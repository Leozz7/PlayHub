import { useTranslation } from 'react-i18next';
import { Bell, Check, CalendarDays, CreditCard, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function GestorNotifications() {
    const { t } = useTranslation();

    const notifications = [
        { id: 1, type: 'reservation', title: 'Nova reserva confirmada', message: 'João Silva agendou a Quadra 1 para amanhã às 18h.', time: t('gestor.notifications.timeAgo'), read: false },
        { id: 2, type: 'payment', title: 'Pagamento recebido', message: 'O pagamento de R$ 150,00 da reserva 12B foi confirmado.', time: 'há 2 horas', read: false },
        { id: 3, type: 'cancellation', title: 'Reserva cancelada', message: 'Maria Souza cancelou a reserva de hoje às 20h.', time: 'há 5 horas', read: true }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <Bell className="w-6 h-6" />
                        </div>
                        {t('gestor.notifications.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.notifications.subtitle')}</p>
                </div>
                <Button 
                    className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white px-6 py-6 rounded-2xl font-black shadow-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                    <Check className="w-5 h-5 mr-2" />
                    {t('gestor.notifications.markAllRead')}
                </Button>
            </div>

            <div className="space-y-4">
                {notifications.map((n, i) => {
                    const Icon = n.type === 'reservation' ? CalendarDays : n.type === 'payment' ? CreditCard : XCircle;
                    const color = n.type === 'reservation' ? 'text-blue-500 bg-blue-500/10' : n.type === 'payment' ? 'text-[#8CE600] bg-[#8CE600]/10' : 'text-red-500 bg-red-500/10';

                    return (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={n.id}
                            className={`p-6 rounded-[2.5rem] border transition-all flex items-start gap-4 ${
                                n.read 
                                    ? 'bg-white dark:bg-card border-gray-100 dark:border-white/5 opacity-70' 
                                    : 'bg-white dark:bg-card border-[#8CE600]/20 shadow-xl shadow-black/5'
                            } hover:-translate-y-1 transition-transform`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1 gap-4">
                                    <h3 className="text-base font-black text-gray-900 dark:text-white truncate">{n.title}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">{n.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{n.message}</p>
                            </div>
                            {!n.read && (
                                <div className="w-3 h-3 rounded-full bg-[#8CE600] mt-2 shadow-[0_0_15px_rgba(140,230,0,0.5)] flex-shrink-0" />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
