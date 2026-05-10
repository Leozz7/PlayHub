import { useTranslation } from 'react-i18next';
import { Bell, Check, CalendarDays, CreditCard, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GestorNotifications() {
  const { t } = useTranslation();

  const notifications = [
    { id: 1, type: 'reservation', title: 'Nova reserva confirmada', message: 'João Silva agendou a Quadra 1 para amanhã às 18h.', time: t('gestor.notifications.timeAgo'), read: false },
    { id: 2, type: 'payment', title: 'Pagamento recebido', message: 'O pagamento de R$ 150,00 da reserva 12B foi confirmado.', time: 'há 2 horas', read: false },
    { id: 3, type: 'cancellation', title: 'Reserva cancelada', message: 'Maria Souza cancelou a reserva de hoje às 20h.', time: 'há 5 horas', read: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header Section */}
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-pink-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('gestor.sidebar.notifications')}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('gestor.notifications.title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                {t('gestor.notifications.subtitle')}
              </p>
            </div>

            <Button className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-6 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hover:scale-105">
              <Check className="w-4 h-4" />
              {t('gestor.notifications.markAllRead')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="space-y-4">
          {notifications.map(n => {
            const Icon = n.type === 'reservation' ? CalendarDays : n.type === 'payment' ? CreditCard : XCircle;
            const color = n.type === 'reservation' ? 'text-blue-500 bg-blue-500/10' : n.type === 'payment' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10';

            return (
              <div key={n.id} className={`p-6 rounded-[2rem] border transition-all flex items-start gap-4 ${n.read ? 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-70' : 'bg-white dark:bg-white/[0.04] border-pink-100 dark:border-pink-500/20 shadow-lg shadow-pink-500/5 hover:-translate-y-1'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">{n.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{n.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                </div>
                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-pink-500 mt-2 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
