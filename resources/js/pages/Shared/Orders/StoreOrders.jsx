import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import CardBox from "@/components/shared/CardBox";
import AdminPageLayout from "@/components/shared/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Eye,
    ShoppingCart,
    User,
    Package,
    XCircle,
    ChevronDown,
    Activity,
    Store,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import Modal from "@/components/shared/Modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StoreOrders = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [viewingOrder, setViewingOrder] = useState(null);

    const storeId = user?.store?.id;

    // Check if profile is incomplete
    const isProfileIncomplete = !user?.store?.name_en || !user?.store?.name_fr || !user?.store?.name_ar || !user?.store?.storePhone;

    // Redirect if profile incomplete
    useEffect(() => {
        if (isProfileIncomplete) {
            navigate('/dashboard/profile', { replace: true });
        }
    }, [isProfileIncomplete, navigate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get("/store/orders");
            let ordersData = [];
            if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
                ordersData = response.data.data.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                ordersData = response.data.data;
            } else if (Array.isArray(response.data)) {
                ordersData = response.data;
            }
            setOrders(ordersData);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) {
            fetchOrders();
        }
    }, [storeId]);

    // Filter orders to only show those with items from this store
    const getStoreOrders = () => {
        if (!storeId || !orders.length) return [];
        return orders.filter(order => {
            if (!order.items) return false;
            return order.items.some(item => item.store_id === storeId);
        });
    };

    // Get only items belonging to this store from an order
    const getStoreItems = (order) => {
        if (!storeId || !order?.items) return [];
        return order.items.filter(item => item.store_id === storeId);
    };

    // Update item status and trigger order status recalculation
    const updateItemStatus = async (orderId, itemId, status) => {
        try {
            await api.post(`/store/orders/${orderId}/items/${itemId}/status`, { status });
            // Refresh orders to get updated statuses
            await fetchOrders();
            // Update viewing order if modal is open
            if (viewingOrder && viewingOrder.id === orderId) {
                const updated = getStoreOrders().find(o => o.id === orderId);
                if (updated) setViewingOrder(updated);
            }
        } catch (error) {
            console.error("Error updating item status:", error);
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    const getStatusConfig = (status) => {
        switch (String(status || '').toLowerCase()) {
            case "en_attente":
            case "pending":
                return { label: "En attente", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock };
            case "confirme":
            case "confirmed":
                return { label: "Confirmé", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 };
            case "imported_to_depot":
            case "imported":
            case "imported_from_store":
                return { label: "Importé au dépôt", color: "text-indigo-500", bg: "bg-indigo-500/10", icon: Package };
            case "en_livraison":
            case "in_shipping":
                return { label: "En livraison", color: "text-blue-500", bg: "bg-blue-500/10", icon: Package };
            case "livree":
            case "shipped":
            case "delivered":
                return { label: "Livrée", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
            case "retournee":
            case "returned":
                return { label: "Retournée", color: "text-rose-500", bg: "bg-rose-500/10", icon: XCircle };
            case "annule":
            case "cancelled":
                return { label: "Annulé", color: "text-red-600", bg: "bg-red-600/10", icon: XCircle };
            default:
                return { label: status || "Non défini", color: "text-muted-foreground", bg: "bg-muted/10", icon: AlertCircle };
        }
    };

    const getItemStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case "en_cours":
                return { label: "EN COURS", color: "text-amber-500", bg: "bg-amber-500/10" };
            case "confirme":
                return { label: "CONFIRMÉ", color: "text-emerald-500", bg: "bg-emerald-500/10" };
            case "annule":
                return { label: "ANNULÉ", color: "text-rose-500", bg: "bg-rose-500/10" };
            default:
                return { label: status?.toUpperCase() || "UNKNOWN", color: "text-muted-foreground", bg: "bg-muted/10" };
        }
    };

    const calculateStoreTotal = (order) => {
        const storeItems = getStoreItems(order);
        return storeItems.reduce((sum, item) => sum + ((item.price - (item.commission || 0)) * item.quantity), 0);
    };

    const calculateStoreCommission = (order) => {
        const storeItems = getStoreItems(order);
        return storeItems.reduce((sum, item) => sum + ((item.commission || 0) * item.quantity), 0);
    };

    const calculateStoreGross = (order) => {
        const storeItems = getStoreItems(order);
        return storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateStoreItemCount = (order) => {
        return getStoreItems(order).length;
    };

    const storeOrders = getStoreOrders();

    const filteredOrders = storeOrders.filter(order =>
        (order.order_number && order.order_number.toLowerCase().includes(search.toLowerCase())) ||
        (order.id && order.id.toString().toLowerCase().includes(search.toLowerCase())) ||
        (order.client?.user?.name?.toLowerCase().includes(search.toLowerCase()))
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
            title={t("store.orders.title") || "My Orders"}
            subtitle={t("store.orders.subtitle") || "View and manage orders containing your products"}
            icon={ShoppingCart}
        >
            <div className="space-y-6 text-start">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            placeholder={t("store.orders.search") || "Search orders..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-12 bg-card border-border/60 rounded-2xl"
                        />
                    </div>
                </div>

                {/* Mobile View - Order Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                            <Activity className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground font-bold">{t("store.orders.messages.loading")}</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 text-center space-y-3 bg-card/50 rounded-[32px] border border-border/50">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <ShoppingCart size={32} />
                            </div>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t("store.orders.messages.noOrders")}</p>
                        </div>
                    ) : (
                            filteredOrders.map((order, idx) => {
                                const status = getStatusConfig(order.status);
                                const StatusIcon = status.icon;
                                const storeItemCount = calculateStoreItemCount(order);
                                const storeTotal = calculateStoreTotal(order);

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-card border border-border/60 rounded-[28px] p-5 space-y-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-black text-foreground tracking-tight leading-none mb-1">
                                                    {order.order_number || `#${order.id?.toString().slice(-8)}`}
                                                </h3>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg}`}>
                                                <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                                <span className={`text-[10px] font-black uppercase ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 py-3 border-y border-border/40">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-0.5">
                                                    {t("store.orders.table.customer")}
                                                </p>
                                                <p className="text-sm font-bold text-foreground truncate">
                                                    {order.client?.user?.name || "N/A"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-0.5">
                                                    {t("store.orders.table.yourItems") || "Your Items"}
                                                </p>
                                                <p className="text-lg font-black text-primary">{storeItemCount}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Store className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {storeTotal.toFixed(2)} TND
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-10 rounded-2xl font-black text-[10px] uppercase gap-2 px-4"
                                                onClick={() => navigate(`/dashboard/orders/${order.order_number || order.id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* Desktop View - Table Container */}
                <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t("store.orders.table.order") || "ORDER"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t("store.orders.table.customer") || "CUSTOMER"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t("store.orders.table.yourItems") || "YOUR ITEMS"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t("store.orders.table.storeTotal") || "STORE TOTAL"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t("store.orders.table.status") || "STATUS"}
                                </TableHead>
                                <TableHead className="py-5 px-6 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    {t("store.orders.table.actions") || "ACTIONS"}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold">
                                                <Activity className="w-5 h-5 animate-spin text-primary" />
                                                {t("store.orders.messages.loading") || "Loading..."}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.map((order) => {
                                    const status = getStatusConfig(order.status);
                                    const StatusIcon = status.icon;
                                    const storeItemCount = calculateStoreItemCount(order);
                                    const storeTotal = calculateStoreTotal(order);

                                    return (
                                        <tr
                                            key={order.id}
                                            className="group hover:bg-primary/5 border-border/40 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground tracking-tight">
                                                        {order.order_number || `#${order.id?.toString().slice(-8)}`}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium text-sm">{order.client?.user?.name || "N/A"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <span className="text-sm font-medium">{storeItemCount} items</span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <span className="font-black text-primary">{storeTotal.toFixed(2)} TND</span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                                                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                                    <span className={`text-xs font-bold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-9 rounded-xl font-bold text-xs"
                                                    onClick={() => navigate(`/dashboard/orders/${order.order_number || order.id}`)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </tr>
                                    );
                                })}

                            {!loading && filteredOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {t("store.orders.messages.noOrders") || "No orders found"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBox>

                {/* Order Details Modal */}
                <Modal
                    isOpen={!!viewingOrder}
                    onClose={() => setViewingOrder(null)}
                    title={t("store.orders.view.title") || "Order Details"}
                    subtitle={viewingOrder?.order_number || `#${viewingOrder?.id?.toString().slice(-8)}`}
                    icon={ShoppingCart}
                    maxWidth="max-w-4xl"
                    footer={
                        <Button onClick={() => setViewingOrder(null)} rounded="xl" className="font-black bg-muted text-foreground hover:bg-muted/80">
                            {t("store.orders.view.close") || "Close"}
                        </Button>
                    }
                >
                    {viewingOrder && (
                        <div className="space-y-6 text-start">
                            {/* Order Status Banner */}
                            <div className={`p-4 rounded-2xl border ${getStatusConfig(viewingOrder.status).bg} ${getStatusConfig(viewingOrder.status).color.replace('text-', 'border-')}/20`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {React.createElement(getStatusConfig(viewingOrder.status).icon, { size: 20, className: getStatusConfig(viewingOrder.status).color })}
                                        <div>
                                            <p className="text-[10px] font-black uppercase opacity-70">Order Status</p>
                                            <p className={`font-black ${getStatusConfig(viewingOrder.status).color}`}>
                                                {getStatusConfig(viewingOrder.status).label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase opacity-70">Date</p>
                                        <p className="font-bold">{new Date(viewingOrder.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <User className="text-primary" size={20} />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                                        {t("store.orders.view.customer") || "Customer Information"}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase">Name</p>
                                        <p className="font-bold text-foreground">{viewingOrder.client?.user?.name} {viewingOrder.client?.user?.family_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase">Email</p>
                                        <p className="font-bold text-foreground">{viewingOrder.client?.user?.email}</p>
                                    </div>
                                </div>
                                {viewingOrder.shipping_address && (
                                    <div className="mt-4 pt-4 border-t border-border/40">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase">{t("store.orders.view.shippingAddress") || "Shipping Address"}</p>
                                        <p className="font-bold text-foreground text-sm">{viewingOrder.shipping_address}</p>
                                    </div>
                                )}
                            </CardBox>

                            {/* Your Items Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="text-primary" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                                        {t("store.orders.view.yourProducts") || "Your Products in this Order"}
                                    </h3>
                                    <span className="text-[10px] font-black text-muted-foreground ml-auto">
                                        {calculateStoreItemCount(viewingOrder)} items
                                    </span>
                                </div>

                                <CardBox className="p-0 border-border/40 rounded-[32px] overflow-hidden bg-muted/5">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow className="border-border/40">
                                                <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-muted-foreground">PRODUCT</TableHead>
                                                <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">STATUS</TableHead>
                                                <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-muted-foreground">QTY</TableHead>
                                                <TableHead className="py-4 px-6 text-end text-[10px] font-black uppercase text-muted-foreground">SUBTOTAL</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {getStoreItems(viewingOrder).map((item, idx) => {
                                                const itemStatus = getItemStatusConfig(item.status);
                                                return (
                                                    <TableRow key={item.id || idx} className="border-border/40">
                                                        <TableCell className="py-4 px-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                                                                    <img
                                                                        src={item.product?.albums?.find((album) => album?.file)?.file || item.product?.albums?.[0]?.file || item.product?.albums?.[0]?.imageUrl || item.product?.imageUrl || '/storage/empty/empty.webp'}
                                                                        className="w-full h-full object-cover"
                                                                        alt=""
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = '/storage/empty/empty.webp';
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-sm text-foreground mb-1 truncate">{item.product?.name_fr || item.product?.name_en}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.product?.name_en}</p>
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
                                                            <span className="font-black text-primary text-sm">{(item.price * item.quantity).toFixed(2)} TND</span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardBox>

                                {/* Store Total */}
                                <div className="flex justify-end p-6 bg-primary/5 rounded-[32px] border border-primary/10">
                                    <div className="text-right space-y-1.5">
                                        <div className="flex items-center justify-end gap-3 text-xs font-bold text-muted-foreground">
                                            <span>{t("store.orders.view.subtotal") || "Customer Total"}</span>
                                            <span>{calculateStoreGross(viewingOrder).toFixed(2)} TND</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-3 text-xs font-bold text-amber-600">
                                            <span>{t("store.orders.view.commission") || "Platform Commission (10%)"}</span>
                                            <span>- {calculateStoreCommission(viewingOrder).toFixed(2)} TND</span>
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mt-2">{t("store.orders.view.yourTotal") || "Your Store Net"}</p>
                                        <p className="text-3xl font-black text-primary leading-none mt-1">
                                            {calculateStoreTotal(viewingOrder).toFixed(2)} TND
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminPageLayout>
    );
};

export default StoreOrders;
