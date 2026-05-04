import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell,
  FileText,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { useTheme } from '@/components/ui/theme-provider';
import logoUrl from '../../assets/logo.png';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  section?: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/lz_admin/dashboard' },
      { label: 'Relatórios', icon: BarChart3, href: '/lz_admin/reports' },
      { label: 'Atividade', icon: Activity, href: '/lz_admin/activity' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Usuários', icon: Users, href: '/lz_admin/users' },
      { label: 'Quadras', icon: Building2, href: '/lz_admin/courts' },
      { label: 'Reservas', icon: CalendarDays, href: '/lz_admin/bookings' },
      { label: 'Pagamentos', icon: CreditCard, href: '/lz_admin/payments' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Logs', icon: FileText, href: '/lz_admin/logs' },
      { label: 'Notificações', icon: Bell, href: '/lz_admin/notifications'},
      { label: 'Configurações', icon: Settings, href: '/lz_admin/settings' },
    ],
  },
];

function getInitials(name?: string) {
  if (!name) return 'A';
  const parts = name.trim().split(' ');
  return `${parts[0].charAt(0)}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''}`.toUpperCase();
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const phToast = usePlayHubToast();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    phToast.logoutSuccess();
    navigate('/login');
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white dark:bg-background border-r border-gray-100 dark:border-white/[0.06] transition-all duration-500 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Glow sutil de fundo */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#8CE600]/5 to-transparent pointer-events-none" />

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-20 w-6 h-6 rounded-full bg-white dark:bg-card border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-md hover:shadow-lg hover:border-[#8CE600]/50 transition-all duration-300 group"
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#8CE600] transition-colors" />
          : <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-[#8CE600] transition-colors" />
        }
      </button>

      {/* Logo / Header */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img src={logoUrl} alt="PlayHub" className="h-7 w-auto transition-transform group-hover:scale-105" />
          {!collapsed && (
            <span className="font-black tracking-tighter text-xl transition-all">
              <span className="text-[#8CE600]">PLAY</span>
              <span className="text-gray-900 dark:text-white">HUB</span>
            </span>
          )}
        </Link>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Administrador</span>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center mt-4 mb-1">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6 px-3 scrollbar-custom">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-2 px-2">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/25'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <item.icon
                        className={`shrink-0 transition-transform group-hover:scale-110 ${
                          collapsed ? 'w-5 h-5' : 'w-4 h-4'
                        } ${isActive ? 'text-gray-950' : ''}`}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      {!collapsed && (
                        <span className={`text-sm font-semibold tracking-tight flex-1 ${isActive ? 'font-bold' : ''}`}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${
                          isActive ? 'bg-gray-950/20 text-gray-950' : 'bg-[#8CE600]/15 text-[#6aad00]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#8CE600] rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`border-t border-gray-100 dark:border-white/[0.06] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs font-black text-red-500 shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none">{user?.name ?? 'Admin'}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email ?? 'admin@playhub.com'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all shrink-0"
                title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-semibold">Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}



