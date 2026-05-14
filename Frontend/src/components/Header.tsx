import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, User as UserIcon, LayoutDashboard, Settings, LogOut, ChevronDown, CalendarDays, Heart, ArrowUpRight, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import logoUrl from '../../assets/logo.png';
import { useAuthStore } from '@/data/useAuthStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { useFavoritesStore } from '@/data/useFavoritesStore';
import { useMyFavorites } from '@/features/favorites/hooks/useFavorites';


function FavoritesPopover() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const count = useFavoritesStore(s => s.count);
  const { data: courts = [], isLoading } = useMyFavorites();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 focus:outline-none group">
        <Heart className="h-[1.15rem] w-[1.15rem] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1 shadow-sm ring-2 ring-white dark:ring-black">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="z-[200] w-[340px] rounded-[1.5rem] p-0 bg-white/90 dark:bg-background/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl">
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{t('header.favorites.title', 'Favoritas')}</span>
          </div>
          {count > 0 && (
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
              {count} {t('header.favorites.saved', 'salvas')}
            </span>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#8CE600]" />
            </div>
          ) : courts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/[0.02] rounded-full flex items-center justify-center mb-4 ring-1 ring-gray-100 dark:ring-white/5">
                <Heart className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{t('header.favorites.emptyTitle', 'Nenhuma favorita')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-[200px]">{t('header.favorites.emptyDescription', 'Salve suas quadras preferidas para acessá-las rapidamente.')}</p>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {courts.map(court => (
                <DropdownMenuItem
                  key={court.id}
                  onClick={() => { navigate(`/courts/${court.id}`); setOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] cursor-pointer transition-all duration-300 text-left group rounded-none outline-none"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-900 relative shadow-inner">
                    {court.img ? (
                      <img src={court.img} alt={court.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Heart className="w-5 h-5 text-gray-300 dark:text-gray-700" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-[#8CE600] transition-colors">{court.name}</p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1">
                      R$ {court.hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}/h
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0">
                    <ArrowUpRight className="w-4 h-4 text-gray-900 dark:text-white" />
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] backdrop-blur-md">
          <DropdownMenuItem
            onClick={() => { navigate('/lz_user/favorites'); setOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#8CE600] text-gray-950 rounded-2xl text-sm font-bold hover:bg-[#7bc400] focus:bg-[#7bc400] transition-all shadow-lg shadow-[#8CE600]/20 cursor-pointer outline-none ring-1 ring-black/5"
          >
            {t('header.favorites.viewAll', 'Ver todas as favoritas')}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


import { type User } from '@/features/auth/types/auth.types';

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return `${parts[0].charAt(0)}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''}`.toUpperCase();
}

function DesktopUserMenu({ user, logout }: { user: User | null, logout: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const phToast = usePlayHubToast();
  const initials = getInitials(user?.name);
  const favCount = useFavoritesStore(s => s.count);
  useMyFavorites();

  const handleLogout = () => {
    logout();
    phToast.logoutSuccess();
    navigate('/login');
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isManager = user?.role?.toLowerCase() === 'manager';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none group">
        <Avatar className="h-10 w-10 border-2 border-transparent transition-all group-hover:border-[#8CE600] shadow-sm">
          <AvatarFallback className="bg-[#8CE600] text-gray-950 font-black text-sm tracking-widest">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden lg:flex flex-col items-start text-left ml-1">
          <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name?.split(' ')[0]}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
            {isAdmin ? t('header.userMenu.roles.admin', 'Admin') : isManager ? t('header.userMenu.roles.manager', 'Gestor') : t('header.userMenu.roles.athlete', 'Atleta')}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#8CE600] transition-transform group-data-[state=open]:rotate-180 ml-1" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[200] w-56 rounded-2xl p-2 bg-white/95 dark:bg-background/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-2xl shadow-gray-200/20 dark:shadow-none">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-xs leading-none text-gray-500 truncate mt-1">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/50" />

        <div className="p-1 space-y-1">
          <DropdownMenuItem onClick={() => navigate('/lz_user/profile')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
            <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
            <span>{t('menu.profile.btnProfile')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate('/my-bookings')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
            <CalendarDays className="mr-3 h-4 w-4 text-gray-500" />
            <span>{t('header.userMenu.myReservations', 'Minhas Reservas')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => navigate('/lz_user/favorites')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
            <Heart className="mr-3 h-4 w-4 text-red-400" />
            <span className="flex-1">{t('header.userMenu.favoriteCourts', 'Quadras Favoritas')}</span>
            {favCount > 0 && (
              <span className="ml-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black bg-red-500 text-white rounded-full px-1">
                {favCount}
              </span>
            )}
          </DropdownMenuItem>

          {isManager && (
            <DropdownMenuItem onClick={() => navigate('/lz_gestor/dashboard')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
              <LayoutDashboard className="mr-3 h-4 w-4 text-[#8CE600]" />
              <span>{t('header.userMenu.managerPanel')}</span>
            </DropdownMenuItem>
          )}

          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/lz_admin/dashboard')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
              <LayoutDashboard className="mr-3 h-4 w-4 text-[#8CE600]" />
              <span>{t('header.userMenu.generalAdmin')}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => navigate('/config')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span>{t('header.userMenu.generalSettings', 'Configurações Gerais')}</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/50" />
        <div className="p-1">
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 p-3 text-sm font-bold transition-colors">
            <LogOut className="mr-3 h-4 w-4" />
            <span>{t('common.actions.logout')}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const phToast = usePlayHubToast();

  const { isAuthenticated, user, logout } = useAuthStore();

  const NAV_LINKS = useMemo(() => [
    { label: t('footer.navigation.courts'), href: '/catalog' },
    { label: t('footer.institutional.about'), href: '/about' },
    { label: t('footer.bottom.contactUs'), href: '/contact' },
  ], [t]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);
  const toggleMobileOpen = useCallback(() => setMobileOpen(prev => !prev), []);
  const handleLogoutAction = useCallback(() => {
    logout();
    phToast.logoutSuccess();
    navigate('/login');
  }, [logout, phToast, navigate]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center w-full pointer-events-none pt-4 md:pt-6 px-4 transition-all duration-500">
      <header
        className={`w-full max-w-6xl pointer-events-auto transition-all duration-700 ease-in-out ${scrolled || mobileOpen
            ? 'bg-white/80 dark:bg-background/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/10 rounded-3xl'
            : 'bg-white/40 dark:bg-background/20 backdrop-blur-md shadow-xl shadow-gray-100/10 dark:shadow-black/5 border border-white/40 dark:border-white/5 rounded-[2rem]'
          }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>

            <Link to="/" className="flex items-center gap-3 group" id="header-logo">
              <img
                src={logoUrl}
                alt="PlayHub Logo"
                className={`w-auto transition-all duration-500 group-hover:scale-105 ${scrolled ? 'h-8' : 'h-9'}`}
              />
              <span className={`font-black tracking-tighter transition-all duration-500 ${scrolled ? 'text-xl' : 'text-2xl'}`}>
                <span className="text-[#8CE600]">PLAY</span>
                <span className="text-gray-900 dark:text-white">HUB</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-5">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} /> : <Moon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />}
              </button>

              {/* Favoritos */}
              {isAuthenticated && <FavoritesPopover />}

              <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>

              {isAuthenticated ? (
                <DesktopUserMenu user={user} logout={logout} />
              ) : (
                <>
                  <Link
                    to="/login"
                    id="header-login-btn"
                    className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {t('common.actions.login')}
                  </Link>
                  <Link
                    to="/register"
                    id="header-register-btn"
                    className="bg-[#8CE600] text-gray-900 px-6 py-2.5 rounded-full text-sm font-black tracking-wide shadow-lg shadow-[#8CE600]/25 hover:bg-[#7bc400] hover:shadow-[#8CE600]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10"
                  >
                    {t('common.actions.enter')}
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
              </button>

              {isAuthenticated && (
                <div className="w-8 h-8 rounded-full bg-[#8CE600] text-gray-950 flex items-center justify-center font-black text-xs shadow-sm">
                  {getInitials(user?.name)}
                </div>
              )}

              <button
                id="header-mobile-menu-btn"
                onClick={toggleMobileOpen}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
              >
                <div className="w-6 flex flex-col gap-1.5">
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-white/40 dark:bg-background/40 backdrop-blur-md ${mobileOpen ? 'max-h-[500px] opacity-100 border-t border-gray-200/50 dark:border-white/10/50' : 'max-h-0 opacity-0'
            }`}
        >
            <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 hover:pl-6 rounded-xl transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10/50">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/lz_user/profile"
                    className="px-4 py-3 text-center text-sm font-bold text-gray-900 bg-[#8CE600] rounded-xl hover:bg-[#7bc400] transition-all shadow-md shadow-[#8CE600]/20 ring-1 ring-black/5"
                  >
                    {t('menu.profile.btnProfile')}
                  </Link>
                  <Link
                    to="/lz_user/dashboard"
                    className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    {t('header.userMenu.myReservations', 'Minhas Reservas')}
                  </Link>
                  <Link
                    to="/config"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    {t('header.userMenu.generalSettings', 'Configurações Gerais')}
                  </Link>
                  <button
                    onClick={handleLogoutAction}
                    className="px-4 py-3 text-center text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                  >
                    {t('common.actions.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    {t('common.actions.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 text-center text-sm font-bold text-gray-900 bg-[#8CE600] rounded-xl hover:bg-[#7bc400] transition-all shadow-md shadow-[#8CE600]/20 ring-1 ring-black/5"
                  >
                    {t('common.actions.enter')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}



