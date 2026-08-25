import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import Modal from '@/components/shared/Modal';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Plus, Pencil, Trash2, Search, Box, Image as ImageIcon,
    Activity, Eye, Package, ChevronDown, ChevronUp
} from 'lucide-react';

const ProductList = ({ role = 'admin' }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = role === 'admin';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingProduct, setViewingProduct] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [quickEditData, setQuickEditData] = useState({});

    const storeId = user?.store?.id;
    const isProfileIncomplete = !isAdmin && (!user?.store?.name_en || !user?.store?.name_fr || !user?.store?.name_ar || !user?.store?.storePhone);

    useEffect(() => {
        if (isProfileIncomplete) navigate('/dashboard/profile', { replace: true });
    }, [isProfileIncomplete]);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const url = isAdmin ? '/admin/products' : '/store/products';
            const response = await api.get(url);
            const payload = response.data?.data ?? response.data ?? [];
            const list = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : [];
            setProducts(list);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => navigate('/dashboard/products/create');

    const handleEdit = (product) => navigate(`/dashboard/products/${product.id}/edit`);

    const handleToggleActive = async (product) => {
        try {
            const url = isAdmin ? `/admin/products/${product.id}/toggle-active` : `/store/products/${product.id}/toggle-active`;
            await api.patch(url);
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
        } catch (error) {
            console.error('Error toggling product:', error);
        }
    };

    const handleDelete = async (product) => {
        if (!confirm(t('admin.products.messages.confirmDelete') || 'Are you sure you want to delete this product?')) return;
        try {
            const url = isAdmin ? `/admin/products/${product.id}` : `/store/products/${product.id}`;
            await api.delete(url);
            setProducts(prev => prev.filter(p => p.id !== product.id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleQuickEdit = async (product) => {
        const edits = quickEditData[product.id];
        if (!edits) return;
        try {
            const url = isAdmin ? `/admin/products/${product.id}` : `/store/products/${product.id}`;
            await api.put(url, {
                price: edits.price ?? product.price,
                stock: edits.stock ?? product.stock,
            });
            setProducts(prev => prev.map(p => p.id === product.id ? {
                ...p,
                price: edits.price ? parseFloat(edits.price) : p.price,
                stock: edits.stock !== undefined ? parseInt(edits.stock) : p.stock,
            } : p));
            setQuickEditData(prev => ({ ...prev, [product.id]: null }));
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/10' };
        if (stock < 5) return { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-500/10' };
        return { label: `${stock} in stock`, color: 'text-green-500', bg: 'bg-green-500/10' };
    };

    const filteredProducts = products.filter(prod => {
        const matchesSearch = prod.name_en?.toLowerCase().includes(search.toLowerCase()) ||
            prod.name_fr?.toLowerCase().includes(search.toLowerCase());
        if (!isAdmin) return matchesSearch;
        if (statusFilter === 'active') return matchesSearch && prod.isActive;
        if (statusFilter === 'deactivated') return matchesSearch && !prod.isActive;
        return matchesSearch;
    });

    if (!isAdmin && !storeId) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">No store associated with this account.</p>
            </div>
        );
    }

    return (
        <AdminPageLayout
            title={isAdmin ? (t('admin.products.title') || "Products") : (t('store.products.title') || "My Products")}
            subtitle={isAdmin ? (t('admin.products.subtitle') || "Manage your product listings") : (t('store.products.subtitle') || "Manage your store products")}
            icon={Box}
            onAdd={handleAdd}
            addLabel={isAdmin ? (t('admin.products.add') || "Add Product") : (t('store.products.add') || "Add Product")}
        >
            <div className="space-y-6 text-start pb-24 xl:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            placeholder={isAdmin ? (t('admin.products.search') || "Search products...") : (t('store.products.search') || "Search products...")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-12 bg-card border-border/50 rounded-2xl font-bold"
                        />
                    </div>
                    {isAdmin && (
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-12 px-4 rounded-2xl bg-card border border-border/60 text-foreground font-bold text-sm"
                        >
                            <option value="all">{t('admin.products.filter.all') || "All Products"}</option>
                            <option value="active">{t('admin.products.filter.active') || "Active"}</option>
                            <option value="deactivated">{t('admin.products.filter.deactivated') || "Deactivated"}</option>
                        </select>
                    )}
                </div>

                {/* Mobile View - Card List */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                            <Activity className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground font-bold">{t('admin.common.loading')}</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-20 text-center space-y-3 bg-card/50 rounded-[32px] border border-border/50">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <Package size={32} />
                            </div>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.products.messages.noProducts') || "No products found"}</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="bg-card border border-border/60 rounded-[24px] p-5 space-y-4 shadow-sm active:scale-[0.98] transition-transform">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border/50">
                                        {product.albums && product.albums.length > 0 ? (
                                            <img src={product.albums[0].imageUrl || product.albums[0].file} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src="/storage/empty/empty.webp" alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-foreground tracking-tight leading-none mb-1 truncate">{product.name_fr}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{product.slug}</p>
                                    </div>
                                    <Switch size="sm" color="success" checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/40">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('admin.products.table.price') || "Price"}</p>
                                        <p className="text-sm font-black text-foreground">{Number(product.price).toFixed(2)} {t('website.currency') || 'TND'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('admin.products.table.quantity') || "Stock"}</p>
                                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black ${getStockStatus(product.stock).bg} ${getStockStatus(product.stock).color}`}>
                                            {getStockStatus(product.stock).label}
                                        </span>
                                    </div>
                                </div>

                                {isAdmin && expandedCardId === product.id && (
                                    <div className="space-y-3 pt-2 border-t border-border/40">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Price</label>
                                                <Input type="number" step="0.01" defaultValue={product.price}
                                                    onChange={(e) => setQuickEditData(prev => ({ ...prev, [product.id]: { ...prev[product.id], price: e.target.value } }))}
                                                    className="h-9 text-sm rounded-lg bg-card border-border/60" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Quantity</label>
                                                <Input type="number" defaultValue={product.stock}
                                                    onChange={(e) => setQuickEditData(prev => ({ ...prev, [product.id]: { ...prev[product.id], stock: e.target.value } }))}
                                                    className="h-9 text-sm rounded-lg bg-card border-border/60" />
                                            </div>
                                        </div>
                                        <Button size="sm" className="w-full rounded-xl" onClick={() => handleQuickEdit(product)}>
                                            {t('common.save') || 'Save'}
                                        </Button>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    {isAdmin && (
                                        <Button size="iconsm" variant="soft" rounded="xl" color={expandedCardId === product.id ? "primary" : "secondary"}
                                            onClick={() => setExpandedCardId(expandedCardId === product.id ? null : product.id)}>
                                            {expandedCardId === product.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </Button>
                                    )}
                                    <Button size="iconsm" variant="soft" rounded="xl" color="info" onClick={() => setViewingProduct(product)}>
                                        <Eye size={18} strokeWidth={2.5} />
                                    </Button>
                                    <Button size="iconsm" variant="soft" rounded="xl" color="warning" onClick={() => handleEdit(product)}>
                                        <Pencil size={18} strokeWidth={2.5} />
                                    </Button>
                                    {!isAdmin && (
                                        <Button size="iconsm" variant="soft" rounded="xl" color="error" onClick={() => handleDelete(product)}>
                                            <Trash2 size={18} strokeWidth={2.5} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View - Table */}
                <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.product') || "PRODUCT"}</TableHead>
                                {isAdmin && <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.store') || "STORE"}</TableHead>}
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.price') || "PRICE"}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.quantity') || "QUANTITY"}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.status') || "STATUS"}</TableHead>
                                <TableHead className="py-5 px-6 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.actions') || "ACTIONS"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center">
                                        <Activity className="w-6 h-6 animate-spin text-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {t('admin.products.messages.noProducts') || "No products found"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border/50 shrink-0">
                                                    {product.albums && product.albums.length > 0 ? (
                                                        <img src={product.albums[0].imageUrl || product.albums[0].file} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={18} className="text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-foreground tracking-tight text-sm truncate">{product.name_fr}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground truncate">{product.name_en}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="py-4 px-6">
                                                <p className="text-sm font-bold text-foreground truncate">{product.store?.name_fr || product.store?.name_en || '—'}</p>
                                            </TableCell>
                                        )}
                                        <TableCell className="py-4 px-6">
                                            <p className="text-sm font-black text-foreground">{Number(product.price).toFixed(2)} {t('website.currency') || 'TND'}</p>
                                            {product.promo > 0 && <p className="text-[10px] font-bold text-green-500">-{product.promo}%</p>}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black ${getStockStatus(product.stock).bg} ${getStockStatus(product.stock).color}`}>
                                                {getStockStatus(product.stock).label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <Switch size="sm" color="success" checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} />
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-end">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip content={t('common.actions.view')}>
                                                    <Button size="iconsm" variant="soft" rounded="xl" color="info" onClick={() => setViewingProduct(product)}>
                                                        <Eye size={18} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={t('common.actions.edit')}>
                                                    <Button size="iconsm" variant="soft" rounded="xl" color="warning" onClick={() => handleEdit(product)}>
                                                        <Pencil size={18} />
                                                    </Button>
                                                </Tooltip>
                                                {!isAdmin && (
                                                    <Tooltip content={t('common.actions.delete')}>
                                                        <Button size="iconsm" variant="soft" rounded="xl" color="error" onClick={() => handleDelete(product)}>
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardBox>
            </div>

           
        </AdminPageLayout>
    );
};

export default ProductList;
