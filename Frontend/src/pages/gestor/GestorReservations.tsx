import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { useManagementCourts } from '@/features/courts/hooks/useCourts';
import { ActionModal } from '@/components/ui/PremiumModal';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { signalRService } from '@/lib/signalr';


const STATUS_CONFIG = {
  2: { key: 'confirmed', icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  1: { key: 'pending',   icon: Clock,         className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  3: { key: 'cancelled', icon: XCircle,       className: 'text-red-500 bg-red-50 dark:bg-red-950/40 dark:text-red-400' },
  4: { key: 'completed', icon: CheckCircle2, className: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  5: { key: 'blocked', icon: XCircle, className: 'text-gray-500 bg-gray-50 dark:bg-gray-950/40 dark:text-gray-400' }
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
  const { data: reservationsData, refetch } = useReservations({ pageSize: 100 });

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
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header Section */}
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-violet-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('gestor.sidebar.reservations')}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('gestor.reservations.title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                {t('gestor.reservations.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder={t('gestor.reservations.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                />
              </div>

              <select 
                value={selectedCourt} 
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full sm:w-auto px-4 py-3.5 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all outline-none appearance-none"
              >
                <option value="all">{t('gestor.reservations.allCourts')}</option>
                {courts.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-3.5 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition-all outline-none appearance-none"
              >
                <option value="all">{t('gestor.reservations.allStatuses')}</option>
                <option value="1">Pendente</option>
                <option value="2">Confirmado</option>
                <option value="3">Cancelado</option>
                <option value="4">Concluído</option>
                <option value="5">Bloqueado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.id')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.client')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.court')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.date')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.price')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.reservations.table.status')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">{t('gestor.reservations.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="font-bold text-gray-500">{t('gestor.reservations.noResults')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((r: any) => {
                    const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
                    let statusLabel = 'Pendente';
                    if (r.status === 2) statusLabel = 'Confirmado';
                    if (r.status === 3) statusLabel = 'Cancelado';
                    if (r.status === 4) statusLabel = 'Concluído';
                    if (r.status === 5) statusLabel = 'Bloqueado';

                    return (
                      <tr key={r.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-gray-400">{r.id.split('-')[0].toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-gray-900 dark:text-white">{r.userName || 'Usuário'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.courtName || 'Quadra Excluída'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{new Date(r.startTime).toLocaleDateString(locale)}</span>
                            <span className="text-xs text-gray-500">{new Date(r.startTime).getHours()}h - {new Date(r.endTime).getHours()}h</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-violet-600 dark:text-violet-400">R$ {r.totalPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.className}`}>
                            <cfg.icon className="w-3 h-3" />
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.status !== 3 && r.status !== 5 && (
                              <button 
                                onClick={() => { setReservationToCancel(r); setCancelModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                                title={t('gestor.reservations.cancelReservation')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
