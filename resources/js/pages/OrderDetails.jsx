import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2, Clock, Package, ShoppingCart, Truck, User, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getStatusConfig = (status) => {
    switch (String(status || '').toLowerCase()) {
        case 'en_attente':
        case 'pending':
            return { label: 'En attente', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock };
        case 'confirme':
        case 'confirmed':
            return { label: 'Confirmé', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 };
        case 'imported_to_depot':
        case 'imported':
        case 'imported_from_store':
            return { label: 'Importé au dépôt', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Package };
        case 'en_livraison':
        case 'in_shipping':
            return { label: 'En livraison', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck };
        case 'livree':
        case 'shipped':
        case 'delivered':
            return { label: 'Livrée', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Package };
        case 'retournee':
        case 'returned':
        case 'annule':
        case 'cancelled':
            return { label: 'Retournée', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle };
        default:
            return { label: status || 'Inconnu', color: 'text-muted-foreground', bg: 'bg-muted/10', icon: Activity };
    }
};

const getItemStatusConfig = (status) => {
    switch (String(status || '').toLowerCase()) {
        case 'en_cours':
            return { label: 'EN COURS', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        case 'confirme':
            return { label: 'CONFIRMÉ', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'annule':
            return { label: 'ANNULÉ', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        default:
            return { label: String(status || 'UNKNOWN').toUpperCase(), color: 'text-muted-foreground', bg: 'bg-muted/10' };
    }
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

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchOrder = async () => {
            try {
                setLoading(true);

                const isAdmin = user?.role === 'ADMIN';
                const endpoint = isAdmin ? `/admin/orders/${id}` : `/store/orders/${id}`;
                const response = await api.get(endpoint);
                const payload = response?.data?.data ?? response?.data;

                if (isMounted) {
                    setOrder(payload);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                if (isMounted) {
                    setOrder(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchOrder();
        }

        return () => {
            isMounted = false;
        };
    }, [id, user?.role]);

    const visibleItems = useMemo(() => {
        if (!order?.items) return [];

        if (user?.role === 'STORE') {
            const storeId = user?.store?.id;
            if (!storeId) return order.items;
            return order.items.filter((item) => item.store_id === storeId || item.product?.store_id === storeId);
        }

        return order.items;
    }, [order, user]);

    const orderTotal = useMemo(() => {
        return visibleItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    }, [visibleItems]);

    const status = getStatusConfig(order?.status);
    const StatusIcon = status.icon;

    return (
        <AdminPageLayout
            title={order?.order_number || `Order #${id}`}
            subtitle="Order details"
            icon={ShoppingCart}
            onBack={() => navigate('/dashboard/orders')}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                    <Activity className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold">Loading order...</p>
                </div>
            ) : !order ? (
                <div className="py-20 text-center bg-card/50 rounded-[32px] border border-border/50">
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Order not found</p>
                </div>
            ) : (
                <div className="space-y-6 text-start">
                    <div className={`p-4 rounded-2xl border ${status.bg}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-70">Order Status</p>
                                    <p className={`font-black ${status.color}`}>{status.label}</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-[10px] font-black uppercase opacity-70">Date</p>
                                <p className="font-bold">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <User className="text-primary" size={20} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Customer</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Name</p>
                                    <p className="font-bold text-foreground">
                                        {order.client?.user?.name || 'N/A'} {order.client?.user?.family_name || ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Email</p>
                                    <p className="font-bold text-foreground">{order.client?.user?.email || 'N/A'}</p>
                                </div>
                                {order.client?.phone && (
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase">Phone</p>
                                        <p className="font-bold text-foreground">{order.client.phone}</p>
                                    </div>
                                )}
                            </div>
                        </CardBox>

                        <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                    <Package className="text-secondary" size={20} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Order Summary</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Reference</p>
                                    <p className="font-bold text-foreground">{order.order_number || `#${order.id}`}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Items</p>
                                    <p className="font-bold text-foreground">{visibleItems.length}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Total</p>
                                    <p className="font-black text-primary text-2xl">{Number(orderTotal).toFixed(2)} TND</p>
                                </div>
                            </div>
                        </CardBox>
                    </div>

                    <CardBox className="p-0 border-border/40 rounded-[32px] overflow-hidden bg-muted/5">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="border-border/40">
                                    <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-muted-foreground">Product</TableHead>
                                    <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">Status</TableHead>
                                    <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">Qty</TableHead>
                                    <TableHead className="py-4 px-6 text-end text-[10px] font-black uppercase text-muted-foreground">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleItems.map((item, idx) => {
                                    const itemStatus = getItemStatusConfig(item.status);

                                    return (
                                        <TableRow key={item.id || idx} className="border-border/40">
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                                                        <img src={getProductImageUrl(item.product)} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-foreground truncate">{item.product?.name_fr || item.product?.name_en || 'Product'}</p>
                                                        <p className="text-xs text-muted-foreground">{item.product?.name_en || '—'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-center">
                                                <span className={`inline-flex h-8 items-center justify-center px-3 rounded-lg text-[10px] font-black ${itemStatus.bg} ${itemStatus.color}`}>
                                                    {itemStatus.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-center font-bold text-sm">x{item.quantity}</TableCell>
                                            <TableCell className="py-4 px-6 text-end">
                                                <span className="font-black text-primary text-sm">{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)} TND</span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardBox>

                    <div className="flex justify-end p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                        <div className="text-right space-y-1.5">
                            <p className="text-[10px] font-black text-muted-foreground uppercase">Total</p>
                            <p className="text-3xl font-black text-primary leading-none mt-1">{Number(orderTotal).toFixed(2)} TND</p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => navigate('/dashboard/orders')} className="rounded-xl font-black">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to orders
                        </Button>
                    </div>
                </div>
            )}
        </AdminPageLayout>
    );
};

export default OrderDetails;
