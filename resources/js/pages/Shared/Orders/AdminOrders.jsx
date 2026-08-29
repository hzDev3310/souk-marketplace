import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import CardBox from "@/components/shared/CardBox";
import AdminPageLayout from "@/components/shared/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
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
    Calendar, 
    DollarSign,
    Clock,
    CheckCircle2,
    Truck,
    Package,
    XCircle,
    ChevronDown,
    Activity,
    FileText,
    Phone,
    RefreshCcw,
    Check
} from "lucide-react";
import Modal from "@/components/shared/Modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Orders = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [search, setSearch] = useState("");
    const [viewingOrder, setViewingOrder] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            console.log("Fetching admin orders from /api/admin/orders...");
            const response = await api.get("/admin/orders");
            const payload = response?.data;
            let nextOrders = [];

            if (Array.isArray(payload)) {
                nextOrders = payload;
            } else if (Array.isArray(payload?.data)) {
                nextOrders = payload.data;
            } else if (Array.isArray(payload?.data?.data)) {
                nextOrders = payload.data.data;
            }

            console.log("Admin orders fetch response:", payload);
            console.log("Parsed admin orders:", nextOrders);
            setOrders(nextOrders);
        } catch (error) {
            console.error("Error fetching orders: full error object:", error);
            console.error("Error fetching orders: response data:", error?.response?.data);
            console.error("Error fetching orders: status:", error?.response?.status);
            console.error("Error fetching orders: headers:", error?.response?.headers);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, status) => {
        try {
            await api.put(`/admin/orders/${orderId}`, { status });
            fetchOrders();
            if (viewingOrder && viewingOrder.id === orderId) {
                const refreshed = await api.get(`/admin/orders/${orderId}`);
                setViewingOrder(refreshed.data?.data ?? refreshed.data);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleVerify = async (orderId) => {
        setVerifying(true);
        try {
            await api.post(`/admin/orders/${orderId}/confirm-manually`);
            fetchOrders();
            if (viewingOrder && viewingOrder.id === orderId) {
                const refreshed = await api.get(`/admin/orders/${orderId}`);
                setViewingOrder(refreshed.data?.data ?? refreshed.data);
            }
        } catch (error) {
            console.error("Verification failed:", error);
        } finally {
            setVerifying(false);
        }
    };

    const updateItemStatus = async (orderId, itemId, status) => {
        try {
            await api.post(`/admin/orders/${orderId}/items/${itemId}/status`, { status });
            if (viewingOrder && viewingOrder.id === orderId) {
                const refreshed = await api.get(`/admin/orders/${orderId}`);
                setViewingOrder(refreshed.data?.data ?? refreshed.data);
            }
            fetchOrders();
        } catch (error) {
            console.error("Error updating item status:", error);
        }
    };

    const removeItem = async (orderId, itemId) => {
        if (!confirm(t("admin.orders.messages.confirmRemoveItem") || "Are you sure you want to remove this item?")) return;
        try {
            await api.delete(`/admin/orders/${orderId}/items/${itemId}`);
            if (viewingOrder && viewingOrder.id === orderId) {
                const refreshed = await api.get(`/admin/orders/${orderId}`);
                setViewingOrder(refreshed.data?.data ?? refreshed.data);
            }
            fetchOrders();
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const calculateOrderCommission = (order) => {
        if (!order?.items) return 0;
        return order.items.reduce((sum, item) => sum + ((item.commission || 0) * item.quantity), 0);
    };

    const calculateStoreNet = (order) => {
        if (!order?.items) return 0;
        return order.items.reduce((sum, item) => sum + ((item.price - (item.commission || 0)) * item.quantity), 0);
    };

    const getStatusConfig = (status) => {
        switch (String(status || '').toLowerCase()) {
            case "en_attente":
            case "pending":
                return { label: "En attente", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock };
            case "confirme":
            case "confirmed":
                return { label: "Confirmé", color: "text-blue-500", bg: "bg-blue-500/10", icon: CheckCircle2 };
            case "imported_to_depot":
            case "imported":
            case "imported_from_store":
                return { label: "Importé au dépôt", color: "text-indigo-500", bg: "bg-indigo-500/10", icon: Package };
            case "en_livraison":
            case "en_shipping":
            case "shipping_company":
                return { label: "En livraison", color: "text-purple-500", bg: "bg-purple-500/10", icon: Truck };
            case "livree":
            case "shipped":
            case "delivered":
                return { label: "Livrée", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: Package };
            case "retournee":
            case "returned":
                return { label: "Retournée", color: "text-rose-500", bg: "bg-rose-500/10", icon: XCircle };
            case "annule":
            case "cancelled":
                return { label: "Annulé", color: "text-red-600", bg: "bg-red-600/10", icon: XCircle };
            default:
                return { label: status || "Non défini", color: "text-muted-foreground", bg: "bg-muted/10", icon: Clock };
        }
    };

    const filteredOrders = orders.filter(order => {
        const orderNumber = String(order?.order_number || order?.id || "");
        const clientName = String(order?.client?.user?.name || "");
        const query = (search || "").toLowerCase();

        return (
            orderNumber.toLowerCase().includes(query) ||
            clientName.toLowerCase().includes(query)
        );
    });

    return (
        <AdminPageLayout
            title="admin.orders.title"
            subtitle="admin.orders.subtitle"
            icon={ShoppingCart}
        >
            <div className="space-y-6 text-start">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            placeholder={t("admin.orders.search")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-12 bg-card border-border/60 rounded-2xl"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                            <Activity className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground font-bold">{t("admin.orders.messages.loading")}</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 text-center space-y-3 bg-card/50 rounded-[32px] border border-border/50">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <ShoppingCart size={32} />
                            </div>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t("admin.orders.messages.noOrders")}</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const status = getStatusConfig(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className="bg-card border border-border/60 rounded-[24px] p-5 space-y-4 shadow-sm active:scale-[0.98] transition-transform"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-foreground tracking-tight leading-none">{order.order_number || `#${order.id.split("-")[0]}`}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.color} font-black text-[10px] uppercase`}>
                                            <status.icon size={12} />
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="py-2 border-y border-border/40 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User size={14} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-sm leading-tight">{order.client?.user?.name || "Unknown"}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold">{order.client?.user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 font-black text-foreground">
                                            <span>{order.totalAmount}</span>
                                            <span className="text-[10px] text-muted-foreground">TND</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                                <Button
                                                    size="iconsm" variant="soft" rounded="xl" color="info"
                                                    onClick={() => navigate(`/dashboard/orders/${order.order_number || order.id}`)}
                                                >
                                                    <Eye size={18} />
                                                </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" rounded="2xl" className="bg-muted/50 hover:bg-muted">
                                                        <ChevronDown size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border/50 rounded-xl">
                                                    {["confirme", "imported_to_depot", "en_livraison", "livree", "retournee", "annule"].map(s => (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            onClick={() => updateStatus(order.id, s)}
                                                            className="text-[11px] font-bold uppercase transition-colors hover:bg-muted"
                                                        >
                                                            {getStatusConfig(s).label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden md:block">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("admin.orders.table.id")}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("admin.orders.table.client")}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("admin.orders.table.amount")}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("admin.orders.table.status")}</TableHead>
                                <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("admin.orders.table.date")}</TableHead>
                                <TableHead className="py-5 px-6 text-end text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t("admin.orders.table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold">
                                            <Activity className="w-5 h-5 animate-spin text-primary" />
                                            {t("admin.orders.messages.loading")}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.map((order) => {
                                const status = getStatusConfig(order.status);
                                return (
                                    <TableRow key={order.id} className="group hover:bg-primary/5 border-border/40 transition-colors">
                                        <TableCell className="py-4 px-6 font-mono text-[10px] text-muted-foreground">
                                            {order.order_number || `#${order.id.split("-")[0]}`}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User size={14} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm leading-tight">{order.client?.user?.name || "Unknown"}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">{order.client?.user?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-1 font-black text-foreground">
                                                <span>{order.totalAmount}</span>
                                                <span className="text-[10px] text-muted-foreground">TND</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.color} font-black text-[10px] uppercase`}>
                                                    <status.icon size={12} />
                                                    {status.label}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-[11px] font-bold text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-end">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="iconsm"
                                                    variant="soft"
                                                    rounded="xl"
                                                    color="info"
                                                    onClick={() => navigate(`/dashboard/orders/${order.order_number || order.id}`)}
                                                >
                                                    <Eye size={18} />
                                                </Button>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="iconsm" variant="ghost" rounded="xl" className="hover:bg-muted">
                                                            <ChevronDown size={18} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card border-border/50 rounded-xl">
                                                        {["confirme", "imported_to_depot", "en_livraison", "livree", "retournee", "annule"].map(s => (
                                                            <DropdownMenuItem 
                                                                key={s} 
                                                                onClick={() => updateStatus(order.id, s)}
                                                                className="text-[11px] font-bold uppercase transition-colors hover:bg-muted"
                                                            >
                                                                {getStatusConfig(s).label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {!loading && filteredOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {t("admin.orders.messages.noOrders")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBox>

                <Modal
                    isOpen={!!viewingOrder}
                    onClose={() => setViewingOrder(null)}
                    title={t("admin.orders.view.title") || "Order Details"}
                    subtitle={viewingOrder?.order_number || `#${viewingOrder?.id}`}
                    icon={ShoppingCart}
                    maxWidth="max-w-4xl"
                    footer={
                        <div className="flex gap-3">
                             {['en_attente', 'confirme'].includes(String(viewingOrder?.status || '').toLowerCase()) && (
                                <Button 
                                    onClick={() => handleVerify(viewingOrder.id)} 
                                    disabled={verifying}
                                    className="rounded-xl font-black bg-blue-500 text-white hover:bg-blue-600 gap-2 px-6"
                                >
                                    {verifying ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    CONFIRMER MANUELLEMENT
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" rounded="xl" className="font-black">
                                        STATUT <ChevronDown size={14} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-border/50 bg-background/95 backdrop-blur-xl">
                                    {["confirme", "imported_to_depot", "en_livraison", "livree", "retournee", "annule"].map(s => (
                                        <DropdownMenuItem key={s} onClick={() => updateStatus(viewingOrder.id, s)} className="font-bold text-[10px] uppercase">
                                            {getStatusConfig(s).label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={() => setViewingOrder(null)} rounded="xl" className="font-black bg-muted text-foreground hover:bg-muted/80">
                                {t("admin.orders.view.close") || "Close"}
                            </Button>
                        </div>
                    }
                >
                    {viewingOrder && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
                                <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <User className="text-primary" size={20} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t("admin.orders.view.clientInfo")}</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">{t("auth.register.lastName")} & {t("auth.register.firstName")}</p>
                                            <p className="font-bold text-foreground">{viewingOrder.client?.user?.name} {viewingOrder.client?.user?.family_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">{t("auth.register.email")}</p>
                                            <p className="font-bold text-foreground">{viewingOrder.client?.user?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">Phone</p>
                                            <p className="font-bold text-foreground">{viewingOrder.client?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </CardBox>

                                <CardBox className="p-6 bg-muted/20 border-border/40 rounded-3xl text-start">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                            <Activity className="text-secondary" size={20} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">STATUT & INFOS</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">STATUS ACTUEL</p>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${getStatusConfig(viewingOrder.status).bg} ${getStatusConfig(viewingOrder.status).color} font-black text-[10px] uppercase mt-1`}>
                                                {getStatusConfig(viewingOrder.status).label}
                                            </div>
                                        </div>
                                        {viewingOrder.driver && (
                                            <div>
                                                <p className="text-[10px] font-black text-muted-foreground uppercase">DRIVER</p>
                                                <p className="font-bold text-foreground">{viewingOrder.driver.user?.name}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase">{t("admin.orders.table.date")}</p>
                                            <p className="font-bold text-foreground">{new Date(viewingOrder.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardBox>
                            </div>

                            <div className="space-y-6 text-start">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShoppingCart className="text-primary" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t("admin.orders.view.items")}</h3>
                                </div>
                                
                                {Object.values(viewingOrder.items.reduce((acc, item) => {
                                    const store = item.product?.store;
                                    const storeId = store?.id || "unknown";
                                    if (!acc[storeId]) {
                                        acc[storeId] = { id: storeId, name: store?.name_fr || store?.name_en || "Default Store", phone: store?.phone || "", items: [], allConfirmed: true };
                                    }
                                    acc[storeId].items.push(item);
                                    if (item.status !== 'confirme') acc[storeId].allConfirmed = false;
                                    return acc;
                                }, {})).map((storeGrp) => (
                                    <div key={storeGrp.id} className="space-y-2 mb-6">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-muted-foreground" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{storeGrp.name}</span>
                                                {storeGrp.allConfirmed ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-amber-500" />}
                                            </div>
                                            {storeGrp.phone && (
                                                <Button size="xs" variant="outline" padding="sm" rounded="lg" className="gap-1.5 font-bold text-[9px]" onClick={() => window.open(`tel:${storeGrp.phone}`)}>
                                                    <Phone size={10} />
                                                    APPELER
                                                </Button>
                                            )}
                                        </div>
                                        <div className="rounded-2xl border border-border/40 overflow-hidden bg-muted/5 font-start">
                                            <Table>
                                                <TableBody>
                                                    {storeGrp.items.map((item) => (
                                                        <TableRow key={item.id} className="border-border/40">
                                                            <TableCell className="py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                                                        <img
                                                                            src={item.product?.albums?.find((album) => album?.file)?.file || item.product?.albums?.[0]?.file || item.product?.albums?.[0]?.imageUrl || item.product?.imageUrl || '/storage/empty/empty.webp'}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.currentTarget.src = '/storage/empty/empty.webp';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="text-start">
                                                                        <p className="font-bold text-sm leading-tight">{item.product?.name_fr}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black ${item.status === 'confirme' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'annule' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                                                {String(item.status || 'unknown').toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-xs">x {item.quantity}</TableCell>
                                                            <TableCell className="text-end font-black text-primary text-sm">{item.price * item.quantity} TND</TableCell>
                                                            <TableCell className="text-end">
                                                                <Tooltip content={t('common.actions.delete')}>
                                                                    <Button variant="soft" size="iconsm" rounded="full" color="error" onClick={() => removeItem(viewingOrder.id, item.id)}>
                                                                        <XCircle size={14} />
                                                                    </Button>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end p-6 bg-primary/5 rounded-[32px] border border-primary/10 mt-4">
                                    <div className="text-right space-y-1.5">
                                        <div className="flex items-center justify-end gap-3 text-xs font-bold text-muted-foreground">
                                            <span>{t("admin.orders.view.subtotal") || "Customer Total"}</span>
                                            <span>{Number(viewingOrder.totalAmount || 0).toFixed(2)} TND</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-3 text-xs font-bold text-amber-600">
                                            <span>{t("admin.orders.view.commission") || "Platform Commission"}</span>
                                            <span>+ {calculateOrderCommission(viewingOrder).toFixed(2)} TND</span>
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mt-2">{t("admin.orders.view.storeNet") || "Store Net"}</p>
                                        <p className="text-3xl font-black text-primary leading-none mt-1">{calculateStoreNet(viewingOrder).toFixed(2)} TND</p>
                                    </div>
                                </div>
                            </div>
                            {viewingOrder.factures?.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FileText className="text-secondary" size={20} />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t("admin.orders.view.factures")}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {viewingOrder.factures.map((facture) => (
                                            <div key={facture.id} className="p-4 rounded-2xl border border-border/60 bg-muted/10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase">{facture.factureNumber}</span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${facture.status === "PAID" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>{facture.status}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-black text-primary/70 uppercase tracking-tighter">{facture.type}</p>
                                                        <p className="text-lg font-black text-foreground">{facture.amount} TND</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </AdminPageLayout>
    );
};

export default Orders;
