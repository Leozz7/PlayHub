import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">{t('terms.title')}</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p className="mb-6">{t('terms.lastUpdate')}</p>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.sections.acceptance.title')}</h2>
            <p>{t('terms.sections.acceptance.text')}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.sections.usage.title')}</h2>
            <p>{t('terms.sections.usage.text')}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.sections.bookings.title')}</h2>
            <p>{t('terms.sections.bookings.text')}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('terms.sections.liability.title')}</h2>
            <p>{t('terms.sections.liability.text')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}



