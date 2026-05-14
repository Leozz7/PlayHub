import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { SPORT_ICONS } from '@/components/SportIconsMap';

export default function NotFound() {
    const { t } = useTranslation();

    const Icon1 = SPORT_ICONS[0];
    const Icon2 = SPORT_ICONS[1];
    const Icon3 = SPORT_ICONS[2];

    return (
        <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-500 flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center relative overflow-hidden py-32">
                {/* Decorative Background Icons */}
                <div className="absolute top-20 left-10 text-[#8CE600] opacity-[0.05] dark:opacity-[0.03] -rotate-12 w-48 h-48 pointer-events-none animate-pulse">
                    <Icon1 className="w-full h-full" />
                </div>
                <div className="absolute bottom-20 right-10 text-[#8CE600] opacity-[0.05] dark:opacity-[0.03] rotate-12 w-64 h-64 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>
                    <Icon2 className="w-full h-full" />
                </div>
                <div className="absolute top-1/2 left-3/4 text-[#8CE600] opacity-[0.05] dark:opacity-[0.03] rotate-45 w-32 h-32 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}>
                    <Icon3 className="w-full h-full" />
                </div>

                <div className="max-w-2xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
                    <Reveal>
                        <div className="relative">
                            <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 leading-none select-none">
                                404
                            </h1>
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#8CE600]/20 to-transparent blur-3xl -z-10 rounded-full" />
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white mt-4 mb-6">
                            {t('notFound.subtitle')}
                        </h2>
                    </Reveal>

                    <Reveal delay={200}>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-normal leading-relaxed mb-10 max-w-lg">
                            {t('notFound.description')}
                        </p>
                    </Reveal>

                    <Reveal delay={300}>
                        <Link 
                            to="/" 
                            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#8CE600] text-gray-950 font-black uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#8CE600]/20 gap-3 group"
                        >
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {t('notFound.backHome')}
                        </Link>
                    </Reveal>
                </div>
            </main>

            <Footer />
        </div>
    );
}



