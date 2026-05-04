import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  BarChart3,
  Users,
  Star,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  { id: 'courts', label: 'Quadras Gerenciadas', value: 4, change: 0, icon: Building2, color: 'green', prefix: '', suffix: '' },
  { id: 'reservations', label: 'Reservas este Mês', value: 312, change: +14.2, icon: CalendarDays, color: 'violet', prefix: '', suffix: '' },
  { id: 'clients', label: 'Clientes Únicos', value: 186, change: +8.5, icon: Users, color: 'blue', prefix: '', suffix: '' },
  { id: 'revenue', label: 'Receita Mensal', value: 43_200, change: +9.1, icon: CreditCard, color: 'amber', prefix: 'R$', suffix: '' },
];

const MY_COURTS = [
  {
    id: 1, name: 'Arena Central Paulista', sport: 'Futebol Society',
    status: 'active', reservationsThisMonth: 88, revenue: 13_200,
    nextReservation: 'Hoje, 14h–16h', rating: 5.0, reviewCount: 312,
    img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2, name: 'Beach Club Sport', sport: 'Beach Tennis',
    status: 'active', reservationsThisMonth: 76, revenue: 8_360,
    nextReservation: 'Hoje, 16h–17h', rating: 4.9, reviewCount: 218,
    img: 'https://images.unsplash.com/photo-1485395037613-e83d5c1f5ac4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3, name: 'Quadra Premium Vila', sport: 'Tênis',
    status: 'maintenance', reservationsThisMonth: 52, revenue: 6_760,
    nextReservation: '—', rating: 4.7, reviewCount: 89,
    img: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4, name: 'Sport Center Sul', sport: 'Basquete',
    status: 'active', reservationsThisMonth: 96, revenue: 8_160,
    nextReservation: 'Amanhã, 08h–10h', rating: 4.8, reviewCount: 145,
    img: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=400&q=80',
  },
];

const RECENT_RESERVATIONS = [
  { id: 'R-083', client: 'Lucas Menezes', court: 'Arena Central Paulista', date: '02/05 • 14h–16h', value: 300, status: 'confirmed' },
  { id: 'R-082', client: 'Ana Beatriz', court: 'Beach Club Sport', date: '02/05 • 10h–11h', value: 110, status: 'pending' },
  { id: 'R-081', client: 'Carlos Souza', court: 'Sport Center Sul', date: '02/05 • 08h–10h', value: 170, status: 'confirmed' },
  { id: 'R-080', client: 'Patrícia Ramos', court: 'Quadra Premium Vila', date: '01/05 • 16h–18h', value: 260, status: 'cancelled' },
  { id: 'R-079', client: 'Eduardo Lima', court: 'Arena Central Paulista', date: '01/05 • 18h–20h', value: 300, status: 'confirmed' },
];

const SCHEDULE_TODAY = [
  { time: '08h–10h', court: 'Sport Center Sul', client: 'Carlos Souza', status: 'confirmed' },
  { time: '10h–11h', court: 'Beach Club Sport', client: 'Ana Beatriz', status: 'pending' },
  { time: '14h–16h', court: 'Arena Central Paulista', client: 'Lucas Menezes', status: 'confirmed' },
  { time: '16h–17h', court: 'Beach Club Sport', client: 'Joana Carvalho', status: 'confirmed' },
  { time: '18h–20h', court: 'Arena Central Paulista', client: 'Eduardo Lima', status: 'confirmed' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmada', icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  pending: { label: 'Pendente', icon: Clock, className: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  cancelled: { label: 'Cancelada', icon: XCircle, className: 'text-red-500 bg-red-50 dark:bg-red-950/40 dark:text-red-400' },
} as const;

const COLOR_MAP = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
  green: { bg: 'bg-[#8CE600]/10', border: 'border-[#8CE600]/20', text: 'text-[#6aad00] dark:text-[#8CE600]' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
};

const COURT_STATUS_CFG = {
  active: { label: 'Ativa', className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400', dot: 'bg-emerald-500' },
  maintenance: { label: 'Manutenção', className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400', dot: 'bg-amber-500' },
  inactive: { label: 'Inativa', className: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400', dot: 'bg-gray-400' },
} as const;

function formatValue(value: number, prefix: string) {
  if (prefix === 'R$') return `R$ ${value.toLocaleString('pt-BR')}`;
  return value.toLocaleString('pt-BR');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: typeof STATS[0] }) {
  const col = COLOR_MAP[stat.color as keyof typeof COLOR_MAP];
  const isPositive = stat.change >= 0;
  return (
    <div className="group bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${col.bg} border ${col.border} flex items-center justify-center`}>
          <stat.icon className={`w-5 h-5 ${col.text}`} strokeWidth={1.75} />
        </div>
        {stat.change !== 0 && (
          <span className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPositive ? '+' : ''}{stat.change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-1">
        {formatValue(stat.value, stat.prefix)}
      </p>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{stat.label}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GestorDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'reservations' | 'schedule'>('reservations');

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Gestor';

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-background/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.05] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Painel do Gestor, {firstName} 🏟️
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{now}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Gestor</span>
          </div>
          <Link to="/lz_gestor/courts/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8CE600] text-gray-950 rounded-full text-xs font-black hover:bg-[#7bc400] transition-all shadow-md shadow-[#8CE600]/20">
            <Plus className="w-3.5 h-3.5" /> Nova Quadra
          </Link>
        </div>
      </header>

      <div className="px-6 py-8 space-y-8 max-w-[1400px] mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map(s => <StatCard key={s.id} stat={s} />)}
        </div>

        {/* My Courts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-gray-900 dark:text-white">Minhas Quadras</h2>
            <Link to="/lz_gestor/courts" className="text-xs font-bold text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 flex items-center gap-1 transition-opacity">
              Gerenciar <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {MY_COURTS.map(court => {
              const statusCfg = COURT_STATUS_CFG[court.status as keyof typeof COURT_STATUS_CFG];
              return (
                <div key={court.id} className="group bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/30 transition-all duration-300">
                  <div className="relative h-28 overflow-hidden">
                    <img src={court.img} alt={court.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black ${statusCfg.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${court.status === 'active' ? 'animate-pulse' : ''}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight mb-0.5">{court.name}</p>
                    <p className="text-[11px] text-gray-400 mb-3">{court.sport}</p>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400">Reservas/mês</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{court.reservationsThisMonth}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Receita</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">R$ {(court.revenue / 1000).toFixed(1)}k</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{court.rating}</span>
                        <span className="text-[10px] text-gray-400">({court.reviewCount})</span>
                      </div>
                      {court.status === 'maintenance' && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <AlertCircle className="w-3 h-3" /> Em manutenção
                        </span>
                      )}
                      {court.status === 'active' && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[90px]">{court.nextReservation}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reservations & Schedule */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main table */}
          <div className="xl:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-1 p-4 border-b border-gray-100 dark:border-white/[0.06]">
              <button onClick={() => setActiveTab('reservations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'reservations' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                Reservas Recentes
              </button>
              <button onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedule' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                Agenda de Hoje
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
                      {['ID', 'Cliente', 'Quadra', 'Horário', 'Valor', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {RECENT_RESERVATIONS.map(r => {
                      const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
                      return (
                        <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3"><span className="text-xs font-mono font-bold text-gray-400">{r.id}</span></td>
                          <td className="px-4 py-3"><span className="text-sm font-semibold text-gray-900 dark:text-white">{r.client}</span></td>
                          <td className="px-4 py-3"><span className="text-sm text-gray-600 dark:text-gray-300">{r.court}</span></td>
                          <td className="px-4 py-3"><span className="text-xs text-gray-500">{r.date}</span></td>
                          <td className="px-4 py-3"><span className="text-sm font-bold text-gray-900 dark:text-white">R$ {r.value}</span></td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.className}`}>
                              <cfg.icon className="w-3 h-3" />{cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {SCHEDULE_TODAY.map((item, i) => {
                  const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
                  return (
                    <div key={i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="w-20 shrink-0">
                        <span className="text-xs font-black text-[#6aad00] dark:text-[#8CE600]">{item.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.court}</p>
                        <p className="text-xs text-gray-400">{item.client}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.className} shrink-0`}>
                        <cfg.icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-4 border-t border-gray-100 dark:border-white/[0.06]">
              <Link to="/lz_gestor/reservations" className="text-xs font-bold text-[#6aad00] dark:text-[#8CE600] hover:opacity-70 flex items-center gap-1 transition-opacity">
                Ver todas <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Revenue breakdown */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[#8CE600]" strokeWidth={2} />
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Receita por Quadra</h3>
              </div>
              <div className="space-y-3">
                {MY_COURTS.sort((a, b) => b.revenue - a.revenue).map(court => {
                  const maxRev = Math.max(...MY_COURTS.map(c => c.revenue));
                  const pct = Math.round((court.revenue / maxRev) * 100);
                  return (
                    <div key={court.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{court.name.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">R$ {(court.revenue / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-[#8CE600] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Resumo de Hoje</h3>
              <div className="space-y-3">
                {[
                  { label: 'Reservas hoje', value: 5, icon: CalendarDays },
                  { label: 'Receita hoje', value: 'R$ 880', icon: CreditCard },
                  { label: 'Clientes hoje', value: 5, icon: Users },
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

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#8CE600] to-[#6aad00] rounded-2xl p-5">
              <h3 className="text-sm font-black text-gray-950 mb-1">Ações Rápidas</h3>
              <p className="text-[11px] text-gray-950/60 mb-3">Gerencie suas quadras com agilidade</p>
              <div className="space-y-2">
                {[
                  { label: 'Bloquear horário', href: '/lz_gestor/schedule' },
                  { label: 'Ver solicitações', href: '/lz_gestor/reservations' },
                  { label: 'Editar quadra', href: '/lz_gestor/courts' },
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




