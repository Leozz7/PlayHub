import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Shield, FileText, Info, Mail, LayoutDashboard, Settings as SettingsIcon, CalendarDays, LogOut, ChevronRight, Globe, Palette } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { useAuthStore } from '@/data/useAuthStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';

export function ConfigUser() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const phToast = usePlayHubToast();

  const role = user?.role?.toLowerCase();
  const isManager = role === 'manager';
  const isAdmin = role === 'admin';

  const handleLogout = () => {
    logout();
    phToast.logoutSuccess();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/30 dark:bg-background transition-colors duration-500">
      <Header />

      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-6 py-28 md:py-36">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            {t('configUser.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('configUser.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* Coluna Principal */}
          <div className="md:col-span-2 space-y-10">

            {/* Aparência */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-[#8CE600]/10 rounded-xl">
                  <Palette className="w-5 h-5 text-[#8CE600]" />
                </div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {t('configUser.appearance')}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${theme === 'light'
                      ? 'bg-[#8CE600]/5 border-[#8CE600] text-[#8CE600] ring-4 ring-[#8CE600]/10 shadow-lg shadow-[#8CE600]/10'
                      : 'bg-white dark:bg-background border-gray-100 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                  <Sun className="w-8 h-8" strokeWidth={1.5} />
                  <span className="font-bold text-sm">{t('configUser.themeLight')}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${theme === 'dark'
                      ? 'bg-[#8CE600]/5 border-[#8CE600] text-[#8CE600] ring-4 ring-[#8CE600]/10 shadow-lg shadow-[#8CE600]/10'
                      : 'bg-white dark:bg-background border-gray-100 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                  <Moon className="w-8 h-8" strokeWidth={1.5} />
                  <span className="font-bold text-sm">{t('configUser.themeDark')}</span>
                </button>
              </div>
            </section>

            {/* Idioma */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-[#8CE600]/10 rounded-xl">
                  <Globe className="w-5 h-5 text-[#8CE600]" />
                </div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  {t('configUser.language')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { code: 'pt', label: 'Português', flag: '🇧🇷' },
                  { code: 'en', label: 'English', flag: '🇺🇸' },
                  { code: 'es', label: 'Español', flag: '🇪🇸' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${i18n.language === lang.code
                        ? 'bg-[#8CE600]/5 border-[#8CE600] text-[#8CE600]'
                        : 'bg-white dark:bg-background border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-bold text-sm">{lang.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Sessão */}
            <section>
              <h2 className="text-xs font-black tracking-widest uppercase text-gray-400 mb-4 ml-1">
                {t('configUser.session')}
              </h2>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-5 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">{t('configUser.logout')}</p>
                    <p className="text-xs opacity-70">{t('configUser.logoutDesc', { name: user?.name })}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
            </section>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">

            {/* Acesso Rápido — adaptado à role */}
            <div className="bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-3xl p-2 shadow-xl shadow-gray-100/30 dark:shadow-black/20">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-400">
                  {t('configUser.quickAccess')}
                </h3>
              </div>
              <nav className="flex flex-col gap-1 p-2">
                {/* Todos os usuários veem suas reservas */}
                <Link to="/lz_user/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[#8CE600] group-hover:bg-[#8CE600]/10 transition-colors">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    {t('configUser.myReservations')}
                  </span>
                </Link>

                {/* Apenas Manager vê painel do gestor */}
                {isManager && (
                  <Link to="/lz_gestor/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[#8CE600] group-hover:bg-[#8CE600]/10 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                      {t('configUser.managerPanel')}
                    </span>
                  </Link>
                )}

                {/* Admin vê ambos os painéis */}
                {isAdmin && (
                  <>
                    <Link to="/lz_gestor/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[#8CE600] group-hover:bg-[#8CE600]/10 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                        {t('configUser.managerPanel')}
                      </span>
                    </Link>
                    <Link to="/lz_admin/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[#8CE600] group-hover:bg-[#8CE600]/10 transition-colors">
                        <SettingsIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                        {t('configUser.adminPanel')}
                      </span>
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Legal & Suporte */}
            <div className="bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-3xl p-2 shadow-xl shadow-gray-100/30 dark:shadow-black/20">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-400">
                  {t('configUser.legalSupport')}
                </h3>
              </div>
              <nav className="flex flex-col gap-1 p-2">
                <Link to="/privacy" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">{t('configUser.privacy')}</span>
                </Link>
                <Link to="/terms" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">{t('configUser.terms')}</span>
                </Link>
                <Link to="/about" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">{t('configUser.about')}</span>
                </Link>
                <Link to="/contact" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">{t('configUser.contact')}</span>
                </Link>
              </nav>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



