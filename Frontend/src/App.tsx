import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '@/i18n/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { useAuthStore } from '@/data/useAuthStore';

// Lazy Pages
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

// Dashboards
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const GestorDashboard = lazy(() => import('@/pages/gestor/GestorDashboard'));
const UserDashboard = lazy(() => import('@/pages/user/UserDashboard'));

// Utility Components
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-950">
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

  if (user.roles?.some(role => allowedRoles.some(allowedRole => allowedRole.toLowerCase() === role.toLowerCase()))) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="playhub-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <GlobalAuthListener />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
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
              
              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
              </Route>

              {/* Protected Gestor Routes */}
              <Route element={<RoleProtectedRoute allowedRoles={["Manager", "Admin"]} />}>
                <Route path="/gestor/dashboard" element={<GestorDashboard />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<RoleProtectedRoute allowedRoles={["Admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
