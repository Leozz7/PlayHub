import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/ui/Reveal';
import { Stars } from '@/components/ui/Stars';
import { SPORT_ICONS } from '@/components/SportIconsMap';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useCourts } from '@/features/courts/hooks/useCourts';

export function FeaturedCourts() {
    const { t } = useTranslation();
    const Icon = SPORT_ICONS[3];

    const { data: pagedData, isLoading, isError } = useCourts({
        pageSize: 4,
        sortBy: 'rating',
        isDescending: true
    });

    const courts = pagedData?.items ?? [];

    return (
        <section id="courts" className="relative py-24 bg-white dark:bg-background transition-colors duration-500 overflow-hidden">
            <div className="absolute top-10 right-1/4 text-[#8CE600] opacity-[0.03] dark:opacity-[0.05] rotate-45 w-48 h-48 pointer-events-none">
                <Icon className="w-full h-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <Reveal>
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">
                                {t('index.featuredCourts.title')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 transition-colors">
                                {t('index.featuredCourts.subtitle')}
                            </p>
                        </div>
                        <Link
                            to="/catalog"
                            className="hidden sm:flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#8CE600] dark:text-gray-400 dark:hover:text-[#8CE600] transition-colors"
                        >
                            {t('index.featuredCourts.viewAll')}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </Reveal>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-100 dark:bg-white/5 rounded-3xl h-72 mb-4" />
                                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">{t('catalog.errorLoadingDesc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {courts.map((court, i) => {
                            return (
                                <Reveal key={court.id} delay={i * 100}>
                                    <div className="group relative block cursor-pointer">
                                        {/* Action Link (Overlay) */}
                                        <Link to={`/courts/${court.id}`} className="absolute inset-0 z-10" aria-label={court.name}>
                                            <span className="sr-only">{t('catalog.viewDetails')}</span>
                                        </Link>

                                        <div className="relative w-full h-72 mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                                            <div className="absolute inset-0 rounded-3xl transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-gray-200/40 dark:group-hover:shadow-black/40 pointer-events-none" />
                                            <div
                                                className="relative w-full h-full rounded-3xl bg-gray-50 dark:bg-background border border-gray-100 dark:border-white/10"
                                                style={{ clipPath: 'inset(0 round 1.5rem)' }}
                                            >
                                                <img
                                                    src={court.imageUrls?.[0] || court.img}
                                                    alt={court.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                                    style={{ willChange: 'transform' }}
                                                />
                                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100 dark:border-white/10 text-gray-900 dark:text-gray-100 shadow-sm">
                                                    {court.neighborhood || court.city}
                                                </div>
                                                {court.badge && (
                                                    <div className="absolute bottom-4 right-4 bg-[#8CE600] text-gray-950 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#8CE600]/20">
                                                        {t(court.badge)}
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 z-20">
                                                    <FavoriteButton courtId={String(court.id)} size="sm" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white transition-colors group-hover:text-[#8CE600] truncate pr-2">{court.name}</h3>
                                            <Stars rating={court.rating ?? 0} />
                                        </div>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 flex items-center gap-1 transition-colors">
                                            <svg className="w-3 h-3 text-[#8CE600] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                                <circle cx="12" cy="9" r="2.5" />
                                            </svg>
                                            <span className="truncate">{court.location}</span>
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-sm">
                                                    <span className="font-bold text-gray-900 dark:text-white">R$ {court.hourlyRate}</span>
                                                    <span className="text-gray-600 dark:text-gray-400"> {t('index.featuredCourts.perHour')}</span>
                                                </p>
                                                {court.oldPrice && (
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 line-through">R$ {court.oldPrice}</p>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8CE600] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                {t('index.featuredCourts.reserve')}
                                            </span>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}



