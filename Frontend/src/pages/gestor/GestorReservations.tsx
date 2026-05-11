import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, CalendarDays, CheckCircle2, Clock, XCircle, DollarSign } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { useManagementCourts } from '@/features/courts/hooks/useCourts';
import { ActionModal } from '@/components/ui/PremiumModal';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { api } from '@/lib/api';
import { signalRService } from '@/lib/signalr';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG = {
    2: { key: 'confirmed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    1: { key: 'pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    3: { key: 'cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    4: { key: 'completed', icon: CheckCircle2, color: 'text-[#8CE600]', bg: 'bg-[#8CE600]/10', border: 'border-[#8CE600]/20' },
    5: { key: 'blocked', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
} as const;

export default function GestorReservations() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    const phToast = usePlayHubToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourt, setSelectedCourt] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [reservationToCancel, setReservationToCancel] = useState<any>(null);

    const { data: courtsData } = useManagementCourts({ pageSize: 100 });
    const { data: reservationsData, isLoading, refetch } = useReservations({ pageSize: 100 });

    useEffect(() => {
        const connection = signalRService.connection;
        if (!connection) return;

        const handleNewReservation = () => {
            refetch();
            phToast.info(t('gestor.notifications.newReservation', 'Uma nova reserva foi realizada!'));
        };

        connection.on("ReservationCreated", handleNewReservation);
        return () => {
            connection.off("ReservationCreated", handleNewReservation);
        };
    }, [refetch, phToast, t]);

    const courts = courtsData?.items || [];
    const reservations = reservationsData?.items || [];

    const filteredReservations = useMemo(() => {
        return reservations.filter((r: any) => {
            const matchSearch = r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCourt = selectedCourt === 'all' || r.courtId === selectedCourt;
            const matchStatus = selectedStatus === 'all' || String(r.status) === selectedStatus;

            return matchSearch && matchCourt && matchStatus;
        });
    }, [reservations, searchTerm, selectedCourt, selectedStatus]);

    const stats = useMemo(() => {
        const total = reservations.length;
        const confirmed = reservations.filter((r: any) => r.status === 2).length;
        const pending = reservations.filter((r: any) => r.status === 1).length;
        const revenue = reservations
            .filter((r: any) => r.status === 2 || r.status === 4)
            .reduce((acc: number, r: any) => acc + r.totalPrice, 0);

        return [
            { label: t('gestor.reservations.stats.total'), value: total, icon: CalendarDays, color: 'text-blue-500' },
            { label: t('gestor.reservations.stats.confirmed'), value: confirmed, icon: CheckCircle2, color: 'text-[#8CE600]' },
            { label: t('gestor.reservations.stats.pending'), value: pending, icon: Clock, color: 'text-amber-500' },
            { label: t('gestor.reservations.stats.revenue'), value: `R$ ${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-500' },
        ];
    }, [reservations, t]);

    const handleCancel = async () => {
        if (!reservationToCancel) return;
        try {
            await api.delete(`/Reservations/${reservationToCancel.id}`);
            phToast.success(t('gestor.reservations.cancelSuccess', 'Reserva cancelada com sucesso!'));
            refetch();
        } catch (error) {
            phToast.error(t('gestor.reservations.cancelError', 'Erro ao cancelar reserva.'));
        } finally {
            setCancelModalOpen(false);
            setReservationToCancel(null);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        {t('gestor.reservations.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.reservations.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-5 rounded-3xl shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-2xl bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t('gestor.reservations.searchPlaceholder')}
                            className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                            <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                                <SelectValue placeholder={t('gestor.reservations.allCourts')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                                <SelectItem value="all">{t('gestor.reservations.allCourts')}</SelectItem>
                                {courts.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full md:w-40 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                                <SelectValue placeholder={t('gestor.reservations.status')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                                <SelectItem value="all">{t('gestor.reservations.allStatuses')}</SelectItem>
                                <SelectItem value="1">Pendente</SelectItem>
                                <SelectItem value="2">Confirmado</SelectItem>
                                <SelectItem value="3">Cancelado</SelectItem>
                                <SelectItem value="4">Concluído</SelectItem>
                                <SelectItem value="5">Bloqueado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.id')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.client')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.court')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.date')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.price')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.status')}</TableHead>
                                <TableHead className="px-6 py-4 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-10 ml-auto rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredReservations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                                                <CalendarDays className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold">{t('gestor.reservations.noResults')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence>
                                    {filteredReservations.map((r: any) => {
                                        const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
                                        let statusLabel = 'Pendente';
                                        if (r.status === 2) statusLabel = 'Confirmado';
                                        if (r.status === 3) statusLabel = 'Cancelado';
                                        if (r.status === 4) statusLabel = 'Concluído';
                                        if (r.status === 5) statusLabel = 'Bloqueado';

                                        return (
                                            <motion.tr
                                                key={r.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                                            >
                                                <TableCell className="px-6 py-4">
                                                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#8CE600] transition-colors">{r.id.split('-')[0].toUpperCase()}</span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="font-black text-sm text-gray-900 dark:text-white">{r.userName || 'Usuário'}</span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.courtName || 'Quadra'}</span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{new Date(r.startTime).toLocaleDateString(locale)}</span>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(r.startTime).getHours()}h - {new Date(r.endTime).getHours()}h</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <span className="font-black text-sm text-[#8CE600]">R$ {r.totalPrice.toFixed(2)}</span>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                        <cfg.icon className="w-3 h-3 mr-1.5" />
                                                        {statusLabel}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    {r.status !== 3 && r.status !== 5 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => { setReservationToCancel(r); setCancelModalOpen(true); }}
                                                            className="h-8 w-8 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ActionModal
                isOpen={cancelModalOpen}
                onClose={() => { setCancelModalOpen(false); setReservationToCancel(null); }}
                onAction={handleCancel}
                title={t('gestor.reservations.cancelConfirm.title')}
                description={t('gestor.reservations.cancelConfirm.desc')}
                actionText={t('gestor.reservations.cancelConfirm.confirm')}
                variant="danger"
                icon={XCircle}
            />
        </div>
    );
}
