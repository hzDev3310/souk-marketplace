import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import Modal from '@/components/shared/Modal';
import ProductViewModal from '@/components/shared/ProductViewModal';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus, Pencil, Trash2, Search, Box, Image as ImageIcon,
    CheckCircle2, XCircle, Activity, Eye, Package, ChevronDown, ChevronUp
} from 'lucide-react';

const StoreProducts = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewingProduct, setViewingProduct] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [quickEditData, setQuickEditData] = useState({});

    // Check if profile is incomplete
    const isProfileIncomplete = !user?.store?.name_en || !user?.store?.name_fr || !user?.store?.name_ar || !user?.store?.matriculeFiscale || !user?.store?.storePhone;

    // Redirect if profile incomplete
    useEffect(() => {
        if (isProfileIncomplete) {
            navigate('/dashboard/profile', { replace: true });
        }
    }, [isProfileIncomplete, navigate]);

    const storeId = user?.store?.id;

    useEffect(() => {
        if (storeId) {
            fetchProducts();
        }
    }, [storeId]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/store/products');
            const productsData = response.data?.data?.data || response.data?.data || response.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (product) => {
        if (!confirm(t('store.products.messages.confirmDelete', { name: product.name_en }) || `Confirm deletion?`)) return;
        try {
            await api.delete(`/store/products/${product.id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleAdd = () => {
        navigate('/dashboard/products/create');
    };

    const handleEdit = (product) => {
        navigate(`/dashboard/products/${product.id}/edit`);
    };

    const handleQuickEdit = async (product) => {
        try {
            const data = new FormData();
            data.append('price', quickEditData[product.id]?.price || product.price);
            data.append('stock', quickEditData[product.id]?.stock || product.stock);
            data.append('_method', 'PUT');

            await api.post(`/store/products/${product.id}`, data);
            fetchProducts();
            setExpandedCardId(null);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/10' };
        if (stock < 5) return { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-500/10' };
        return { label: `${stock} in stock`, color: 'text-green-500', bg: 'bg-green-500/10' };
    };

    const filteredProducts = products.filter(prod =>
        prod.name_en?.toLowerCase().includes(search.toLowerCase()) ||
        prod.name_fr?.toLowerCase().includes(search.toLowerCase())
    );

    if (!storeId) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">No store associated with this account.</p>
            </div>
        );
    }

    return (
        <AdminPageLayout
            title={t('store.products.title') || "My Products"}
            subtitle={t('store.products.subtitle') || "Manage your store products"}
            icon={Box}
            onAdd={handleAdd}
            addLabel={t('store.products.add') || "Add Product"}
        >
            <div className="space-y-6 text-start pb-24 xl:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            placeholder={t('store.products.search') || "Search products..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-12 bg-card border-border/60 rounded-2xl"
                        />
                    </div>
                </div>

                {/* Mobile Inventory Cards View */}
                <div className="block xl:hidden space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Activity className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-12 text-center">
                            <Box className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">{t('store.products.messages.noProducts') || "No products found"}</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, idx) => {
                            const stockStatus = getStockStatus(product.stock);
                            const isExpanded = expandedCardId === product.id;

                            return (
                                <div key={product.id}>
                                        <div className="bg-white dark:bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            {/* Main Card Content */}
                                            <div
                                                onClick={() => setExpandedCardId(isExpanded ? null : product.id)}
                                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                                            >
                                                {/* Product Image */}
                                                <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border/50">
                                                    {product.albums && product.albums.length > 0 ? (
                                                        <img src={product.albums[0].file} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src="/storage/empty/empty.webp" alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>

                                                {/* Product Info - Center */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground text-sm truncate">{product.name_fr}</p>
                                                    <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${stockStatus.bg} ${stockStatus.color}`}>
                                                        {stockStatus.label}
                                                    </div>
                                                </div>

                                                {/* Price - Right */}
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <span className="font-black text-primary text-lg">${(product.price * 1.1).toFixed(2)}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase line-through">${product.price}</span>
                                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Quick Edit Panel */}
                                            {isExpanded && (
                                                <div
                                                    className="border-t border-border/60 bg-muted/20 p-4 space-y-4"
                                                >
                                                        {/* Quick Edit Fields */}
                                                        <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground block mb-1.5">Price (Base)</p>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            defaultValue={product.price}
                                            onChange={(e) => setQuickEditData(prev => ({
                                                ...prev,
                                                [product.id]: { ...prev[product.id], price: e.target.value }
                                            }))}
                                            className="h-9 text-sm rounded-lg bg-card border-border/60"
                                        />
                                    </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Quantity</label>
                                                                <Input
                                                                    type="number"
                                                                    defaultValue={product.stock}
                                                                    onChange={(e) => setQuickEditData(prev => ({
                                                                        ...prev,
                                                                        [product.id]: { ...prev[product.id], stock: e.target.value }
                                                                    }))}
                                                                    className="h-9 text-sm rounded-lg bg-card border-border/60"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                                                <span className="text-xs font-medium text-foreground">Published</span>
                                                            </label>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleEdit(product)}
                                                                    className="h-8 text-xs rounded-lg"
                                                                >
                                                                    <Pencil size={14} className="mr-1" />
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 text-xs rounded-lg bg-primary hover:bg-primary/90"
                                                                    onClick={() => handleQuickEdit(product)}
                                                                >
                                                                    <CheckCircle2 size={14} className="mr-1" />
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        </div>
                                                </div>
                                            )}
                                        </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop Table View */}
                <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden xl:block">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t('store.products.table.product') || "PRODUCT"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t('store.products.table.price') || "PRICE & STOCK"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t('store.products.table.status') || "STATUS"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t('store.products.table.actions') || "ACTIONS"}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold">
                                                <Activity className="w-5 h-5 animate-spin text-primary" />
                                                {t('store.products.messages.loading') || "Loading..."}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="group hover:bg-primary/5 border-border/40 transition-colors"
                                    >
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border/50">
                                                    {product.albums && product.albums.length > 0 ? (
                                                        <img src={product.albums[0].file} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src="/storage/empty/empty.webp" alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-foreground tracking-tight">{product.name_fr}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{product.slug}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary">${(product.price * 1.1).toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase line-through">${product.price} base</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{product.stock} in stock</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-end">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip content={t('common.actions.view')}>
                                                    <Button size="iconsm" variant="soft" rounded="xl" color="secondary" onClick={() => setViewingProduct(product)}>
                                                        <Eye size={18} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={t('common.actions.edit')}>
                                                    <Button size="iconsm" variant="soft" rounded="xl" color="primary" onClick={() => handleEdit(product)}>
                                                        <Pencil size={18} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={t('common.actions.delete')}>
                                                    <Button size="iconsm" variant="soft" rounded="xl" color="error" onClick={() => handleDelete(product)}>
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </tr>
                                ))}

                            {!loading && filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {t('store.products.messages.noProducts') || "No products found"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBox>

                {/* View Modal */}
                <Modal
                    isOpen={!!viewingProduct}
                    onClose={() => setViewingProduct(null)}
                    title={t('store.products.view.title') || "Product Details"}
                    subtitle={viewingProduct?.name_fr || ""}
                    icon={Package}
                    maxWidth="max-w-6xl"
                    footer={
                        <Button variant="ghost" rounded="xl" onClick={() => setViewingProduct(null)} className="font-bold bg-muted/30">
                            {t('store.products.view.close') || "Close"}
                        </Button>
                    }
                >
                    <ProductViewModal product={viewingProduct} apiBase="/store/products" showPromo />
                </Modal>
            </div>
        </AdminPageLayout>
    );
};

export default StoreProducts;
