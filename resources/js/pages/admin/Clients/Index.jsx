import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import CardBox from '@/components/shared/CardBox';
import AdminPageLayout from '@/components/shared/AdminPageLayout';
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
import { Search, Users, MapPin, Activity, Filter, Download, Eye } from 'lucide-react';

const Clients = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users/clients');
            setClients(response.data.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleView = (client) => {
        navigate(`/dashboard/clients/${client.client?.id || client.id}/orders`, { state: { client } });
    };

    const handleToggleBlock = async (client) => {
        const newBlocked = !client.isBlocked;
        const action = newBlocked ? 'block' : 'unblock';
        setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, isBlocked: newBlocked } : c));
        try {
            await api.post(`/admin/users/${client.id}/${action}`);
        } catch (error) {
            console.error(`Error trying to ${action} client:`, error);
            setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, isBlocked: !newBlocked } : c));
        }
    };

    const filteredClients = clients.filter(client =>
        (client.name?.toLowerCase().includes(search.toLowerCase()) ||
        client.email?.toLowerCase().includes(search.toLowerCase()) ||
        client.client?.city?.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === 'all' || (statusFilter === 'blocked' ? client.isBlocked : !client.isBlocked))
    );

    return (
        <AdminPageLayout
            title="admin.clients.title"
            subtitle="admin.clients.subtitle"
            icon={Users}
        >
            <div className="space-y-6">
                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <Input
                            placeholder={t('admin.clients.search')}
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
                            <option value="all">{t('admin.clients.filter.all') || 'All Clients'}</option>
                            <option value="blocked">{t('admin.clients.filter.blocked') || 'Blocked'}</option>
                            <option value="unblocked">{t('admin.clients.filter.unblocked') || 'Not Blocked'}</option>
                        </select>
                        <Button variant="outlinemuted" size="xl" padding="lg" rounded="2xl" className="font-bold">
                            <Filter size={18} className="text-muted-foreground" />
                            {t('common.actions.filter') || 'Filter'}
                        </Button>
                        <Button variant="outlinemuted" size="xl" padding="lg" rounded="2xl" className="font-bold">
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
                    ) : filteredClients.length === 0 ? (
                        <div className="py-20 text-center space-y-3 bg-card/50 rounded-[32px] border border-border/50">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <Users size={32} />
                            </div>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('admin.clients.messages.noClients') || 'No clients found'}</p>
                        </div>
                    ) : (
                        filteredClients.map((client, idx) => (
                            <div
                                key={client.id}
                                className="bg-card border border-border/60 rounded-[24px] p-5 space-y-4 shadow-sm active:scale-[0.98] transition-transform"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black text-xl uppercase">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-foreground tracking-tight leading-none mb-1">{client.name} {client.family_name}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{client.email}</p>
                                    </div>
                                    <Switch size="sm" color="success" checked={!client.isBlocked} onCheckedChange={() => handleToggleBlock(client)} />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium py-2 border-y border-border/40">
                                    <MapPin size={14} className="text-primary/50" />
                                    {client.client?.city || '-'}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleView(client)}
                                        className="h-10 px-4 rounded-2xl bg-secondary/5 text-secondary hover:bg-secondary/20 text-xs font-bold gap-2"
                                    >
<Eye size={16} strokeWidth={2.5} />
                                         {t('admin.clients.table.viewOrders') || 'View orders'}
                                     </Button>
                                 </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View - Clients Table Container */}
                <CardBox className="p-0 border-border/50 rounded-[32px] overflow-hidden hidden md:block">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.table.name')}</TableHead>
                                    <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.table.email')}</TableHead>
                                    <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.table.city')}</TableHead>
                                    <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.clients.table.status')}</TableHead>
                                    <TableHead className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground text-end">{t('admin.clients.table.actions')}</TableHead>
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
                                ) : filteredClients.map((client, idx) => (
                                    <tr 
                                        key={client.id}
                                        className="border-border/40 hover:bg-primary/5 transition-colors group cursor-pointer"
                                    >
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <p className="font-black text-foreground tracking-tight">{client.name} {client.family_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-muted-foreground font-medium">{client.email}</TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                <MapPin size={14} className="text-primary/50" />
                                                {client.client?.city || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <Switch size="sm" color="success" checked={!client.isBlocked} onCheckedChange={() => handleToggleBlock(client)} />
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-end">
                                            <div className="flex items-center justify-end gap-2">
                                                <Tooltip content={t('common.actions.view')}>
                                                    <Button
                                                        variant="soft"
                                                        size="iconsm"
                                                        rounded="xl"
                                                        color="info"
                                                        onClick={() => handleView(client)}
                                                    >
                                                        <Eye size={18} strokeWidth={2.5} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </tr>
                                ))}
</TableBody>
                        </Table>
                    </div>
                </CardBox>
            </div>
        </AdminPageLayout>
    );
};

export default Clients;
