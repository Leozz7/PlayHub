import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoUrl from '../../assets/logo.png';

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

const SOCIALS = [
  {
    id: 'footer-instagram',
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'footer-whatsapp',
    label: 'WhatsApp',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    id: 'footer-twitter',
    label: 'Twitter',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
      </svg>
    )
  }
];

export function Footer() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="relative bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-white/5 pt-20 pb-10 overflow-hidden" id="contact">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-[#8CE600]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#8CE600]/[0.025] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group w-fit" id="footer-logo">
              <img src={logoUrl} alt="PlayHub Logo" className="h-9 w-auto transition-all duration-500 group-hover:scale-105 drop-shadow-sm" />
              <span className="text-2xl font-black tracking-tighter transition-all">
                <span className="text-[#8CE600]">PLAY</span>
                <span className="text-gray-900 dark:text-white">HUB</span>
              </span>
            </Link>

            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-sm mb-8 transition-colors">
              {t('footer.description')}
            </p>

            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.id}
                  id={s.id}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-white/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-6 transition-colors">
                {t('footer.navigation.title')}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/catalog" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group w-fit flex">
                    {t('footer.navigation.championships')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group w-fit flex">
                    {t('common.navigation.leagues')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-6 transition-colors">
                {t('footer.institutional.title')}
              </h3>
              <ul className="space-y-4">
                <li>
                  <a href="#about" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group w-fit flex">
                    {t('footer.institutional.about')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group w-fit flex">
                    {t('footer.bottom.contactUs')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </a>
                </li>
                <li>
                  <Link to="/terms" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group w-fit flex">
                    {t('footer.institutional.terms')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative group w-fit flex">
                    {t('footer.institutional.privacy')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#8CE600] transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 dark:border-white/5 gap-6 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-500">
            {t('footer.bottom.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider">{t('footer.institutional.privacy')}</Link>
              <Link to="/terms" className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-wider">{t('footer.institutional.terms')}</Link>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-white/5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-all group">
                <Globe className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8CE600] transition-colors" />
                <span>
                  {LANGUAGES.find(l => l.code === i18n.language)?.label || 'Português'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/20 dark:shadow-none p-1 ring-1 ring-black/5 dark:ring-white/5">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`flex items-center justify-between cursor-pointer rounded-xl p-3 text-xs font-bold transition-colors ${i18n.language === lang.code ? 'bg-[#8CE600]/10 text-[#8CE600]' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'}`}
                  >
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && <Check className="w-3.5 h-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  );
}



