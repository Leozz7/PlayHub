import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  LogIn,
  LogOut,
  UserPlus,
  CalendarCheck,
  CalendarX,
  Star,
  Send,
  KeyRound,
  ShieldAlert,
  Wifi,
  Clock,
} from 'lucide-react';

// ─── Ícone wrapper inline para Sonner ─────────────────────────────────────────

function ToastIcon({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  return (
    <div
      className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
      style={{ background: `${color}18` }}
    >
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
  );
}

// ─── Cores do Design System ───────────────────────────────────────────────────

const COLORS = {
  success: '#8CE600',   // verde PlayHub
  error: '#EF4444',     // vermelho
  warning: '#F59E0B',   // âmbar
  info: '#3B82F6',      // azul
  neutral: '#6B7280',   // cinza
} as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlayHubToast() {
  const { t } = useTranslation();

  // ── Autenticação ──

  const loginSuccess = (name?: string) =>
    toast.success(
      name
        ? t('toasts.loginSuccess.titleNamed', { name })
        : t('toasts.loginSuccess.title'),
      {
        description: t('toasts.loginSuccess.desc'),
        icon: <ToastIcon icon={LogIn} color={COLORS.success} />,
        duration: 3000,
      },
    );

  const loginError = (msg?: string) =>
    toast.error(t('toasts.loginError.title'), {
      description: msg || t('toasts.loginError.desc'),
      icon: <ToastIcon icon={ShieldAlert} color={COLORS.error} />,
      duration: 4000,
    });

  const registerSuccess = () =>
    toast.success(t('toasts.registerSuccess.title'), {
      description: t('toasts.registerSuccess.desc'),
      icon: <ToastIcon icon={UserPlus} color={COLORS.success} />,
      duration: 4000,
    });

  const registerError = (msg?: string) =>
    toast.error(t('toasts.registerError.title'), {
      description: msg || t('toasts.registerError.desc'),
      icon: <ToastIcon icon={XCircle} color={COLORS.error} />,
      duration: 4000,
    });

  const logoutSuccess = () =>
    toast(t('toasts.logoutSuccess.title'), {
      description: t('toasts.logoutSuccess.desc'),
      icon: <ToastIcon icon={LogOut} color={COLORS.neutral} />,
      duration: 2500,
    });

  const forgotPasswordSuccess = () =>
    toast.success(t('toasts.forgotPassword.title'), {
      description: t('toasts.forgotPassword.desc'),
      icon: <ToastIcon icon={KeyRound} color={COLORS.success} />,
      duration: 4000,
    });

  // ── Reservas ──

  const bookingConfirmed = (courtName: string) =>
    toast.success(t('toasts.bookingConfirmed.title'), {
      description: t('toasts.bookingConfirmed.desc', { court: courtName }),
      icon: <ToastIcon icon={CalendarCheck} color={COLORS.success} />,
      duration: 5000,
    });

  const bookingCancelled = () =>
    toast(t('toasts.bookingCancelled.title'), {
      description: t('toasts.bookingCancelled.desc'),
      icon: <ToastIcon icon={CalendarX} color={COLORS.warning} />,
      duration: 3500,
    });

  const bookingError = (msg?: string) =>
    toast.error(t('toasts.bookingError.title'), {
      description: msg || t('toasts.bookingError.desc'),
      icon: <ToastIcon icon={XCircle} color={COLORS.error} />,
      duration: 4000,
    });

  const slotAlreadyTaken = () =>
    toast.warning(t('toasts.slotAlreadyTaken.title'), {
      description: t('toasts.slotAlreadyTaken.desc'),
      icon: <ToastIcon icon={Clock} color={COLORS.warning} />,
      duration: 3500,
    });

  // ── Avaliações ──

  const reviewSuccess = () =>
    toast.success(t('toasts.reviewSuccess.title'), {
      description: t('toasts.reviewSuccess.desc'),
      icon: <ToastIcon icon={Star} color={COLORS.success} />,
      duration: 3500,
    });

  const reviewError = (msg?: string) =>
    toast.error(t('toasts.reviewError.title'), {
      description: msg || t('toasts.reviewError.desc'),
      icon: <ToastIcon icon={XCircle} color={COLORS.error} />,
      duration: 4000,
    });

  const reviewLoginRequired = () =>
    toast(t('toasts.reviewLoginRequired.title'), {
      description: t('toasts.reviewLoginRequired.desc'),
      icon: <ToastIcon icon={Info} color={COLORS.info} />,
      duration: 3500,
      action: {
        label: t('details.loginBtn'),
        onClick: () => (window.location.href = '/login'),
      },
    });

  // ── Contato ──

  const contactSuccess = () =>
    toast.success(t('toasts.contactSuccess.title'), {
      description: t('toasts.contactSuccess.desc'),
      icon: <ToastIcon icon={Send} color={COLORS.success} />,
      duration: 4000,
    });

  const contactError = () =>
    toast.error(t('toasts.contactError.title'), {
      description: t('toasts.contactError.desc'),
      icon: <ToastIcon icon={XCircle} color={COLORS.error} />,
      duration: 4000,
    });

  // ── Genéricos ──

  const success = (title: string, description?: string) =>
    toast.success(title, {
      description,
      icon: <ToastIcon icon={CheckCircle2} color={COLORS.success} />,
      duration: 3000,
    });

  const error = (title: string, description?: string) =>
    toast.error(title, {
      description,
      icon: <ToastIcon icon={XCircle} color={COLORS.error} />,
      duration: 4000,
    });

  const warning = (title: string, description?: string) =>
    toast.warning(title, {
      description,
      icon: <ToastIcon icon={AlertTriangle} color={COLORS.warning} />,
      duration: 4000,
    });

  const info = (title: string, description?: string) =>
    toast(title, {
      description,
      icon: <ToastIcon icon={Info} color={COLORS.info} />,
      duration: 3500,
    });

  const networkError = () =>
    toast.error(t('toasts.networkError.title'), {
      description: t('toasts.networkError.desc'),
      icon: <ToastIcon icon={Wifi} color={COLORS.error} />,
      duration: 5000,
    });

  return {
    // Auth
    loginSuccess,
    loginError,
    registerSuccess,
    registerError,
    logoutSuccess,
    forgotPasswordSuccess,
    // Reservas
    bookingConfirmed,
    bookingCancelled,
    bookingError,
    slotAlreadyTaken,
    // Avaliações
    reviewSuccess,
    reviewError,
    reviewLoginRequired,
    // Contato
    contactSuccess,
    contactError,
    // Genéricos
    success,
    error,
    warning,
    info,
    networkError,
  };
}



