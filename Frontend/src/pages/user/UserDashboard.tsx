import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
  CalendarDays,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Search,
  Trophy,
  Zap,
  Filter,
  CalendarCheck,
  CreditCard,
} from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';


const STATUS_CONFIG = {
  confirmed: {
    label: 'user.dashboard.status.confirmed',
    icon: CheckCircle2,
    badge: 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/30',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'user.dashboard.status.completed',
    icon: CheckCircle2,
    badge: 'text-gray-500 bg-gray-100 border border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10',
    dot: 'bg-gray-400',
  },
  cancelled: {
    label: 'user.dashboard.status.cancelled',
    icon: XCircle,
    badge: 'text-red-600 bg-red-50 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/30',
    dot: 'bg-red-500',
  },
  pending: {
    label: 'user.dashboard.status.pending',
    icon: Clock,
    badge: 'text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/30',
    dot: 'bg-amber-500',
  },
} as const;

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

const TABS: { key: TabType; label: string }[] = [
  { key: 'all', label: 'user.dashboard.tabs.all' },
  { key: 'upcoming', label: 'user.dashboard.tabs.upcoming' },
  { key: 'completed', label: 'user.dashboard.tabs.completed' },
  { key: 'cancelled', label: 'user.dashboard.tabs.cancelled' },
];

function StarRating({ value, onChange }: { value: number | null; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const stars = value ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              i <= (hovered || stars) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'
            }`}
            fill={i <= (hovered || stars) ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}


export default function UserDashboard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const firstName = user?.name?.split(' ')[0] ?? t('header.userMenu.roles.athlete');
  
  const { data: courtsData } = useQuery({
    queryKey: ['courts', 'all'],
    queryFn: async () => {
      const res = await api.get('/courts?pageSize=100');
      return res.data;
    }
  });

  const { data: reservationsData } = useQuery({
    queryKey: ['reservations', 'user', user?.id],
    queryFn: async () => {
      const res = await api.get('/Reservations', { params: { userId: user?.id, pageSize: 100 } });
      return res.data;
    },
    enabled: !!user?.id
  });

  const myReservations = useMemo(() => {
    if (!reservationsData?.items) return [];
    
    return reservationsData.items.map((r: any) => {
      const courtId = String(r.courtId).toLowerCase();
      const court = courtsData?.items?.find((c: any) => String(c.id).toLowerCase() === courtId);
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      const durHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      const statusMap: Record<number, string> = {
        1: 'pending',
        2: 'confirmed',
        3: 'cancelled',
        4: 'completed',
      };
      
      let statusStr = statusMap[r.status] || 'pending';
      if (statusStr === 'confirmed' && end < new Date()) {
        statusStr = 'completed';
      }

      return {
        id: r.id.split('-')[0].toUpperCase(),
        court: r.courtName || t('user.dashboard.table.deletedCourt'),
        sport: court?.sport || t('user.dashboard.table.sport'),
        location: court ? `${court.city} • ${court.neighborhood}` : t('user.dashboard.table.locationNotAvailable'),
        date: start.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }),
        time: `${start.getUTCHours()}h–${end.getUTCHours()}h`,
        duration: `${durHours}h`,
        value: r.totalPrice,
        status: statusStr,
        img: court?.mainImageBase64 ? court.mainImageBase64 : (court?.img || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80'),
        rating: null,
        courtId: r.courtId,
      };
    });
  }, [reservationsData, courtsData, locale, t]);

  const nextReservation = useMemo(
    () => myReservations.find((r: any) => r.status === 'confirmed' || r.status === 'pending'),
    [myReservations]
  );

  const filteredReservations = useMemo(() => {
    let list = myReservations;
    if (activeTab === 'upcoming') list = list.filter((r: any) => r.status === 'confirmed' || r.status === 'pending');
    else if (activeTab === 'completed') list = list.filter((r: any) => r.status === 'completed');
    else if (activeTab === 'cancelled') list = list.filter((r: any) => r.status === 'cancelled');
    if (search) list = list.filter((r: any) =>
      r.court.toLowerCase().includes(search.toLowerCase()) ||
      r.sport.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [myReservations, activeTab, search]);

  const totalSpent = useMemo(
    () => myReservations.filter((r: any) => r.status === 'completed').reduce((acc: number, r: any) => acc + r.value, 0),
    [myReservations]
  );

  const dynamicAchievements = useMemo(() => {
    const completedOrConfirmed = myReservations.filter((r: any) => r.status === 'completed' || r.status === 'confirmed').length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthRes = reservationsData?.items?.filter((r: any) => {
      const d = new Date(r.startTime);
      return d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
    }).length || 0;

    return [
      { icon: Trophy,       label: t('user.dashboard.achievements.firstGame.label'),    desc: t('user.dashboard.achievements.firstGame.desc'),      earned: myReservations.length > 0 },
      { icon: Zap,          label: t('user.dashboard.achievements.regular.label'),     desc: t('user.dashboard.achievements.regular.desc'),     earned: completedOrConfirmed >= 5 },
      { icon: Star,         label: t('user.dashboard.achievements.reviewer.label'),         desc: t('user.dashboard.achievements.reviewer.desc'),      earned: Object.keys(ratings).length >= 3 },
      { icon: CalendarCheck, label: t('user.dashboard.achievements.dedicated.label'),         desc: t('user.dashboard.achievements.dedicated.desc'),         earned: thisMonthRes >= 10 },
    ];
  }, [myReservations, reservationsData, ratings, t]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">

      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          {t('user.dashboard.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          <Trans 
            i18nKey="user.dashboard.welcome" 
            values={{ name: firstName }}
            components={[<span className="font-bold text-gray-700 dark:text-gray-300" />]}
          >
            Olá, <span className="font-bold text-gray-700 dark:text-gray-300">Atleta</span> — acompanhe e gerencie suas reservas de quadras.
          </Trans>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t('user.dashboard.stats.totalReservations'), value: myReservations.length,
            icon: CalendarDays, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20',
          },
          {
            label: t('user.dashboard.stats.confirmed'), value: myReservations.filter((r: any) => r.status === 'confirmed').length,
            icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
          },
          {
            label: t('user.dashboard.stats.sports'), value: new Set(myReservations.map((r: any) => r.sport)).size,
            icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
          },
          {
            label: t('user.dashboard.stats.totalSpent'), value: `R$ ${(totalSpent / 1000).toFixed(1)}k`,
            icon: CreditCard, color: 'text-[#6aad00] dark:text-[#8CE600]', bg: 'bg-[#8CE600]/10', border: 'border-[#8CE600]/20',
          },
        ].map(stat => (
          <div key={stat.label}
            className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {nextReservation && (
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-background border border-white/10 shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 hover:scale-105"
            style={{ backgroundImage: `url("${nextReservation.img}")`, transition: 'transform 10000ms ease' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/60 to-transparent" />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#8CE600]/20 border border-[#8CE600]/30 rounded-full text-[10px] font-black text-[#8CE600] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-[#8CE600] rounded-full animate-pulse" />
                  {t('user.dashboard.nextReservation.badge')}
                </span>
                <span className="text-[10px] font-mono text-gray-500">{nextReservation.id}</span>
              </div>

              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{nextReservation.court}</h2>
              <p className="text-gray-400 text-sm mb-5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {nextReservation.sport} · {nextReservation.location}
              </p>

              <div className="flex flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#8CE600]" />
                  <span className="text-sm text-gray-200 font-semibold">{nextReservation.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8CE600]" />
                  <span className="text-sm text-gray-200 font-semibold">{nextReservation.time} ({nextReservation.duration})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8CE600]" />
                  <span className="text-sm font-black text-white">R$ {nextReservation.value}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <Link
                to={`/courts/${nextReservation.courtId}`}
                className="flex items-center gap-2 px-5 py-3 bg-[#8CE600] text-gray-950 rounded-xl text-sm font-black hover:bg-[#7bc400] transition-all shadow-lg shadow-[#8CE600]/30 whitespace-nowrap"
              >
                {t('user.dashboard.nextReservation.viewCourt')} <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button className="px-5 py-3 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-all whitespace-nowrap">
                {t('user.dashboard.nextReservation.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-gray-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#8CE600] text-gray-950 shadow-md shadow-[#8CE600]/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {t(tab.label)}
                {tab.key !== 'all' && (
                  <span className={`ml-1.5 text-[10px] ${activeTab === tab.key ? 'text-gray-950/60' : 'text-gray-400'}`}>
                    {tab.key === 'upcoming'
                      ? myReservations.filter((r: any) => r.status === 'confirmed' || r.status === 'pending').length
                      : myReservations.filter((r: any) => r.status === tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder={t('user.dashboard.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-52 pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl focus:outline-none focus:border-[#8CE600]/50 focus:ring-2 focus:ring-[#8CE600]/10 text-gray-700 dark:text-gray-300 placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>

        {filteredReservations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Filter className="w-7 h-7 text-gray-300 dark:text-gray-700" />
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('user.dashboard.noResults')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('user.dashboard.noResultsDesc')}</p>
            <Link to="/catalog" className="mt-5 text-xs font-black text-[#6aad00] dark:text-[#8CE600] flex items-center gap-1 hover:opacity-70 transition-opacity">
              {t('user.dashboard.findCourt')} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {filteredReservations.map((r: any) => {
            const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
            const currentRating = ratings[r.id] ?? r.rating;

            return (
              <div key={r.id} className="group flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50/70 dark:hover:bg-white/[0.015] transition-colors">
                <div className="relative w-full sm:w-28 h-28 sm:h-20 rounded-xl overflow-hidden shrink-0 self-start">
                  <img
                    src={r.img}
                    alt={r.court}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">{r.court}</h3>
                        <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {r.sport} · {r.location}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${cfg.badge}`}>
                      <cfg.icon className="w-3 h-3" />
                      {t(cfg.label)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span className="text-xs">{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{r.time} · {r.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-black text-gray-900 dark:text-white">R$ {r.value}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {r.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <StarRating value={currentRating} onChange={currentRating ? undefined : (v) => setRatings(prev => ({ ...prev, [r.id]: v }))} />
                        {!currentRating && (
                          <span className="text-[11px] text-gray-400">{t('user.dashboard.table.evaluate')}</span>
                        )}
                      </div>
                    ) : r.status === 'confirmed' ? (
                      <button className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                        {t('user.dashboard.table.cancel')}
                      </button>
                    ) : (
                      <span />
                    )}

                    <Link
                      to={`/courts/${r.courtId}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 transition-opacity"
                    >
                      {t('user.dashboard.table.viewCourt')} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReservations.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('user.dashboard.table.reservationsCount', { count: filteredReservations.length })}
            </p>
            <Link to="/catalog"
              className="text-xs font-black text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 flex items-center gap-1 transition-opacity">
              {t('user.dashboard.table.makeNew')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          {t('user.dashboard.achievements.title')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dynamicAchievements.map(a => (
            <div
              key={a.label}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all duration-300 ${
                a.earned
                  ? 'border-[#8CE600]/20 bg-[#8CE600]/5 hover:shadow-lg hover:shadow-[#8CE600]/10 hover:-translate-y-0.5'
                  : 'border-gray-100 dark:border-white/[0.06] opacity-40 grayscale'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.earned ? 'bg-[#8CE600]/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                <a.icon className={`w-6 h-6 ${a.earned ? 'text-[#6aad00] dark:text-[#8CE600]' : 'text-gray-400'}`} strokeWidth={1.75} />
              </div>
              <div>
                <p className={`text-xs font-black ${a.earned ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{a.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8CE600] to-[#5c9200] p-8 text-center shadow-2xl shadow-[#8CE600]/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full pointer-events-none" />
        <div className="relative z-10">
          <MapPin className="w-8 h-8 text-gray-950/40 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-black text-gray-950 mb-2">{t('user.dashboard.cta.title')}</h3>
          <p className="text-sm text-gray-950/60 mb-6 max-w-md mx-auto">
            {t('user.dashboard.cta.desc')}
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-950 text-[#8CE600] rounded-xl text-sm font-black hover:bg-gray-900 transition-all shadow-xl group"
          >
            {t('user.dashboard.cta.button')}
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}


