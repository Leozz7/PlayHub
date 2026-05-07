import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Shield,
  Bell,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Save,
  Phone as PhoneIcon,
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { api } from '@/lib/api';


function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return `${parts[0].charAt(0)}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''}`.toUpperCase();
}

function getRoleBadge(role?: string, t?: any) {
  switch (role?.toLowerCase()) {
    case 'admin':    return { label: t('userProfile.role.admin'), className: 'bg-red-500/10 text-red-500 border-red-500/20' };
    case 'manager':  return { label: t('userProfile.role.manager'), className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    default:         return { label: t('userProfile.role.athlete'), className: 'bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border-[#8CE600]/20' };
  }
}

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

const formatCpf = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};


type FeedbackType = 'success' | 'error' | null;
interface Feedback { type: FeedbackType; message: string }

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback.type) return null;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
      feedback.type === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400'
    }`}>
      {feedback.type === 'success'
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {feedback.message}
    </div>
  );
}


function PasswordInput({
  id, label, value, onChange, placeholder, hint,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}


function PasswordStrength({ password, t }: { password: string, t: any }) {
  if (!password) return null;

  const checks = [
    { label: t('userProfile.passwordStrength.checks.length'), ok: password.length >= 8 },
    { label: t('userProfile.passwordStrength.checks.upper'), ok: /[A-Z]/.test(password) },
    { label: t('userProfile.passwordStrength.checks.number'), ok: /\d/.test(password) },
    { label: t('userProfile.passwordStrength.checks.special'), ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-[#8CE600]', 'bg-[#8CE600]'];
  const labels = ['', t('userProfile.passwordStrength.weak'), t('userProfile.passwordStrength.fair'), t('userProfile.passwordStrength.good'), t('userProfile.passwordStrength.strong')];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : 'bg-gray-200 dark:bg-white/[0.08]'}`} />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-[11px] font-bold ${score >= 3 ? 'text-[#6aad00] dark:text-[#8CE600]' : score === 2 ? 'text-amber-500' : 'text-red-500'}`}>
          {labels[score]}
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${c.ok ? 'bg-[#8CE600]' : 'bg-gray-200 dark:bg-white/[0.08]'}`}>
              {c.ok && <CheckCircle2 className="w-2.5 h-2.5 text-gray-950" />}
            </div>
            <span className={`text-[10px] font-medium ${c.ok ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function SectionCard({ title, subtitle, icon: Icon, children, iconColor = 'text-[#8CE600]', iconBg = 'bg-[#8CE600]/10', iconBorder = 'border-[#8CE600]/20' }: {
  title: string; subtitle?: string; icon: React.ElementType; children: React.ReactNode;
  iconColor?: string; iconBg?: string; iconBorder?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/10 dark:shadow-black/20 hover:border-gray-200 dark:hover:border-white/[0.08] transition-colors duration-300">
      <div className="px-8 py-6 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-5 bg-gray-50/50 dark:bg-transparent">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} border ${iconBorder} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="px-8 py-8">{children}</div>
    </div>
  );
}


export default function UserProfile() {
  const { t } = useTranslation();
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const roleBadge = getRoleBadge(user?.role, t);
  const initials = getInitials(user?.name);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ? formatPhone(user.phone) : '');
  const [cpf, setCpf] = useState(user?.cpf ? formatCpf(user.cpf) : '');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoFeedback, setInfoFeedback] = useState<Feedback>({ type: null, message: '' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passFeedback, setPassFeedback] = useState<Feedback>({ type: null, message: '' });

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPromo, setNotifPromo] = useState(true);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setInfoFeedback({ type: 'error', message: t('userProfile.feedbacks.nameEmpty') });
      return;
    }
    if (!email.includes('@')) {
      setInfoFeedback({ type: 'error', message: t('userProfile.feedbacks.emailInvalid') });
      return;
    }
    try {
      setInfoLoading(true);
      setInfoFeedback({ type: null, message: '' });
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanCpf = cpf.replace(/\D/g, '');
      await api.put('/users/my-profile', {
        userId: user?.id,
        name,
        email,
        phone: cleanPhone || null,
        cpf: cleanCpf || null
      });

      if (user && token) {
        setAuth({ ...user, name, email, phone: cleanPhone || undefined, cpf: cleanCpf || undefined }, token);
      }
      setInfoFeedback({ type: 'success', message: t('userProfile.feedbacks.updateSuccess') });
    } catch (error) {
      console.error(error);
      setInfoFeedback({ type: 'error', message: t('userProfile.feedbacks.updateError') });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPassFeedback({ type: 'error', message: t('userProfile.feedbacks.currentPassRequired') }); return;
    }
    if (newPassword.length < 8) {
      setPassFeedback({ type: 'error', message: t('userProfile.feedbacks.newPassLength') }); return;
    }
    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', message: t('userProfile.feedbacks.passMismatch') }); return;
    }
    setPassLoading(true);
    setPassFeedback({ type: null, message: '' });
    await new Promise(r => setTimeout(r, 900));
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setPassFeedback({ type: 'success', message: t('userProfile.feedbacks.passSuccess') });
    setPassLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background transition-colors duration-500">
      <div className="pt-28 pb-32 px-4 sm:px-6 max-w-4xl mx-auto space-y-10 relative z-10">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#8CE600] transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('userProfile.back')}
          </button>

          <div className="relative overflow-hidden bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] shadow-xl shadow-gray-200/20 dark:shadow-black/40">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#8CE600]/20 via-[#8CE600]/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8CE600]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-end gap-8 mt-4">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-[#8CE600] to-[#6aad00] flex items-center justify-center text-4xl font-black text-gray-950 shadow-2xl shadow-[#8CE600]/40 select-none transform transition-transform group-hover:scale-105">
                  {initials}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-[2rem] bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  title="Alterar foto de perfil"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" />
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-white truncate">
                    {user?.name ?? t('common.user')}
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${roleBadge.className}`}>
                    {roleBadge.label}
                  </span>
                </div>
                <p className="text-base text-gray-500 dark:text-gray-400 truncate font-medium">{user?.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="w-2 h-2 rounded-full bg-[#8CE600] animate-pulse" />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-wider uppercase">{t('userProfile.idLabel')}: {user?.id?.slice(0, 16) ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>


      <SectionCard
        title={t('userProfile.sections.info.title')}
        subtitle={t('userProfile.sections.info.subtitle')}
        icon={UserIcon}
      >
        <form onSubmit={handleInfoSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('userProfile.labels.fullName')}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('userProfile.placeholders.fullName')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-email" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('userProfile.labels.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('userProfile.placeholders.email')}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400">{t('userProfile.labels.emailHint')}</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-phone" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('userProfile.labels.phone')}
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder={t('userProfile.placeholders.phone')}
                maxLength={15}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400">{t('userProfile.labels.phoneHint')}</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-cpf" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('userProfile.labels.cpf')}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-cpf"
                type="text"
                value={cpf}
                onChange={e => setCpf(formatCpf(e.target.value))}
                placeholder={t('userProfile.placeholders.cpf')}
                maxLength={14}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400">{t('userProfile.labels.cpfHint')}</p>
          </div>

          <FeedbackBanner feedback={infoFeedback} />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={infoLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#8CE600] text-gray-950 rounded-xl text-sm font-black hover:bg-[#7bc400] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#8CE600]/25"
            >
              {infoLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              {infoLoading ? t('userProfile.buttons.saving') : t('userProfile.buttons.save')}
            </button>
          </div>
        </form>
      </SectionCard>



        <SectionCard
        title={t('userProfile.sections.security.title')}
        subtitle={t('userProfile.sections.security.subtitle')}
        icon={Lock}
        iconColor="text-violet-500"
        iconBg="bg-violet-500/10"
        iconBorder="border-violet-500/20"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <PasswordInput
            id="current-password"
            label={t('userProfile.labels.currentPassword')}
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="••••••••"
          />

          <div className="space-y-1.5">
            <PasswordInput
              id="new-password"
              label={t('userProfile.labels.newPassword')}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="••••••••"
            />
            <PasswordStrength password={newPassword} t={t} />
          </div>

          <PasswordInput
            id="confirm-password"
            label={t('userProfile.labels.confirmPassword')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
            hint={confirmPassword && confirmPassword !== newPassword ? t('userProfile.labels.passwordMismatch') : undefined}
          />

          <FeedbackBanner feedback={passFeedback} />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-black hover:bg-violet-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25"
            >
              {passLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Shield className="w-4 h-4" />}
              {passLoading ? t('userProfile.buttons.changing') : t('userProfile.buttons.changePassword')}
            </button>
          </div>
        </form>
      </SectionCard>


        <SectionCard
        title={t('userProfile.sections.notifications.title')}
        subtitle={t('userProfile.sections.notifications.subtitle')}
        icon={Bell}
        iconColor="text-amber-500"
        iconBg="bg-amber-500/10"
        iconBorder="border-amber-500/20"
      >
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-white/[0.05]">
          {[
            {
              id: 'notif-email', label: t('userProfile.notifications.email.label'),
              desc: t('userProfile.notifications.email.desc'),
              value: notifEmail, onChange: setNotifEmail,
            },
            {
              id: 'notif-sms', label: t('userProfile.notifications.sms.label'),
              desc: t('userProfile.notifications.sms.desc'),
              value: notifSms, onChange: setNotifSms,
            },
            {
              id: 'notif-promo', label: t('userProfile.notifications.promo.label'),
              desc: t('userProfile.notifications.promo.desc'),
              value: notifPromo, onChange: setNotifPromo,
            },
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between py-4 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                id={item.id}
                role="switch"
                aria-checked={item.value}
                onClick={() => item.onChange(!item.value)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-all duration-300 ${item.value ? 'bg-[#8CE600]' : 'bg-gray-200 dark:bg-white/[0.1]'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>


        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/10 dark:shadow-black/20">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-transparent">
            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">{t('userProfile.sections.quickAccess.title')}</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {[
            { label: t('userProfile.quickAccessItems.reservations.label'), desc: t('userProfile.quickAccessItems.reservations.desc'), href: '/lz_user/dashboard' },
            { label: t('userProfile.quickAccessItems.settings.label'), desc: t('userProfile.quickAccessItems.settings.desc'), href: '/config' },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.href)}
              className="w-full flex items-center justify-between gap-4 px-8 py-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-left group"
            >
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-[#8CE600] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>


        <div className="bg-red-50/30 dark:bg-[#111] border border-red-200 dark:border-red-900/30 rounded-[2rem] overflow-hidden shadow-lg shadow-red-200/10 dark:shadow-black/20">
          <div className="px-8 py-6 border-b border-red-200 dark:border-red-900/30 flex items-center gap-5 bg-red-50/50 dark:bg-transparent">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-red-600 dark:text-red-400">{t('userProfile.sections.danger.title')}</h2>
              <p className="text-xs text-gray-500 dark:text-red-400/70 mt-1 font-medium">{t('userProfile.sections.danger.subtitle')}</p>
            </div>
          </div>
          <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{t('userProfile.labels.deleteAccount')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('userProfile.labels.deleteAccountDesc')}</p>
          </div>
          <button
            type="button"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {t('userProfile.buttons.deleteAccount')}
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}



