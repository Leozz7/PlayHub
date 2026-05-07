import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, Building2, CalendarDays, CreditCard,
  MoreHorizontal, ArrowUpRight, CheckCircle2,
  XCircle, Clock, AlertTriangle, Activity, Star,
  CalendarCheck
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRService } from '@/lib/signalr';


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
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t(`admin.dashboard.kpi.${stat.id}`)}</p>
    </div>
  );
}

function ReservationRow({ r, t }: { r: any, t: any }) {
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
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.userName || 'Usuário Excluído'}</span>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{r.courtName || 'Quadra Excluída'}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(r.startTime).toLocaleDateString()} • {new Date(r.startTime).getHours()}h–{new Date(r.endTime).getHours()}h
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

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
  const [activeTab, setActiveTab] = useState<'reservations' | 'users'>('reservations');

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [locale]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const connection = signalRService.connection;
    if (!connection) return;

    const handleUpdate = () => {
      // Invalida todas as queries do admin para atualizar o dashboard
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    connection.on("ReservationCreated", handleUpdate);
    return () => {
      connection.off("ReservationCreated", handleUpdate);
    };
  }, [queryClient]);

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
 
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: async () => {
      const res = await api.get('/users?pageSize=100');
      return res.data;
    }
  });
 
  const { data: courtsData } = useQuery({
    queryKey: ['admin', 'stats', 'courts'],
    queryFn: async () => {
      const res = await api.get('/courts?pageSize=100');
      return res.data;
    }
  });

  const { data: reservationsData } = useQuery({
    queryKey: ['admin', 'stats', 'reservations'],
    queryFn: async () => {
      const res = await api.get('/Reservations?pageSize=100');
      return res.data;
    }
  });

  const { data: paymentsData = [] } = useQuery({
    queryKey: ['admin', 'stats', 'payments'],
    queryFn: async () => {
      const res = await api.get('/Payments');
      return res.data;
    }
  });
 
  const usersCount = usersData?.totalCount || 0;
  const courtsCount = courtsData?.totalCount || 0;
  const reservationsCount = reservationsData?.totalCount || 0;
  const revenue = paymentsData.filter((p: any) => p.status === 2).reduce((sum: number, p: any) => sum + p.amount, 0);

  const functionalStats = [
    { id: 'users', value: usersCount, icon: Users, color: 'blue', isCurrency: false },
    { id: 'courts', value: courtsCount, icon: Building2, color: 'green', isCurrency: false },
    { id: 'reservations', value: reservationsCount, icon: CalendarDays, color: 'violet', isCurrency: false },
    { id: 'revenue', value: revenue, icon: CreditCard, color: 'amber', isCurrency: true },
  ];

  const recentReservations = (reservationsData?.items || []).slice(0, 6);

  const topCourts = useMemo(() => {
    if (!courtsData?.items || !reservationsData?.items) return [];
    
    const courtStats: Record<string, { revenue: number, reservations: number }> = {};
    reservationsData.items.forEach((r: any) => {
      if (!courtStats[r.courtId]) courtStats[r.courtId] = { revenue: 0, reservations: 0 };
      courtStats[r.courtId].reservations += 1;
      if (r.status === 2) {
        courtStats[r.courtId].revenue += r.totalPrice;
      }
    });

    return courtsData.items.map((c: any) => ({
      name: c.name,
      city: c.city,
      sport: c.sport,
      rating: c.rating || 5.0,
      revenue: courtStats[c.id]?.revenue || 0,
      reservations: courtStats[c.id]?.reservations || 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [courtsData, reservationsData]);

  const recentUsers = (usersData?.items || []).slice(0, 4).map((u: any) => {
    const userRes = (reservationsData?.items || []).filter((r: any) => r.userId === u.id).length;
    return {
      name: u.name,
      email: u.email,
      role: u.role,
      joinedAt: new Date(u.created).toLocaleDateString(locale),
      reservations: userRes
    };
  });

  const dynamicAlerts = useMemo(() => {
    const alerts = [];
    const pendingPayments = paymentsData.filter((p: any) => p.status === 1).length;
    if (pendingPayments > 0) {
      alerts.push({ type: 'info', message: t('admin.dashboard.alerts.pendingPayments', { count: pendingPayments }) });
    }
    const pendingRes = (reservationsData?.items || []).filter((r: any) => r.status === 1).length;
    if (pendingRes > 0) {
      alerts.push({ type: 'warning', message: t('admin.dashboard.alerts.pendingReservations', { count: pendingRes }) });
    }
    return alerts;
  }, [paymentsData, reservationsData, t]);

  return (
    <>
        <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-background/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.05] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.dashboard.greeting', { name: firstName })}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{now}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{t('admin.dashboard.adminBadge')}</span>
            </div>
            <Link
              to="/"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {t('admin.dashboard.viewSite')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        <div className="px-6 py-8 space-y-8 max-w-[1400px] mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {functionalStats.map(s => <StatCard key={s.id} stat={s} t={t} locale={locale} />)}
          </div>

          {dynamicAlerts.length > 0 && (
            <div className="space-y-2">
              {dynamicAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                    alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400' :
                    alert.type === 'error'   ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400' :
                                              'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-medium flex-1">{alert.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <div className="xl:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1 p-4 border-b border-gray-100 dark:border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'reservations' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  {t('admin.dashboard.recentReservations')}
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  {t('admin.dashboard.recentUsers')}
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
                        {['id', 'user', 'court', 'schedule', 'value', 'status'].map(h => (
                          <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                            {t(`admin.dashboard.${h}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      {recentReservations.length > 0 ? recentReservations.map((r: any) => <ReservationRow key={r.id} r={r} t={t} />) : (
                        <tr><td colSpan={6} className="text-center py-4 text-xs text-gray-500">{t('admin.dashboard.noReservations')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {recentUsers.length > 0 ? recentUsers.map((u: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        u.role === 'Manager' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600]'
                      }`}>
                        {(u.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.name || 'Sem nome'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        u.role === 'Manager' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                      }`}>
                        {u.role === 'Manager' ? t('admin.dashboard.manager') : t('admin.dashboard.athlete')}
                      </span>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-gray-400">{u.joinedAt}</p>
                        {u.reservations > 0 && <p className="text-[10px] text-[#8CE600] font-bold">{u.reservations} {t('admin.dashboard.reservations')}</p>}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-xs text-gray-500">{t('admin.dashboard.noUsers')}</div>
                  )}
                </div>
              )}

              <div className="p-4 border-t border-gray-100 dark:border-white/[0.06]">
                <Link to={activeTab === 'reservations' ? '/lz_admin/reservations' : '/lz_admin/users'}
                  className="text-xs font-bold text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 transition-opacity flex items-center gap-1">
                  {t('admin.dashboard.viewAll')} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">

              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#8CE600]" strokeWidth={2} />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('admin.dashboard.recentActivity')}</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: t('admin.dashboard.resConfirmed'), value: reservationsData?.items?.filter((r:any) => r.status === 2).length || 0, total: reservationsData?.items?.length || 1, color: '#8CE600' },
                    { label: t('admin.dashboard.paymentApproved'), value: paymentsData.filter((p:any) => p.status === 2).length || 0, total: paymentsData.length || 1, color: '#60a5fa' },
                    { label: t('admin.dashboard.kpi.users'), value: usersCount, total: usersCount || 1, color: '#a78bfa' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(item.value / item.total) * 100}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('admin.dashboard.topCourts')}</h3>
                  <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                </div>
                <div className="space-y-3">
                  {topCourts.slice(0, 4).map((court: any, i: number) => (
                    <div key={court.name} className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-300 dark:text-gray-700 w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{court.name}</p>
                        <p className="text-[10px] text-gray-400">{court.city} • {court.sport}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-gray-900 dark:text-white">
                          {formatValue(court.revenue, true, locale)}
                        </p>
                        <p className="text-[10px] text-gray-400">{court.reservations} {t('admin.dashboard.reservations')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#8CE600] to-[#6aad00] rounded-2xl p-5">
                <h3 className="text-sm font-black text-gray-950 mb-3">{t('admin.dashboard.quickActions')}</h3>
                <div className="space-y-2">
                  {[
                    { label: t('admin.dashboard.addCourt'), href: '/lz_admin/courts/new' },
                    { label: t('admin.dashboard.createManager'), href: '/lz_admin/users/new' },
                    { label: t('admin.dashboard.generateReport'), href: '/lz_admin/reports' },
                  ].map(a => (
                    <Link
                      key={a.label}
                      to={a.href}
                      className="flex items-center justify-between w-full px-3 py-2.5 bg-black/10 hover:bg-black/20 rounded-xl transition-all group"
                    >
                      <span className="text-xs font-bold text-gray-950">{a.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-950/60 group-hover:text-gray-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {topCourts.length > 0 && (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">{t('admin.dashboard.revenueChart')}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{t('admin.dashboard.revenueDesc')}</p>
                </div>
                <Link to="/lz_admin/courts" className="text-xs font-bold text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 flex items-center gap-1 transition-opacity">
                  {t('admin.dashboard.viewAllCourts')} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {topCourts.slice(0, 10).map((court: any) => {
                  const maxRev = topCourts[0]?.revenue || 1;
                  const pct = Math.round((court.revenue / maxRev) * 100);
                  return (
                    <div key={court.name} className="flex items-center gap-4">
                      <div className="w-36 shrink-0">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{court.name}</p>
                        <p className="text-[10px] text-gray-400">{court.city}</p>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8CE600] rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-24 text-right shrink-0">
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                          {formatValue(court.revenue, true, locale)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{court.rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
    </>
  );
}
