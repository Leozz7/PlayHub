import { useTranslation } from 'react-i18next';
import { BarChart3, Download, TrendingUp, Users, DollarSign, Calendar, Activity } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function GestorReports() {
    const { t } = useTranslation();

    const { data: reservationsData, isLoading } = useReservations({ pageSize: 500 });
    const reservations = reservationsData?.items || [];

    const revenue = reservations
        .filter((r: any) => r.status === 2 || r.status === 4)
        .reduce((sum: number, r: any) => sum + r.totalPrice, 0);
    const totalReservations = reservations.length;
    const uniqueClients = new Set(reservations.map((r: any) => r.userId)).size;
    const avgTicket = totalReservations > 0 ? revenue / totalReservations : 0;

    const handleExportPDF = () => {
        window.print();
    };

    const stats = [
        { label: t('gestor.reports.revenue'), value: `R$ ${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-[#8CE600]' },
        { label: t('gestor.reports.totalReservations'), value: totalReservations, icon: Calendar, color: 'text-blue-500' },
        { label: t('gestor.reports.uniqueClients'), value: uniqueClients, icon: Users, color: 'text-purple-500' },
        { label: t('gestor.reports.avgTicket'), value: `R$ ${avgTicket.toFixed(2)}`, icon: Activity, color: 'text-amber-500' },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        {t('gestor.reports.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.reports.subtitle')}</p>
                </div>
                <Button 
                    onClick={handleExportPDF} 
                    className="bg-[#8CE600] text-gray-950 hover:opacity-90 font-black px-6 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20"
                >
                    <Download className="w-5 h-5 mr-2" />
                    {t('gestor.reports.exportPdf')}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-5 rounded-3xl shadow-sm">
                            <Skeleton className="h-10 w-10 rounded-2xl mb-4" />
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    ))
                ) : (
                    stats.map((stat, i) => (
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
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-12 shadow-xl shadow-black/5 dark:shadow-none min-h-[400px] flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                        <TrendingUp className="w-10 h-10 text-gray-200 dark:text-gray-800" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('gestor.reports.revenueByCourt')}</h3>
                    <p className="text-sm text-gray-500 max-w-xs">{t('gestor.reports.comingSoon')}</p>
                </div>
                <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-12 shadow-xl shadow-black/5 dark:shadow-none min-h-[400px] flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                        <BarChart3 className="w-10 h-10 text-gray-200 dark:text-gray-800" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('gestor.reports.reservationsByDay')}</h3>
                    <p className="text-sm text-gray-500 max-w-xs">{t('gestor.reports.comingSoon')}</p>
                </div>
            </div>
        </div>
    );
}
