import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import CardBox from '@/components/shared/CardBox';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Search, Store, Activity, Filter, Download, Eye, Trash2 } from 'lucide-react';
import { imageFallback } from '@/utils/imageFallback';

const getStoreLogoUrl = (logo) => {
    if (!logo || logo === 'null' || logo === 'undefined') return null;
    if (logo.startsWith('http') || logo.startsWith('/')) return logo;
    return `/storage/${logo.replace(/^storage\//, '').replace(/^\//, '')}`;
};

const getStoreName = (store) => {
    return store?.store?.name_fr || store?.store?.name_en || store?.store?.name_ar || store?.name || 'Store';
};

const Stores = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users/stores');
      setStores(response.data.data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleAdd = () => {
    navigate('/dashboard/stores/create');
  };

  const handleEdit = (store) => {
    navigate(`/dashboard/stores/${store.id}/edit`);
  };

  const handleView = (store) => {
    navigate(`/dashboard/stores/${store.store?.id || store.id}`);
  };

  const handleDelete = async (store) => {
    if ((store.products_count ?? 0) > 0) return;
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      await api.delete(`/admin/users/stores/${store.id}`);
      setStores((prev) => prev.filter((s) => s.id !== store.id));
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const handleToggleBlock = async (store) => {
    const newBlocked = !store.isBlocked;
    const action = newBlocked ? 'block' : 'unblock';
    setStores((prev) => prev.map((s) => s.id === store.id ? { ...s, isBlocked: newBlocked } : s));
    try {
      await api.post(`/admin/users/${store.id}/${action}`);
    } catch (error) {
      console.error(`Error trying to ${action} store:`, error);
      setStores((prev) => prev.map((s) => s.id === store.id ? { ...s, isBlocked: !newBlocked } : s));
    }
  };

  const filteredStores = stores.filter(store =>
    (store.name?.toLowerCase().includes(search.toLowerCase()) ||
    store.email?.toLowerCase().includes(search.toLowerCase()) ||
    store.store?.name_fr?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'blocked' ? store.isBlocked : !store.isBlocked))
  );

  return (
    <AdminPageLayout
        title="admin.stores.title"
        subtitle="admin.stores.subtitle"
        icon={Store}
        onAdd={handleAdd}
        addLabel="admin.stores.add"
    >
      <div className="space-y-6">
        {/* Filters & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <Input
                    placeholder={t('admin.stores.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 bg-card border-border/60 rounded-2xl focus:shadow-xl focus:shadow-primary/5 transition-all"
                />
            </div>
            
            <div className="flex items-center gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 px-4 rounded-2xl bg-card border border-border/60 text-foreground font-bold text-sm"
                >
                    <option value="all">{t('admin.stores.filter.all') || 'All Stores'}</option>
                    <option value="blocked">{t('admin.stores.filter.blocked') || 'Blocked'}</option>
                    <option value="unblocked">{t('admin.stores.filter.unblocked') || 'Not Blocked'}</option>
                </select>
                <Button variant="outlinemuted" size="xl" rounded="2xl" className="font-bold">
                    <Filter size={18} className="text-muted-foreground" />
                    {t('common.actions.filter') || 'Filter'}
                </Button>
                <Button variant="outlinemuted" size="xl" rounded="2xl" className="font-bold">
                    <Download size={18} className="text-muted-foreground" />
                    {t('common.actions.export') || 'Export'}
                </Button>
            </div>
        </div>

        {/* Mobile View - Card List */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card/50 rounded-[32px] border border-border/50">
                    <Activity className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-bold">{t('admin.common.loading')}</p>
                </div>
            ) : filteredStores.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-card/50 rounded-[32px] border border-border/50">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                        <Store size={32} />
                    </div>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.stores.messages.noStores')}</p>
                </div>
            ) : (
                    filteredStores.map((store, idx) => (
                        <div
                            key={store.id}
                            className="bg-card border border-border/60 rounded-[24px] p-5 space-y-4 shadow-sm active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl uppercase overflow-hidden">
                                    {getStoreLogoUrl(store.store?.logo) ? (
                                        <img
                                            src={getStoreLogoUrl(store.store?.logo)}
                                            alt={getStoreName(store)}
                                            className="w-full h-full object-cover"
                                            onError={imageFallback}
                                        />
                                    ) : (
                                        getStoreName(store).charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-foreground tracking-tight leading-none mb-1">{getStoreName(store)}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{store.store?.matriculeFiscale || 'No MAT'}</p>
                                </div>
                                <Switch size="sm" color="success" checked={!store.isBlocked} onCheckedChange={() => handleToggleBlock(store)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/40">
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">{t('admin.stores.table.owner')}</p>
                                    <p className="text-xs font-bold text-foreground truncate">{store.name} {store.family_name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">{t('admin.stores.table.phone')}</p>
                                    <p className="text-xs font-bold text-foreground truncate">{store.store?.storePhone || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-0.5">{t('admin.stores.table.email')}</p>
                                    <p className="text-xs font-bold text-primary truncate max-w-[150px]">{store.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip content="View">
                                        <Button
                                            variant="soft"
                                            size="iconsm"
                                            rounded="xl"
                                            onClick={() => handleView(store)}
                                        >
                                            <Eye size={18} strokeWidth={2.5} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content={t('common.actions.edit')}>
                                        <Button
                                            variant="soft"
                                            size="iconsm"
                                            color="warning"
                                            rounded="xl"
                                            onClick={() => handleEdit(store)}
                                        >
                                            <Pencil size={18} strokeWidth={2.5} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Delete">
                                        <Button
                                            variant="soft"
                                            size="iconsm"
                                            color="error"
                                            rounded="xl"
                                            disabled={(store.products_count ?? 0) > 0}
                                            onClick={() => handleDelete(store)}
                                        >
                                            <Trash2 size={18} strokeWidth={2.5} />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    ))
            )}
        </div>

        {/* Desktop View - Table Container */}
        <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.stores.table.storeName')}</TableHead>
                            <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.stores.table.owner')}</TableHead>
                            <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.stores.table.email')}</TableHead>
                            <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.stores.table.phone')}</TableHead>
                            <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.stores.table.status')}</TableHead>
                            <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground text-end">{t('admin.stores.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold">
                                        <Activity className="w-5 h-5 animate-spin text-primary" />
                                        {t('admin.common.loading')}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredStores.map((store, idx) => (
                            <tr 
                                key={store.id}
                                className="border-border/40 hover:bg-primary/5 transition-colors group cursor-pointer"
                            >
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase overflow-hidden">
                                            {getStoreLogoUrl(store.store?.logo) ? (
                                                <img
                                                    src={getStoreLogoUrl(store.store?.logo)}
                                                    alt={getStoreName(store)}
                                                    className="w-full h-full object-cover"
                                                    onError={imageFallback}
                                                />
                                            ) : (
                                                getStoreName(store).charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground tracking-tight">{getStoreName(store)}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{store.store?.matriculeFiscale || '-'}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 font-bold text-sm text-foreground">
                                    {store.name} {store.family_name}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-muted-foreground font-medium">{store.email}</TableCell>
                                <TableCell className="py-4 px-6 text-sm text-muted-foreground font-medium">{store.store?.storePhone || '-'}</TableCell>
                                <TableCell className="py-4 px-6">
                                    <Switch size="sm" color="success" checked={!store.isBlocked} onCheckedChange={() => handleToggleBlock(store)} />
                                </TableCell>
                                <TableCell className="py-4 px-6 text-end">
                                    <div className="flex items-center justify-end gap-2  transition-opacity">
                                        <Tooltip content="View">
                                            <Button
                                                variant="soft"
                                                size="iconsm"
                                                rounded="xl"
                                                onClick={() => handleView(store)}
                                            >
                                                <Eye size={18} strokeWidth={2.5} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content={t('common.actions.edit')}>
                                            <Button
                                                variant="soft"
                                                size="iconsm"
                                                color="warning"
                                                rounded="xl"
                                                onClick={() => handleEdit(store)}
                                            >
                                                <Pencil size={18} strokeWidth={2.5} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Delete">
                                            <Button
                                                variant="soft"
                                                size="iconsm"
                                                color="error"
                                                rounded="xl"
                                                disabled={(store.products_count ?? 0) > 0}
                                                onClick={() => handleDelete(store)}
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </tr>
                        ))}
                    </TableBody>
                </Table>
                {!loading && filteredStores.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <Store size={32} />
                        </div>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.stores.messages.noStores')}</p>
                    </div>
                )}
            </div>
        </CardBox>
      </div>
    </AdminPageLayout>
  );
};

export default Stores;
