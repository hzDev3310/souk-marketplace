import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/context/NotificationContext';
import { Store, ArrowLeft, Save, Activity, Wand2 } from 'lucide-react';

const StoreEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    family_name: '',
    email: '',
    name_fr: '',
    name_ar: '',
    name_en: '',
    storePhone: '',
    address: '',
    matriculeFiscale: '',
    rib: '',
    governorate: '',
  });

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
          storePhone: store.store?.storePhone || '',
          address: store.store?.address || '',
          matriculeFiscale: store.store?.matriculeFiscale || '',
          rib: store.store?.rib || '',
          governorate: store.store?.governorate || '',
        });
      } else {
        alert('Store not found');
        navigate('/dashboard/stores');
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      alert('Error loading store data');
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
              (key === 'name_en' || key === 'name_fr' || key === 'name_ar')
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/users/stores/${id}`, formData);
      navigate('/dashboard/stores');
    } catch (error) {
      console.error('Error saving store:', error);
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message;
      if (errors) {
        const errorText = Object.entries(errors).map(([key, value]) => `${key}: ${value.join(', ')}`).join('\n');
        alert(t('admin.stores.messages.validationError') + '\n\n' + errorText);
      } else if (message) {
        alert(message);
      } else {
        alert(t('admin.stores.messages.errorSaving'));
      }
    } finally {
      setSaving(false);
    }
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
    <div className="space-y-6">
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

      {/* Form */}
      <div>
        <CardBox className="p-8 border-border/50 rounded-[32px]">
          <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* Store Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                  Store Information
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
                  <Input
                    value={formData.name_fr}
                    onChange={(e) => handleChange('name_fr', e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t('admin.stores.form.storeNameAr')}
                  </label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => handleChange('name_ar', e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl text-end"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t('admin.stores.form.storeNameEn')}
                  </label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => handleChange('name_en', e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t('admin.stores.form.address')}
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
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
                  <Input
                    value={formData.matriculeFiscale}
                    onChange={(e) => handleChange('matriculeFiscale', e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t('admin.stores.form.rib')}
                  </label>
                  <Input
                    value={formData.rib}
                    onChange={(e) => handleChange('rib', e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t('admin.stores.form.governorate')}
                </label>
                <GovernorateSelect
                  value={formData.governorate}
                  onChange={(value) => handleChange('governorate', value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/dashboard/stores')}
                className="h-12 px-6 rounded-xl font-bold"
              >
                {t('admin.stores.form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-12 px-8 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:bg-primaryemphasis transition-all"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⋯</span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={18} />
                    {t('admin.stores.form.update')}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardBox>
      </div>
    </div>
  );
};

export default StoreEdit;
