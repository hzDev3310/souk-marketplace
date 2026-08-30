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
    Package, XCircle, CheckCircle2, Clock, Truck, ArrowLeft, Mail,
    Navigation, Phone, RotateCcw, PackageCheck
} from 'lucide-react';

const getOrderStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'en_cours':
        case 'pending':
            return { key: 'admin.orders.status.pending', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock };
        case 'confirme':
        case 'confirmed':
            return { key: 'admin.orders.status.confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 };
        case 'en_shipping':
            return { key: 'admin.orders.status.en_shipping', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Activity };
        case 'shipping_company':
            return { key: 'admin.orders.status.shipping_company', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck };
        case 'shipped':
        case 'delivered':
            return { key: 'admin.orders.status.delivered', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Truck };
        case 'annule':
        case 'cancelled':
            return { key: 'admin.orders.status.cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle };
        default:
            return { key: 'common.status.unknown', color: 'text-muted-foreground', bg: 'bg-muted/10', icon: Activity, raw: status };
    }
};

const getItemStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'en_cours':
        case 'pending':
            return { key: 'admin.orders.status.pending', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        case 'retournee':
        case 'returned':
            return { key: 'admin.orders.status.retournee', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        case 'livree':
        case 'delivered':
        case 'shipped':
            return { key: 'admin.orders.status.delivered', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'confirme':
        case 'confirmed':
            return { key: 'admin.orders.status.confirmed', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'annule':
        case 'cancelled':
            return { key: 'admin.orders.status.cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        default:
            return { key: 'common.status.unknown', color: 'text-muted-foreground', bg: 'bg-muted/10', raw: status };
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
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl uppercase shrink-0 shadow-lg shadow-indigo-500/20">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-foreground text-xl tracking-tight">
                                            {client.name} {client.family_name || ''}
                                        </h3>
                                        <p className="text-xs font-bold text-muted-foreground mt-0.5">{'Client'}</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 rounded-2xl bg-muted/30 border border-border/40 px-4 py-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Mail size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email</p>
                                            <p className="text-sm font-bold text-foreground truncate">{client.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-muted/30 border border-border/40 px-4 py-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Phone size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Phone</p>
                                            <p className="text-sm font-bold text-foreground truncate">{client.phone || client.telephone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-muted/30 border border-border/40 px-4 py-3">
                                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600"><MapPin size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Address</p>
                                            <p className="text-sm font-bold text-foreground truncate">{client.client?.address || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-muted/30 border border-border/40 px-4 py-3">
                                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600"><Navigation size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">City / ZIP</p>
                                            <p className="text-sm font-bold text-foreground truncate">{client.client?.city || '-'}{client.client?.codePostal ? `, ${client.client.codePostal}` : ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-[360px] shrink-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin size={14} className="text-primary" />
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Location</h4>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-border/50 h-56 relative bg-muted/20">
                                    {client.client?.lon && client.client?.lat ? (
                                        <iframe
                                            title="Client location"
                                            className="w-full h-full border-0"
                                            loading="lazy"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(client.client.lon) - 0.02}%2C${Number(client.client.lat) - 0.02}%2C${Number(client.client.lon) + 0.02}%2C${Number(client.client.lat) + 0.02}&layer=mapnik&marker=${Number(client.client.lat)}%2C${Number(client.client.lon)}`}
                                        />
                                    ) : (
                                        <iframe
                                            title="Client location"
                                            className="w-full h-full border-0"
                                            loading="lazy"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=8.52%2C33.0%2C11.5%2C37.4&layer=mapnik`}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-border/40">
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    {[
                                        { title: t('admin.clients.orders.totalOrders') || "Orders", value: orders.length, icon: ShoppingCart, color: 'from-purple-500 to-pink-600' },
                                        { title: t('admin.clients.orders.cancelled') || "Cancelled", value: cancelledCount, icon: XCircle, color: 'from-amber-500 to-orange-600' },
                                        { title: t('admin.clients.orders.returned') || "Returned", value: returnedCount, icon: RotateCcw, color: 'from-rose-500 to-red-600' },
                                        { title: t('admin.clients.orders.delivered') || "Delivered", value: deliveredCount, icon: PackageCheck, color: 'from-emerald-500 to-teal-600' },
                                        { title: t('admin.clients.orders.other') || "Other", value: otherCount, icon: Activity, color: 'from-blue-500 to-indigo-600' }
                                    ].map((stat, i) => (
                                        <CardBox key={i} className="p-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                                                    <p className="text-xl font-black text-foreground mt-1">{stat.value}</p>
                                                </div>
                                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                                                    <stat.icon size={16} />
                                                </div>
                                            </div>
                                        </CardBox>
                                    ))}
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
                                                {status.raw ? (status.raw) : t(status.key)}
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
                                                                                {itemStatus.raw ? (itemStatus.raw) : t(itemStatus.key)}
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
