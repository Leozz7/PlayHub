import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '@/i18n/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { useAuthStore } from '@/data/useAuthStore';
import { Toaster } from '@/components/ui/sonner';
import { api } from '@/lib/api';

import { useSignalR } from '@/hooks/useSignalR';

const Index = lazy(() => import('@/pages/Index').then(m => ({ default: m.Index })));
const Catalog = lazy(() => import('@/pages/Catalog'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const CourtsDetails = lazy(() => import('@/pages/CourtsDetails'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const BookingConfirmation = lazy(() => import('@/pages/BookingConfirmation'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminActivities = lazy(() => import('@/pages/admin/AdminActivities'));
const AdminReport = lazy(() => import('@/pages/admin/AdminReport'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCourt = lazy(() => import('@/pages/admin/AdminCourt'));
const AdminBookings = lazy(() => import('@/pages/admin/AdminBookings'));
const GestorCourt = lazy(() => import('@/pages/gestor/GestorCourt'));
const AdminPayments = lazy(() => import('@/pages/admin/AdminPayments'));
const AdminConfig = lazy(() => import('@/pages/admin/AdminConfig'));
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'));
const AdminNotification = lazy(() => import('@/pages/admin/AdminNotification'));
const GestorDashboard = lazy(() => import('@/pages/gestor/GestorDashboard'));
const GestorSchedule = lazy(() => import('@/pages/gestor/GestorSchedule'));
const GestorReservations = lazy(() => import('@/pages/gestor/GestorReservations'));
const GestorReports = lazy(() => import('@/pages/gestor/GestorReports'));
const GestorClients = lazy(() => import('@/pages/gestor/GestorClients'));
const GestorPayments = lazy(() => import('@/pages/gestor/GestorPayments'));
const GestorNotifications = lazy(() => import('@/pages/gestor/GestorNotifications'));
const GestorSettings = lazy(() => import('@/pages/gestor/GestorSettings'));
const UserDashboard = lazy(() => import('@/pages/user/UserDashboard'));
const UserProfile = lazy(() => import('@/pages/user/UserProfile'));
const UserFavorites = lazy(() => import('@/pages/user/UserFavorites'));
const ConfigUser = lazy(() => import('@/pages/user/ConfigUser').then(m => ({ default: m.ConfigUser })));

const LazyUserLayout = lazy(() => import('@/pages/user/UserLayout'));
const LazyGestorLayout = lazy(() => import('@/pages/gestor/GestorLayout'));
const LazyAdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8CE600] border-t-transparent" />
  </div>
);

const GlobalAuthListener = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handleUnauthorized = () => {
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [navigate]);
  return null;
};

const InitialSessionCheck = () => {
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !user) {
        try {
          const response = await api.get('/Auth/me');
          setAuth(response.data);
        } catch (error) {
          console.error("Failed to fetch user session:", error);
          logout();
        }
      }
    };

    fetchUser();
  }, [isAuthenticated, user, setAuth, logout]);

  return null;
};

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && !user) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && !user) return <PageLoader />;

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role && allowedRoles.some(allowedRole => allowedRole.toLowerCase() === user.role.toLowerCase())) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

function UserLayoutShell() { return <Suspense fallback={<PageLoader />}><LazyUserLayout /></Suspense>; }
function GestorLayoutShell() { return <Suspense fallback={<PageLoader />}><LazyGestorLayout /></Suspense>; }
function AdminLayoutShell() { return <Suspense fallback={<PageLoader />}><LazyAdminLayout /></Suspense>; }

export default function App() {
  useSignalR();

  return (
    <ThemeProvider defaultTheme="light" storageKey="playhub-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <GlobalAuthListener />
          <InitialSessionCheck />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/courts/:id" element={<CourtsDetails />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/booking/confirm" element={<BookingConfirmation />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<UserLayoutShell />}>
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/lz_user">
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="favorites" element={<UserFavorites />} />
                  </Route>
                </Route>
                <Route path="/config" element={<ConfigUser />} />
              </Route>

              {/* Rotas do Gestor */}
              <Route path="/lz_gestor" element={<RoleProtectedRoute allowedRoles={["Manager", "Admin"]} />}>
                <Route element={<GestorLayoutShell />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<GestorDashboard />} />
                  <Route path="courts" element={<GestorCourt />} />
                  <Route path="schedule" element={<GestorSchedule />} />
                  <Route path="reservations" element={<GestorReservations />} />
                  <Route path="reports" element={<GestorReports />} />
                  <Route path="clients" element={<GestorClients />} />
                  <Route path="payments" element={<GestorPayments />} />
                  <Route path="notifications" element={<GestorNotifications />} />
                  <Route path="settings" element={<GestorSettings />} />
                </Route>
              </Route>

              {/* Rotas do Admin */}
              <Route path="/lz_admin" element={<RoleProtectedRoute allowedRoles={["Admin"]} />}>
                <Route element={<AdminLayoutShell />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="activity" element={<AdminActivities />} />
                  <Route path="reports" element={<AdminReport />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="courts" element={<AdminCourt />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="settings" element={<AdminConfig />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="notifications" element={<AdminNotification />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}



