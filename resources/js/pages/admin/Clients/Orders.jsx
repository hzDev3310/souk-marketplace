import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { imageFallback } from '@/utils/imageFallback';
import CardBox from '@/components/shared/CardBox';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart, User, MapPin, Calendar, Activity, ChevronDown, ChevronUp,
    Package, CreditCard, XCircle, CheckCircle2, Clock, Truck, ArrowLeft, Mail
} from 'lucide-react';

const getOrderStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'en_cours':
        case 'pending':
            return { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock };
        case 'confirme':
        case 'confirmed':
            return { label: 'Confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 };
        case 'en_shipping':
            return { label: 'Ready to ship', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Activity };
        case 'shipping_company':
            return { label: 'With carrier', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck };
        case 'shipped':
        case 'delivered':
            return { label: 'Delivered', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Truck };
        case 'annule':
        case 'cancelled':
            return { label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle };
        default:
            return { label: status || 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted/10', icon: Activity };
    }
};

const getItemStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'en_cours':
        case 'pending':
            return { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        case 'confirme':
        case 'confirmed':
            return { label: 'Confirmed', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'annule':
        case 'cancelled':
            return { label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        default:
            return { label: status || 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted/10' };
    }
};

const getFactureStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'paid':
            return { label: 'Paid', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'unpaid':
            return { label: 'Unpaid', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        case 'pending':
            return { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        default:
            return { label: status || 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted/10' };
    }
};

const ClientOrders = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = useParams();
    const [client, setClient] = useState(location.state?.client || null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (!client) {
            api.get(`/admin/users/${clientId}`)
                .then((res) => setClient(res.data?.data || null))
                .catch((err) => console.error('Error fetching client:', err));
        }
        api.get(`/admin/orders/client/${clientId}`)
            .then((res) => setOrders(res.data?.data || []))
            .catch((err) => console.error('Error fetching client orders:', err))
            .finally(() => setLoading(false));
    }, [clientId]);

    const calculateOrderTotal = (order) => {
        if (order.totalAmount != null) return Number(order.totalAmount);
        if (!order.items) return 0;
        return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateCancelledTotal = (order) => {
        if (!order.items) return 0;
        return order.items
            .filter((item) => ['annule', 'cancelled'].includes(item.status?.toLowerCase()))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const totalSpent = orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    const totalPaid = orders.reduce((sum, order) => sum + (order.factures || []).filter(f => f.status?.toLowerCase() === 'paid').reduce((s, f) => s + Number(f.amount), 0), 0);
    const totalUnpaid = orders.reduce((sum, order) => sum + (order.factures || []).filter(f => f.status?.toLowerCase() !== 'paid').reduce((s, f) => s + Number(f.amount), 0), 0);

    const cancelledCount = orders.filter(order => 
        order.items?.some(item => ['annule', 'cancelled'].includes(item.status?.toLowerCase()))
    ).length;
    const returnedCount = orders.filter(order => 
        order.items?.some(item => ['retournee', 'returned'].includes(item.status?.toLowerCase()))
    ).length;
    const deliveredCount = orders.filter(order => 
        order.items?.some(item => ['livree', 'delivered', 'shipped'].includes(item.status?.toLowerCase()))
    ).length;
    const otherCount = orders.length - cancelledCount - returnedCount - deliveredCount;

    return (
        <AdminPageLayout
            title={t('admin.clients.orders.title') || "Client Orders"}
            subtitle={client ? `${client.name} ${client.family_name || ''}` : (t('admin.clients.orders.subtitle') || "All orders for this client")}
            icon={ShoppingCart}
            onBack={() => navigate('/dashboard/clients')}
        >
            <div className="space-y-6 text-start">
                {client && (
                    <CardBox className="p-6 border-border/50 rounded-[32px]">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-2xl uppercase shrink-0">
                                {client.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-foreground text-lg tracking-tight">{client.name} {client.family_name || ''}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-bold text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {client.email}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {client.client?.city || '-'}, {client.client?.codePostal || '-'}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                                <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border/40 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.orders.totalOrders') || "Orders"}</p>
                                    <p className="text-xl font-black text-foreground">{orders.length}</p>
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border/40 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.orders.totalSpent') || "Spent"}</p>
                                    <p className="text-xl font-black text-primary">{totalSpent.toFixed(2)} TND</p>
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border/40 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.orders.totalUnpaid') || "Unpaid"}</p>
                                    <p className="text-xl font-black text-rose-500">{totalUnpaid.toFixed(2)} TND</p>
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200/50 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">{t('admin.clients.orders.cancelled') || "Cancelled"}</p>
                                    <p className="text-xl font-black text-amber-700">{cancelledCount}</p>
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-rose-50/50 border border-rose-200/50 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-700">{t('admin.clients.orders.returned') || "Returned"}</p>
                                    <p className="text-xl font-black text-rose-700">{returnedCount}</p>
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/50 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">{t('admin.clients.orders.delivered') || "Delivered"}</p>
                                    <p className="text-xl font-black text-emerald-700">{deliveredCount}</p>
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-blue-50/50 border border-blue-200/50 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">{t('admin.clients.orders.other') || "Other"}</p>
                                    <p className="text-xl font-black text-blue-700">{otherCount}</p>
                                </div>
                            </div>
                        </div>
                    </CardBox>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                        <Activity className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground font-bold">{t('admin.common.loading')}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center space-y-3 bg-card/50 rounded-[32px] border border-border/50">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <Package size={32} />
                        </div>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.clients.view.noOrders') || "No orders found"}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const status = getOrderStatusConfig(order.status);
                            const total = calculateOrderTotal(order);
                            const cancelled = calculateCancelledTotal(order);
                            const isOpen = expandedOrder === order.id;
                            return (
                                <CardBox
                                    key={order.id}
                                    className={`p-0 border-border/50 rounded-[24px] overflow-hidden transition-all ${isOpen ? 'ring-2 ring-primary/20' : ''}`}
                                >
                                    <button
                                        onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                                        className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <ShoppingCart size={20} className="text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-foreground tracking-tight truncate">{order.order_number || `#${order.id?.toString().slice(-8)}`}</p>
                                                <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                                                    <Calendar size={10} />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.color} font-black text-[10px] uppercase`}>
                                                <status.icon size={12} />
                                                {status.label}
                                            </div>
                                            <div className="text-end">
                                                <p className="font-black text-primary">{total.toFixed(2)} TND</p>
                                            </div>
                                            {isOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-border/40 p-5 space-y-5">
                                            {/* Items */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Package size={14} className="text-primary" />
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">{t('admin.orders.view.items') || "Items"}</h4>
                                                </div>
                                                {order.items?.length > 0 ? (
                                                    <div className="rounded-2xl border border-border/40 overflow-hidden">
                                                        <div className="divide-y divide-border/30">
                                                            {order.items.map((item) => {
                                                                const itemStatus = getItemStatusConfig(item.status);
                                                                return (
                                                                    <div key={item.id || item.product?.id} className="flex items-center gap-3 p-3 bg-muted/5">
                                                                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                                            {item.product?.albums?.[0] ? (
                                                                                <img src={item.product.albums[0].file} className="w-full h-full object-cover" alt="" onError={imageFallback} />
                                                                            ) : (
                                                                                <img src="/storage/empty/empty.webp" className="w-full h-full object-cover" alt="" onError={imageFallback} />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-bold text-sm text-foreground truncate">{item.product?.name_fr || item.product?.name_en || 'Product'}</p>
                                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                                {item.price.toFixed(2)} TND × {item.quantity}
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${itemStatus.bg} ${itemStatus.color}`}>
                                                                                {itemStatus.label}
                                                                            </span>
                                                                            <span className="font-black text-primary text-sm">{(item.price * item.quantity).toFixed(2)} TND</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-bold text-muted-foreground">{t('admin.clients.orders.noItems') || "No items"}</p>
                                                )}
                                            </div>

                                            {/* Factures / Money */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CreditCard size={14} className="text-primary" />
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">{t('admin.clients.orders.payments') || "Payments"}</h4>
                                                </div>
                                                {order.factures?.length > 0 ? (
                                                    <div className="rounded-2xl border border-border/40 overflow-hidden">
                                                        <div className="divide-y divide-border/30">
                                                            {order.factures.map((f) => {
                                                                const fStatus = getFactureStatusConfig(f.status);
                                                                return (
                                                                    <div key={f.id} className="flex items-center justify-between gap-3 p-3 bg-muted/5">
                                                                        <div>
                                                                            <p className="font-bold text-sm text-foreground">{f.type}</p>
                                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{f.factureNumber}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${fStatus.bg} ${fStatus.color}`}>
                                                                                {fStatus.label}
                                                                            </span>
                                                                            <span className="font-black text-primary text-sm">{Number(f.amount).toFixed(2)} TND</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-bold text-muted-foreground">{t('admin.clients.orders.noPayments') || "No payments recorded"}</p>
                                                )}
                                            </div>

                                            {/* Money Summary */}
                                            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">{t('admin.orders.table.total') || "Total"}</p>
                                                    <p className="font-black text-primary text-lg">{total.toFixed(2)} TND</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">{t('admin.clients.orders.paid') || "Paid"}</p>
                                                    <p className="font-black text-emerald-500 text-lg">
                                                        {(order.factures || []).filter(f => f.status?.toLowerCase() === 'paid').reduce((s, f) => s + Number(f.amount), 0).toFixed(2)} TND
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">{t('admin.clients.orders.cancelled') || "Cancelled / Returned"}</p>
                                                    <p className={`font-black text-lg ${cancelled > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>{cancelled.toFixed(2)} TND</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardBox>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminPageLayout>
    );
};

export default ClientOrders;
