import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Building2,
  FileText,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { StatusModal } from '@/components/ui/PremiumModal';
import { exportAdminReportPDF } from '@/pdf/AdminReportGenerator';

export default function AdminReport() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('30');
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, status: 'loading' | 'success' | 'error', title: string, message?: string }>({
    isOpen: false,
    status: 'loading',
    title: '',
  });

  const { data: reservationsData, isLoading: isLoadingRes } = useQuery({
    queryKey: ['admin', 'reports', 'reservations'],
    queryFn: async () => {
      const res = await api.get('/Reservations?pageSize=100');
      return res.data.items || [];
    }
  });

  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['admin', 'reports', 'payments'],
    queryFn: async () => {
      const res = await api.get('/Payments');
      return res.data || [];
    }
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'reports', 'users'],
    queryFn: async () => {
      const res = await api.get('/users?pageSize=100');
      return res.data.items || [];
    }
  });

  const stats = useMemo(() => {
    const totalBookings = reservationsData?.length || 0;
    const confirmedBookings = reservationsData?.filter((r: any) => r.status === 2).length || 0;
    const totalRevenue = paymentsData?.filter((p: any) => p.status === 2).reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
    const newUsers = usersData?.length || 0;
    const averageTicket = confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0;

    return {
      totalBookings,
      confirmedBookings,
      totalRevenue,
      newUsers,
      averageTicket
    };
  }, [reservationsData, paymentsData, usersData]);

  const chartData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayRevenue = paymentsData
        ?.filter((p: any) => p.status === 2 && new Date(p.created).toDateString() === date.toDateString())
        .reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
        
      data.push({ name: dayName, revenue: dayRevenue });
    }
    return data;
  }, [paymentsData]);

  const sportData = useMemo(() => {
    const counts: Record<string, number> = {};
    reservationsData?.forEach((r: any) => {
      const sport = r.courtSport || 'Outros';
      counts[sport] = (counts[sport] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reservationsData]);

  const exportPDF = async () => {
    setStatusModal({
      isOpen: true,
      status: 'loading',
      title: 'Gerando Relatório',
      message: 'Aguarde enquanto preparamos seu documento PDF premium...'
    });
    
    try {
      await exportAdminReportPDF({ stats, reservationsData, t });
      
      setStatusModal({
        isOpen: true,
        status: 'success',
        title: 'Relatório Pronto!',
        message: 'O download do seu relatório foi iniciado com sucesso.'
      });
    } catch (error) {
      setStatusModal({
        isOpen: true,
        status: 'error',
        title: 'Erro na Exportação',
        message: 'Não foi possível gerar o PDF no momento. Tente novamente.'
      });
    }
  };

  const COLORS = ['#8CE600', '#60a5fa', '#a78bfa', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <BarChart3 className="w-6 h-6" />
            </div>
            {t('admin.reports.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('admin.reports.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold bg-white dark:bg-card border-gray-200 dark:border-white/10 shadow-sm hover:bg-gray-50">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {period === '7' ? t('admin.reports.last7Days') : period === '30' ? t('admin.reports.last30Days') : t('admin.reports.last90Days')}
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl border-gray-100 dark:border-white/10 shadow-xl">
              <DropdownMenuItem onClick={() => setPeriod('7')} className="rounded-xl cursor-pointer">{t('admin.reports.last7Days')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('30')} className="rounded-xl cursor-pointer">{t('admin.reports.last30Days')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod('90')} className="rounded-xl cursor-pointer">{t('admin.reports.last90Days')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            onClick={exportPDF}
            className="h-12 px-6 bg-[#8CE600] text-gray-950 hover:opacity-90 font-black rounded-2xl shadow-lg shadow-[#8CE600]/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('admin.reports.exportPdf')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('admin.reports.summary.totalRevenue'), value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`, icon: CreditCard, color: 'text-emerald-500' },
          { label: t('admin.reports.summary.totalBookings'), value: stats.totalBookings, icon: Calendar, color: 'text-[#8CE600]' },
          { label: t('admin.reports.summary.averageTicket'), value: `R$ ${stats.averageTicket.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-500' },
          { label: t('admin.reports.summary.newUsers'), value: stats.newUsers, icon: Users, color: 'text-purple-500' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-6 rounded-3xl shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-2xl bg-gray-50 dark:bg-white/5 ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#8CE600]/5 rounded-tl-[4rem] translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl shadow-black/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#8CE600]/10 text-[#8CE600]">
                <TrendingUp className="w-5 h-5" />
              </div>
              {t('admin.reports.charts.revenueGrowth')}
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {isLoadingPayments ? (
              <Skeleton className="w-full h-full rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8CE600" 
                    strokeWidth={5} 
                    dot={{ r: 0 }}
                    activeDot={{ r: 8, fill: '#8CE600', stroke: '#fff', strokeWidth: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sport Distribution */}
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl shadow-black/5">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Building2 className="w-5 h-5" />
            </div>
            {t('admin.reports.charts.bookingsBySport')}
          </h3>
          <div className="h-[250px] w-full">
            {isLoadingRes ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sportData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {sportData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-8 space-y-3">
            {sportData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 ring-offset-transparent ring-transparent group-hover:ring-offset-white dark:group-hover:ring-offset-card group-hover:ring-current transition-all" style={{ backgroundColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{s.name}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-black border-none bg-gray-50 dark:bg-white/5 rounded-lg px-2 py-1">{s.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table (for the report context) */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
        <div className="p-8 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
           <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <FileText className="w-5 h-5" />
            </div>
            {t('admin.reports.pdf.bookingsDetail')}
          </h3>
          <Button variant="ghost" className="rounded-xl font-bold text-xs hover:bg-[#8CE600]/10 hover:text-[#8CE600]">
            Ver tudo
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('admin.reports.pdf.date')}</TableHead>
                <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('admin.activities.table.user')}</TableHead>
                <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('admin.reports.pdf.court')}</TableHead>
                <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Esporte</TableHead>
                <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('admin.reports.pdf.value')}</TableHead>
                <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-gray-400">{t('admin.reports.pdf.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reservationsData || []).slice(0, 8).map((r: any) => (
                <TableRow key={r.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <TableCell className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {new Date(r.startTime).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500">
                        {(r.userName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors">{r.userName || 'User'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.courtName || 'Arena'}</span>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <Badge variant="outline" className="text-[10px] font-bold border-[#8CE600]/20 text-[#8CE600] bg-[#8CE600]/5">
                      {r.courtSport || 'Outro'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <span className="text-sm font-black text-[#8CE600]">R$ {r.totalPrice}</span>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <Badge className={`rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-1 ${
                      r.status === 2 ? 'bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border border-[#8CE600]/20' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.status === 2 ? 'Confirmada' : 'Pendente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-6 bg-gray-50/30 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/10 flex justify-center">
            <Button variant="ghost" className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#8CE600] transition-all">
              {t('admin.activities.table.viewMore')} <ArrowUpRight className="w-3 h-3 ml-2" />
            </Button>
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
