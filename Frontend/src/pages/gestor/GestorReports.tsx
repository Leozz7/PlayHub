import { useTranslation } from 'react-i18next';
import { BarChart3, Download, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { Button } from '@/components/ui/button';

export default function GestorReports() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';

  const { data: reservationsData } = useReservations({ pageSize: 500 });
  const reservations = reservationsData?.items || [];

  const revenue = reservations.filter((r: any) => r.status === 2 || r.status === 4).reduce((sum: number, r: any) => sum + r.totalPrice, 0);
  const totalReservations = reservations.length;
  const uniqueClients = new Set(reservations.map((r: any) => r.userId)).size;

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header Section */}
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('gestor.sidebar.reports')}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('gestor.reports.title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                {t('gestor.reports.subtitle')}
              </p>
            </div>

            <Button onClick={handleExportPDF} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-105">
              <Download className="w-4 h-4" />
              {t('gestor.reports.exportPdf')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl shadow-gray-200/20 dark:shadow-black/20 flex items-center gap-4 transition-all hover:shadow-gray-200/40 dark:hover:shadow-black/40 hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('gestor.reports.revenue')}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">R$ {revenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl shadow-gray-200/20 dark:shadow-black/20 flex items-center gap-4 transition-all hover:shadow-gray-200/40 dark:hover:shadow-black/40 hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('gestor.reports.totalReservations')}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{totalReservations}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl shadow-gray-200/20 dark:shadow-black/20 flex items-center gap-4 transition-all hover:shadow-gray-200/40 dark:hover:shadow-black/40 hover:-translate-y-1">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-lg shadow-violet-500/10">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('gestor.reports.uniqueClients')}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{uniqueClients}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl shadow-gray-200/20 dark:shadow-black/20 min-h-[400px] flex flex-col justify-center items-center">
            <TrendingUp className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
            <p className="text-lg font-black text-gray-400">{t('gestor.reports.revenueByCourt')}</p>
            <p className="text-xs text-gray-500">Gráfico será disponibilizado em breve</p>
          </div>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl shadow-gray-200/20 dark:shadow-black/20 min-h-[400px] flex flex-col justify-center items-center">
            <BarChart3 className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-4" />
            <p className="text-lg font-black text-gray-400">{t('gestor.reports.reservationsByDay')}</p>
            <p className="text-xs text-gray-500">Gráfico será disponibilizado em breve</p>
          </div>
        </div>
      </div>
    </div>
  );
}
