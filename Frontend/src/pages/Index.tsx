import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SPORT_ICONS } from '@/components/SportIcons';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { Reveal } from '@/components/ui/Reveal';
import { HomeSearchWidget } from '@/components/HomeSearchWidget';
import { SportCards } from '@/components/SportCards';
import { FeaturedCourts } from '@/components/FeaturedCourts';
import { PaymentMethods } from '@/components/PaymentMethods';
import { STATS, STEPS, TESTIMONIALS } from '@/pages/IndexData';

function useCountUp(target: number, duration = 1500, active = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [active, target, duration]);
    return count;
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const { t } = useTranslation();
    const [active, setActive] = useState(false);
    const count = useCountUp(value, 1500, active);

    return (
        <div 
            ref={el => {
                if (el) {
                    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.5 });
                    obs.observe(el);
                    return () => obs.disconnect();
                }
            }} 
            className="text-left border-l border-gray-100 dark:border-white/10 pl-6 transition-all duration-500"
        >
            <p className="text-3xl font-medium tracking-tight text-gray-900 dark:text-white tabular-nums">
                {count}{suffix}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 font-light tracking-wide italic">
                {t(label)}
            </p>
            <div className="w-4 h-1 bg-[#8CE600] mt-3 rounded-full opacity-60" />
        </div>
    );
}

function MarqueeBanner() {
    const { t } = useTranslation();
    const items = [
        t('index.marquee.item1'),
        t('index.marquee.item2'),
        t('index.marquee.item3'),
        t('index.marquee.item4'),
        t('index.marquee.item5'),
        t('index.marquee.item6'),
    ];

    return (
        <div className="relative w-full bg-[#8CE600]/65 backdrop-blur-md py-2.5 overflow-hidden z-30 transition-all duration-500 border-y border-black/5">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-16 px-8">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-16">
                                <span className="text-gray-950 font-bold text-[10px] tracking-[0.3em]">
                                    {item}
                                </span>
                                <span className="w-1 h-1 bg-gray-950 rounded-full opacity-10" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
      `}</style>
        </div>
    );
}

export function Index() {
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-500">
            <Header />

            <section className="relative h-[95vh] min-h-[700px] flex items-center justify-center z-50">
                <HeroBackground />

                <div className="relative z-40 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
                    <Reveal>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-gray-900 dark:text-white mb-3 pt-6 md:pt-10 leading-tight transition-colors">
                            {(() => {
                                const words = t('index.hero.titleLine1').split(' ');
                                const lastWord = words.pop();
                                return <>{words.join(' ')} <span className="text-[#8CE600]">{lastWord}</span></>;
                            })()}
                            <br />{t('index.hero.titleLine2')}
                        </h1>
                    </Reveal>
                    
                    <Reveal delay={200}>
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-normal mb-5 max-w-2xl mx-auto transition-colors leading-relaxed">
                            {t('index.hero.subtitle')}
                        </p>
                    </Reveal>

                    <Reveal delay={300}>
                        <div className="mb-12 flex items-center justify-center gap-4 opacity-90">
                            <span className="hidden md:block w-12 h-[1px] bg-gradient-to-r from-transparent to-[#8CE600]"></span>
                            <h2 className="text-[#8CE600] font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-center">
                                {t('index.hero.badges')}
                            </h2>
                            <span className="hidden md:block w-12 h-[1px] bg-gradient-to-l from-transparent to-[#8CE600]"></span>
                        </div>
                    </Reveal>

                    <Reveal delay={400} width="w-full max-w-5xl xl:max-w-6xl relative z-50">
                        <HomeSearchWidget onOpenChange={setIsDropdownOpen} />
                    </Reveal>

                    <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mt-10 pt-6 border-t border-gray-100/50 dark:border-white/10/50 w-full max-w-3xl opacity-80">
                        {[[ '50+', t('index.hero.stats.courts')], ['12k+', t('index.hero.stats.bookings')], ['98%', t('index.hero.stats.satisfaction')]].map(([v, l], i) => (
                            <Reveal key={l} delay={600 + (i * 100)} width="w-auto">
                                <div className="flex flex-col items-center gap-1 group">
                                    <span className="text-gray-900 dark:text-white font-black text-3xl tracking-tighter group-hover:scale-110 transition-transform group-hover:text-[#8CE600]">{v}</span>
                                    <span className="text-gray-600 dark:text-gray-400 text-[10px] uppercase font-bold tracking-widest">{l}</span>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

                <div className={`absolute bottom-0 pb-2 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${isDropdownOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <Reveal delay={800} width="w-auto">
                        <div className="flex flex-col items-center gap-2 animate-bounce cursor-pointer" onClick={() => document.getElementById('courts')?.scrollIntoView({ behavior: 'smooth' })}>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-500">{t('index.hero.explore')}</span>
                            <svg className="w-4 h-4 text-[#8CE600]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    </Reveal>
                </div>
            </section>

            <FeaturedCourts />

            <section className="relative py-24 bg-white dark:bg-background transition-colors duration-500 overflow-hidden">
                {(() => {
                    const Icon = SPORT_ICONS[6];
                    return (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8CE600] opacity-[0.08] dark:opacity-[0.04] w-48 h-48 pointer-events-none">
                            <Icon className="w-full h-full" />
                        </div>
                    );
                })()}
                
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                        {STATS.map(s => (
                            <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
                        ))}
                    </div>
                </div>
            </section>

            <MarqueeBanner />

            <SportCards />

            <section id="how-it-works" className="relative py-24 bg-white dark:bg-background transition-colors duration-500 overflow-hidden">
                {(() => {
                    const Icon = SPORT_ICONS[4];
                    return (
                        <div className="absolute bottom-10 left-1/4 text-[#8CE600] opacity-[0.08] dark:opacity-[0.04] -rotate-12 w-48 h-48 pointer-events-none">
                            <Icon className="w-full h-full" />
                        </div>
                    );
                })()}

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="mb-20">
                        <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">{t('index.howItWorks.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 transition-colors">{t('index.howItWorks.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {STEPS.map((step) => (
                            <div key={step.num} className="flex flex-col">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-3xl font-black text-[#8CE600] leading-none">
                                        {step.num}
                                    </span>
                                    <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800" />
                                </div>
                                <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-white transition-colors">
                                    {t(step.title)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed font-light">
                                    {t(step.desc)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PaymentMethods />

            <section className="relative py-24 bg-white dark:bg-background transition-colors duration-500 overflow-hidden">
                {(() => {
                    const Icon = SPORT_ICONS[5];
                    return (
                        <div className="absolute top-1/2 right-4 text-[#8CE600] opacity-[0.12] dark:opacity-[0.05] rotate-12 w-40 h-40 pointer-events-none">
                            <Icon className="w-full h-full" />
                        </div>
                    );
                })()}

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="mb-16">
                        <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">{t('index.testimonials.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 transition-colors">{t('index.testimonials.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t_item) => (
                            <div
                                key={t_item.name}
                                className="group relative flex flex-col p-8 bg-gray-50 dark:bg-background/50 rounded-[2rem] border border-gray-100 dark:border-white/10 transition-all duration-300 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/30 overflow-hidden isolation-isolate transform-gpu"
                            >
                                <div className="flex items-center gap-1 mb-6 text-[#8CE600]">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 font-light italic">
                                    "{t(t_item.text)}"
                                </p>

                                <div className="mt-auto flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                                    <div className="w-10 h-10 rounded-2xl bg-[#8CE600] text-gray-950 flex items-center justify-center text-xs font-black shadow-lg shadow-[#8CE600]/20 shrink-0">
                                        {t_item.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors group-hover:text-[#8CE600]">{t_item.name}</p>
                                        <p className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-widest font-medium">{t(t_item.role)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-24 bg-white dark:bg-background transition-colors duration-500 overflow-hidden">
                {(() => {
                    const Icon = SPORT_ICONS[0];
                    return (
                        <div className="absolute bottom-4 left-4 text-[#8CE600] opacity-[0.12] dark:opacity-[0.05] -rotate-45 w-48 h-48 pointer-events-none">
                            <Icon className="w-full h-full" />
                        </div>
                    );
                })()}

                <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors mb-4">
                        {t('index.cta.title')}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-500 text-sm mb-10 transition-colors font-light">
                        {t('index.cta.subtitle')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link
                            to="/register"
                            id="cta-final-register"
                            className="text-sm font-black uppercase tracking-widest text-[#8CE600] hover:opacity-70 transition-all"
                        >
                            {t('index.cta.createAccount')}
                        </Link>
                        <Link
                            to="/catalog"
                            id="cta-final-catalog"
                            className="text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all"
                        >
                            {t('index.cta.viewSports')}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}



