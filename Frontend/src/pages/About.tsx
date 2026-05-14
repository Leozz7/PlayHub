import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { SPORT_ICONS } from '@/components/SportIconsMap';


function GreenBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[#8CE600]">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {children}
        </span>
    );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-white dark:bg-background border border-gray-100 dark:border-white/10 shadow-lg shadow-gray-100/60 dark:shadow-black/20 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-10 h-10 rounded-2xl bg-[#8CE600]/10 text-[#8CE600] flex items-center justify-center mb-1">
                {icon}
            </div>
            <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">{value}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#8CE600]/10 text-[#8CE600] flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">{title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}


const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
);
const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
);
const CardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);
const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const StarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const BuildingIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
);
const PixIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M7 7l5 5-5 5M17 7l-5 5 5 5" />
    </svg>
);


export default function About() {
    const { t } = useTranslation();

    const Icon1 = SPORT_ICONS[2];
    const Icon2 = SPORT_ICONS[3];
    const Icon3 = SPORT_ICONS[5];
    const Icon4 = SPORT_ICONS[0];

    const userFeatures = [
        { icon: <SearchIcon />, title: t('about.userFeature1Title'), desc: t('about.userFeature1Desc') },
        { icon: <ClockIcon />, title: t('about.userFeature2Title'), desc: t('about.userFeature2Desc') },
        { icon: <CardIcon />, title: t('about.userFeature3Title'), desc: t('about.userFeature3Desc') },
        { icon: <UsersIcon />, title: t('about.userFeature4Title'), desc: t('about.userFeature4Desc') },
    ];

    const managerFeatures = [
        { icon: <ChartIcon />, title: t('about.managerFeature1Title'), desc: t('about.managerFeature1Desc') },
        { icon: <BellIcon />, title: t('about.managerFeature2Title'), desc: t('about.managerFeature2Desc') },
        { icon: <PixIcon />, title: t('about.managerFeature3Title'), desc: t('about.managerFeature3Desc') },
        { icon: <StarIcon />, title: t('about.managerFeature4Title'), desc: t('about.managerFeature4Desc') },
    ];

    const stats = [
        {
            value: '500+', label: t('about.stat1'),
            icon: <BuildingIcon />
        },
        {
            value: '12k+', label: t('about.stat2'),
            icon: <UsersIcon />
        },
        {
            value: '98%', label: t('about.stat3'),
            icon: <StarIcon />
        },
        {
            value: '8', label: t('about.stat4'),
            icon: <SearchIcon />
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-500 flex flex-col">
            <Header />

            {/* Seção Hero */}
            <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden border-b border-gray-100 dark:border-white/10">
                {/* bg sport icons */}
                <div className="absolute top-8 right-8 text-[#8CE600] opacity-[0.06] dark:opacity-[0.04] rotate-12 w-72 h-72 pointer-events-none select-none">
                    <Icon1 className="w-full h-full" />
                </div>
                <div className="absolute bottom-8 left-8 text-[#8CE600] opacity-[0.06] dark:opacity-[0.04] -rotate-12 w-52 h-52 pointer-events-none select-none">
                    <Icon2 className="w-full h-full" />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <Reveal delay={80}>
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.9]">
                            {t('about.heroTitle1')}
                            <span className="text-[#8CE600]"> {t('about.heroTitle2')}</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={160}>
                        <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
                            {t('about.subtitle')}
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Estatísticas rápidas */}
            <section className="py-16 md:py-20 bg-gray-50 dark:bg-background/40 border-b border-gray-100 dark:border-white/10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <Reveal key={s.label} delay={i * 80} width="w-full">
                                <StatCard value={s.value} label={s.label} icon={s.icon} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nossa Missão */}
            <section className="py-24 md:py-36 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <Reveal>
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-6">
                            {t('about.missionTitle')}
                        </h2>
                    </Reveal>
                    <Reveal delay={100}>
                        <p className="text-2xl md:text-4xl font-light leading-relaxed text-gray-900 dark:text-white">
                            "{t('about.missionText')}"
                        </p>
                    </Reveal>
                    <Reveal delay={180}>
                        <p className="mt-8 text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            {t('about.missionComplement')}
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Seção: Para Atletas */}
            <section id="para-atletas" className="py-20 md:py-28 bg-gray-50 dark:bg-background/30 border-y border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Text side */}
                        <Reveal width="w-full">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-4">
                                    {t('about.forUsersEyebrow')}
                                </p>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight">
                                    {t('about.forUsersTitle')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                                    {t('about.forUsersText')}
                                </p>
                                <div className="flex flex-wrap gap-3 mb-10">
                                    {(t('about.forUsersBadges', { returnObjects: true }) as string[]).map((badge: string) => (
                                        <GreenBadge key={badge}>{badge}</GreenBadge>
                                    ))}
                                </div>
                                <Link
                                    to="/register"
                                    id="about-user-cta"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#8CE600] text-gray-950 font-black uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#8CE600]/20"
                                >
                                    {t('about.userCta')}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </Reveal>

                        {/* Feature cards */}
                        <Reveal delay={150} width="w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {userFeatures.map((f, i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-background rounded-3xl p-6 border border-gray-100 dark:border-white/10 shadow-md shadow-gray-100/60 dark:shadow-black/20 hover:-translate-y-1 transition-transform duration-300"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-[#8CE600]/10 text-[#8CE600] flex items-center justify-center mb-4">
                                            {f.icon}
                                        </div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">{f.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Seção: Para Gestores */}
            <section id="para-gestores" className="py-20 md:py-28 overflow-hidden relative">
                {/* bg icon */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 text-[#8CE600] opacity-[0.04] w-[500px] h-[500px] pointer-events-none select-none">
                    <Icon4 className="w-full h-full" />
                </div>

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Feature cards – left on desktop */}
                        <Reveal width="w-full">
                            <div className="bg-gray-950 dark:bg-background rounded-[2.5rem] p-8 md:p-10 border border-gray-900 dark:border-white/10 shadow-2xl shadow-black/30 relative overflow-hidden">
                                {/* Glow */}
                                <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#8CE600] opacity-5 rounded-full blur-3xl pointer-events-none" />

                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-6 relative z-10">
                                    {t('about.forManagersEyebrow')}
                                </p>
                                <div className="flex flex-col gap-6 relative z-10">
                                    {managerFeatures.map((f, i) => (
                                        <FeatureRow key={i} icon={f.icon} title={f.title} desc={f.desc} />
                                    ))}
                                </div>

                                {/* Bottom highlight */}
                                <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between relative z-10">
                                    <span className="text-gray-500 text-xs">{t('about.managerHighlightLabel')}</span>
                                    <span className="text-[#8CE600] font-black text-2xl tracking-tighter">+80%</span>
                                </div>
                            </div>
                        </Reveal>

                        {/* Text side */}
                        <Reveal delay={150} width="w-full">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-4">
                                    {t('about.forManagersSection')}
                                </p>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight">
                                    {t('about.forManagersTitle')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                    {t('about.forManagersText')}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                                    {t('about.forManagersComplement')}
                                </p>
                                <div className="flex flex-wrap gap-3 mb-10">
                                    {(t('about.forManagersBadges', { returnObjects: true }) as string[]).map((badge: string) => (
                                        <span
                                            key={badge}
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                        >
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/register"
                                        id="about-manager-cta"
                                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all border border-gray-800 dark:border-transparent shadow-lg"
                                    >
                                        {t('about.managerCta')}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </Link>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-28 bg-gray-50 dark:bg-background/30 border-y border-gray-100 dark:border-white/10">
                <div className="max-w-5xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-14">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-4">{t('about.diffEyebrow')}</p>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white">{t('about.diffTitle')}</h2>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <ShieldIcon />, title: t('about.diff1Title'), desc: t('about.diff1Desc') },
                            { icon: <ClockIcon />, title: t('about.diff2Title'), desc: t('about.diff2Desc') },
                            { icon: <UsersIcon />, title: t('about.diff3Title'), desc: t('about.diff3Desc') },
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 100} width="w-full">
                                <div className="group bg-white dark:bg-background rounded-3xl p-8 border border-gray-100 dark:border-white/10 shadow-md shadow-gray-100/60 dark:shadow-black/20 hover:-translate-y-2 transition-transform duration-400 h-full text-center flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-3xl bg-[#8CE600]/10 text-[#8CE600] flex items-center justify-center mb-6 group-hover:bg-[#8CE600] group-hover:text-gray-950 transition-colors duration-300">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-28 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8CE600] opacity-[0.04] dark:opacity-[0.03] w-[700px] h-[700px] pointer-events-none select-none">
                    <Icon3 className="w-full h-full" />
                </div>
                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <Reveal>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight">
                            {t('about.joinUsTitle')}
                            <span className="text-[#8CE600]">.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={100}>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
                            {t('about.joinUsText')}
                        </p>
                    </Reveal>
                    <Reveal delay={200}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                id="about-join-user-cta"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#8CE600] text-gray-950 font-black uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#8CE600]/20"
                            >
                                {t('about.ctaUser')}
                            </Link>
                            <Link
                                to="/contact"
                                id="about-join-manager-cta"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-background border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold uppercase tracking-widest text-sm hover:border-[#8CE600] dark:hover:border-[#8CE600] hover:text-[#8CE600] dark:hover:text-[#8CE600] active:scale-[0.98] transition-all"
                            >
                                {t('about.ctaManager')}
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}



