import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
}




