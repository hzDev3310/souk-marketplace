import React, { useState, useEffect, useCallback } from 'react';
import CardBox from '@/components/shared/CardBox';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { imageFallback } from '@/utils/imageFallback';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Store,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} TND`;
};

const formatNumber = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};

// Normalize the various order response shapes into a plain array
const extractOrders = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

// Normalize a product response into a plain array
const extractProducts = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isProfileIncomplete = user?.role === 'STORE' && user?.store && (!user?.store?.name_en || !user?.store?.name_fr || !user?.store?.name_ar || !user?.store?.storePhone);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      if ((isAdmin || user?.role === 'STORE') && (isAdmin || user?.store?.id)) {
        const endpoint = isAdmin ? '/admin/dashboard' : '/store/dashboard';
        const { data } = await api.get(endpoint);
        setOrders(extractOrders(data?.orders));
        setProducts(extractProducts(data?.products));
        setClientCount(Number(data?.client_count || 0));
        setStoreCount(Number(data?.store_count || 0));
      }
    } catch (error) {
      setLoadError(true);
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user?.role, user?.store?.id]);

  useEffect(() => {
    if (user?.role) {
      fetchDashboard();
    }
  }, [fetchDashboard, user?.role]);

  // Revenue is the sum of all order totals
  const revenue = orders.reduce((sum, o) => sum + Number(o?.totalAmount || 0), 0);

  // Total units sold across all items
  const totalUnitsSold = orders.reduce((sum, o) => {
    if (!o?.items) return sum;
    return sum + o.items.reduce((s, item) => s + Number(item?.quantity || 0), 0);
  }, 0);

  // Order status counts
  const statusCount = (status) =>
    orders.filter((o) => String(o?.status || '').toLowerCase() === status).length;

  // Top products computed from order items across orders
  const topProducts = (() => {
    const map = new Map();
    orders.forEach((o) => {
      if (!o?.items) return;
      o.items.forEach((item) => {
        const product = item?.product;
        if (!product?.id) return;
        const key = product.id;
        const entry = map.get(key) || {
          id: key,
          name: product.name_fr || product.name_en || product.name_ar || 'Product',
          image:
            product.albums?.find((a) => a?.file)?.file ||
            product.albums?.[0]?.file ||
            product.albums?.[0]?.imageUrl ||
            product.imageUrl,
          sales: 0,
          revenue: 0,
        };
        entry.sales += Number(item?.quantity || 0);
        entry.revenue += Number(item?.price || 0) * Number(item?.quantity || 0);
        map.set(key, entry);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  })();

  const productCount = products.length;

  const stats = isAdmin
    ? [
        {
          title: t('dashboard.stats.revenue') || 'Total Revenue',
          value: formatCurrency(revenue),
          sub: `${orders.length} ${t('dashboard.subOrders') || 'orders'}`,
          icon: DollarSign,
          color: 'from-blue-500 to-indigo-600',
        },
        {
          title: t('dashboard.stats.orders') || 'Orders',
          value: formatNumber(orders.length),
          sub: `${statusCount('confirme')} ${t('dashboard.subConfirmed') || 'confirmed'}`,
          icon: ShoppingCart,
          color: 'from-purple-500 to-pink-600',
        },
        {
          title: t('dashboard.stats.customers') || 'Customers',
          value: formatNumber(clientCount),
          sub: `${productCount} ${t('dashboard.subProducts') || 'products'}`,
          icon: Users,
          color: 'from-emerald-500 to-teal-600',
        },
        {
          title: t('dashboard.stats.stores') || 'Stores',
          value: formatNumber(storeCount),
          sub: `${formatNumber(totalUnitsSold)} ${t('dashboard.subUnitsSold') || 'units sold'}`,
          icon: Store,
          color: 'from-orange-500 to-amber-600',
        },
      ]
    : [
        {
          title: t('dashboard.stats.revenue') || 'Total Revenue',
          value: formatCurrency(revenue),
          sub: `${orders.length} ${t('dashboard.subOrders') || 'orders'}`,
          icon: DollarSign,
          color: 'from-blue-500 to-indigo-600',
        },
        {
          title: t('dashboard.stats.orders') || 'Orders',
          value: formatNumber(orders.length),
          sub: `${statusCount('confirme')} ${t('dashboard.subConfirmed') || 'confirmed'}`,
          icon: ShoppingCart,
          color: 'from-purple-500 to-pink-600',
        },
        {
          title: t('dashboard.stats.products') || 'Products',
          value: formatNumber(productCount),
          sub: `${formatNumber(totalUnitsSold)} ${t('dashboard.subUnitsSold') || 'units sold'}`,
          icon: Package,
          color: 'from-emerald-500 to-teal-600',
        },
        {
          title: t('dashboard.stats.growth') || 'Units Sold',
          value: formatNumber(totalUnitsSold),
          sub: `${statusCount('livree')} ${t('dashboard.subDelivered') || 'delivered'}`,
          icon: TrendingUp,
          color: 'from-orange-500 to-amber-600',
        },
      ];

  const getStatusStyle = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'confirme':
      case 'confirmed':
        return { label: t('dashboard.statusConfirmed') || 'Confirmed', color: 'bg-emerald-500/10 text-emerald-600' };
      case 'en_attente':
      case 'pending':
        return { label: t('dashboard.statusPending') || 'Pending', color: 'bg-amber-500/10 text-amber-600' };
      case 'imported_to_depot':
        return { label: t('dashboard.statusInDepot') || 'In Depot', color: 'bg-indigo-500/10 text-indigo-600' };
      case 'en_livraison':
        return { label: t('dashboard.statusShipping') || 'Shipping', color: 'bg-blue-500/10 text-blue-600' };
      case 'livree':
      case 'delivered':
        return { label: t('dashboard.statusDelivered') || 'Delivered', color: 'bg-emerald-500/10 text-emerald-600' };
      case 'retournee':
      case 'returned':
      case 'annule':
      case 'cancelled':
        return { label: t('dashboard.statusCancelled') || 'Cancelled', color: 'bg-red-500/10 text-red-600' };
      default:
        return { label: status || t('dashboard.statusUnknown') || 'Unknown', color: 'bg-muted/10 text-muted-foreground' };
    }
  };

  const recentOrders = orders.slice(0, 5);
  const productColors = [
    'bg-blue-500/10 text-blue-600',
    'bg-indigo-500/10 text-indigo-600',
    'bg-emerald-500/10 text-emerald-600',
    'bg-purple-500/10 text-purple-600',
    'bg-pink-500/10 text-pink-600',
  ];

  return (
    <div className="space-y-8 p-1">
      {isProfileIncomplete && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-yellow-200 bg-yellow-50/70 p-4 dark:border-yellow-800/60 dark:bg-yellow-950/20">
              <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <div>
                      <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">{t('dashboard.profileIncompleteTitle') || 'Complete your store profile'}</p>
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">{t('dashboard.profileIncompleteDesc') || 'Fill in the required store data to unlock your dashboard functionality.'}</p>
                  </div>
              </div>
              <Link to="/dashboard/profile" className="flex items-center gap-2 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-yellow-700">
                  {t('dashboard.completeProfile') || 'Complete profile'}
                  <ArrowRight className="h-4 w-4" />
              </Link>
          </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {t('sidebar.dashboard')}
            </h1>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">
            {t('dashboard.welcome') || "Welcome back! Here's a summary of your performance."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchDashboard} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primaryemphasis transition-all shadow-lg shadow-primary/20">
            <Layers className="w-4 h-4" />
            {t('dashboard.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-800/60 dark:bg-red-950/20">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-600 dark:text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-900 dark:text-red-200">{t('dashboard.loadErrorTitle') || 'Failed to load dashboard data'}</p>
            <p className="text-xs text-red-800 dark:text-red-300">{t('dashboard.loadErrorDesc') || 'Some metrics may be incomplete. Click Refresh to try again.'}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group">
            <CardBox className="p-6 h-full relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:bg-card hover:border-primary/20 shadow-sm hover:shadow-xl">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
                    {loading ? (
                      <span className="inline-block w-24 h-7 bg-muted/40 rounded-md animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                      {stat.sub}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-inherit/20 flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </CardBox>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-black text-foreground tracking-tight">{t('dashboard.recentOrders') || 'Recent Orders'}</h3>
            </div>
            <Link to="/dashboard/orders" className="text-sm font-bold text-primary hover:text-primaryemphasis transition-colors px-3 py-1 bg-primary/5 rounded-lg">
              {t('dashboard.viewAll') || 'View All Transactions'}
            </Link>
          </div>

          <CardBox className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 rounded-3xl p-0 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('dashboard.colOrderId') || 'Order ID'}</th>
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('dashboard.colCustomer') || 'Customer'}</th>
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('dashboard.colStatus') || 'Status'}</th>
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('dashboard.colAmount') || 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold">
                          <Activity className="w-5 h-5 animate-spin text-primary" />
                          {t('dashboard.loading') || 'Loading...'}
                        </div>
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                        {t('dashboard.noOrders') || 'No orders yet'}
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, i) => {
                      const style = getStatusStyle(order.status);
                      const customerName = order.client?.user?.name || t('dashboard.na') || 'N/A';
                      return (
                        <tr
                          key={order.id || i}
                          className="hover:bg-primary/5 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-6 text-sm font-black text-foreground tracking-tight">
                            {order.order_number || `#${String(order.id).split('-')[0]}`}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{customerName}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-lg ${style.color}`}>
                              {style.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-black text-foreground">{formatCurrency(order.totalAmount)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardBox>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black text-foreground tracking-tight">{t('dashboard.topProducts') || 'Top Products'}</h3>
          </div>

          <CardBox className="bg-card/50 backdrop-blur-sm border-border/50 rounded-3xl p-6 shadow-sm h-full">
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted/40 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 bg-muted/40 rounded animate-pulse" />
                        <div className="h-2 w-1/3 bg-muted/40 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Package size={32} />
                  </div>
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('dashboard.noSales') || 'No sales yet'}</p>
                </div>
              ) : (
                topProducts.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl ${productColors[i % productColors.length]} flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={imageFallback}
                        />
                      ) : (
                        product.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate">{product.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.sales} {t('dashboard.sold') || 'sold'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button size="hero" rounded="2xl" className="mt-8 bg-muted hover:bg-muted/80 text-foreground font-bold shadow-none border border-border/50" onClick={fetchDashboard}>
              {t('dashboard.refresh') || 'Refresh'}
            </Button>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
