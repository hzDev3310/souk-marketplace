import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, ImagePlus, Activity } from 'lucide-react';
import IconPicker from '@/components/ui/icon-picker';
import { createFormData, prepareFormDataRequest, getImageUrl } from '@/services/apiService';
import { validateImageFile } from '@/utils/imageUploadValidation';

const CategoryEdit = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [formData, setFormData] = useState({
        parent_id: '',
        name_fr: '',
        name_ar: '',
        name_en: '',
        icon: '',
        isActive: true,
    });
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategory();
        fetchAllCategories();
    }, [id]);

    const fetchAllCategories = async () => {
        try {
            const response = await api.get('/admin/categories/all');
            setAllCategories(response.data?.filter(c => c.id !== id) || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchCategory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/categories/${id}`);
            const cat = response.data;
            if (cat) {
                setFormData({
                    parent_id: cat.parent_id || '',
                    name_fr: cat.name_fr || '',
                    name_ar: cat.name_ar || '',
                    name_en: cat.name_en || '',
                    icon: cat.icon || '',
                    isActive: cat.isActive ?? true,
                });
                if (cat.cover) setCoverPreview(getImageUrl(cat.cover));
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            alert('Category not found');
            navigate('/dashboard/categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        const submitData = { ...formData };
        if (!submitData.parent_id) delete submitData.parent_id;
        if (!submitData.icon) delete submitData.icon;

        const data = createFormData(submitData, { cover: coverFile });
        const cleanup = prepareFormDataRequest();

        console.log('=== CATEGORY UPDATE DEBUG ===');
        console.log('URL:', `/admin/categories/${id}`);
        console.log('submitData:', submitData);
        console.log('coverFile:', coverFile);

        // Log FormData entries
        const fdObj = {};
        for (const [key, value] of data.entries()) {
            fdObj[key] = value instanceof File ? `File(${value.name}, ${value.size}b)` : value;
        }
        console.log('FormData entries:', fdObj);

        try {
            const response = await api.put(`/admin/categories/${id}`, data);
            console.log('Update success:', response.data);
            cleanup.restore();
            navigate('/dashboard/categories');
        } catch (error) {
            cleanup.restore();
            console.error('Error updating category:', error);

            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);

                // Convert HTML error page to text and log it
                if (typeof error.response.data === 'string') {
                    const div = document.createElement('div');
                    div.innerHTML = error.response.data;
                    console.error('HTML error (text):', div.textContent || div.innerText);
                }

                if (error.response.data?.errors) {
                    console.error('Validation errors:', error.response.data.errors);
                    setErrors(error.response.data.errors);
                } else {
                    alert(error.message || t('admin.categories.messages.errorUpdating'));
                }
            } else {
                alert(error.message || t('admin.categories.messages.errorUpdating'));
            }
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validation = validateImageFile(file, { maxSizeBytes: 4 * 1024 * 1024 });
        if (!validation.isValid) {
            setErrors(prev => ({ ...prev, cover: [validation.error] }));
            return;
        }

        setErrors(prev => ({ ...prev, cover: null }));
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Activity className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold">{t('admin.common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" rounded="xl" onClick={() => navigate('/dashboard/categories')}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">{t('admin.categories.form.editTitle') || 'Edit Category'}</h1>
                    <p className="text-sm text-muted-foreground font-medium">Update category details</p>
                </div>
            </div>

            <div>
                <CardBox className="p-8 border-border/50 rounded-[32px]">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                                Basic Information
                            </h3>
                            
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.categories.form.nameFr')} *</Label>
                                    <Input required value={formData.name_fr} onChange={(e) => handleChange('name_fr', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                                    {errors.name_fr && <p className="text-xs text-red-500">{errors.name_fr[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.categories.form.nameAr')} *</Label>
                                    <Input required value={formData.name_ar} onChange={(e) => handleChange('name_ar', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl text-end" dir="rtl" />
                                    {errors.name_ar && <p className="text-xs text-red-500">{errors.name_ar[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.categories.form.nameEn')} *</Label>
                                    <Input required value={formData.name_en} onChange={(e) => handleChange('name_en', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                                    {errors.name_en && <p className="text-xs text-red-500">{errors.name_en[0]}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Parent Category</Label>
                                    <select value={formData.parent_id} onChange={(e) => handleChange('parent_id', e.target.value)} className="w-full h-12 bg-muted/30 border border-border/50 rounded-xl px-4">
                                        <option value="">{t('admin.categories.form.noParent') || 'No Parent (Root)'}</option>
                                        {allCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Icon</Label>
                                    <IconPicker value={formData.icon} onChange={(val) => handleChange('icon', val)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Switch checked={formData.isActive} onCheckedChange={(checked) => handleChange('isActive', checked)} />
                                    <Label className="text-sm font-medium">{t('admin.categories.form.isActive') || 'Active'}</Label>
                                </div>
                                {errors.isActive && <p className="text-xs text-red-500">{errors.isActive[0]}</p>}
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Images</h3>
                                <div className="space-y-2 max-w-sm">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cover (max 4MB)</Label>
                                <div className="relative border-2 border-dashed border-border/50 rounded-2xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer h-32">
                                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mt-8" />
                                    )}
                                </div>
                                {errors.cover && <p className="text-xs text-red-500">{errors.cover[0]}</p>}
                                <p className="text-[11px] text-muted-foreground">Supported: JPG, PNG, WEBP, GIF, SVG. Max 4MB.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
                            <Button type="button" variant="ghost" size="xl" padding="xl" rounded="xl" className="font-bold" onClick={() => navigate('/dashboard/categories')}>
                                {t('common.cancel') || 'Cancel'}
                            </Button>
                            <Button type="submit" size="xl" padding="2xl" rounded="xl" disabled={saving} className="font-black shadow-lg shadow-primary/20 transition-all">
                                {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> {t('common.save') || 'Save Changes'}</>}
                            </Button>
                        </div>
                    </form>
                </CardBox>
            </div>
        </div>
    );
};

export default CategoryEdit;
