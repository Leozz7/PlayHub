import { Link } from 'react-router-dom';
import { Reveal } from '@/components/ui/Reveal';
import { Stars } from '@/components/ui/Stars';
import { FEATURED_COURTS } from '@/pages/IndexData';
import { CATALOG_COURTS } from '@/pages/CatalogData';
import { SPORT_ICONS } from '@/components/SportIcons';

export function FeaturedCourts() {
    const Icon = SPORT_ICONS[3];

    return (
        <section id="courts" className="relative py-24 bg-white dark:bg-gray-950 transition-colors duration-500 overflow-hidden">
            <div className="absolute top-10 right-1/4 text-[#8CE600] opacity-[0.03] dark:opacity-[0.05] rotate-45 w-48 h-48 pointer-events-none">
                <Icon className="w-full h-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <Reveal>
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">Quadras em Destaque</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 transition-colors">Espaços premium selecionados com infraestrutura completa.</p>
                        </div>
                        <Link
                            to="/catalog"
                            className="hidden sm:flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-[#8CE600] dark:text-gray-400 dark:hover:text-[#8CE600] transition-colors"
                        >
                            Ver todas
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURED_COURTS.map((court, i) => {
                        const courtId = CATALOG_COURTS[i]?.id ?? i + 1;
                        return (
                        <Reveal key={court.name} delay={i * 100}>
                            <Link to={`/courts/${courtId}`} className="group cursor-pointer block">
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
                                            src={court.img}
                                            alt={court.name}
                                            className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                            style={{ willChange: 'transform' }}
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 shadow-sm">
                                            {court.location.split('•')[1]?.trim() || court.location}
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-[#8CE600] text-gray-950 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#8CE600]/20">
                                            {court.badge}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white transition-colors group-hover:text-[#8CE600] truncate pr-2">{court.name}</h3>
                                    <Stars rating={court.rating} />
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 flex items-center gap-1 transition-colors">
                                    <svg className="w-3 h-3 text-[#8CE600] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                        <circle cx="12" cy="9" r="2.5" />
                                    </svg>
                                    <span className="truncate">{court.location}</span>
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-sm">
                                            <span className="font-bold text-gray-900 dark:text-white">{court.price}</span>
                                            <span className="text-gray-600 dark:text-gray-400"> / hora</span>
                                        </p>
                                        {court.oldPrice && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 line-through">{court.oldPrice}</p>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8CE600] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        Reservar →
                                    </span>
                                </div>
                            </Link>
                        </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
