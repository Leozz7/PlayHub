import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Mail, Phone, FileText } from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/useReservations';

export default function GestorClients() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';

  const [searchTerm, setSearchTerm] = useState('');
  const { data: reservationsData } = useReservations({ pageSize: 500 });
  const reservations = reservationsData?.items || [];

  const clients = useMemo(() => {
    const map = new Map<string, any>();
    reservations.forEach((r: any) => {
      if (!map.has(r.userId)) {
        map.set(r.userId, {
          id: r.userId,
          name: r.userName || t('gestor.clients.deletedUser'),
          email: r.userEmail || t('gestor.clients.notInformed'), 
          phone: r.userPhone || t('gestor.clients.notInformed'),
          cpf: r.userCpf || t('gestor.clients.notInformed'),
          totalSpent: 0,
          totalReservations: 0,
          lastVisit: r.startTime
        });
      }
      const c = map.get(r.userId);
      c.totalReservations += 1;
      if (r.status === 2 || r.status === 4) {
        c.totalSpent += r.totalPrice;
      }
      if (new Date(r.startTime) > new Date(c.lastVisit)) {
        c.lastVisit = r.startTime;
      }
    });
    return Array.from(map.values()).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [reservations, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('gestor.sidebar.clients')}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('gestor.clients.title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                {t('gestor.clients.subtitle')}
              </p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder={t('gestor.clients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.clients.table.name')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.clients.table.contact')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.clients.table.totalReservations')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.clients.table.totalSpent')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.clients.table.lastVisit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="font-bold text-gray-500">{t('gestor.clients.noResults')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((c: any) => (
                    <tr key={c.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black shadow-lg shadow-blue-500/10">
                            {c.name.charAt(0)}
                          </div>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500"><Mail className="w-3 h-3" /> {c.email}</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500"><Phone className="w-3 h-3" /> {c.phone}</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500"><FileText className="w-3 h-3" /> CPF: {c.cpf}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">{c.totalReservations}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">R$ {c.totalSpent.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-500">{new Date(c.lastVisit).toLocaleDateString(locale)}</span>
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
