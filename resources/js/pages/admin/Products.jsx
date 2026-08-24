import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import Modal from '@/components/shared/Modal';
import ProductViewModal from '@/components/shared/ProductViewModal';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus, Pencil, Search, Box, Image as ImageIcon,
    Activity, Eye, Package
} from 'lucide-react';
const Products = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingProduct, setViewingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            const productsData = response.data?.data || response.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (product) => {
        const newValue = !product.isActive;
        setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: newValue } : p));
        try {
            await api.put(`/admin/products/${product.id}`, { isActive: newValue });
        } catch (error) {
            console.error('Error toggling product status:', error);
            setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: !newValue } : p));
        }
    };

    const handleAdd = () => {
        navigate('/dashboard/products/create');
    };

    const handleEdit = (product) => {
        navigate(`/dashboard/products/${product.id}/edit`);
    };

    const filteredProducts = products.filter(prod =>
        (prod.name_en?.toLowerCase().includes(search.toLowerCase()) ||
        prod.name_fr?.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'all' || (statusFilter === 'active' ? prod.isActive : !prod.isActive))
    );

    return (
        <AdminPageLayout
            title={t('admin.products.title') || "Products"}
            subtitle={t('admin.products.subtitle') || "Manage all products"}
            icon={Box}
            onAdd={handleAdd}
            addLabel={t('admin.products.add') || "Add Product"}
        >
            <div className="space-y-6 text-start">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            placeholder={t('admin.products.search') || "Search products..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-12 bg-card border-border/60 rounded-2xl"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-12 px-4 rounded-2xl bg-card border border-border/60 text-foreground font-bold text-sm"
                    >
                        <option value="all">{t('admin.products.filter.all') || "All Products"}</option>
                        <option value="active">{t('admin.products.filter.active') || "Active"}</option>
                        <option value="deactivated">{t('admin.products.filter.deactivated') || "Deactivated"}</option>
                    </select>
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
                            <div
                                key={product.id}
                                className="bg-card border border-border/60 rounded-[24px] p-5 space-y-4 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border/50">
                                        {product.albums && product.albums.length > 0 ? (
                                            <img src={product.albums[0].file} alt="" className="w-full h-full object-cover" />
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
                                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">{t('admin.products.table.store') || "Store"}</p>
                                        <p className="text-xs font-bold text-foreground truncate">{product.store?.store_name_fr || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">{t('admin.products.table.price') || "Price"}</p>
                                        <p className="text-xs font-bold text-primary">${(product.price * 1.1).toFixed(2)} (${product.price})</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <Button
                                        size="iconsm" variant="soft" rounded="xl" color="info"
                                        onClick={() => setViewingProduct(product)}
                                    >
                                        <Eye size={18} strokeWidth={2.5} />
                                    </Button>
                                    <Button
                                        size="iconsm" variant="soft" rounded="xl" color="warning"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <Pencil size={18} strokeWidth={2.5} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View - Table Container */}
                <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.product') || "PRODUCT"}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.store') || "STORE"}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.price') || "PRICE"}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.quantity') || "QUANTITY"}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.status') || "STATUS"}</TableHead>
                                <TableHead className="py-5 px-6 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.products.table.actions') || "ACTIONS"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold">
                                                <Activity className="w-5 h-5 animate-spin text-primary" />
                                                {t('admin.common.loading')}
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
                                        <TableCell className="py-4 px-6 text-sm font-bold text-muted-foreground">
                                            {product.store?.store_name_fr || "N/A"}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary">${(product.price * 1.1).toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase line-through">${product.price}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex flex-col">
                                                
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{product.stock} in stock</span>
                                            </div>
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
                                            </div>
                                        </TableCell>
                                    </tr>
                                ))}
                            {!loading && filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {t('admin.products.messages.noProducts') || "No products found"}
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
                    title={t('admin.products.view.title') || "Product Details"}
                    subtitle={viewingProduct?.name_fr || ""}
                    icon={Package}
                    maxWidth="max-w-6xl"
                    footer={
                        <Button variant="ghost" rounded="xl" onClick={() => setViewingProduct(null)} className="font-bold bg-muted/30">
                            {t('admin.products.view.close') || "Close"}
                        </Button>
                    }
                >
                    <ProductViewModal product={viewingProduct} apiBase="/admin/products" showStore />
                </Modal>
            </div>
        </AdminPageLayout>
    );
};

export default Products;
