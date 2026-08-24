import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Building2,
    Upload,
    Loader,
    AlertCircle,
    ImagePlus,
    Wand2,
    Save,
    UserCircle,
    ShieldCheck,
    Mail,
} from 'lucide-react';
import { validateImageFile } from '@/utils/imageUploadValidation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialAccountForm = {
    name: '',
    family_name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

const initialStoreForm = {
    name_fr: '',
    name_ar: '',
    name_en: '',
    description_fr: '',
    description_ar: '',
    description_en: '',
    storePhone: '',
    address: '',
    responsibleCin: '',
    matriculeFiscale: '',
    rib: '',
    promo: '0',
};

const StoreProfile = () => {
    const { t } = useTranslation();
    const { user, setUser } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [imageSaving, setImageSaving] = useState(false);
    const [storeSaving, setStoreSaving] = useState(false);
    const [accountSaving, setAccountSaving] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [accountForm, setAccountForm] = useState(initialAccountForm);
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const [formData, setFormData] = useState(initialStoreForm);
    const storeId = user?.store?.id;
    const isProfileIncomplete = Boolean(user?.store) && (!user?.store?.name_en || !user?.store?.name_fr || !user?.store?.name_ar || !user?.store?.matriculeFiscale || !user?.store?.storePhone);

    useEffect(() => {
        if (!user) return;

        setAccountForm({
            name: user.name || '',
            family_name: user.family_name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
        });

        if (storeId) {
            fetchStoreData();
        }
    }, [user, storeId]);

    const fetchStoreData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/store/profile');
            const storeData = response.data?.data || response.data;

            if (storeData) {
                setFormData({
                    name_fr: storeData.name_fr || '',
                    name_ar: storeData.name_ar || '',
                    name_en: storeData.name_en || '',
                    description_fr: storeData.description_fr || '',
                    description_ar: storeData.description_ar || '',
                    description_en: storeData.description_en || '',
                    storePhone: storeData.storePhone || '',
                    address: storeData.address || '',
                    responsibleCin: storeData.responsibleCin || '',
                    matriculeFiscale: storeData.matriculeFiscale || '',
                    rib: storeData.rib || '',
                    promo: String(storeData.promo ?? '0'),
                });

                if (storeData.logo) {
                    setLogoPreview(`/storage/${storeData.logo}`);
                }
                if (storeData.cover) {
                    setCoverPreview(`/storage/${storeData.cover}`);
                }
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching store data:', error);
                addNotification('error', t('store.profile.messages.fetchError') || 'Failed to load store data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAccountChange = (e) => {
        const { name, value } = e.target;
        setAccountForm(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file, { maxSizeBytes: 2 * 1024 * 1024 });
        if (!validation.isValid) {
            addNotification('error', validation.error);
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file, { maxSizeBytes: 4 * 1024 * 1024 });
        if (!validation.isValid) {
            addNotification('error', validation.error);
            return;
        }

        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const saveAccountInfo = async () => {
        try {
            setAccountSaving(true);
            const payload = {
                name: accountForm.name,
                family_name: accountForm.family_name,
                email: accountForm.email,
            };

            if (accountForm.password) {
                payload.password = accountForm.password;
                payload.password_confirmation = accountForm.password_confirmation;
            }

            const response = await api.put('/profile', payload);
            const updatedUser = response.data?.user || response.data;

            if (updatedUser) {
                setUser(prev => ({ ...prev, ...updatedUser }));
            }

            setAccountForm(prev => ({ ...prev, password: '', password_confirmation: '' }));
            addNotification('success', 'Account updated successfully');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update account information';
            addNotification('error', message);
        } finally {
            setAccountSaving(false);
        }
    };

    const saveImagesOnly = async () => {
        if (!logoFile && !coverFile) {
            addNotification('info', 'Please choose a logo or cover image first.');
            return;
        }

        try {
            setImageSaving(true);
            const payload = new FormData();
            if (logoFile) payload.append('logo', logoFile);
            if (coverFile) payload.append('cover', coverFile);

            const response = await api.post('/store/profile', payload);
            const store = response.data?.data || response.data;

            if (store) {
                setUser(prev => ({
                    ...prev,
                    store: {
                        ...(prev?.store || {}),
                        ...store,
                    },
                }));
            }

            setLogoFile(null);
            setCoverFile(null);
            addNotification('success', 'Images saved successfully');
        } catch (error) {
            console.error('Image save error:', error);
            addNotification('error', 'Failed to save images');
        } finally {
            setImageSaving(false);
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
            addNotification('error', 'Write at least one name or description before enhancing.');
            return;
        }

        try {
            setTranslating(true);
            console.log('AI enhancement payload:', fieldsToTranslate);
            const response = await api.post('/translate/autofill', { fields: fieldsToTranslate });
            console.log('AI enhancement response:', response?.data);

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
                console.error('AI enhancement API returned unsuccessful response:', response?.data);
                addNotification('error', response?.data?.error || 'AI enhancement failed. Please try again.');
            }
        } catch (error) {
            console.error('Translation error full object:', error);
            console.error('Translation error response data:', error.response?.data);
            console.error('Translation error status:', error.response?.status);
            addNotification('error', error.response?.data?.error || error.response?.data?.message || 'AI enhancement failed. Please try again.');
        } finally {
            setTranslating(false);
        }
    };

    const saveStoreDetails = async () => {
        try {
            setStoreSaving(true);
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    payload.append(key, String(value));
                }
            });

            const response = await api.post('/store/profile', payload);
            const store = response.data?.data || response.data;

            if (store) {
                setUser(prev => ({
                    ...prev,
                    store: {
                        ...(prev?.store || {}),
                        ...store,
                    },
                }));
            }

            addNotification('success', 'Store information saved successfully');
        } catch (error) {
            console.error('Error updating store info:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const messages = Object.values(errors).flat().join('\n');
                addNotification('error', `Validation error:\n${messages}`);
            } else {
                addNotification('error', 'Failed to save store information');
            }
        } finally {
            setStoreSaving(false);
        }
    };

    return (
        <AdminPageLayout
            title={t('store.profile.title') || 'Store Profile'}
            subtitle={t('store.profile.subtitle') || 'Update your store information'}
            icon={Building2}
        >
            <div className="w-full max-w-none mx-auto space-y-7 px-2 md:px-4 text-start">
                {isProfileIncomplete && (
                    <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50/70 p-4 dark:border-yellow-800/60 dark:bg-yellow-950/20">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
                        <div>
                            <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">Complete your store profile</p>
                            <p className="mt-1 text-xs text-yellow-800 dark:text-yellow-300">Fill in the required store data to unlock your dashboard.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <CardBox className="w-full rounded-[30px] border border-border/60 bg-card/80 p-4 md:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
                            <div className="relative w-full lg:w-[220px]">
                                <div className="relative h-44 w-full overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-primary/20 via-secondary/10 to-background">
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="store cover" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                                            <ImagePlus className="h-12 w-12" />
                                        </div>
                                    )}

                                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/15 group">
                                        <div className="flex flex-col items-center gap-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            <Upload className="h-5 w-5" />
                                            <span className="text-xs font-semibold">Cover</span>
                                        </div>
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={handleCoverChange} />
                                    </label>
                                </div>

                                <div className="absolute -bottom-10 left-5 h-24 w-24 overflow-hidden rounded-[26px] border-4 border-card bg-background shadow-xl">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="store logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted/70 text-muted-foreground">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors hover:bg-black/15 group">
                                        <div className="flex h-full w-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                            <ImagePlus className="h-5 w-5 text-white" />
                                        </div>
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={handleLogoChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex-1 pt-12 lg:pt-0">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Store identity</p>
                                        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{formData.name_en || user?.name || 'Your Store'}</h2>
                                    </div>
                                    <Button type="button" onClick={saveImagesOnly} disabled={imageSaving || (!logoFile && !coverFile)} className="h-12 rounded-2xl px-5 font-bold shadow-sm">
                                        {imageSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save images
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardBox>

                    <CardBox className="w-full rounded-[30px] border border-border/60 bg-card/80 p-4 md:p-6">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Account</p>
                                <h3 className="mt-2 text-xl font-black text-foreground">Profile details</h3>
                            </div>
                            <Button type="button" onClick={saveAccountInfo} disabled={accountSaving} className="h-11 rounded-2xl px-5 font-bold">
                                {accountSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save account
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="account-name">First name</Label>
                                <Input id="account-name" name="name" value={accountForm.name} onChange={handleAccountChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-family_name">Last name</Label>
                                <Input id="account-family_name" name="family_name" value={accountForm.family_name} onChange={handleAccountChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2 md:col-span-2 xl:col-span-1">
                                <Label htmlFor="account-email">Email</Label>
                                <Input id="account-email" type="email" name="email" value={accountForm.email} onChange={handleAccountChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-password">Password</Label>
                                <Input id="account-password" type="password" name="password" value={accountForm.password} onChange={handleAccountChange} className="h-12 rounded-2xl text-base" placeholder="New password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-password_confirmation">Confirm password</Label>
                                <Input id="account-password_confirmation" type="password" name="password_confirmation" value={accountForm.password_confirmation} onChange={handleAccountChange} className="h-12 rounded-2xl text-base" placeholder="Repeat password" />
                            </div>
                        </div>
                    </CardBox>

                    <CardBox className="w-full rounded-[30px] border border-border/60 bg-card/80 p-4 md:p-6">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Store content</p>
                                <h3 className="mt-2 text-xl font-black text-foreground">Brand information</h3>
                            </div>
                            <Button type="button" onClick={handleAutoTranslate} disabled={translating} className="h-11 rounded-2xl border border-purple-300 bg-purple-500/10 px-5 font-bold text-purple-600 hover:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300">
                                {translating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                AI enhance & translate
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name_en">Store name (English)</Label>
                                    <Input id="name_en" name="name_en" value={formData.name_en} onChange={handleInputChange} className="h-12 rounded-2xl text-base" placeholder="Store name in English" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name_fr">Store name (French)</Label>
                                    <Input id="name_fr" name="name_fr" value={formData.name_fr} onChange={handleInputChange} className="h-12 rounded-2xl text-base" placeholder="Nom du magasin en français" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name_ar">Store name (Arabic)</Label>
                                    <Input id="name_ar" name="name_ar" value={formData.name_ar} onChange={handleInputChange} className="h-12 rounded-2xl text-base" dir="rtl" placeholder="اسم المتجر بالعربية" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="description_en">Description (English)</Label>
                                    <Textarea id="description_en" name="description_en" value={formData.description_en} onChange={handleInputChange} rows={6} className="min-h-[150px] rounded-2xl text-base" placeholder="Write your store description here and click AI enhance" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description_fr">Description (French)</Label>
                                    <Textarea id="description_fr" name="description_fr" value={formData.description_fr} onChange={handleInputChange} rows={6} className="min-h-[150px] rounded-2xl text-base" placeholder="Décrivez votre boutique en français" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description_ar">Description (Arabic)</Label>
                                    <Textarea id="description_ar" name="description_ar" value={formData.description_ar} onChange={handleInputChange} rows={6} className="min-h-[150px] rounded-2xl text-base" dir="rtl" placeholder="اكتب وصف المتجر بالعربية" />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="button" onClick={saveStoreDetails} disabled={storeSaving} className="h-12 rounded-2xl px-5 font-bold">
                                    {storeSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save store details
                                </Button>
                            </div>
                        </div>
                    </CardBox>

                    <CardBox className="w-full rounded-[30px] border border-border/60 bg-card/80 p-4 md:p-6">
                        <div className="mb-5">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
                            <h3 className="mt-2 text-xl font-black text-foreground">Store contact information</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="storePhone">Phone</Label>
                                <Input id="storePhone" name="storePhone" value={formData.storePhone} onChange={handleInputChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="responsibleCin">Responsible CIN</Label>
                                <Input id="responsibleCin" name="responsibleCin" value={formData.responsibleCin} onChange={handleInputChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="matriculeFiscale">Tax number</Label>
                                <Input id="matriculeFiscale" name="matriculeFiscale" value={formData.matriculeFiscale} onChange={handleInputChange} className="h-12 rounded-2xl text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rib">RIB</Label>
                                <Input id="rib" name="rib" value={formData.rib} onChange={handleInputChange} className="h-12 rounded-2xl text-base" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button type="button" onClick={saveStoreDetails} disabled={storeSaving} className="h-12 rounded-2xl px-5 font-bold">
                                {storeSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save store details
                            </Button>
                        </div>
                    </CardBox>
                </div>
            </div>
        </AdminPageLayout>
    );
};

export default StoreProfile;
