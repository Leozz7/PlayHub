import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2, CalendarDays, CreditCard, CheckCircle2,
  XCircle, Clock, ArrowUpRight, Activity, Users, Plus, CalendarCheck, TrendingUp, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/data/useAuthStore';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { useDashboardStats, useDashboardTopCourts } from '@/features/dashboard/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG = {
  2: { key: 'confirmed', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  1: { key: 'pending',   icon: Clock,         className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  3: { key: 'cancelled', icon: XCircle,       className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  4: { key: 'completed', icon: CalendarCheck, className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
} as const;

function formatValue(value: number, isCurrency: boolean, locale: string) {
  if (isCurrency) {
    return value.toLocaleString(locale, { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }
  return value.toLocaleString(locale);
}

interface DashboardStat {
  id: string;
  value: number;
  color: string;
  isCurrency: boolean;
  icon: React.ElementType;
}

interface DashboardReservation {
  id: string;
  userName?: string;
  courtName?: string;
  startTime: string;
  totalPrice: number;
  status: number;
}

function StatCard({ stat, t, locale, i }: { stat: DashboardStat, t: (k: string) => string, locale: string, i: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 ${stat.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500">+12%</span>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none mb-2">{t(`gestor.dashboard.stats.${stat.id}`)}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
        {formatValue(stat.value, stat.isCurrency, locale)}
      </p>
    </motion.div>
  );
}

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
  const [activeTab, setActiveTab] = useState<'reservations' | 'schedule'>('reservations');

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [locale]);

  const firstName = user?.name?.split(' ')[0] ?? 'Gestor';

  const { data: statsData,    isLoading: statsLoading    } = useDashboardStats();
  const { data: topCourtsData, isLoading: topCourtsLoading } = useDashboardTopCourts();
  
  const { data: recentResData,  isLoading: recentResLoading  } = useReservations({ pageSize: 6 });
  const recentReservations = recentResData?.items || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const { data: todayResData, isLoading: todayResLoading } = useReservations({ date: todayStr, pageSize: 50 });
  const scheduleToday = todayResData?.items || [];

  const stats = [
    { id: 'managedCourts',     value: statsData?.managedCourts     || 0, icon: Building2,   color: 'text-[#8CE600]', isCurrency: false },
    { id: 'reservationsMonth', value: statsData?.reservationsMonth  || 0, icon: CalendarDays, color: 'text-blue-500', isCurrency: false },
    { id: 'uniqueClients',     value: statsData?.uniqueClients      || 0, icon: Users,        color: 'text-purple-500', isCurrency: false },
    { id: 'monthlyRevenue',    value: statsData?.monthlyRevenue     || 0, icon: CreditCard,   color: 'text-amber-500', isCurrency: true  },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8CE600] bg-[#8CE600]/10 px-3 py-1 rounded-full">{t('gestor.dashboard.managerBadge')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{now}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            {t('gestor.dashboard.greeting', { name: firstName })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('gestor.dashboard.subtitle')}</p>
        </div>
        <Link to="/lz_gestor/courts">
          <Button className="bg-[#8CE600] text-gray-950 hover:opacity-90 font-black px-6 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20">
            <Plus className="w-5 h-5 mr-2" />
            {t('gestor.dashboard.newCourt')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-5 rounded-3xl shadow-sm">
                    <Skeleton className="h-10 w-10 rounded-2xl mb-4" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                </div>
            ))
        ) : (
            stats.map((s, i) => <StatCard key={s.id} stat={s} t={t} locale={locale} i={i} />)
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex gap-2">
                {['reservations', 'schedule'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'reservations' | 'schedule')}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === tab
                        ? 'bg-[#8CE600] text-gray-950'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t(`gestor.dashboard.tabs.${tab === 'reservations' ? 'recentReservations' : 'todaysSchedule'}`)}
                  </button>
                ))}
              </div>
              <Link to="/lz_gestor/reservations" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#8CE600] transition-colors flex items-center gap-1">
                {t('gestor.dashboard.viewAll')} <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'reservations' ? (
                  <motion.table
                    key="res"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full text-left"
                  >
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/10">
                        {['client', 'court', 'time', 'value', 'status'].map(h => (
                          <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t(`gestor.dashboard.table.${h}`)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {recentResLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-10 w-16 rounded-lg" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></td>
                          </tr>
                        ))
                      ) : recentReservations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-gray-400 font-bold">{t('gestor.dashboard.emptyState.title')}</td>
                        </tr>
                      ) : (
                        recentReservations.map((r: DashboardReservation) => {
                          const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
                          return (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                <span className="font-black text-sm text-gray-900 dark:text-white">{r.userName || 'Cliente'}</span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-500">{r.courtName}</td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                {new Date(r.startTime).toLocaleDateString(locale)} • {new Date(r.startTime).getHours()}h
                              </td>
                              <td className="px-6 py-4 text-sm font-black text-[#8CE600]">R$ {r.totalPrice}</td>
                              <td className="px-6 py-4">
                                <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${cfg.className}`}>
                                  <cfg.icon className="w-3 h-3 mr-1.5" />
                                  {t(`admin.dashboard.res${cfg.key.charAt(0).toUpperCase() + cfg.key.slice(1)}`)}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </motion.table>
                ) : (
                  <motion.div
                    key="sch"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="divide-y divide-gray-50 dark:divide-white/5"
                  >
                    {todayResLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="px-6 py-4 flex gap-4">
                                <Skeleton className="h-12 w-20 rounded-xl" />
                                <Skeleton className="h-12 flex-1 rounded-xl" />
                                <Skeleton className="h-12 w-32 rounded-xl" />
                            </div>
                        ))
                    ) : scheduleToday.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-bold">{t('gestor.dashboard.emptyState.scheduleTitle')}</div>
                    ) : (
                      scheduleToday.map((item: DashboardReservation, i: number) => {
                        const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
                        return (
                          <div key={i} className="flex items-center gap-6 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="w-16 shrink-0 font-black text-xs text-[#8CE600] bg-[#8CE600]/10 px-2 py-1 rounded-lg text-center">
                              {new Date(item.startTime).getHours()}h
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.courtName}</p>
                              <p className="text-xs text-gray-400 font-bold">{item.userName}</p>
                            </div>
                            <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${cfg.className}`}>
                                {t(`admin.dashboard.res${cfg.key.charAt(0).toUpperCase() + cfg.key.slice(1)}`)}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-8">
            <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl shadow-black/5 dark:shadow-none">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">{t('gestor.dashboard.revenueByCourt')}</h3>
                    <Activity className="w-4 h-4 text-[#8CE600]" />
                </div>
                <div className="space-y-5">
                    {topCourtsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)
                    ) : (
                        topCourtsData?.slice(0, 5).map((court: { id: string; name: string; revenue: number; }) => {
                            const maxRev = topCourtsData[0]?.revenue || 1;
                            const pct = Math.round((court.revenue / maxRev) * 100);
                            return (
                                <div key={court.id} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-500">{court.name}</span>
                                        <span className="text-gray-900 dark:text-white">R$ {court.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-[#8CE600] rounded-full" 
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-gray-950 dark:bg-[#8CE600] rounded-[2.5rem] p-8 shadow-xl shadow-black/20 text-white dark:text-gray-950">
                <h3 className="text-xl font-black mb-1">{t('gestor.dashboard.quickActions')}</h3>
                <p className="text-xs font-medium opacity-60 mb-6">{t('gestor.dashboard.quickActionsDesc')}</p>
                <div className="space-y-3">
                    {[
                        { label: t('gestor.dashboard.actions.blockTime'),    href: '/lz_gestor/schedule' },
                        { label: t('gestor.dashboard.actions.viewRequests'), href: '/lz_gestor/reservations' },
                        { label: t('gestor.dashboard.actions.editCourt'),    href: '/lz_gestor/courts' },
                    ].map(a => (
                        <Link key={a.label} to={a.href} className="flex items-center justify-between w-full px-5 py-4 bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 rounded-2xl transition-all group">
                            <span className="text-xs font-black uppercase tracking-widest">{a.label}</span>
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
