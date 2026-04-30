import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Privacy() {

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Política de Privacidade</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p className="mb-6">Última atualização: 30 de abril de 2026</p>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Coleta de Informações</h2>
            <p>Coletamos informações que você nos fornece diretamente, como quando cria uma conta, atualiza seu perfil, usa os recursos interativos dos nossos serviços ou se comunica conosco. Os tipos de informações que podemos coletar incluem seu nome, endereço de e-mail, número de telefone e informações de pagamento.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Uso das Informações</h2>
            <p>Utilizamos as informações que coletamos para fornecer, manter e melhorar nossos serviços, processar transações, enviar avisos técnicos, atualizações, alertas de segurança e mensagens administrativas, bem como para responder a seus comentários e perguntas.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Compartilhamento de Informações</h2>
            <p>Podemos compartilhar suas informações com parceiros que administram as quadras para facilitar suas reservas. Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing sem o seu consentimento explícito.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Segurança</h2>
            <p>Tomamos medidas razoáveis para ajudar a proteger informações sobre você contra perda, roubo, uso indevido, acesso não autorizado, divulgação, alteração e destruição. No entanto, lembre-se de que nenhum sistema de transmissão ou armazenamento de dados na internet é 100% seguro.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
