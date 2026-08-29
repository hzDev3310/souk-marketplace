import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity, ArrowLeft, CheckCircle2, Clock, Package, ShoppingCart, Truck,
  User, XCircle, ChevronDown, Store, MapPin, Phone, Mail, Hash, Calendar,
  CreditCard, Receipt, Percent, Box
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import CardBox from '@/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ORDER_STATUSES = [
    'en_attente',
    'confirme',
    'imported_to_depot',
    'en_livraison',
    'livree',
    'retournee',
    'annule',
];

const getStatusConfig = (t, status) => {
    switch (String(status || '').toLowerCase()) {
        case 'en_attente':
        case 'pending':
            return { label: t('orderDetails.status.en_attente') || 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock };
        case 'confirme':
        case 'confirmed':
            return { label: t('orderDetails.status.confirme') || 'Confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 };
        case 'imported_to_depot':
        case 'imported':
        case 'imported_from_store':
            return { label: t('orderDetails.status.importedToDepot') || 'In Depot', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Package };
        case 'en_livraison':
        case 'in_shipping':
            return { label: t('orderDetails.status.enLivraison') || 'Shipping', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck };
        case 'livree':
        case 'shipped':
        case 'delivered':
            return { label: t('orderDetails.status.livree') || 'Delivered', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Package };
        case 'retournee':
        case 'returned':
            return { label: t('orderDetails.status.retournee') || 'Returned', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle };
        case 'annule':
        case 'cancelled':
            return { label: t('orderDetails.status.annule') || 'Cancelled', color: 'text-red-600', bg: 'bg-red-600/10', icon: XCircle };
        default:
            return { label: t('orderDetails.status.none') || 'Not defined', color: 'text-muted-foreground', bg: 'bg-muted/10', icon: Clock };
    }
};

const getAvailableStatuses = () => {
    // All statuses except en_attente (cannot go back to pending)
    return ORDER_STATUSES.filter((s) => s !== 'en_attente');
};

const getItemStatusConfig = (t, status) => {
    switch (String(status || '').toLowerCase()) {
        case 'en_cours':
            return { label: t('orderDetails.status.enCours') || 'In Progress', color: 'text-amber-500', bg: 'bg-amber-500/10' };
        case 'confirme':
        case 'confirmed':
            return { label: t('orderDetails.status.confirme') || 'Confirmed', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        case 'annule':
        case 'cancelled':
            return { label: t('orderDetails.status.annule') || 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        default:
            return { label: String(status || t('orderDetails.status.none') || 'NOT DEFINED').toUpperCase(), color: 'text-muted-foreground', bg: 'bg-muted/10' };
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

const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-2.5">
        {Icon && <Icon size={14} className="mt-0.5 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="font-bold text-foreground text-sm break-words">{value || '—'}</p>
        </div>
    </div>
);

const SectionTitle = ({ icon: Icon, title, right }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="text-primary" size={18} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
        </div>
        {right}
    </div>
);

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    const isAdmin = user?.role === 'ADMIN';
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const updateStatus = async (newStatus) => {
        if (!order?.id || updatingStatus) return;
        setUpdatingStatus(true);
        try {
            const response = await api.put(`/admin/orders/${order.id}`, { status: newStatus });
            const updated = response?.data?.order ?? response?.data;
            setOrder((prev) => ({ ...prev, status: updated?.status || newStatus }));
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchOrder = async () => {
            try {
                setLoading(true);

                const isAdmin = user?.role === 'ADMIN';
                const endpoint = isAdmin ? `/admin/orders/by-number/${encodeURIComponent(id)}` : `/store/orders/by-number/${encodeURIComponent(id)}`;
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

    const totalQuantity = useMemo(() => {
        return visibleItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }, [visibleItems]);

    const totalCommission = useMemo(() => {
        return visibleItems.reduce((sum, item) => sum + Number(item.commission || 0) * Number(item.quantity || 0), 0);
    }, [visibleItems]);

    // Store logo fallback helper
    const storeLogoUrl = (logo) => {
        if (!logo || logo === 'null' || logo === 'undefined') return null;
        if (logo.startsWith('http') || logo.startsWith('/')) return logo;
        return `/storage/${logo.replace(/^storage\//, '').replace(/^\//, '')}`;
    };

    const status = getStatusConfig(t, order?.status);
    const StatusIcon = status.icon;

    const customer = order?.client;

    // Parse client coordinates robustly (they may be strings from the API)
    const clientLat = customer ? Number(parseFloat(customer.lat)) : NaN;
    const clientLon = customer ? Number(parseFloat(customer.lon)) : NaN;
    const hasCoords = Number.isFinite(clientLat) && Number.isFinite(clientLon) && (clientLat !== 0 || clientLon !== 0);

    const mapSrc = hasCoords
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${clientLon - 0.01}%2C${clientLat - 0.01}%2C${clientLon + 0.01}%2C${clientLat + 0.01}&layer=mapnik&marker=${clientLat}%2C${clientLon}`
        : null;

    return (
        <AdminPageLayout
            title={order?.order_number || `Order #${id}`}
            subtitle={order?.order_number ? `ID: ${String(order.id || id).substring(0, 8)}` : 'Order details'}
            icon={ShoppingCart}
            onBack={() => navigate('/dashboard/orders')}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                    <Activity className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold">{t('orderDetails.loading') || 'Loading order...'}</p>
                </div>
            ) : !order ? (
                <div className="py-20 text-center bg-card/50 rounded-[32px] border border-border/50">
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('orderDetails.notFound') || 'Order not found'}</p>
                </div>
            ) : (
                <div className="space-y-6 text-start">

                    {/* Status header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.orders.table.date') || 'DATE'}</p>
                                <p className="font-bold">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="h-8 w-px bg-border hidden sm:block" />
                            <div className="text-sm text-muted-foreground">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('orderDetails.lastUpdate') || 'LAST UPDATE'}</p>
                                <p className="font-bold">{order.updated_at ? new Date(order.updated_at).toLocaleString() : '—'}</p>
                            </div>
                        </div>

                        {/* Status badge with integrated dropdown */}
                        {isAdmin ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${status.bg} ${status.color} hover:opacity-85 transition-opacity cursor-pointer`}
                                    >
                                        <StatusIcon size={14} />
                                        {status.label}
                                        <ChevronDown size={12} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-card border-border/50 rounded-xl">
                                    {getAvailableStatuses().map((s) => {
                                        const cfg = getStatusConfig(t, s);
                                        const Icon = cfg.icon;
                                        return (
                                            <DropdownMenuItem
                                                key={s}
                                                onClick={() => updateStatus(s)}
                                                className="text-[11px] font-bold uppercase transition-colors hover:bg-muted gap-2"
                                            >
                                                <Icon size={12} className={cfg.color} />
                                                {cfg.label}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${status.bg} ${status.color}`}>
                                <StatusIcon size={14} />
                                {status.label}
                            </span>
                        )}
                    </div>

                    {/* Order info + Customer info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Order info */}
                        <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl">
                            <SectionTitle icon={Receipt} title={t('orderDetails.orderInfo') || 'Order Information'} />
                            <div className="space-y-3.5">
                                <InfoRow icon={Hash} label={t('orderDetails.reference') || 'Reference'} value={order.order_number || `#${order.id}`} />
                                <InfoRow icon={CreditCard} label={t('orderDetails.orderId') || 'Order ID'} value={order.id} />
                                <InfoRow icon={Calendar} label={t('orderDetails.created') || 'Created'} value={new Date(order.created_at).toLocaleString()} />
                                <InfoRow icon={Calendar} label={t('orderDetails.lastUpdate') || 'Last Update'} value={order.updated_at ? new Date(order.updated_at).toLocaleString() : '—'} />
                                <InfoRow icon={Box} label={t('orderDetails.itemsCount') || 'Items Count'} value={`${totalQuantity} ${t('orderDetails.units') || 'units'} / ${visibleItems.length} ${t('orderDetails.lines') || 'line(s)'}`} />
                                <InfoRow icon={StatusIcon} label={t('orderDetails.statusLabel') || 'Status'} value={status.label} />
                            </div>
                        </CardBox>

                        {/* Customer info + map */}
                        <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl flex flex-col">
                            <SectionTitle icon={User} title={t('orderDetails.customer') || 'Customer'} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                                <InfoRow icon={User} label={t('orderDetails.name') || 'Name'} value={`${customer?.user?.name || ''} ${customer?.user?.family_name || ''}`.trim() || '—'} />
                                <InfoRow icon={Mail} label={t('orderDetails.email') || 'Email'} value={customer?.user?.email} />
                                <InfoRow icon={Phone} label={t('orderDetails.phone') || 'Phone'} value={customer?.user?.phone || customer?.phone} />
                                <InfoRow icon={MapPin} label={t('orderDetails.address') || 'Address'} value={[customer?.address, customer?.city, customer?.codePostal].filter(Boolean).join(', ')} />
                            </div>
                            <div className="mt-5 flex-1 flex items-stretch">
                                {hasCoords ? (
                                    <iframe
                                        title="Customer location"
                                        className="w-full h-52 rounded-3xl border border-border/40"
                                        loading="lazy"
                                        src={mapSrc}
                                    />
                                ) : (
                                    <div className="w-full h-52 rounded-3xl border border-dashed border-border/50 bg-card flex flex-col items-center justify-center gap-2 text-center px-6">
                                        <MapPin className="w-8 h-8 text-muted-foreground/60" />
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            {t('orderDetails.noMap') || 'No location available'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardBox>
                    </div>

                    {/* Items table */}
                    <CardBox className="p-0 border-border/40 rounded-[32px] overflow-hidden bg-muted/5">
                        <div className="p-6 pb-4">
                            <SectionTitle
                                icon={Package}
                                title={`${t('orderDetails.orderItems') || 'Order Items'} (${visibleItems.length})`}
                                right={<span className="text-[10px] font-black uppercase text-muted-foreground">{totalQuantity} {t('orderDetails.units') || 'units'}</span>}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="border-border/40">
                                        <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.product') || 'PRODUCT'}</TableHead>
                                        {isAdmin && <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.storeColumn') || 'STORE'}</TableHead>}
                                        <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.unitPrice') || 'UNIT PRICE'}</TableHead>
                                        <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.qty') || 'QTY'}</TableHead>
                                        {isAdmin && <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.commission') || 'COMMISSION'}</TableHead>}
                                        <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.status') || 'STATUS'}</TableHead>
                                        <TableHead className="py-4 px-6 text-end text-[10px] font-black uppercase text-muted-foreground">{t('orderDetails.subtotal') || 'SUBTOTAL'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleItems.length === 0 ? (
                                        <TableRow className="border-border/40">
                                            <TableCell colSpan={isAdmin ? 7 : 5} className="py-12 text-center text-muted-foreground font-black uppercase tracking-widest text-xs">
                                                {t('orderDetails.noItems') || 'No items'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        visibleItems.map((item, idx) => {
                                            const itemStatus = getItemStatusConfig(t, item.status);
                                            return (
                                                <TableRow key={item.id || idx} className="border-border/40">
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                                                                <img src={getProductImageUrl(item.product)} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-sm text-foreground truncate">{item.product?.name_fr || item.product?.name_en || item.product?.name_ar || 'Product'}</p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {[item.product?.name_en, item.product?.name_ar].filter(Boolean).join(' • ') || '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="py-4 px-6">
                                                            {item.product?.store ? (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                        {storeLogoUrl(item.product.store.logo) ? (
                                                                            <img src={storeLogoUrl(item.product.store.logo)} className="w-full h-full object-cover" alt="" />
                                                                        ) : (
                                                                            <Store size={16} className="text-muted-foreground" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-xs text-foreground truncate">{item.product.store.name_fr || item.product.store.name_en || '—'}</p>
                                                                        <p className="text-[10px] text-muted-foreground truncate">{item.product.store.storePhone || item.product.store.phone || '—'}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs font-bold text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="py-4 px-6 text-center font-bold text-sm">{Number(item.price || 0).toFixed(2)}</TableCell>
                                                    <TableCell className="py-4 px-6 text-center font-bold text-sm">x{item.quantity}</TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="py-4 px-6 text-center">
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                                                <Percent size={12} />
                                                                {Number(item.commission || 0).toFixed(2)}
                                                            </span>
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="py-4 px-6 text-center">
                                                        <span className={`inline-flex h-7 items-center justify-center px-3 rounded-lg text-[10px] font-black ${itemStatus.bg} ${itemStatus.color}`}>
                                                            {itemStatus.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-end">
                                                        <span className="font-black text-primary text-sm">{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)} TND</span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardBox>

                    {/* Single total badge */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[32px] border border-primary/15">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <span className="px-2.5 py-1 rounded-full bg-card border border-border/50">{totalQuantity} {t('orderDetails.units') || 'units'}</span>
                            {isAdmin && (
                                <span className="px-2.5 py-1 rounded-full bg-card border border-border/50">-{totalCommission.toFixed(2)} {t('orderDetails.commission') || 'commission'}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t('orderDetails.total') || 'Total'}</span>
                            <span className="text-3xl font-black text-primary leading-none">{orderTotal.toFixed(2)} TND</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => navigate('/dashboard/orders')} className="rounded-xl font-black">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('orderDetails.backToOrders') || 'Back to orders'}
                        </Button>
                    </div>
                </div>
            )}
        </AdminPageLayout>
    );
};

export default OrderDetails;
