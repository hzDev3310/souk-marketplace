import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { imageFallback } from '@/utils/imageFallback';
import CardBox from '@/components/shared/CardBox';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import Modal from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { validateImageFile } from '@/utils/imageUploadValidation';
import {
    Package, Store, Tags, Box, Image as ImageIcon, Activity, Plus, X,
    Check, Layers, DollarSign, CloudUpload, GitBranch, Wand2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';


const validateForm = (formData, imageFiles, fileErrors, { requireStore = true } = {}) => {
    const errs = {};

    if (fileErrors.length > 0) {
        errs.images = fileErrors;
    }

    if (requireStore && !formData.store_id) {
        errs.store_id = ['Please select a store.'];
    }

    if (!formData.name_fr || !formData.name_fr.trim()) {
        errs.name_fr = ['Product name (French) is required.'];
    } else if (formData.name_fr.length > 255) {
        errs.name_fr = ['Product name (French) must not exceed 255 characters.'];
    }

    if (!formData.name_ar || !formData.name_ar.trim()) {
        errs.name_ar = ['Product name (Arabic) is required.'];
    } else if (formData.name_ar.length > 255) {
        errs.name_ar = ['Product name (Arabic) must not exceed 255 characters.'];
    }

    if (!formData.name_en || !formData.name_en.trim()) {
        errs.name_en = ['Product name (English) is required.'];
    } else if (formData.name_en.length > 255) {
        errs.name_en = ['Product name (English) must not exceed 255 characters.'];
    }

    if (formData.price === '' || formData.price === null || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
        errs.price = ['Please enter a valid price (0 or greater).'];
    }

    // Condition is fixed to NEW; no validation required here.

    if (formData.stock === '' || formData.stock === null || isNaN(Number(formData.stock)) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
        errs.stock = ['Please enter a valid stock quantity (non-negative integer).'];
    }

    if (formData.promo && (isNaN(Number(formData.promo)) || Number(formData.promo) < 0 || Number(formData.promo) > 100)) {
        errs.promo = ['Promo must be between 0 and 100.'];
    }

    return errs;
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Icon size={18} />
        </div>
        <div>
            <h3 className="text-sm font-black text-foreground tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

const FieldError = ({ error }) => (
    error ? <p className="text-red-500 text-xs mt-1.5 font-semibold">{error[0]}</p> : null
);

const ProductForm = () => {
    const { id: productId } = useParams();
    const { user } = useAuth();
    const mode = productId ? 'edit' : 'create';
    const role = user?.role === 'STORE' ? 'store' : 'admin';
    const isEdit = mode === 'edit';
    const normalizedRole = String(role || '').toLowerCase();
    const isStore = normalizedRole === 'store';
    const apiBase = isStore ? '/store/products' : '/admin/products';
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useNotification();

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        store_id: isStore ? (user?.store?.id ?? '') : '',
        name_fr: '',
        name_ar: '',
        name_en: '',
        description_fr: '',
        description_ar: '',
        description_en: '',
        price: '',
        // condition removed
        stock: '0',
        promo: '0',
        categories: []
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [fileErrors, setFileErrors] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [translating, setTranslating] = useState(false);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [savingCategory, setSavingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [categoryForm, setCategoryForm] = useState({ name_en: '', name_fr: '', name_ar: '', icon: '' });

    useEffect(() => {
        if (!isStore) {
            fetchStores();
        }
        fetchCategories();
        if (isEdit && productId) {
            fetchProduct(productId);
        } else {
            setFetchingData(false);
        }
    }, [productId]);

    useEffect(() => {
        if (isStore && user?.store?.id) {
            setFormData(prev => ({
                ...prev,
                store_id: String(user.store.id),
            }));
        }
    }, [isStore, user?.store?.id]);

    const fetchStores = async () => {
        try {
            const response = await api.get('/admin/users/stores/list');
            const storesData = response.data?.data || response.data || [];
            setStores(Array.isArray(storesData) ? storesData : []);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const endpoint = isStore ? '/store/categories' : '/admin/categories/all';
            const response = await api.get(endpoint);
            const categoriesData = response.data?.data || response.data || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async (id) => {
        try {
            const response = await api.get(`${apiBase}/${id}`);
            const product = response.data?.data || response.data;
            if (product) {
                setFormData({
                    store_id: isStore ? (user?.store?.id ?? product.store_id ?? '') : (product.store_id || ''),
                    name_fr: product.name_fr || '',
                    name_ar: product.name_ar || '',
                    name_en: product.name_en || '',
                    description_fr: product.description_fr || '',
                    description_ar: product.description_ar || '',
                    description_en: product.description_en || '',
                    price: product.price ?? '',
                    stock: product.stock ?? '0',
                    promo: product.promo ?? '0',
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
        if (generalError) setGeneralError('');
    };

    const handleCategoryToggle = (catId) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(catId)
                ? prev.categories.filter(id => id !== catId)
                : [...prev.categories, catId]
        }));
    };

    const processFiles = (files) => {
        const validFiles = [];
        const errorsList = [];

        Array.from(files || []).forEach((file) => {
            const validation = validateImageFile(file, { maxSizeBytes: 4 * 1024 * 1024 });
            if (!validation.isValid) {
                errorsList.push(validation.error);
            } else {
                validFiles.push(file);
            }
        });

        setFileErrors(errorsList);

        if (validFiles.length > 0) {
            setImageFiles(prev => [...prev, ...validFiles]);
            setPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
        }
    };

    const handleFileChange = (e) => {
        processFiles(e.target.files);
        e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        processFiles(e.dataTransfer.files);
    };

    const handleRemoveNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleCategoryFormChange = (e) => {
        const { name, value } = e.target;
        setCategoryForm(prev => ({ ...prev, [name]: value }));
        if (categoryError) setCategoryError('');
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setCategoryError('');

        if (!categoryForm.name_en.trim() || !categoryForm.name_fr.trim() || !categoryForm.name_ar.trim()) {
            setCategoryError(t('admin.products.form.categoryRequired') || 'All category names are required.');
            return;
        }

        setSavingCategory(true);
        try {
            const response = await api.post('/admin/categories', {
                name_en: categoryForm.name_en.trim(),
                name_fr: categoryForm.name_fr.trim(),
                name_ar: categoryForm.name_ar.trim(),
                icon: categoryForm.icon.trim() || null,
                isActive: true
            });
            const created = response.data;
            setCategories(prev => [...prev, created]);
            setFormData(prev => ({ ...prev, categories: [...prev.categories, created.id] }));
            setShowCategoryModal(false);
            setCategoryForm({ name_en: '', name_fr: '', name_ar: '', icon: '' });
            showToast(t('admin.products.messages.categoryCreated') || 'Category created successfully', 'success');
        } catch (error) {
            console.error('Error creating category:', error);
            const msg = error.response?.data?.message || t('admin.products.messages.categoryCreateError') || 'Failed to create category';
            showToast(msg, 'error');
        } finally {
            setSavingCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        const validationErrors = validateForm(formData, imageFiles, fileErrors, { requireStore: !isStore });
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToast(t('admin.products.messages.validationError') || 'Please fix the highlighted fields.', 'error');
            return;
        }

        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (isStore && key === 'store_id') {
                return;
            }

            if (key === 'categories') {
                data.append('categories', JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        imageFiles.forEach(file => {
            data.append('images[]', file);
        });

        if (isEdit) {
            data.append('keep_images', JSON.stringify(existingImages.map(img => img.id)));
            data.append('_method', 'PUT');
        }

        try {
            if (isEdit) {
                await api.post(`${apiBase}/${productId}`, data);
                showToast(t('admin.products.messages.updateSuccess') || 'Product updated successfully', 'success');
                navigate('/dashboard/products');
            } else {
                const created = await api.post(apiBase, data);
                showToast(t('admin.products.messages.createSuccess') || 'Product created successfully', 'success');
                const newId = created.data?.id;
                navigate(newId ? '/dashboard/products' : '/dashboard/products');
            }
        } catch (error) {
            if (error.response?.status === 422) {
                const body = error.response.data || {};
                const errs = body.errors || {};
                setErrors(prev => ({ ...prev, ...errs }));
                if (Object.keys(errs).length > 0) {
                    const firstKey = Object.keys(errs)[0];
                    const el = document.querySelector(`[name="${firstKey}"]`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (body.message) {
                    setGeneralError(body.message);
                }
            } else {
                console.error('Error saving product:', error);
                showToast(t('admin.products.messages.saveError') || 'Something went wrong. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAutoTranslate = async () => {
        const fieldsToTranslate = {};
        Object.entries(formData).forEach(([key, value]) => {
            if ((key.startsWith('name_') || key.startsWith('description_')) && value && String(value).trim() !== '') {
                fieldsToTranslate[key] = value;
            }
        });

        if (Object.keys(fieldsToTranslate).length === 0) {
            showToast('Write at least one name or description before enhancing.', 'error');
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
                showToast('AI enhancement is ready.', 'success');
            } else {
                showToast(response.data?.error || 'AI enhancement failed. Please try again.', 'error');
            }
        } catch (error) {
            showToast(error.response?.data?.error || error.response?.data?.message || 'AI enhancement failed. Please try again.', 'error');
        } finally {
            setTranslating(false);
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
        <AdminPageLayout
            title={isEdit ? t('admin.products.edit.title') : t('admin.products.create.title')}
            subtitle={isEdit ? t('admin.products.edit.subtitle') : t('admin.products.create.subtitle')}
            icon={Package}
            onBack={handleCancel}
        >
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
                    {/* ===================== 70% Left Column ===================== */}
                    <div className="lg:col-span-7 space-y-6">
                        {generalError && (
                            <div className="p-4 bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl">
                                <p className="text-red-600 dark:text-red-400 text-sm font-bold">{generalError}</p>
                            </div>
                        )}

                        {/* Card 1: Basic Information */}
                        <CardBox className="p-6 sm:p-8 rounded-[32px]">
                            <SectionHeader
                                icon={Store}
                                title={t('admin.products.form.basicInfo') || 'Basic Information'}
                                subtitle={t('admin.products.form.basicInfoSubtitle') || 'Store and condition details'}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {!isStore && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            {t('admin.products.form.store') || 'Store'} *
                                        </label>
                                        <select
                                            name="store_id"
                                            value={formData.store_id}
                                            onChange={handleChange}
                                            className={`w-full h-12 px-4 rounded-xl bg-card border font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.store_id ? 'border-red-400' : 'border-border/60'}`}
                                        >
                                            <option value="">{t('admin.products.form.selectStore') || 'Select Store'}</option>
                                            {stores.map(store => (
                                                <option key={store.id} value={store.id}>
                                                    {store.name_fr || store.name_en}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError error={errors.store_id} />
                                    </div>
                                )}

                                {isStore && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            {t('admin.products.form.store') || 'Store'}
                                        </label>
                                        <div className="w-full h-12 px-4 rounded-xl bg-card border border-border/60 flex items-center font-bold text-sm">
                                            {user?.store?.name_fr || user?.store?.store_name_fr || user?.store?.name_en || user?.store?.id || '—'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardBox>

                        {/* Card 2: Product Names */}
                        <CardBox className="p-6 sm:p-8 rounded-[32px]">
                            <div className="flex items-center justify-between mb-4">
                                <SectionHeader
                                    icon={Tags}
                                    title={`${t('admin.products.form.productNames') || 'Product Names'} *`}
                                    subtitle={t('admin.products.form.namesSubtitle') || 'Names in all supported languages'}
                                />
                                <Button
                                    type="button"
                                    onClick={handleAutoTranslate}
                                    disabled={translating}
                                    className="h-11 rounded-2xl border border-purple-300 bg-purple-500/10 px-5 font-bold text-purple-600 hover:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300 gap-2 shrink-0"
                                >
                                    {translating ? <Activity className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    {t('store.products.form.autoTranslate') || 'AI enhance & translate'}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Input
                                        name="name_en"
                                        value={formData.name_en}
                                        onChange={handleChange}
                                        placeholder={t('admin.products.form.englishPlaceholder') || 'Product name'}
                                        className={`h-12 bg-card rounded-xl font-bold ${errors.name_en ? 'border-red-400' : 'border-border/60'}`}
                                    />
                                    <span className="text-[10px] text-muted-foreground ml-1">English</span>
                                    <FieldError error={errors.name_en} />
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        name="name_fr"
                                        value={formData.name_fr}
                                        onChange={handleChange}
                                        placeholder={t('admin.products.form.frenchPlaceholder') || 'Nom du produit'}
                                        className={`h-12 bg-card rounded-xl font-bold ${errors.name_fr ? 'border-red-400' : 'border-border/60'}`}
                                    />
                                    <span className="text-[10px] text-muted-foreground ml-1">Français</span>
                                    <FieldError error={errors.name_fr} />
                                </div>
                                <div className="space-y-1">
                                    <Input
                                        name="name_ar"
                                        value={formData.name_ar}
                                        onChange={handleChange}
                                        placeholder={t('admin.products.form.arabicPlaceholder') || 'اسم المنتج'}
                                        dir="rtl"
                                        className={`h-12 bg-card rounded-xl font-black text-right ${errors.name_ar ? 'border-red-400' : 'border-border/60'}`}
                                    />
                                    <span className="text-[10px] text-muted-foreground ml-1 block text-end mr-1">العربية</span>
                                    <FieldError error={errors.name_ar} />
                                </div>
                            </div>
                        </CardBox>

                        {/* Card 3: Descriptions */}
                        <CardBox className="p-6 sm:p-8 rounded-[32px]">
                            <SectionHeader
                                icon={Layers}
                                title={t('admin.products.form.descriptions') || 'Descriptions'}
                                subtitle={t('admin.products.form.descSubtitle') || 'Descriptions in all supported languages'}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <textarea
                                    name="description_en"
                                    value={formData.description_en}
                                    onChange={handleChange}
                                    placeholder={t('admin.products.form.descEnPlaceholder') || 'Description in English...'}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 min-h-[100px] resize-none text-sm"
                                />
                                <textarea
                                    name="description_fr"
                                    value={formData.description_fr}
                                    onChange={handleChange}
                                    placeholder={t('admin.products.form.descFrPlaceholder') || 'Description en français...'}
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 min-h-[100px] resize-none text-sm"
                                />
                                <textarea
                                    name="description_ar"
                                    value={formData.description_ar}
                                    onChange={handleChange}
                                    placeholder={t('admin.products.form.descArPlaceholder') || 'الوصف بالعربية...'}
                                    dir="rtl"
                                    className="w-full px-4 py-3 rounded-xl bg-card border border-border/60 min-h-[100px] resize-none text-sm text-right"
                                />
                            </div>
                        </CardBox>

                        {/* Card 4: Pricing & Inventory */}
                        <CardBox className="p-6 sm:p-8 rounded-[32px]">
                            <SectionHeader
                                icon={DollarSign}
                                title={`${t('admin.products.form.pricing') || 'Pricing & Inventory'} *`}
                                subtitle={t('admin.products.form.pricingSubtitle') || 'Price, stock and discount'}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 start-4 flex items-center text-muted-foreground font-black text-sm">$</span>
                                        <Input
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className={`h-12 bg-card rounded-xl font-bold ps-9 ${errors.price ? 'border-red-400' : 'border-border/60'}`}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground ml-1">{t('admin.products.form.price') || 'Price ($)'}</span>
                                    <FieldError error={errors.price} />
                                </div>

                                <div className="space-y-1">
                                    <Input
                                        name="stock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className={`h-12 bg-card rounded-xl font-bold ${errors.stock ? 'border-red-400' : 'border-border/60'}`}
                                    />
                                    <span className="text-[10px] text-muted-foreground ml-1">{t('admin.products.form.stock') || 'Stock Quantity'}</span>
                                    <FieldError error={errors.stock} />
                                </div>

                                <div className="space-y-1">
                                    <div className="relative">
                                        <Input
                                            name="promo"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.promo}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className={`h-12 bg-card rounded-xl font-bold pe-9 ${errors.promo ? 'border-red-400' : 'border-border/60'}`}
                                        />
                                        <span className="absolute inset-y-0 end-4 flex items-center text-muted-foreground font-black text-sm">%</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground ml-1">{t('admin.products.form.promo') || 'Promo %'}</span>
                                    <FieldError error={errors.promo} />
                                </div>
                            </div>
                        </CardBox>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-2">
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
                                ) : isEdit ? (
                                    t('admin.products.form.update') || 'Update Product'
                                ) : (
                                    t('admin.products.form.create') || 'Create Product'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* ===================== 30% Right Column ===================== */}
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
                        {/* Card 5: Categories */}
                        <CardBox className="p-6 rounded-[32px]">
                            <div className="flex items-center justify-between mb-6">
                                <SectionHeader
                                    icon={Box}
                                    title={t('admin.products.form.categories') || 'Categories'}
                                    subtitle={t('admin.products.form.categoriesSubtitle') || 'Select or create categories'}
                                />
                            </div>

                            <div className="space-y-3">
                                {categories.length === 0 ? (
                                    <p className="text-xs text-muted-foreground font-medium bg-muted/30 rounded-xl px-4 py-3">
                                        {t('admin.products.form.noCategories') || 'No categories available'}
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => {
                                            const selected = formData.categories.includes(cat.id);
                                            return (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => handleCategoryToggle(cat.id)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryToggle(cat.id); } }}
                                                    className={`cursor-pointer h-9 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 ${
                                                        selected
                                                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                            : 'border-border/50 bg-card hover:bg-muted/50 hover:border-primary/50 text-foreground'
                                                    }`}
                                                >
                                                    {selected ? (
                                                        <Check size={13} strokeWidth={3} />
                                                    ) : cat.icon && LucideIcons[cat.icon] ? (
                                                        React.createElement(LucideIcons[cat.icon], { size: 13, className: 'opacity-50' })
                                                    ) : (
                                                        <Box size={13} className="opacity-50" />
                                                    )}
                                                    <span className="text-[11px] font-black">{cat.name_fr || cat.name_en}</span>
                                                    {selected && (
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); handleCategoryToggle(cat.id); }}
                                                            className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                                            title={t('common.actions.remove') || 'Remove'}
                                                        >
                                                            <X size={10} strokeWidth={3} />
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {!isStore && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCategoryModal(true)}
                                        className="w-full h-10 rounded-xl font-bold text-xs border-dashed gap-2"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                        {t('admin.products.form.addCategory') || 'Add New Category'}
                                    </Button>
                                )}
                            </div>
                        </CardBox>

                        {/* Card 6: Images Dropzone */}
                        <CardBox className="p-6 rounded-[32px]">
                            <SectionHeader
                                icon={ImageIcon}
                                title={t('admin.products.form.images') || 'Images'}
                                subtitle={t('admin.products.form.imagesSubtitle') || 'JPG, PNG, WEBP, GIF, SVG · Max 4MB'}
                            />

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                className={`relative border-2 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                    dragActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border/50 bg-muted/20 hover:bg-muted/30'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <CloudUpload className={`mb-3 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} size={30} />
                                <span className="font-black text-sm">
                                    {dragActive
                                        ? (t('admin.products.form.dropHere') || 'Drop images here')
                                        : (t('admin.products.form.dragDrop') || 'Drag & drop or click to upload')}
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                                    {t('admin.products.form.supportedTypes') || 'JPG, PNG, WEBP, GIF, SVG — Max 4MB each'}
                                </span>
                            </div>

                            {fileErrors.length > 0 && (
                                <div className="space-y-1 mt-3">
                                    {fileErrors.map((err, idx) => (
                                        <p key={idx} className="text-red-500 text-xs flex items-center gap-1">
                                            <span>•</span> {err}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {isEdit && existingImages.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        {t('admin.products.form.existingImages') || 'Current Images'}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {existingImages.map((img, idx) => (
                                            <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 border-border/50 aspect-square">
                                                <img src={img.file} className="w-full h-full object-cover" alt={`Product ${idx + 1}`} onError={imageFallback} />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(idx)}
                                                    title={t('common.actions.remove') || 'Remove'}
                                                    className="absolute top-1 end-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {previews.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                                        {t('admin.products.form.newImages') || 'New Images'}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {previews.map((src, idx) => (
                                            <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-border/50 aspect-square">
                                                <img src={src} className="w-full h-full object-cover" alt={`New Preview ${idx + 1}`} onError={imageFallback} />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    title={t('common.actions.remove') || 'Remove'}
                                                    className="absolute top-1 end-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardBox>
                    </div>
                </div>
            </form>

            {/* Add New Category Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title={t('admin.products.form.newCategoryTitle') || 'New Category'}
                subtitle={t('admin.products.form.newCategorySubtitle') || 'Add a new category to this product'}
                icon={Layers}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleCreateCategory} className="space-y-4">
                    {categoryError && (
                        <div className="p-3 bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
                            <p className="text-red-600 dark:text-red-400 text-xs font-bold">{categoryError}</p>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('admin.products.form.nameEn') || 'Name (English)'} *
                        </label>
                        <Input
                            name="name_en"
                            value={categoryForm.name_en}
                            onChange={handleCategoryFormChange}
                            placeholder={t('admin.products.form.englishPlaceholder') || 'Product name'}
                            className="h-12 bg-card rounded-xl font-bold border-border/60"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('admin.products.form.nameFr') || 'Name (French)'} *
                        </label>
                        <Input
                            name="name_fr"
                            value={categoryForm.name_fr}
                            onChange={handleCategoryFormChange}
                            placeholder={t('admin.products.form.frenchPlaceholder') || 'Nom du produit'}
                            className="h-12 bg-card rounded-xl font-bold border-border/60"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('admin.products.form.nameAr') || 'Name (Arabic)'} *
                        </label>
                        <Input
                            name="name_ar"
                            value={categoryForm.name_ar}
                            onChange={handleCategoryFormChange}
                            placeholder={t('admin.products.form.arabicPlaceholder') || 'اسم المنتج'}
                            dir="rtl"
                            className="h-12 bg-card rounded-xl font-black text-right border-border/60"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t('admin.products.form.iconPlaceholder') || 'Icon (optional)'}
                        </label>
                        <Input
                            name="icon"
                            value={categoryForm.icon}
                            onChange={handleCategoryFormChange}
                            placeholder={t('admin.products.form.iconExample') || 'e.g. Shirt, Watch, Home'}
                            className="h-12 bg-card rounded-xl font-bold border-border/60"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowCategoryModal(false)}
                            className="h-11 px-5 rounded-xl font-bold"
                        >
                            {t('common.cancel') || 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={savingCategory}
                            className="h-11 px-6 rounded-xl font-black"
                        >
                            {savingCategory ? (
                                <Activity className="w-4 h-4 animate-spin" />
                            ) : (
                                t('admin.products.form.createCategory') || 'Create Category'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminPageLayout>
    );
};

export default ProductForm;
