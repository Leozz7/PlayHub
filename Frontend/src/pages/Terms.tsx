import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Terms() {

  return (
    <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 md:py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8">Termos de Uso</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p className="mb-6">Última atualização: 30 de abril de 2026</p>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma PlayHub, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Uso da Plataforma</h2>
            <p>O PlayHub é uma plataforma de agendamento de quadras esportivas. Você concorda em usar a plataforma apenas para fins legais e de maneira que não infrinja os direitos de terceiros, nem restrinja ou iniba o uso e o aproveitamento da plataforma por qualquer outra pessoa.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Reservas e Cancelamentos</h2>
            <p>As reservas feitas através do PlayHub estão sujeitas à disponibilidade. As políticas de cancelamento e reembolso são definidas pelos respectivos proprietários das quadras. É sua responsabilidade revisar estas políticas antes de confirmar uma reserva.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Contas de Usuário</h2>
            <p>Para utilizar certas funcionalidades do PlayHub, você precisará criar uma conta. Você é responsável por manter a confidencialidade das informações da sua conta e senha, e por restringir o acesso ao seu computador ou dispositivo.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}



