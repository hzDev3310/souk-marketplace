import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Box, Pencil, Package, ShieldCheck, BadgeCheck } from 'lucide-react';
import api from '@/lib/api';
import { imageFallback } from '@/utils/imageFallback';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';

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

const getStoreLogoUrl = (logo) => {
    if (!logo || logo === 'null' || logo === 'undefined') return null;
    if (logo.startsWith('http') || logo.startsWith('/')) return logo;
    return `/storage/${logo.replace(/^storage\//, '').replace(/^\//, '')}`;
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const isAdmin = user?.role === 'ADMIN';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const endpoint = isAdmin ? `/admin/products/${id}` : `/store/products/${id}`;
                const response = await api.get(endpoint);
                const payload = response?.data?.data ?? response?.data;

                if (isMounted) {
                    setProduct(payload);
                    setActiveImage(getProductImageUrl(payload));
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
                if (isMounted) setProduct(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id) fetchProduct();

        return () => { isMounted = false; };
    }, [id, isAdmin]);

    const images = useMemo(() => {
        return product?.albums || [];
    }, [product]);

    const displayName = product?.name_fr || product?.name_en || product?.name_ar || 'Product';
    const secondaryName = product?.name_en || product?.name_ar || '';
    const description = product?.description_fr || product?.description_en || product?.description_ar || '';

    const getStockBadge = () => {
        if (product?.stock === 0) return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-600' };
        if (product?.stock < 5) return { label: 'Low Stock', color: 'bg-orange-500/10 text-orange-600' };
        return { label: `${product?.stock} in stock`, color: 'bg-emerald-500/10 text-emerald-600' };
    };

    return (
        <AdminPageLayout
            title={t('store.products.detail.title') || 'Product Details'}
            subtitle={product?.name_en || `#${id}`}
            icon={Box}
            onBack={() => navigate('/dashboard/products')}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                    <Activity className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold">Loading product...</p>
                </div>
            ) : !product ? (
                <div className="py-20 text-center bg-card/50 rounded-[32px] border border-border/50">
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Product not found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-start">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="relative aspect-square bg-card glass border border-border/40 rounded-[40px] lg:rounded-[60px] overflow-hidden shadow-lg">
                            <img
                                src={activeImage}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                onError={imageFallback}
                            />
                            {product.promo > 0 && (
                                <span className="absolute top-6 left-6 px-3 py-1.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                    -{product.promo}%
                                </span>
                            )}
                            {!isAdmin && (
                                <span className={`absolute top-6 right-6 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg ${getStockBadge().color}`}>
                                    {getStockBadge().label}
                                </span>
                            )}
                        </div>

                        {images.length > 0 && (
                            <div className="flex gap-4">
                                {images.map((album) => {
                                    const url = album.file || album.imageUrl || '/storage/empty/empty.webp';
                                    return (
                                        <div
                                            key={album.id}
                                            className={`w-20 h-20 lg:w-24 lg:h-24 bg-card glass border rounded-3xl overflow-hidden cursor-pointer hover:border-primary transition-colors ${activeImage === url ? 'border-primary' : 'border-border/40'}`}
                                            onClick={() => setActiveImage(getProductImageUrl({ albums: [album] }))}
                                        >
                                            <img
                                                src={url}
                                                className="w-full h-full object-cover"
                                                alt=""
                                                onError={imageFallback}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8 py-2">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Button
                                        variant="outlinemuted"
                                        size="sm"
                                        onClick={() => navigate('/dashboard/products')}
                                        className="rounded-full font-black uppercase tracking-widest text-[10px]"
                                    >
                                        <ArrowLeft size={14} strokeWidth={2.5} />
                                        Return
                                    </Button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        ID: {String(product.id).substring(0, 8)}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStockBadge().color}">
                                        {getStockBadge().label}
                                    </span>
                                </div>
                            </div>

                            {product.store && (
                                <a
                                    href={product.store.slug ? `/store/${product.store.slug}` : '#'}
                                    target={product.store.slug ? '_blank' : undefined}
                                    rel={product.store.slug ? 'noreferrer' : undefined}
                                    className="inline-flex items-center gap-3 w-fit rounded-full border border-border/50 bg-card px-3 py-2 shadow-sm hover:border-primary/60 transition-colors"
                                >
                                    {product.store.logo ? (
                                        <img
                                            src={getStoreLogoUrl(product.store.logo)}
                                            alt={product.store.name_fr || product.store.name_en || 'Store'}
                                            className="w-10 h-10 rounded-full object-cover border border-border/50"
                                            onError={imageFallback}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                                            {(product.store.name_fr || product.store.name_en || 'S').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                        {product.store.name_fr || product.store.name_en || 'Store'}
                                    </span>
                                </a>
                            )}

                            <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                                {displayName}
                            </h1>
                            {secondaryName && secondaryName !== displayName && (
                                <p className="text-sm font-bold text-muted-foreground">{secondaryName}</p>
                            )}

                            <div className="flex items-center gap-6 flex-wrap">
                                <p className="text-4xl font-black text-primary">
                                    {Number(product.price).toFixed(2)}
                                    <span className="text-xs font-black text-muted-foreground uppercase ml-1">{t('website.currency') || 'TND'}</span>
                                </p>
                                {product.promo > 0 && (
                                    <>
                                        <p className="text-xl font-bold text-muted-foreground line-through opacity-50 pt-2">
                                            {Number(product.storePrice ? product.display_price : product.price).toFixed(2)} {t('website.currency') || 'TND'}
                                        </p>
                                        <span className="px-2 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                            -{product.promo}%
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t('admin.products.table.quantity') || 'Stock'}</h4>
                            <div className="flex items-center gap-6">
                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black ${getStockBadge().color}`}>
                                    {getStockBadge().label}
                                </span>
                                <span className="text-sm font-bold text-muted-foreground">
                                    {product.stock} units
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t('admin.products.table.description') || 'Description'}</h4>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                {description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => navigate(`/dashboard/products/${product.id}/edit`)}
                                className="flex-1 py-5 bg-primary text-white rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                            >
                                <Pencil size={20} strokeWidth={2.5} />
                                {t('common.actions.edit') || 'Modifier'}
                            </Button>
                            <Button
                                variant="outlinemuted"
                                onClick={() => navigate('/dashboard/products')}
                                className="flex-1 py-5 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <ArrowLeft size={20} strokeWidth={2.5} />
                                {t('common.actions.back') || 'Back'}
                            </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 pt-8">
                            <CardBox className="p-4 bg-muted/20 border border-border/20 rounded-3xl shadow-none">
                                <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('website.productInfo.authenticity') || 'Authenticity'}</p>
                                <p className="text-xs font-bold">{t('website.productInfo.genuine') || '100% Genuine'}</p>
                            </CardBox>
                            <CardBox className="p-4 bg-muted/20 border border-border/20 rounded-3xl shadow-none">
                                <BadgeCheck className="w-5 h-5 text-primary mb-2" />
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('website.productInfo.storeVerified') || 'Store Verified'}</p>
                                <p className="text-xs font-bold">{t('website.productInfo.trustedSeller') || 'Trusted Seller'}</p>
                            </CardBox>
                        </div>
                    </div>
                </div>
            )}
        </AdminPageLayout>
    );
};

export default ProductDetail;
