import React, { useEffect, useState } from 'react';
import { Mail, UserCircle, ShieldCheck, Building2, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const initialUserForm = {
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
    governorate: '',
};

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const { addNotification } = useNotification();
    const [saving, setSaving] = useState(false);
    const [loadingStore, setLoadingStore] = useState(false);
    const [userForm, setUserForm] = useState(initialUserForm);
    const [storeForm, setStoreForm] = useState(initialStoreForm);

    const roleLabel = user?.role || 'USER';

    useEffect(() => {
        if (!user) return;

        setUserForm({
            name: user.name || '',
            family_name: user.family_name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
        });

        if (user?.role === 'STORE') {
            fetchStoreData();
        }
    }, [user]);

    const fetchStoreData = async () => {
        try {
            setLoadingStore(true);
            const response = await api.get('/store/profile');
            const store = response.data?.data || response.data;

            if (store) {
                setStoreForm({
                    name_fr: store.name_fr || '',
                    name_ar: store.name_ar || '',
                    name_en: store.name_en || '',
                    description_fr: store.description_fr || '',
                    description_ar: store.description_ar || '',
                    description_en: store.description_en || '',
                    storePhone: store.storePhone || '',
                    address: store.address || '',
                    governorate: store.governorate || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch store profile', error);
        } finally {
            setLoadingStore(false);
        }
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStoreChange = (e) => {
        const { name, value } = e.target;
        setStoreForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                name: userForm.name,
                family_name: userForm.family_name,
                email: userForm.email,
            };

            if (userForm.password) {
                payload.password = userForm.password;
                payload.password_confirmation = userForm.password_confirmation;
            }

            const userResponse = await api.put('/profile', payload);
            const updatedUser = userResponse.data?.user || userResponse.data;

            if (updatedUser) {
                setUser((prev) => ({ ...prev, ...updatedUser }));
            }

            if (user?.role === 'STORE') {
                const storePayload = new FormData();
                Object.entries(storeForm).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        storePayload.append(key, value);
                    }
                });

                await api.post('/store/profile', storePayload);
            }

            addNotification('success', 'Profile updated successfully');
            setUserForm((prev) => ({
                ...prev,
                password: '',
                password_confirmation: '',
            }));
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile.';
            addNotification('error', message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminPageLayout
            title="Profile"
            subtitle="Manage your account and store information"
            icon={UserCircle}
        >
            <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6 text-start">
                <CardBox className="p-6 rounded-[32px] border-border/40 bg-card/60">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 text-2xl font-black">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>

                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                <ShieldCheck size={12} />
                                {roleLabel}
                            </div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">
                                {user?.name || 'User Name'}
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                </CardBox>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CardBox className="p-6 rounded-[28px] border-border/40 bg-card/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <UserCircle size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Account Information</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">First name</Label>
                                <Input id="name" name="name" value={userForm.name} onChange={handleUserChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="family_name">Last name</Label>
                                <Input id="family_name" name="family_name" value={userForm.family_name} onChange={handleUserChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" value={userForm.email} onChange={handleUserChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">New password</Label>
                                <Input id="password" type="password" name="password" value={userForm.password} onChange={handleUserChange} placeholder="Leave blank to keep current password" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm new password</Label>
                                <Input id="password_confirmation" type="password" name="password_confirmation" value={userForm.password_confirmation} onChange={handleUserChange} />
                            </div>
                        </div>
                    </CardBox>

                    <CardBox className="p-6 rounded-[28px] border-border/40 bg-card/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Access</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</p>
                                <p className="mt-1 font-bold text-foreground">{roleLabel}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                <p className="mt-1 font-bold text-emerald-500">Active</p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail size={14} />
                                <span>{user?.email || 'Not available'}</span>
                            </div>
                        </div>
                    </CardBox>
                </div>

                {user?.role === 'STORE' && (
                    <CardBox className="p-6 rounded-[28px] border-border/40 bg-card/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Store Information</h3>
                        </div>

                        {loadingStore ? (
                            <p className="text-sm text-muted-foreground">Loading store details...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name_fr">Store name (French)</Label>
                                    <Input id="name_fr" name="name_fr" value={storeForm.name_fr} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name_ar">Store name (Arabic)</Label>
                                    <Input id="name_ar" name="name_ar" value={storeForm.name_ar} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name_en">Store name (English)</Label>
                                    <Input id="name_en" name="name_en" value={storeForm.name_en} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storePhone">Phone</Label>
                                    <Input id="storePhone" name="storePhone" value={storeForm.storePhone} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" value={storeForm.address} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description_en">Description (English)</Label>
                                    <Input id="description_en" name="description_en" value={storeForm.description_en} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description_fr">Description (French)</Label>
                                    <Input id="description_fr" name="description_fr" value={storeForm.description_fr} onChange={handleStoreChange} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description_ar">Description (Arabic)</Label>
                                    <Input id="description_ar" name="description_ar" value={storeForm.description_ar} onChange={handleStoreChange} />
                                </div>
                            </div>
                        )}
                    </CardBox>
                )}

                <div className="flex justify-end">
                    <Button type="submit" className="gap-2 font-black" disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </AdminPageLayout>
    );
};

export default ProfilePage;
