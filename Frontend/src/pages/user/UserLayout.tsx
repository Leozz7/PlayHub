import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/**
 * Layout base para as páginas do usuário comum (atleta).
 * Usa o Header e Footer globais do site — sem sidebar.
 * O conteúdo da rota filha é renderizado via <Outlet />.
 */
export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-background text-gray-900 dark:text-gray-100 antialiased transition-colors duration-500">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}



