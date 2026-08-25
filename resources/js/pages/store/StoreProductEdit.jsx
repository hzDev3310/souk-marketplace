import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Package, Box, Image as ImageIcon, Activity, Wand2 } from 'lucide-react';
import { validateImageFile } from '@/utils/imageUploadValidation';

const StoreProductEdit = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [existingImages, setExistingImages] = useState([]);
    const [translating, setTranslating] = useState(false);

    const [formData, setFormData] = useState({
        name_fr: '',
        name_ar: '',
        name_en: '',
        description_fr: '',
        description_ar: '',
        description_en: '',
        price: '',
        stock: '0',
        promo: '0',
        categories: []
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [fileErrors, setFileErrors] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories/all');
            const categoriesData = response.data?.data || response.data || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/store/products/${id}`);
            const product = response.data?.data || response.data;
            if (product) {
                // Verify this product belongs to the current store
                if (product.store_id !== user?.store?.id) {
                    navigate('/dashboard/products');
                    return;
                }

                setFormData({
                    name_fr: product.name_fr || '',
                    name_ar: product.name_ar || '',
                    name_en: product.name_en || '',
                    description_fr: product.description_fr || '',
                    description_ar: product.description_ar || '',
                    description_en: product.description_en || '',
                    price: product.price || '',
                    // condition is ignored; defaults to NEW
                    condition: 'NEW',
                    stock: product.stock || '0',
                    promo: product.promo || '0',
                    categories: Array.isArray(product.categories)
                        ? product.categories.map(c => (typeof c === 'object' && c !== null ? c.id : c))
                        : []
                });
                setExistingImages(product.albums || []);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setFetchingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = [];
        const errorsList = [];

        files.forEach((file) => {
            const validation = validateImageFile(file, { maxSizeBytes: 4 * 1024 * 1024 });
            if (!validation.isValid) {
                errorsList.push(validation.error);
            } else {
                validFiles.push(file);
            }
        });

        setFileErrors(errorsList);
        setImageFiles(validFiles);
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setNewPreviews(previews);

        e.target.value = '';
    };

    const handleCategoryToggle = (catId) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(catId)
                ? prev.categories.filter(id => id !== catId)
                : [...prev.categories, catId]
        }));
    };

    const handleAutoTranslate = async () => {
        const fieldsToTranslate = {};
        Object.entries(formData).forEach(([key, value]) => {
            if ((key.startsWith('name_') || key.startsWith('description_')) && value && String(value).trim() !== '') {
                fieldsToTranslate[key] = value;
            }
        });

        if (Object.keys(fieldsToTranslate).length === 0) {
            addNotification('error', 'Write at least one name or description before enhancing.');
            return;
        }

        try {
            setTranslating(true);
            const response = await api.post('/translate/autofill', { fields: fieldsToTranslate });
            if (response.data?.success) {
                const translatedFields = Object.fromEntries(
                    Object.entries(response.data.data || {})
                        .map(([key, value]) => {
                            const normalizedKey = key === 'name_es' ? 'name_ar' : key === 'description_es' ? 'description_ar' : key;
                            return [normalizedKey, value];
                        })
                        .filter(([key, value]) => (
                            (key === 'name_en' || key === 'name_fr' || key === 'name_ar' || key === 'description_en' || key === 'description_fr' || key === 'description_ar')
                            && typeof value === 'string'
                        ))
                );

                setFormData(prev => ({
                    ...prev,
                    ...translatedFields,
                }));
                addNotification('success', 'AI enhancement is ready.');
            } else {
                addNotification('error', response.data?.error || 'AI enhancement failed. Please try again.');
            }
        } catch (error) {
            addNotification('error', error.response?.data?.error || error.response?.data?.message || 'AI enhancement failed. Please try again.');
        } finally {
            setTranslating(false);
        }
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (fileErrors.length > 0) return;
        setLoading(true);
        setErrors({});

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'categories') {
                data.append('categories', JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        // Append new images
        imageFiles.forEach(file => {
            data.append('images[]', file);
        });

        // Append remaining existing image IDs
        if (existingImages.length > 0) {
            data.append('keep_images', JSON.stringify(existingImages.map(img => img.id)));
        }

        data.append('_method', 'PUT');

        try {
            await api.post(`/store/products/${id}`, data);
            navigate('/dashboard/products');
        } catch (error) {
            console.error('Error updating product:', error);
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/products');
    };

    if (fetchingData) {
        return (
            <div className="flex items-center justify-center h-96">
                <Activity className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 text-start">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="h-10 w-10 rounded-xl"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Package className="text-primary" size={28} />
                            {t('store.products.edit.title') || 'Edit Product'}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t('store.products.edit.subtitle') || 'Update your product details'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Auto Translate Action */}
                    <div className="flex justify-end -mb-4 relative z-10">
                        <Button
                            type="button"
                            onClick={handleAutoTranslate}
                            disabled={translating}
                            className="h-11 rounded-2xl border border-purple-300 bg-purple-500/10 px-5 font-bold text-purple-600 hover:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300 gap-2"
                        >
                            {translating ? <Activity className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            {t('store.products.form.autoTranslate') || 'AI enhance & translate'}
                        </Button>
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    {t('store.products.form.condition') || 'Condition'}
                                </label>
                                <div className="w-full md:w-1/3 h-12 px-4 rounded-xl bg-card border border-border/60 flex items-center font-bold text-sm">
                                    {t('store.products.form.condNew') || 'New'}
                                </div>
                            </div>

                    {/* Product Names */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('store.products.form.productNames') || 'Product Names'} *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Input
                                    name="name_fr"
                                    value={formData.name_fr}
                                    onChange={handleChange}
                                    placeholder={t('store.products.form.frenchPlaceholder') || 'Nom du produit'}
                                    className="h-12 bg-card border-border/60 rounded-xl font-bold"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground ml-1">Français</span>
                                {errors.name_fr && <p className="text-red-500 text-xs">{errors.name_fr[0]}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input
                                    name="name_ar"
                                    value={formData.name_ar}
                                    onChange={handleChange}
                                    placeholder="اسم المنتج"
                                    dir="rtl"
                                    className="h-12 bg-card border-border/60 rounded-xl font-black text-right"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground ml-1 block text-right mr-1">العربية</span>
                                {errors.name_ar && <p className="text-red-500 text-xs">{errors.name_ar[0]}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input
                                    name="name_en"
                                    value={formData.name_en}
                                    onChange={handleChange}
                                    placeholder={t('store.products.form.englishPlaceholder') || 'Product name'}
                                    className="h-12 bg-card border-border/60 rounded-xl font-bold"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground ml-1">English</span>
                                {errors.name_en && <p className="text-red-500 text-xs">{errors.name_en[0]}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('store.products.form.descriptions') || 'Descriptions'}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <textarea
                                name="description_fr"
                                value={formData.description_fr}
                                onChange={handleChange}
                                placeholder={t('store.products.form.descFrPlaceholder') || 'Description en français...'}
                                className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 min-h-[100px] resize-none text-sm"
                            />
                            <textarea
                                name="description_ar"
                                value={formData.description_ar}
                                onChange={handleChange}
                                placeholder="الوصف بالعربية..."
                                dir="rtl"
                                className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 min-h-[100px] resize-none text-sm text-right"
                            />
                            <textarea
                                name="description_en"
                                value={formData.description_en}
                                onChange={handleChange}
                                placeholder={t('store.products.form.descEnPlaceholder') || 'Description in English...'}
                                className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 min-h-[100px] resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('store.products.form.pricing') || 'Pricing & Inventory'} *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <Input
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="h-12 bg-card border-border/60 rounded-xl font-bold"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground ml-1">{t('store.products.form.price') || 'Price ($)'}</span>
                                {errors.price && <p className="text-red-500 text-xs">{errors.price[0]}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="h-12 bg-card border-border/60 rounded-xl font-bold"
                                    required
                                />
                                <span className="text-[10px] text-muted-foreground ml-1">{t('store.products.form.stock') || 'Stock'}</span>
                                {errors.stock && <p className="text-red-500 text-xs">{errors.stock[0]}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input
                                    name="promo"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.promo}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="h-12 bg-card border-border/60 rounded-xl font-bold"
                                />
                                <span className="text-[10px] text-muted-foreground ml-1">{t('store.products.form.promo') || 'Promo %'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('store.products.form.categories') || 'Categories'}
                        </label>
                        <div className="flex flex-wrap gap-2 p-4 bg-muted/20 rounded-2xl border border-border/40">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => handleCategoryToggle(cat.id)}
                                    className={`cursor-pointer h-10 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                        formData.categories.includes(cat.id)
                                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                            : 'border-border/50 bg-card hover:bg-muted/50 hover:border-primary/50 text-foreground'
                                    }`}
                                >
                                    {cat.logo ? (
                                        <img src={`/storage/${cat.logo}`} alt="" className="w-5 h-5 rounded-[4px] object-cover" />
                                    ) : (
                                        <Box size={14} className="opacity-50" />
                                    )}
                                    <span className="text-[11px] font-black">{cat.name_fr}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                {t('store.products.form.existingImages') || 'Current Images'}
                            </label>
                            <div className="flex gap-4 flex-wrap">
                                {existingImages.map((img, idx) => (
                                    <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border/50 group">
                                        <img src={img.file} className="w-full h-full object-cover" alt={`Product ${idx + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(idx)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Images */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('store.products.form.addImages') || 'Add New Images'}
                        </label>
                        <div className="relative border-2 border-dashed border-border/50 rounded-[24px] p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer">
                            <ImageIcon className="text-muted-foreground mb-4" size={32} />
                            <span className="font-black text-sm">{t('store.products.form.uploadImages') || 'Click to upload images'}</span>
                            <span className="text-xs text-muted-foreground mt-1">Supported: JPG, PNG, WEBP, GIF, SVG. Max 4MB each</span>
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                        </div>

                        {fileErrors.length > 0 && (
                            <div className="space-y-1 mt-2">
                                {fileErrors.map((err, idx) => (
                                    <p key={idx} className="text-red-500 text-xs flex items-center gap-1">
                                        <span>•</span> {err}
                                    </p>
                                ))}
                            </div>
                        )}

                        {newPreviews.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto py-4">
                                {newPreviews.map((src, idx) => (
                                    <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border-2 border-border/50 flex-shrink-0">
                                        <img src={src} className="w-full h-full object-cover" alt={`New Preview ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-12 px-6 rounded-xl font-bold"
                        >
                            {t('common.cancel') || 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 rounded-xl font-black bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <Activity className="w-5 h-5 animate-spin" />
                            ) : (
                                t('store.products.form.update') || 'Update Product'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreProductEdit;
