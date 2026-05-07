import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">{t('privacy.title')}</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p className="mb-6">{t('privacy.lastUpdate')}</p>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.sections.collection.title')}</h2>
            <p>{t('privacy.sections.collection.text')}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.sections.usage.title')}</h2>
            <p>{t('privacy.sections.usage.text')}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.sections.sharing.title')}</h2>
            <p>{t('privacy.sections.sharing.text')}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.sections.security.title')}</h2>
            <p>{t('privacy.sections.security.text')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}



