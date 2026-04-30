import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { SPORT_ICONS } from '@/components/SportIcons';

export default function Contact() {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 5000); // Reset after 5s
        }, 1500);
    };

    const Icon1 = SPORT_ICONS[0];
    const Icon2 = SPORT_ICONS[4];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-500 flex flex-col">
            <Header />

            {/* Cabeçalho da página */}
            <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800">
                <div className="absolute top-10 left-10 text-[#8CE600] opacity-[0.05] dark:opacity-[0.03] -rotate-12 w-48 h-48 pointer-events-none">
                    <Icon1 className="w-full h-full" />
                </div>
                <div className="absolute bottom-10 right-10 text-[#8CE600] opacity-[0.05] dark:opacity-[0.03] rotate-12 w-64 h-64 pointer-events-none">
                    <Icon2 className="w-full h-full" />
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <Reveal>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-6">
                            {t('contact.title')}
                        </h1>
                    </Reveal>
                    <Reveal delay={100}>
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto">
                            {t('contact.subtitle')}
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Formulário e Informações de Contato */}
            <section className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    
                    <Reveal delay={200} width="w-full">
                        <div className="flex flex-col gap-12">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter mb-8">{t('contact.infoTitle')}</h2>
                                
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 text-[#8CE600]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">E-mail</p>
                                            <a href="mailto:contato@playhub.com.br" className="text-lg font-medium hover:text-[#8CE600] transition-colors">contato@playhub.com.br</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 text-[#8CE600]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">WhatsApp</p>
                                            <a href="tel:+5511999999999" className="text-lg font-medium hover:text-[#8CE600] transition-colors">+55 (11) 99999-9999</a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 text-[#8CE600]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Localização</p>
                                            <p className="text-lg font-medium">São Paulo, SP - Brasil</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={300} width="w-full">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-black/20">
                            <h2 className="text-2xl font-black tracking-tighter mb-8">{t('contact.formTitle')}</h2>
                            
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('contact.nameLabel')}</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8CE600] focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        placeholder="João Silva"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('contact.emailLabel')}</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8CE600] focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        placeholder="joao@exemplo.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('contact.subjectLabel')}</label>
                                    <input 
                                        type="text" 
                                        id="subject" 
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8CE600] focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        placeholder="Dúvida sobre reservas"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{t('contact.messageLabel')}</label>
                                    <textarea 
                                        id="message" 
                                        rows={4}
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8CE600] focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                                        placeholder="Escreva sua mensagem aqui..."
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full mt-2 py-4 rounded-2xl bg-[#8CE600] text-gray-950 font-black uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#8CE600]/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                                    ) : t('contact.submitBtn')}
                                </button>

                                {isSuccess && (
                                    <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium text-center animate-in fade-in slide-in-from-bottom-2">
                                        {t('contact.successMessage')}
                                    </div>
                                )}
                            </form>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}
