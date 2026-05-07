import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Search, CheckCircle2, Clock, XCircle, DollarSign } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';

export default function GestorPayments() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';

  const [searchTerm, setSearchTerm] = useState('');
  const { data: reservationsData } = useReservations({ pageSize: 500 });
  const reservations = reservationsData?.items || [];

  const payments = useMemo(() => {
    return reservations.map((r: any) => ({
      id: r.id.split('-')[0].toUpperCase(),
      reservationId: r.id,
      clientName: r.userName || 'Usuário Excluído',
      amount: r.totalPrice,
      method: r.paymentMethod || 'Credit Card',
      status: r.status === 2 ? 'Concluído' : r.status === 3 ? 'Falhou' : 'Pendente',
      date: r.startTime
    })).filter(p => p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [reservations, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header Section */}
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('gestor.sidebar.payments')}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('gestor.payments.title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                {t('gestor.payments.subtitle')}
              </p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder={t('gestor.payments.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
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
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.payments.table.id')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.payments.table.client')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.payments.table.amount')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.payments.table.method')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.payments.table.status')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.payments.table.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="font-bold text-gray-500">{t('gestor.payments.noResults')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((p: any) => (
                    <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-gray-400">{p.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{p.clientName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">R$ {p.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-500">{p.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.status === 'Concluído' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          p.status === 'Falhou' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {p.status === 'Concluído' ? <CheckCircle2 className="w-3 h-3" /> : p.status === 'Falhou' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-500">{new Date(p.date).toLocaleString(locale)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
