import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Package, Box, Store as StoreIcon, Sparkles, Tag,
    Layers, CheckCircle2, AlertTriangle, PackageX, TrendingDown, BadgePercent
} from 'lucide-react';

const stockBadge = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: PackageX };
    if (stock < 5) return { label: 'Low Stock', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle };
    return { label: 'In Stock', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle2 };
};

const StatCard = ({ icon: Icon, iconClass = 'text-primary', label, value }) => (
    <div className="relative rounded-2xl border border-border/50 bg-muted/20 p-4 overflow-hidden">
        <div className="absolute -top-6 -end-6 w-16 h-16 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-1.5 mb-2">
            <Icon size={13} className={iconClass} />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        </div>
        <p className="font-black text-foreground text-base truncate">{value}</p>
    </div>
);

const ProductViewModal = ({ product, apiBase, showStore = false, showPromo = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);

    const albums = product?.albums || [];
    const mainImage = albums[activeImage]?.file || '/storage/empty/empty.webp';

    useEffect(() => {
        setActiveImage(0);
    }, [product?.id]);

    if (!product) return null;

    const stock = stockBadge(Number(product.stock));
    const StockIcon = stock.icon;
    const displayPrice = (product.price * 1.1).toFixed(2);
    const storeName = product.store?.store_name_fr || product.store?.name_fr || 'N/A';

    return (
        <div className="space-y-8 text-start">
            {/* Hero split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Gallery */}
                <div>
                    <div className="relative rounded-[28px] overflow-hidden border border-border/40 bg-muted/30 aspect-square">
                        <img
                            src={mainImage}
                            alt={product.name_fr || product.name_en}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 end-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase border ${stock.bg} ${stock.color} ${stock.border}`}>
                                <StockIcon size={11} />
                                {stock.label}
                            </span>
                        </div>
                    </div>
                    {albums.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {albums.map((a, idx) => (
                                <button
                                    key={a.id || idx}
                                    type="button"
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                        idx === activeImage
                                            ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                                            : 'border-border/40 hover:border-primary/50 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={a.file} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                                <Sparkles size={11} />
                                {t('admin.products.view.featured') || 'Featured Product'}
                            </span>
                            {showPromo && Number(product.promo) > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                                    <BadgePercent size={11} />
                                    -{product.promo}%
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                            {product.name_fr || product.name_en}
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">
                            {product.slug}
                        </p>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-end gap-3 rounded-[24px] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                {t('admin.products.view.displayPrice') || 'Display Price'}
                            </p>
                            <p className="text-4xl font-black text-primary leading-none mt-1">
                                ${displayPrice}
                            </p>
                        </div>
                        <div className="pb-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {t('admin.products.view.basePrice') || 'Base Price'}
                            </p>
                            <p className="text-sm font-black text-muted-foreground line-through">${product.price}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon={Package}
                            label={t('admin.products.view.stock') || 'Stock'}
                            value={product.stock}
                        />
                        {showStore && (
                            <StatCard
                                icon={StoreIcon}
                                label={t('admin.products.view.store') || 'Store'}
                                value={storeName}
                                iconClass="text-secondary"
                            />
                        )}
                        {showPromo && Number(product.promo) > 0 && (
                            <StatCard
                                icon={TrendingDown}
                                label={t('store.products.view.promo') || 'Promo'}
                                value={`${product.promo}%`}
                                iconClass="text-rose-500"
                            />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductViewModal;