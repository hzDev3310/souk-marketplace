import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Building2, Image as ImageIcon, MapPin, Package, Phone } from 'lucide-react';
import api from '@/lib/api';
import { imageFallback } from '@/utils/imageFallback';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';

const getStoreLogoUrl = (logo) => {
    if (!logo || logo === 'null' || logo === 'undefined') return null;
    if (logo.startsWith('http') || logo.startsWith('/')) return logo;
    return `/storage/${logo.replace(/^storage\//, '').replace(/^\//, '')}`;
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
                    const mappedStore = storeFromApi.store ? { ...storeFromApi.store, user: storeFromApi } : storeFromApi;
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
        return store?.name_fr || store?.name_en || store?.name_ar || 'Store';
    }, [store]);

    const description = useMemo(() => {
        return store?.description_fr || store?.description_en || store?.description_ar || 'No description provided for this store.';
    }, [store]);

    if (loading) {
        return (
            <AdminPageLayout title="Store Details" subtitle="Loading store profile" icon={Building2} onBack={() => navigate('/dashboard/products')}>
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                    <Activity className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold">Loading store...</p>
                </div>
            </AdminPageLayout>
        );
    }

    if (!store) {
        return (
            <AdminPageLayout title="Store Details" subtitle="Store profile" icon={Building2} onBack={() => navigate('/dashboard/products')}>
                <div className="py-20 text-center bg-card/50 rounded-[32px] border border-border/50">
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Store not found</p>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout
            title="Store Details"
            subtitle="Store profile and catalog"
            icon={Building2}
            onBack={() => navigate('/dashboard/products')}
        >
            <div className="space-y-8 text-start">
                <div className="rounded-[36px] overflow-hidden border border-border/50 bg-card/80 shadow-sm">
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-muted/60">
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
                                        {products.length} products
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
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Products</h2>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">From this store</p>
                        </div>
                        <Button variant="outlinemuted" size="sm" rounded="2xl" onClick={() => navigate('/dashboard/products')}>
                            Back to products
                        </Button>
                    </div>

                    {products.length === 0 ? (
                        <CardBox className="p-10 rounded-[28px] border-border/50 text-center">
                            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <ImageIcon size={28} />
                            </div>
                            <p className="mt-4 text-muted-foreground font-black uppercase tracking-widest text-xs">No products</p>
                        </CardBox>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {products.map((product) => (
                                <div key={product.id} className="rounded-[28px] border border-border/50 bg-card p-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="relative mb-4 overflow-hidden rounded-[22px] bg-muted/35">
                                        <img
                                            src={getProductImageUrl(product)}
                                            alt={product.name_fr || product.name_en || 'Product'}
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
                                            <h3 className="text-lg font-black text-foreground tracking-tight">{product.name_fr || product.name_en || 'Product'}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{product.slug}</p>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xl font-black text-primary">
                                                {Number(product.price).toFixed(2)}
                                                <span className="ml-1 text-[10px] uppercase text-muted-foreground">TND</span>
                                            </p>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black ${product.stock === 0 ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                                            </span>
                                        </div>

                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full rounded-2xl"
                                            onClick={() => navigate(`/dashboard/products/${product.id}`)}
                                        >
                                            View product
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminPageLayout>
    );
};

export default StoreDetail;
