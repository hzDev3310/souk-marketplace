import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/context/NotificationContext';
import { imageFallback } from '@/utils/imageFallback';
import { validateImageFile } from '@/utils/imageUploadValidation';
import { Store, ArrowLeft, Save, Activity, Wand2, Upload, Image as ImageIcon, X } from 'lucide-react';

const StoreEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [translating, setTranslating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    family_name: '',
    email: '',
    name_fr: '',
    name_ar: '',
    name_en: '',
    description_fr: '',
    description_ar: '',
    description_en: '',
    storePhone: '',
    address: '',
    matriculeFiscale: '',
    rib: '',
    governorate: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchStore();
  }, [id]);

  const fetchStore = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users/stores');
      const store = response.data.data.find(s => s.id === id);
      if (store) {
        setFormData({
          name: store.name || '',
          family_name: store.family_name || '',
          email: store.email || '',
          name_fr: store.store?.name_fr || '',
          name_ar: store.store?.name_ar || '',
          name_en: store.store?.name_en || '',
          description_fr: store.store?.description_fr || '',
          description_ar: store.store?.description_ar || '',
          description_en: store.store?.description_en || '',
          storePhone: store.store?.storePhone || '',
          address: store.store?.address || '',
          matriculeFiscale: store.store?.matriculeFiscale || '',
          rib: store.store?.rib || '',
          governorate: store.store?.governorate || '',
        });
        
        if(store.store?.logo) setLogoPreview(store.store.logo);
        if(store.store?.cover) setCoverPreview(store.store.cover);
      } else {
        showToast('Store not found', 'error');
        navigate('/dashboard/stores');
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      showToast('Error loading store data', 'error');
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
      showToast('Write at least one name before enhancing.', 'error');
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
              (key.startsWith('name_') || key.startsWith('description_'))
              && typeof value === 'string'
            ))
        );
        setFormData(prev => ({ ...prev, ...translatedFields }));
        showToast('AI enhancement is ready.', 'success');
      } else {
        showToast(response.data?.error || 'AI enhancement failed.', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'AI enhancement failed.', 'error');
    } finally {
      setTranslating(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await api.put(`/admin/users/stores/${id}`, formData);
      showToast('Store information updated successfully', 'success');
    } catch (error) {
      console.error('Error saving store:', error);
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message;
      if (errors) {
        const errorText = Object.entries(errors).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
        showToast(`Validation Error:\n${errorText}`, 'error');
      } else if (message) {
        showToast(message, 'error');
      } else {
        showToast('Error saving store information', 'error');
      }
    } finally {
      setSavingInfo(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setSavingImages(true);
    try {
      const data = new FormData();
      if (logoFile) data.append('logo', logoFile);
      if (coverFile) data.append('cover', coverFile);
      
      data.append('_method', 'PUT');

      if (!logoFile && !coverFile) {
        showToast('No new images selected', 'error');
        setSavingImages(false);
        return;
      }

      await api.post(`/admin/users/stores/${id}`, data);
      showToast('Store images updated successfully', 'success');
      
      // Reset files but keep previews
      setLogoFile(null);
      setCoverFile(null);
      
      fetchStore(); // refresh to get new paths
    } catch (error) {
      console.error('Error saving images:', error);
      showToast(error.response?.data?.message || 'Error saving store images', 'error');
    } finally {
      setSavingImages(false);
    }
  };

  const handleImageChange = (e, setImageFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showToast(validation.error, 'error');
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/stores')}
          className="h-10 w-10 rounded-xl"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">{t('admin.stores.form.editTitle')}</h1>
          <p className="text-sm text-muted-foreground font-medium">Editing {formData.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleInfoSubmit}>
            <CardBox className="p-8 border-border/50 rounded-[32px]">
              <div className="space-y-8">
                {/* Owner Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.ownerFirstName')} *
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="h-12 bg-muted/30 border-border/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.ownerLastName')}
                      </label>
                      <Input
                        value={formData.family_name}
                        onChange={(e) => handleChange('family_name', e.target.value)}
                        className="h-12 bg-muted/30 border-border/50 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.email')} *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="h-12 bg-muted/30 border-border/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.storePhone')}
                      </label>
                      <Input
                        value={formData.storePhone}
                        onChange={(e) => handleChange('storePhone', e.target.value)}
                        className="h-12 bg-muted/30 border-border/50 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Store Info + Description */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      Store Information & Description
                    </h3>
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
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.storeNameFr')}
                      </label>
                      <Input value={formData.name_fr} onChange={(e) => handleChange('name_fr', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.storeNameAr')}
                      </label>
                      <Input value={formData.name_ar} onChange={(e) => handleChange('name_ar', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl text-end" dir="rtl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.storeNameEn')}
                      </label>
                      <Input value={formData.name_en} onChange={(e) => handleChange('name_en', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.address')}
                      </label>
                      <Input value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (French)</label>
                    <textarea
                      value={formData.description_fr}
                      onChange={(e) => handleChange('description_fr', e.target.value)}
                      className="w-full h-24 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (English)</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => handleChange('description_en', e.target.value)}
                      className="w-full h-24 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Arabic)</label>
                    <textarea
                      dir="rtl"
                      value={formData.description_ar}
                      onChange={(e) => handleChange('description_ar', e.target.value)}
                      className="w-full h-24 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm text-end"
                    />
                  </div>
                </div>

                {/* Legal Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                    Legal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.matriculeFiscale')}
                      </label>
                      <Input value={formData.matriculeFiscale} onChange={(e) => handleChange('matriculeFiscale', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {t('admin.stores.form.rib')}
                      </label>
                      <Input value={formData.rib} onChange={(e) => handleChange('rib', e.target.value)} className="h-12 bg-muted/30 border-border/50 rounded-xl" />
                    </div>
                  </div>
                  {/* Add Governorate here if component exists */}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50 mt-8">
                <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/stores')} className="h-12 px-6 rounded-xl font-bold">
                  {t('admin.stores.form.cancel')}
                </Button>
                <Button type="submit" disabled={savingInfo} className="h-12 px-8 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:bg-primaryemphasis transition-all">
                  {savingInfo ? (
                    <span className="flex items-center gap-2"><span className="animate-spin">⋯</span> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save size={18} /> {t('admin.stores.form.update')}</span>
                  )}
                </Button>
              </div>
            </CardBox>
          </form>
        </div>

        {/* Images Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleImageSubmit}>
            <CardBox className="p-6 border-border/50 rounded-[32px]">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2 mb-6">
                Store Images
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo</label>
                  <div className="relative group w-full aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview.startsWith('http') || logoPreview.startsWith('/') ? logoPreview : `/storage/${logoPreview}`} alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.src = '/storage/empty/empty.webp'} />
                        <button type="button" onClick={() => {setLogoPreview(null); setLogoFile(null);}} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white"><X size={14} /></button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs font-bold text-muted-foreground">Upload Logo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setLogoFile, setLogoPreview)} />
                      </label>
                    )}
                    {logoFile && <div className="absolute bottom-2 left-2 bg-primary text-white text-[10px] px-2 py-1 rounded-md font-bold">New</div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cover Image</label>
                  <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    {coverPreview ? (
                      <>
                        <img src={coverPreview.startsWith('http') || coverPreview.startsWith('/') ? coverPreview : `/storage/${coverPreview}`} alt="Cover" className="w-full h-full object-cover" onError={(e) => e.target.src = '/storage/empty/empty.webp'} />
                        <button type="button" onClick={() => {setCoverPreview(null); setCoverFile(null);}} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white"><X size={14} /></button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs font-bold text-muted-foreground">Upload Cover</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setCoverFile, setCoverPreview)} />
                      </label>
                    )}
                    {coverFile && <div className="absolute bottom-2 left-2 bg-primary text-white text-[10px] px-2 py-1 rounded-md font-bold">New</div>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50 mt-6">
                <Button type="submit" disabled={savingImages} className="w-full h-12 px-8 rounded-xl bg-emerald-600 text-white font-black shadow-lg hover:bg-emerald-700 transition-all">
                  {savingImages ? (
                    <span className="flex items-center gap-2"><span className="animate-spin">⋯</span> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Save size={18} /> Save Images</span>
                  )}
                </Button>
              </div>
            </CardBox>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreEdit;