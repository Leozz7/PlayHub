import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Mail, Phone, FileText, UserPlus, CreditCard, Activity } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { Reservation } from '@/features/reservations/types/reservation.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function GestorClients() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';

    const [searchTerm, setSearchTerm] = useState('');
    const { data: reservationsData, isLoading } = useReservations({ pageSize: 500 });
    interface ClientData {
        id: string;
        name: string;
        email: string;
        phone: string;
        cpf: string;
        totalSpent: number;
        totalReservations: number;
        lastVisit: string;
        createdAt: string;
    }

    const clients = useMemo(() => {
        const reservations = reservationsData?.items || [];
        const map = new Map<string, ClientData>();
        reservations.forEach((r: Reservation) => {
            if (!map.has(r.userId)) {
                map.set(r.userId, {
                    id: r.userId,
                    name: r.userName || t('gestor.clients.deletedUser'),
                    email: r.userEmail || t('gestor.clients.notInformed'),
                    phone: r.userPhone || t('gestor.clients.notInformed'),
                    cpf: r.userCpf || t('gestor.clients.notInformed'),
                    totalSpent: 0,
                    totalReservations: 0,
                    lastVisit: r.startTime,
                    createdAt: r.startTime // Simplified for new clients stat
                });
            }
            const c = map.get(r.userId);
            if (c) {
                c.totalReservations += 1;
                if (Number(r.status) === 2 || Number(r.status) === 4) {
                    c.totalSpent += r.totalPrice;
                }
                if (new Date(r.startTime) > new Date(c.lastVisit)) {
                    c.lastVisit = r.startTime;
                }
            }
        });
        return Array.from(map.values()).filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.cpf.includes(searchTerm)
        );
    }, [reservationsData?.items, searchTerm, t]);

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const totalClients = clients.length;
        const newClients = clients.filter(c => {
            const d = new Date(c.createdAt);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
        const totalRevenue = clients.reduce((acc, c) => acc + c.totalSpent, 0);
        const avgRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;

        return [
            { label: t('gestor.clients.stats.total'), value: totalClients, icon: Users, color: 'text-blue-500' },
            { label: t('gestor.clients.stats.new'), value: newClients, icon: UserPlus, color: 'text-[#8CE600]' },
            { label: t('gestor.clients.stats.revenue'), value: `R$ ${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-purple-500' },
            { label: t('gestor.clients.stats.avg'), value: `R$ ${avgRevenue.toFixed(2)}`, icon: Activity, color: 'text-amber-500' },
        ];
    }, [clients, t]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <Users className="w-6 h-6" />
                        </div>
                        {t('gestor.clients.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.clients.subtitle')}</p>
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
                <div className="p-6 border-b border-gray-100 dark:border-white/10">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t('gestor.clients.searchPlaceholder')}
                            className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.clients.table.name')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.clients.table.contact')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.clients.table.totalReservations')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.clients.table.totalSpent')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.clients.table.lastVisit')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                                                <Users className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold">{t('gestor.clients.noResults')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence>
                                    {clients.map((c) => (
                                        <motion.tr
                                            key={c.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[#8CE600]/10 flex items-center justify-center text-[#8CE600] font-black text-xs">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <span className="font-black text-sm text-gray-900 dark:text-white">{c.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <Mail className="w-3 h-3 text-[#8CE600]" /> {c.email}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <Phone className="w-3 h-3 text-[#8CE600]" /> {c.phone}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                                        <FileText className="w-3 h-3" /> CPF: {c.cpf}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
                                                    {c.totalReservations}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-sm font-black text-[#8CE600]">
                                                    R$ {c.totalSpent.toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-500">
                                                    {new Date(c.lastVisit).toLocaleDateString(locale)}
                                                </span>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
