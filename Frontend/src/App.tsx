import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '@/i18n/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { useAuthStore } from '@/data/useAuthStore';
import { Toaster } from '@/components/ui/sonner';

// --- Pages (Lazy Loaded) ---
const Index = lazy(() => import('@/pages/Index').then(m => ({ default: m.Index })));
const Catalog = lazy(() => import('@/pages/Catalog'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const CourtsDetails = lazy(() => import('@/pages/CourtsDetails'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const BookingConfirmation = lazy(() => import('@/pages/BookingConfirmation'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));

// --- Dashboards ---
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
const UserDashboard = lazy(() => import('@/pages/user/UserDashboard'));
const UserProfile = lazy(() => import('@/pages/user/UserProfile'));
const UserFavorites = lazy(() => import('@/pages/user/UserFavorites'));
const ConfigUser = lazy(() => import('@/ConfigUser').then(m => ({ default: m.ConfigUser })));

// --- Layouts ---
const LazyUserLayout = lazy(() => import('@/pages/user/UserLayout'));
const LazyGestorLayout = lazy(() => import('@/pages/gestor/GestorLayout'));
const LazyAdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));

// --- Utilities ---
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

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role && allowedRoles.some(allowedRole => allowedRole.toLowerCase() === user.role.toLowerCase())) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

function UserLayoutShell() { return <Suspense fallback={<PageLoader />}><LazyUserLayout /></Suspense>; }
function GestorLayoutShell() { return <Suspense fallback={<PageLoader />}><LazyGestorLayout /></Suspense>; }
function AdminLayoutShell() { return <Suspense fallback={<PageLoader />}><LazyAdminLayout /></Suspense>; }

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="playhub-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <GlobalAuthListener />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/courts/:id" element={<CourtsDetails />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/booking/confirm" element={<BookingConfirmation />} />

              {/* User */}
              <Route element={<ProtectedRoute />}>
                <Route element={<UserLayoutShell />}>
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/lz_user/dashboard" element={<UserDashboard />} />
                  <Route path="/lz_user/profile" element={<UserProfile />} />
                  <Route path="/lz_user/favorites" element={<UserFavorites />} />
                </Route>
                <Route path="/config" element={<ConfigUser />} />
              </Route>

              {/* Manager/Admin */}
              <Route element={<RoleProtectedRoute allowedRoles={["Manager", "Admin"]} />}>
                <Route element={<GestorLayoutShell />}>
                  <Route path="/lz_gestor/dashboard" element={<GestorDashboard />} />
                  <Route path="/lz_gestor/courts" element={<GestorCourt />} />
                  <Route path="/lz_gestor/schedule" element={<GestorSchedule />} />
                </Route>

              </Route>

              {/* Admin Only */}
              <Route element={<RoleProtectedRoute allowedRoles={["Admin"]} />}>
                <Route element={<AdminLayoutShell />}>
                  <Route path="/lz_admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/lz_admin/activity" element={<AdminActivities />} />
                  <Route path="/lz_admin/reports" element={<AdminReport />} />
                  <Route path="/lz_admin/users" element={<AdminUsers />} />
                  <Route path="/lz_admin/courts" element={<AdminCourt />} />
                  <Route path="/lz_admin/bookings" element={<AdminBookings />} />
                  <Route path="/lz_admin/payments" element={<AdminPayments />} />
                  <Route path="/lz_admin/settings" element={<AdminConfig />} />
                  <Route path="/lz_admin/logs" element={<AdminLogs />} />
                  <Route path="/lz_admin/notifications" element={<AdminNotification />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}



