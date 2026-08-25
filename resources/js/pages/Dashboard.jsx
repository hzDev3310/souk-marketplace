import React from 'react';
import CardBox from '@/components/shared/CardBox';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isProfileIncomplete = user?.role === 'STORE' && user?.store && (!user?.store?.name_en || !user?.store?.name_fr || !user?.store?.name_ar || !user?.store?.storePhone);

  const stats = [
    {
      title: t('dashboard.stats.revenue') || 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-blue-500 to-indigo-600',
      lightColor: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: t('dashboard.stats.orders') || 'Orders',
      value: '2,350',
      change: '+15.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-600',
      lightColor: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: t('dashboard.stats.customers') || 'Customers',
      value: '12,234',
      change: '+5.4%',
      trend: 'up',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      lightColor: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: t('dashboard.stats.growth') || 'Growth',
      value: '+18.2%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600',
      lightColor: 'bg-orange-500/10 text-orange-600',
    },
  ];

  return (
    <div className="space-y-8 p-1">
      {isProfileIncomplete && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-yellow-200 bg-yellow-50/70 p-4 dark:border-yellow-800/60 dark:bg-yellow-950/20">
              <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <div>
                      <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">Complete your store profile</p>
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">Fill in the required store data to unlock your dashboard functionality.</p>
                  </div>
              </div>
              <Link to="/dashboard/profile" className="flex items-center gap-2 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-yellow-700">
                  Complete profile
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
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primaryemphasis transition-all shadow-lg shadow-primary/20">
            <Layers className="w-4 h-4" />
            Custom View
          </button>
        </div>
      </div>

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
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {stat.change}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">vs last month</span>
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
              <h3 className="text-xl font-black text-foreground tracking-tight">Recent Orders</h3>
            </div>
            <button className="text-sm font-bold text-primary hover:text-primaryemphasis transition-colors px-3 py-1 bg-primary/5 rounded-lg">
              View All Transactions
            </button>
          </div>

          <CardBox className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 rounded-3xl p-0 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</th>
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-start py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[
                    { id: '#ORD-001', name: 'John Doe', status: 'Completed', amount: '$120.50', statusColor: 'bg-emerald-500/10 text-emerald-600' },
                    { id: '#ORD-002', name: 'Jane Smith', status: 'Pending', amount: '$85.00', statusColor: 'bg-amber-500/10 text-amber-600' },
                    { id: '#ORD-003', name: 'Mike Johnson', status: 'Processing', amount: '$230.25', statusColor: 'bg-blue-500/10 text-blue-600' },
                    { id: '#ORD-004', name: 'Sarah Wilson', status: 'Completed', amount: '$450.00', statusColor: 'bg-emerald-500/10 text-emerald-600' },
                    { id: '#ORD-005', name: 'Robert Lee', status: 'Cancelled', amount: '$15.00', statusColor: 'bg-red-500/10 text-red-600' },
                  ].map((order, i) => (
                    <tr
                      className="hover:bg-primary/5 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6 text-sm font-black text-foreground tracking-tight">{order.id}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{order.name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-lg ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-foreground">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBox>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black text-foreground tracking-tight">Top Products</h3>
          </div>

          <CardBox className="bg-card/50 backdrop-blur-sm border-border/50 rounded-3xl p-6 shadow-sm h-full">
            <div className="space-y-6">
              {[
                { name: 'Premium Widget', sales: '234 sales', revenue: '$12,340', color: 'bg-blue-500/10 text-blue-600' },
                { name: 'Deluxe Package', sales: '189 sales', revenue: '$9,450', color: 'bg-indigo-500/10 text-indigo-600' },
                { name: 'Starter Kit', sales: '156 sales', revenue: '$7,800', color: 'bg-emerald-500/10 text-emerald-600' },
                { name: 'Global Access', sales: '142 sales', revenue: '$6,200', color: 'bg-purple-500/10 text-purple-600' },
                { name: 'Ultra Boost', sales: '128 sales', revenue: '$5,100', color: 'bg-pink-500/10 text-pink-600' },
              ].map((product, i) => (
                <div
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl ${product.color} flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform`}>
                    {product.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.sales}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{product.revenue}</p>
                    <div className="flex items-center justify-end gap-0.5 text-[9px] font-black text-emerald-600">
                      <ArrowUpRight size={8} />
                      12%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button size="hero" rounded="2xl" className="mt-8 bg-muted hover:bg-muted/80 text-foreground font-bold shadow-none border border-border/50">
              Generate Full Report
            </Button>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
