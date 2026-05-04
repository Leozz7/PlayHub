import { Outlet } from 'react-router-dom';
import { GestorSidebar } from '@/components/GestorSidebar';

/**
 * Layout base para todas as rotas do painel do gestor de quadras.
 * Renderiza a sidebar fixa à esquerda e o conteúdo da rota filha via <Outlet />.
 */
export default function GestorLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden">
      <GestorSidebar />
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
}




