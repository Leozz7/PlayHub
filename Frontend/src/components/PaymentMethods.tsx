import { Reveal } from '@/components/ui/Reveal';
import { useTranslation } from 'react-i18next';

export function PaymentMethods() {
    const { t } = useTranslation();

    return (
        <section className="relative py-12 bg-gray-50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800 transition-colors duration-500 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <Reveal>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500 mb-8">
                        {t('index.paymentMethods.title')}
                    </p>
                </Reveal>
                
                <Reveal delay={200}>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-70 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
                        
                        {/* PIX */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <div className="w-6 h-6 rounded-md overflow-hidden group-hover:scale-110 transition-transform flex items-center justify-center">
                                <img src="/assets/pix.png" alt="Pix" className="w-full h-full object-cover " />
                            </div>
                            <span className="font-black text-xl text-gray-900 dark:text-white tracking-tighter">pix</span>
                        </div>

                        {/* VISA */}
                        <div className="flex items-center group cursor-default">
                            <span className="font-black italic text-2xl text-[#1434CB] dark:text-white group-hover:scale-110 transition-transform tracking-tighter">VISA</span>
                        </div>

                        {/* MASTERCARD */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <div className="relative w-10 h-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <div className="absolute left-0 w-6 h-6 bg-[#EB001B] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-90" />
                                <div className="absolute right-0 w-6 h-6 bg-[#F79E1B] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-90" />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white tracking-tight text-lg">mastercard</span>
                        </div>

                        {/* APPLE PAY */}
                        <div className="flex items-center gap-1.5 group cursor-default">
                            <svg className="w-5 h-5 text-gray-900 dark:text-white group-hover:scale-110 transition-transform" viewBox="0 0 384 512" fill="currentColor">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                            </svg>
                            <span className="font-semibold text-gray-900 dark:text-white text-lg">Pay</span>
                        </div>

                    </div>
                </Reveal>
            </div>
        </section>
    );
}
