import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Star,
  MapPin,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import logoUrl from '../../assets/logo.png';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return `${parts[0].charAt(0)}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''}`.toUpperCase();
}

export function UserSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const phToast = usePlayHubToast();

  const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
    {
      title: t('user.sidebar.sections.general'),
      items: [
        { label: t('user.sidebar.items.dashboard'), icon: LayoutDashboard, href: '/lz_user/dashboard' },
        { label: t('user.sidebar.items.myBookings'), icon: CalendarDays, href: '/my-bookings' },
      ],
    },
    {
      title: t('user.sidebar.sections.explore'),
      items: [
        { label: t('user.sidebar.items.courts'), icon: MapPin, href: '/catalog' },
        { label: t('user.sidebar.items.favorites'), icon: Heart, href: '/lz_user/favorites' },
        { label: t('user.sidebar.items.reviews'), icon: Star, href: '/lz_user/reviews' },
      ],
    },
    {
      title: t('user.sidebar.sections.account'),
      items: [
        { label: t('user.sidebar.items.profile'), icon: UserIcon, href: '/lz_user/profile' },
        { label: t('user.sidebar.items.notifications'), icon: Bell, href: '/lz_user/notifications' },
        { label: t('user.sidebar.items.settings'), icon: Settings, href: '/config' },
      ],
    },
  ];

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
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#8CE600]/5 to-transparent pointer-events-none" />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-20 w-6 h-6 rounded-full bg-white dark:bg-card border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-md hover:shadow-lg hover:border-[#8CE600]/50 transition-all duration-300 group"
        aria-label={collapsed ? t('user.sidebar.expand') : t('user.sidebar.collapse')}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#8CE600] transition-colors" />
          : <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-[#8CE600] transition-colors" />
        }
      </button>

      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img src={logoUrl} alt="PlayHub" className="h-7 w-auto transition-transform group-hover:scale-105" />
          {!collapsed && (
            <span className="font-black tracking-tighter text-xl">
              <span className="text-[#8CE600]">PLAY</span>
              <span className="text-gray-900 dark:text-white">HUB</span>
            </span>
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className="mx-4 mt-4 mb-1 px-3 py-2 rounded-xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center gap-2">
          <UserIcon className="w-3.5 h-3.5 text-[#8CE600] shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6aad00] dark:text-[#8CE600]">{t('user.sidebar.role')}</span>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center mt-4 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-[#8CE600]" />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6 px-3 scrollbar-thin">
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
                        }`}
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

      <div className={`border-t border-gray-100 dark:border-white/[0.06] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            title={t('user.sidebar.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-xl bg-[#8CE600] flex items-center justify-center text-xs font-black text-gray-950 shrink-0 shadow-md shadow-[#8CE600]/30">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none">{user?.name ?? 'Atleta'}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email ?? 'atleta@playhub.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-semibold">{t('user.sidebar.logout')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}



