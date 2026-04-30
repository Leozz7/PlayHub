import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, User as UserIcon, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
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

// NAV_LINKS moved inside component to support translations

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName) return 'U';
  return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
}

function DesktopUserMenu({ user, logout }: { user: any, logout: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initials = getInitials(user?.firstName, user?.lastName);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.map((r: string) => r.toLowerCase()).includes('admin');
  const isManager = user?.roles?.map((r: string) => r.toLowerCase()).includes('manager');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none group">
        <Avatar className="h-10 w-10 border-2 border-transparent transition-all group-hover:border-[#8CE600] shadow-sm">
          <AvatarFallback className="bg-[#8CE600] text-gray-950 font-black text-sm tracking-widest">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden lg:flex flex-col items-start text-left ml-1">
           <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.firstName}</span>
           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
             {isAdmin ? 'Admin' : isManager ? 'Gestor' : 'Atleta'}
           </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#8CE600] transition-transform group-data-[state=open]:rotate-180 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/20 dark:shadow-black/40">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs leading-none text-gray-500 truncate mt-1">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/50" />
        
        <div className="p-1 space-y-1">
            <DropdownMenuItem onClick={() => navigate('/user/dashboard')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
            <UserIcon className="mr-3 h-4 w-4 text-gray-500" />
            <span>{t('menu.profile.btnProfile')}</span>
            </DropdownMenuItem>

            {isManager && (
            <DropdownMenuItem onClick={() => navigate('/gestor/dashboard')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
                <LayoutDashboard className="mr-3 h-4 w-4 text-[#8CE600]" />
                <span>{t('header.userMenu.managerPanel')}</span>
            </DropdownMenuItem>
            )}

            {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 p-3 text-sm font-medium transition-colors">
                <Settings className="mr-3 h-4 w-4 text-[#8CE600]" />
                <span>{t('header.userMenu.generalAdmin')}</span>
            </DropdownMenuItem>
            )}
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
  
  const { isAuthenticated, user, logout } = useAuthStore();

  const NAV_LINKS = [
    { label: t('footer.navigation.championships'), href: '/catalog' },
    { label: t('footer.institutional.about'), href: '/about' },
    { label: t('common.navigation.leagues'), href: '#sports' },
    { label: t('footer.bottom.contactUs'), href: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center w-full pointer-events-none pt-4 md:pt-6 px-4 transition-all duration-500">
      <header
        className={`w-full max-w-6xl pointer-events-auto transition-all duration-700 ease-in-out overflow-hidden ${
          scrolled || mobileOpen
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl shadow-2xl shadow-gray-200/40 dark:shadow-black/60 border border-gray-100 dark:border-gray-800 rounded-3xl'
            : 'bg-white/40 dark:bg-gray-950/20 backdrop-blur-md shadow-xl shadow-gray-100/10 dark:shadow-black/5 border border-white/40 dark:border-white/5 rounded-[2rem]'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}>
            
            {/* LOGO */}
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

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                >
                  {link.label}
                  {/* Animating underline */}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                </a>
              ))}
            </nav>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-5">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
              </button>
              
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

            {/* MOBILE MENU BUTTON */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {isAuthenticated && (
                 <div className="w-8 h-8 rounded-full bg-[#8CE600] text-gray-950 flex items-center justify-center font-black text-xs shadow-sm">
                   {getInitials(user?.firstName, user?.lastName)}
                 </div>
              )}

              <button
                id="header-mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
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

        {/* MOBILE NAV (Inside the island) */}
        <div
          className={`md:hidden transition-all duration-500 ease-in-out bg-white/40 dark:bg-gray-950/40 backdrop-blur-md ${
            mobileOpen ? 'max-h-[500px] opacity-100 border-t border-gray-200/50 dark:border-gray-800/50' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 hover:pl-6 rounded-xl transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/user/dashboard"
                    className="px-4 py-3 text-center text-sm font-bold text-gray-900 bg-[#8CE600] rounded-xl hover:bg-[#7bc400] transition-all shadow-md shadow-[#8CE600]/20 ring-1 ring-black/5"
                  >
                    {t('common.navigation.dashboard')}
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
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
