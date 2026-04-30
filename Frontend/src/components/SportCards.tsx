import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/ui/Reveal';
import { SPORTS } from '@/pages/IndexData';
import { SPORT_ICONS } from '@/components/SportIcons';

export function SportCards() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const Icon1 = SPORT_ICONS[0];
    const Icon2 = SPORT_ICONS[4];

    return (
        <section id="sports" className="relative py-24 bg-white dark:bg-gray-950 transition-colors duration-500 overflow-hidden">
            <div className="absolute top-10 left-4 text-[#8CE600] opacity-[0.12] dark:opacity-[0.05] -rotate-12 w-32 h-32 pointer-events-none">
                <Icon1 className="w-full h-full" />
            </div>
            <div className="absolute bottom-10 right-4 text-[#8CE600] opacity-[0.12] dark:opacity-[0.05] rotate-12 w-40 h-40 pointer-events-none">
                <Icon2 className="w-full h-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <Reveal>
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">{t('index.sports.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 transition-colors">{t('index.sports.subtitle')}</p>
                        </div>
                        <Link
                            to="/catalog"
                            id="sports-view-all"
                            className="hidden sm:flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#8CE600] dark:text-gray-400 dark:hover:text-[#8CE600] transition-colors"
                        >
                            {t('index.sports.viewAll')}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SPORTS.map((sport, i) => (
                        <Reveal key={sport.name} delay={i * 100}>
                            <div 
                                className="group cursor-pointer"
                                onClick={() => navigate('/catalog', { state: { selectedSport: sport.name } })}
                            >
                                {/* Wrapper externo: recebe o lift — sem overflow:hidden */}
                                <div className="relative w-full h-72 mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                                    {/* Sombra numa camada própria */}
                                    <div className="absolute inset-0 rounded-3xl transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-gray-200/40 dark:group-hover:shadow-black/40 pointer-events-none" />
                                    {/* clip-path em vez de overflow:hidden — não sofre com o bug de GPU */}
                                    <div
                                        className="relative w-full h-full rounded-3xl bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                                        style={{ clipPath: 'inset(0 round 1.5rem)' }}
                                    >
                                        <img
                                            src={sport.img}
                                            alt={sport.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                            style={{ willChange: 'transform' }}
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm">
                                            {sport.tag}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-3 px-1">
                                    <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white transition-colors group-hover:text-[#8CE600] mb-1">{sport.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {sport.courts} {t('index.hero.stats.courts')}
                                        </p>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8CE600] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
                                            {t('index.hero.explore')}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
