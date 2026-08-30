import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, Building2, Image as ImageIcon, MapPin, Package, Phone, Pencil, Trash2, Power, ShoppingCart, PackageCheck, RotateCcw, XCircle, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { imageFallback } from '@/utils/imageFallback';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const getStoreLogoUrl = (logo) => {
    if (!logo || logo === 'null' || logo === 'undefined') return null;
    if (logo.startsWith('http') || logo.startsWith('/')) return logo;
    return `/storage/${logo.replace(/^storage\//, '').replace(/^\//, '')}`;
};

const getCoverUrl = (cover) => {
    if (!cover || cover === 'null' || cover === 'undefined') return null;
    if (cover.startsWith('http') || cover.startsWith('/')) return cover;
    return `/storage/${cover.replace(/^storage\//, '').replace(/^\//, '')}`;
};

const getProductImageUrl = (product) => {
    const album = product?.albums?.find((entry) => entry?.file) || product?.albums?.[0];
    const candidate = album?.file || album?.imageUrl || product?.imageUrl || '/storage/empty/empty.webp';

    if (!candidate || candidate === 'null' || candidate === 'undefined') {
        return '/storage/empty/empty.webp';
    }

    if (candidate.startsWith('http') || candidate.startsWith('/')) {
        return candidate;
    }

    return `/storage/${candidate.replace(/^storage\//, '').replace(/^\//, '')}`;
};

const StoreDetail = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const passedStore = location.state?.store ?? null;

    const [store, setStore] = useState(passedStore);
    const [products, setProducts] = useState(location.state?.products ?? []);
    const [loading, setLoading] = useState(!passedStore);

    useEffect(() => {
        let isMounted = true;

        const loadStore = async () => {
            if (passedStore) {
                setStore(passedStore);
                if (passedStore.products) {
                    setProducts(passedStore.products);
                }
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const usersResponse = await api.get('/admin/users/stores');
                const storeFromApi = usersResponse.data?.data?.find((entry) => {
                    const idMatches = String(entry.id) === String(id);
                    const nestedMatches = String(entry.store?.id) === String(id);
                    return idMatches || nestedMatches;
                });

                if (!storeFromApi) {
                    const profileResponse = await api.get('/store/profile');
                    const profile = profileResponse.data?.data ?? profileResponse.data;
                    if (profile && (String(profile.id) === String(id) || String(profile.store_id) === String(id))) {
                        if (isMounted) {
                            setStore(profile);
                        }
                    }
                } else {
                    const mappedStore = storeFromApi.store ? {
                        ...storeFromApi.store,
                        user: storeFromApi,
                        products_count: storeFromApi.products_count ?? 0,
                        total_orders: storeFromApi.total_orders ?? 0,
                        delivered_orders: storeFromApi.delivered_orders ?? 0,
                        returned_orders: storeFromApi.returned_orders ?? 0,
                        cancelled_orders: storeFromApi.cancelled_orders ?? 0,
                        revenue: storeFromApi.revenue ?? 0,
                    } : storeFromApi;
                    if (isMounted) setStore(mappedStore);
                }

                const productsResponse = await api.get('/admin/products');
                const allProducts = productsResponse.data?.data ?? productsResponse.data ?? [];
                const relatedProducts = allProducts.filter((product) => {
                    const productStoreId = product.store_id ?? product.store?.id;
                    return String(productStoreId) === String(id);
                });

                if (isMounted) setProducts(relatedProducts);
            } catch (error) {
                console.error('Error fetching store details:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadStore();

        return () => { isMounted = false; };
    }, [id, passedStore]);

    const storeName = useMemo(() => {
        const lang = i18n.language;
        return store?.[`name_${lang}`] || store?.name_fr || store?.name_en || store?.name_ar || t('admin.stores.messages.store', 'Store');
    }, [store, i18n.language, t]);

    const description = useMemo(() => {
        const lang = i18n.language;
        return store?.[`description_${lang}`] || store?.description_fr || store?.description_en || store?.description_ar || t('admin.stores.messages.noDescription', 'No description provided for this store.');
    }, [store, i18n.language, t]);

    const userId = store?.user?.id || store?.id;

    const handleEdit = () => {
        navigate(`/dashboard/stores/${userId}/edit`);
    };

    const handleDelete = async () => {
        if ((store?.products_count ?? 0) > 0) return;
        if (!window.confirm(t('admin.stores.messages.confirmDelete', 'Are you sure you want to delete this store?'))) return;
        try {
            await api.delete(`/admin/users/stores/${userId}`);
            navigate('/dashboard/stores');
        } catch (error) {
            console.error('Error deleting store:', error);
        }
    };

    const handleToggleActive = async () => {
        const newActive = !store.isActive;
        const prev = store.isActive;
        setStore((s) => ({ ...s, isActive: newActive }));
        try {
            await api.put(`/admin/users/stores/${userId}`, { isActive: newActive });
        } catch (error) {
            console.error('Error toggling store status:', error);
            setStore((s) => ({ ...s, isActive: prev }));
        }
    };

    if (loading) {
        return (
            <AdminPageLayout title={t('admin.stores.detail.title', 'Store Details')} subtitle={t('admin.stores.detail.loading', 'Loading store profile')} icon={Building2} onBack={() => navigate('/dashboard/stores')}>
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                    <Activity className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold">{t('admin.common.loading', 'Loading...')}</p>
                </div>
            </AdminPageLayout>
        );
    }

    if (!store) {
        return (
            <AdminPageLayout title={t('admin.stores.detail.title', 'Store Details')} subtitle={t('admin.stores.detail.profile', 'Store profile')} icon={Building2} onBack={() => navigate('/dashboard/stores')}>
                <div className="py-20 text-center bg-card/50 rounded-[32px] border border-border/50">
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.stores.messages.notFound', 'Store not found')}</p>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout
            title={t('admin.stores.detail.title', 'Store Details')}
            subtitle={t('admin.stores.detail.subtitle', 'Store profile and catalog')}
            icon={Building2}
            onBack={() => navigate('/dashboard/stores')}
        >
            <div className="space-y-8 text-start">
                <div className="rounded-[36px] overflow-hidden border border-border/50 bg-card/80 shadow-sm">
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-muted/60">
                        {store.cover ? (
                            <img
                                src={getCoverUrl(store.cover)}
                                alt={storeName}
                                className="w-full h-full object-cover"
                                onError={imageFallback}
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>

                    <div className="relative -mt-16 md:-mt-20 px-6 md:px-8 pb-8">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] overflow-hidden border-4 border-background bg-card shadow-xl flex-shrink-0">
                                {store.logo ? (
                                    <img
                                        src={getStoreLogoUrl(store.logo)}
                                        alt={storeName}
                                        className="w-full h-full object-cover"
                                        onError={imageFallback}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black">
                                        {storeName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">{storeName}</h1>
                                <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                    {description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                        <Package size={14} />
                                        {products.length} {t('admin.stores.detail.products', 'products')}
                                    </span>
                                    {store.storePhone && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                            <Phone size={14} />
                                            {store.storePhone}
                                        </span>
                                    )}
                                    {store.address && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                            <MapPin size={14} />
                                            {store.address}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-3">
                                    <Button variant="soft" size="sm" rounded="2xl" onClick={handleEdit}>
                                        <Pencil size={16} />
                                        {t('common.actions.edit', 'Update')}
                                    </Button>
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        rounded="2xl"
                                        onClick={handleToggleActive}
                                    >
                                        <Power size={16} />
                                        {store.isActive ? t('admin.stores.detail.deactivate', 'Deactivate') : t('admin.stores.detail.activate', 'Activate')}
                                    </Button>
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        color="error"
                                        rounded="2xl"
                                        disabled={(store.products_count ?? 0) > 0}
                                        onClick={handleDelete}
                                    >
                                        <Trash2 size={16} />
                                        {t('common.actions.delete', 'Delete')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 text-start">
                    <CardBox className="p-4 bg-card border border-border/50 rounded-[24px] text-center">
                        <Package className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-black text-foreground">{store.products_count ?? products.length}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('admin.stores.detail.stats.products', 'Products')}</p>
                    </CardBox>
                    <CardBox className="p-4 bg-card border border-border/50 rounded-[24px] text-center">
                        <ShoppingCart className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-black text-foreground">{store.total_orders ?? 0}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('admin.stores.detail.stats.orders', 'Orders')}</p>
                    </CardBox>
                    <CardBox className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-[24px] text-center">
                        <PackageCheck className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-emerald-600">{store.delivered_orders ?? 0}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('admin.stores.detail.stats.delivered', 'Delivered')}</p>
                    </CardBox>
                    <CardBox className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-[24px] text-center">
                        <RotateCcw className="w-5 h-5 text-rose-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-rose-600">{store.returned_orders ?? 0}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('admin.stores.detail.stats.returned', 'Returned')}</p>
                    </CardBox>
                    <CardBox className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-[24px] text-center">
                        <XCircle className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-black text-amber-600">{store.cancelled_orders ?? 0}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('admin.stores.detail.stats.cancelled', 'Cancelled')}</p>
                    </CardBox>
                    <CardBox className="p-4 bg-card border border-border/50 rounded-[24px] text-center">
                        <Wallet className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-black text-foreground">{Number(store.revenue ?? 0).toFixed(2)}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('admin.stores.detail.stats.revenue', 'Revenue (TND)')}</p>
                    </CardBox>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">{t('admin.stores.detail.productsTitle', 'Products')}</h2>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{t('admin.stores.detail.fromStore', 'From this store')}</p>
                        </div>
                        <Button variant="outlinemuted" size="sm" rounded="2xl" onClick={() => navigate('/dashboard/products')}>
                            {t('admin.stores.detail.backToProducts', 'Back to products')}
                        </Button>
                    </div>

                    {products.length === 0 ? (
                        <CardBox className="p-10 rounded-[28px] border-border/50 text-center">
                            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <ImageIcon size={28} />
                            </div>
                            <p className="mt-4 text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.stores.messages.noProducts', 'No products')}</p>
                        </CardBox>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {products.map((product) => {
                                const productLang = i18n.language;
                                const productName = product?.[`name_${productLang}`] || product?.name_fr || product?.name_en || t('common.product', 'Product');
                                return (
                                    <div key={product.id} className="rounded-[28px] border border-border/50 bg-card p-4 shadow-sm hover:shadow-md transition-all">
                                        <div className="relative mb-4 overflow-hidden rounded-[22px] bg-muted/35">
                                            <img
                                                src={getProductImageUrl(product)}
                                                alt={productName}
                                                className="h-44 w-full object-cover"
                                                onError={imageFallback}
                                            />
                                            {product.promo > 0 && (
                                                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                    -{product.promo}%
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-lg font-black text-foreground tracking-tight">{productName}</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{product.slug}</p>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xl font-black text-primary">
                                                    {Number(product.price).toFixed(2)}
                                                    <span className="ml-1 text-[10px] uppercase text-muted-foreground">{t('website.currency', 'TND')}</span>
                                                </p>
                                                <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${product.stock === 0 ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                    {product.stock === 0 ? t('admin.products.stock.outOfStock', 'Out of stock') : `${product.stock} ${t('admin.products.stock.inStock', 'in stock')}`}
                                                </span>
                                            </div>

                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="w-full rounded-2xl"
                                                onClick={() => navigate(`/dashboard/products/${product.id}`)}
                                            >
                                                {t('common.actions.view', 'View product')}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminPageLayout>
    );
};

export default StoreDetail;
