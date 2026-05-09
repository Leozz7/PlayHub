import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import {
  Activity,
  UserPlus,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'new_user' | 'new_booking' | 'booking_confirmed' | 'booking_cancelled' | 'review_added';
  title: string;
  user: string;
  date: string;
  details: string;
  link?: string;
}

export default function AdminActivities() {
  const { t } = useTranslation();

  const [filterType, setFilterType] = useState('all');

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin', 'activities', 'users'],
    queryFn: async () => {
      const res = await api.get('/users?pageSize=50');
      return res.data.items || [];
    }
  });

  const { data: reservationsData, isLoading: isLoadingReservations } = useQuery({
    queryKey: ['admin', 'activities', 'reservations'],
    queryFn: async () => {
      const res = await api.get('/Reservations?pageSize=100');
      return res.data.items || [];
    }
  });

  const activities = useMemo(() => {
    let list: ActivityItem[] = [];

    (usersData || []).forEach((u: any) => {
      list.push({
        id: `user-${u.id}`,
        type: 'new_user',
        title: t('admin.activities.types.new_user'),
        user: u.name,
        date: u.created,
        details: u.email,
        link: `/lz_admin/users`
      });
    });

    (reservationsData || []).forEach((r: any) => {
      list.push({
        id: `res-new-${r.id}`,
        type: 'new_booking',
        title: t('admin.activities.types.new_booking'),
        user: r.userName || 'User',
        date: r.created,
        details: `${r.courtName} • R$ ${r.totalPrice}`,
        link: `/lz_admin/bookings`
      });

      if (r.status === 2) {
        list.push({
          id: `res-conf-${r.id}`,
          type: 'booking_confirmed',
          title: t('admin.activities.types.booking_confirmed'),
          user: r.userName || 'User',
          date: r.created,
          details: `${r.courtName}`,
          link: `/lz_admin/bookings`
        });
      } else if (r.status === 3) {
        list.push({
          id: `res-canc-${r.id}`,
          type: 'booking_cancelled',
          title: t('admin.activities.types.booking_cancelled'),
          user: r.userName || 'User',
          date: r.created,
          details: `${r.courtName}`,
          link: `/lz_admin/bookings`
        });
      }
    });

    const sorted = list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filterType !== 'all') {
      return sorted.filter(a => a.type === filterType);
    }

    return sorted;
  }, [usersData, reservationsData, t, filterType]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_user': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'new_booking': return <CalendarCheck className="w-5 h-5 text-[#8CE600]" />;
      case 'booking_confirmed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'booking_cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const isLoading = isLoadingUsers || isLoadingReservations;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <Activity className="w-6 h-6" />
            </div>
            {t('admin.activities.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('admin.activities.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('admin.activities.searchPlaceholder')}
              className="pl-11 h-12 bg-white dark:bg-card border-none shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-12 bg-white dark:bg-card shadow-sm border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder={t('admin.activities.type')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                <SelectItem value="all">{t('admin.activities.allTypes')}</SelectItem>
                <SelectItem value="new_user">{t('admin.activities.types.new_user')}</SelectItem>
                <SelectItem value="new_booking">{t('admin.activities.types.new_booking')}</SelectItem>
                <SelectItem value="booking_confirmed">{t('admin.activities.types.booking_confirmed')}</SelectItem>
                <SelectItem value="booking_cancelled">{t('admin.activities.types.booking_cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-6">
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 dark:before:via-white/10 before:to-transparent">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative flex items-center justify-between gap-6 pl-12">
                  <Skeleton className="absolute left-0 w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <p>{t('admin.activities.noActivities') || 'Nenhuma atividade encontrada.'}</p>
              </div>
            ) : (
              activities.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-center justify-between gap-6 pl-12 group"
                >
                  <div className="absolute left-0 w-10 h-10 rounded-xl bg-white dark:bg-background border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:border-[#8CE600]/50 transition-colors z-10">
                    {getActivityIcon(item.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-black text-gray-900 dark:text-white">{item.title}</span>
                      <span className="text-[10px] text-gray-400 font-bold">•</span>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(item.date).toLocaleDateString('pt-BR')} {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="font-bold text-gray-700 dark:text-gray-300">{item.user}</span> — {item.details}
                    </p>
                  </div>

                  {item.link && (
                    <Link
                      to={item.link}
                      className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-[#8CE600]/10 hover:text-[#8CE600] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                    >
                      {t('admin.activities.viewDetails')} <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
