import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2, CalendarDays, CreditCard, CheckCircle2,
  XCircle, Clock, ArrowUpRight, MoreHorizontal,
  Activity, Users, Plus, CalendarCheck
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { useManagementCourts } from '@/features/courts/hooks/useCourts';
import { useReservations } from '@/features/reservations/hooks/useReservations';

const STATUS_CONFIG = {
  2: { key: 'confirmed', icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  1: { key: 'pending',   icon: Clock,         className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  3: { key: 'cancelled', icon: XCircle,       className: 'text-red-500 bg-red-50 dark:bg-red-950/40 dark:text-red-400' },
  4: { key: 'completed', icon: CalendarCheck, className: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' }
} as const;

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-500',   glow: 'shadow-blue-500/20' },
  green:  { bg: 'bg-[#8CE600]/10',  border: 'border-[#8CE600]/20',  text: 'text-[#6aad00] dark:text-[#8CE600]', glow: 'shadow-[#8CE600]/20' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-500', glow: 'shadow-violet-500/20' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-500',  glow: 'shadow-amber-500/20' },
};

function formatValue(value: number, isCurrency: boolean, locale: string) {
  if (isCurrency) {
    return value.toLocaleString(locale, { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }
  return value.toLocaleString(locale);
}

function StatCard({ stat, t, locale }: { stat: any, t: any, locale: string }) {
  const col = COLOR_MAP[stat.color as keyof typeof COLOR_MAP];

  return (
    <div className="group relative bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-${stat.color}-50/20 dark:group-hover:from-${stat.color}-950/10 transition-all duration-500 pointer-events-none`} />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${col.bg} border ${col.border} flex items-center justify-center shadow-lg ${col.glow}`}>
          <stat.icon className={`w-5 h-5 ${col.text}`} strokeWidth={1.75} />
        </div>
      </div>

      <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-1">
        {formatValue(stat.value, stat.isCurrency, locale)}
      </p>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t(`gestor.dashboard.stats.${stat.id}`)}</p>
    </div>
  );
}

function ReservationRow({ r, t, locale }: { r: any, t: any, locale: string }) {
  const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
  
  let statusLabel = t('admin.dashboard.resPending');
  if (r.status === 2) statusLabel = t('admin.dashboard.resConfirmed');
  if (r.status === 3) statusLabel = t('admin.dashboard.resCancelled');
  if (r.status === 4) statusLabel = t('admin.dashboard.resCompleted');

  return (
    <tr className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-bold text-gray-400">{r.id.split('-')[0].toUpperCase()}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.userName || t('gestor.clients.deletedUser')}</span>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{r.courtName || t('gestor.dashboard.deletedCourt', 'Quadra Excluída')}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(r.startTime).toLocaleDateString(locale)} • {new Date(r.startTime).getHours()}h–{new Date(r.endTime).getHours()}h
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-bold text-gray-900 dark:text-white">R$ {r.totalPrice.toFixed(2)}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.className}`}>
          <cfg.icon className="w-3 h-3" />
          {statusLabel}
        </span>
      </td>
    </tr>
  );
}

export default function GestorDashboard() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
  const [activeTab, setActiveTab] = useState<'reservations' | 'schedule'>('reservations');

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [locale]);

  const firstName = user?.name?.split(' ')[0] ?? 'Gestor';

  const { data: courtsData } = useManagementCourts({ pageSize: 100 });
  const courts = courtsData?.items || [];
  
  const { data: reservationsData } = useReservations({ pageSize: 100 });
  const reservations = reservationsData?.items || [];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthReservations = reservations.filter((r: any) => {
      const d = new Date(r.startTime);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const uniqueClients = new Set(reservations.map((r: any) => r.userId)).size;
  const revenue = reservations.filter((r: any) => r.status === 2).reduce((sum: number, r: any) => sum + r.totalPrice, 0);

  const stats = [
    { id: 'managedCourts', value: courts.length, icon: Building2, color: 'green', isCurrency: false },
    { id: 'reservationsMonth', value: currentMonthReservations.length, icon: CalendarDays, color: 'violet', isCurrency: false },
    { id: 'uniqueClients', value: uniqueClients, icon: Users, color: 'blue', isCurrency: false },
    { id: 'monthlyRevenue', value: revenue, icon: CreditCard, color: 'amber', isCurrency: true },
  ];

  const recentReservations = reservations.slice(0, 6);

  const topCourts = useMemo(() => {
    const courtStats: Record<string, { revenue: number, reservations: number }> = {};
    reservations.forEach((r: any) => {
      if (!courtStats[r.courtId]) courtStats[r.courtId] = { revenue: 0, reservations: 0 };
      courtStats[r.courtId].reservations += 1;
      if (r.status === 2) {
        courtStats[r.courtId].revenue += r.totalPrice;
      }
    });

    return courts.map((c: any) => ({
      ...c,
      revenue: courtStats[c.id]?.revenue || 0,
      reservations: courtStats[c.id]?.reservations || 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [courts, reservations]);

  const scheduleToday = useMemo(() => {
      const today = new Date().toDateString();
      return reservations.filter((r: any) => new Date(r.startTime).toDateString() === today);
  }, [reservations]);


  return (
    <>
        <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-background/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.05] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              {t('gestor.dashboard.greeting', { name: firstName })}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{now}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{t('gestor.dashboard.managerBadge')}</span>
            </div>
            <Link to="/lz_gestor/courts/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8CE600] text-gray-950 rounded-full text-xs font-black hover:bg-[#7bc400] transition-all shadow-md shadow-[#8CE600]/20">
              <Plus className="w-3.5 h-3.5" /> {t('gestor.dashboard.newCourt')}
            </Link>
          </div>
        </header>

        <div className="px-6 py-8 space-y-8 max-w-[1400px] mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(s => <StatCard key={s.id} stat={s} t={t} locale={locale} />)}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <div className="xl:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1 p-4 border-b border-gray-100 dark:border-white/[0.06]">
                <button onClick={() => setActiveTab('reservations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'reservations' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                  {t('gestor.dashboard.tabs.recentReservations')}
                </button>
                <button onClick={() => setActiveTab('schedule')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedule' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                  {t('gestor.dashboard.tabs.todaysSchedule')}
                </button>
                <div className="ml-auto">
                  <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {activeTab === 'reservations' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                        {['id', 'client', 'court', 'time', 'value', 'status'].map(h => (
                          <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">{t(`gestor.dashboard.table.${h}`)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      {recentReservations.length > 0 ? recentReservations.map((r: any) => (
                        <ReservationRow key={r.id} r={r} t={t} locale={locale} />
                      )) : (
                        <tr><td colSpan={6} className="text-center py-4 text-xs text-gray-500">{t('gestor.dashboard.table.noResults')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {scheduleToday.length > 0 ? scheduleToday.map((item: any, i: number) => {
                    const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
                    let statusLabel = t('admin.dashboard.resPending');
                    if (item.status === 2) statusLabel = t('admin.dashboard.resConfirmed');
                    if (item.status === 3) statusLabel = t('admin.dashboard.resCancelled');
                    if (item.status === 4) statusLabel = t('admin.dashboard.resCompleted');

                    return (
                      <div key={i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="w-20 shrink-0">
                          <span className="text-xs font-black text-[#6aad00] dark:text-[#8CE600]">{new Date(item.startTime).getHours()}h–{new Date(item.endTime).getHours()}h</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{item.courtName}</p>
                          <p className="text-xs text-gray-400">{item.userName}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.className} shrink-0`}>
                          <cfg.icon className="w-3 h-3" />{statusLabel}
                        </span>
                      </div>
                    );
                  }) : (
                     <div className="text-center py-4 text-xs text-gray-500">{t('gestor.dashboard.table.noResults')}</div>
                  )}
                </div>
              )}

              <div className="p-4 border-t border-gray-100 dark:border-white/[0.06]">
                <Link to="/lz_gestor/reservations" className="text-xs font-bold text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 flex items-center gap-1 transition-opacity">
                  {t('gestor.dashboard.viewAll')} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">

              {topCourts.length > 0 && (
                  <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-[#8CE600]" strokeWidth={2} />
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('gestor.dashboard.revenueByCourt')}</h3>
                    </div>
                    <div className="space-y-3">
                      {topCourts.slice(0, 5).map((court: any) => {
                        const maxRev = topCourts[0]?.revenue || 1;
                        const pct = Math.round((court.revenue / maxRev) * 100);
                        return (
                          <div key={court.id}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{court.name.split(' ').slice(0, 2).join(' ')}</span>
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{formatValue(court.revenue, true, locale)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-[#8CE600] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              )}

              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">{t('gestor.dashboard.todaySummary')}</h3>
                <div className="space-y-3">
                  {[
                    { label: t('gestor.dashboard.todayStats.reservations'), value: scheduleToday.length, icon: CalendarDays },
                    { label: t('gestor.dashboard.todayStats.revenue'), value: formatValue(scheduleToday.reduce((s: number, r: any) => s + r.totalPrice, 0), true, locale), icon: CreditCard },
                    { label: t('gestor.dashboard.todayStats.clients'), value: new Set(scheduleToday.map((r: any) => r.userId)).size, icon: Users },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-[#8CE600]" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                      </div>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#8CE600] to-[#6aad00] rounded-2xl p-5">
                <h3 className="text-sm font-black text-gray-950 mb-1">{t('gestor.dashboard.quickActions')}</h3>
                <p className="text-[11px] text-gray-950/60 mb-3">{t('gestor.dashboard.quickActionsDesc')}</p>
                <div className="space-y-2">
                  {[
                    { label: t('gestor.dashboard.actions.blockTime'), href: '/lz_gestor/schedule' },
                    { label: t('gestor.dashboard.actions.viewRequests'), href: '/lz_gestor/reservations' },
                    { label: t('gestor.dashboard.actions.editCourt'), href: '/lz_gestor/courts' },
                  ].map(a => (
                    <Link key={a.label} to={a.href}
                      className="flex items-center justify-between w-full px-3 py-2.5 bg-black/10 hover:bg-black/20 rounded-xl transition-all group">
                      <span className="text-xs font-bold text-gray-950">{a.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-950/60 group-hover:text-gray-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
    </>
  );
}
