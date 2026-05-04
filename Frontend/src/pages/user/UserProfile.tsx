import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';

// --- Helpers ---

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return `${parts[0].charAt(0)}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''}`.toUpperCase();
}

function getRoleBadge(role?: string) {
  switch (role?.toLowerCase()) {
    case 'admin':    return { label: 'Administrador', className: 'bg-red-500/10 text-red-500 border-red-500/20' };
    case 'manager':  return { label: 'Gestor de Quadra', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    default:         return { label: 'Atleta', className: 'bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border-[#8CE600]/20' };
  }
}

// --- Feedback Component ---

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

// --- Password Input ---

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

// --- Password Strength ---

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
    { label: 'Caractere especial', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-[#8CE600]', 'bg-[#8CE600]'];
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

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

// --- Section Card ---

function SectionCard({ title, subtitle, icon: Icon, children, iconColor = 'text-[#8CE600]', iconBg = 'bg-[#8CE600]/10', iconBorder = 'border-[#8CE600]/20' }: {
  title: string; subtitle?: string; icon: React.ElementType; children: React.ReactNode;
  iconColor?: string; iconBg?: string; iconBorder?: string;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} border ${iconBorder} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

// --- Main Component ---

export default function UserProfile() {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const roleBadge = getRoleBadge(user?.role);
  const initials = getInitials(user?.name);

  // State: Informações Básicas
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoFeedback, setInfoFeedback] = useState<Feedback>({ type: null, message: '' });

  // State: Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passFeedback, setPassFeedback] = useState<Feedback>({ type: null, message: '' });

  // State: Notificações
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPromo, setNotifPromo] = useState(true);

  // --- Handlers ---
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setInfoFeedback({ type: 'error', message: 'O nome não pode estar vazio.' });
      return;
    }
    if (!email.includes('@')) {
      setInfoFeedback({ type: 'error', message: 'Insira um e-mail válido.' });
      return;
    }
    setInfoLoading(true);
    setInfoFeedback({ type: null, message: '' });
    // Simula request
    await new Promise(r => setTimeout(r, 900));
    // Atualiza store local
    if (user && token) {
      setAuth({ ...user, name, email }, token);
    }
    setInfoFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    setInfoLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPassFeedback({ type: 'error', message: 'Informe sua senha atual.' }); return;
    }
    if (newPassword.length < 8) {
      setPassFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 8 caracteres.' }); return;
    }
    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', message: 'As senhas não coincidem.' }); return;
    }
    setPassLoading(true);
    setPassFeedback({ type: null, message: '' });
    await new Promise(r => setTimeout(r, 900));
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setPassFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
    setPassLoading(false);
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Voltar
      </button>

      <div className="relative overflow-hidden bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[#8CE600]/8 via-[#8CE600]/4 to-transparent pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[#8CE600] flex items-center justify-center text-2xl font-black text-gray-950 shadow-xl shadow-[#8CE600]/30 select-none">
              {initials}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Alterar foto de perfil"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">
                {user?.name ?? 'Usuário'}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${roleBadge.className}`}>
                {roleBadge.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1 font-mono">ID: {user?.id?.slice(0, 16) ?? '—'}</p>
          </div>
        </div>
      </div>

      // Informações Básicas
      <SectionCard
        title="Informações do Perfil"
        subtitle="Atualize seu nome e endereço de e-mail"
        icon={UserIcon}
      >
        <form onSubmit={handleInfoSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Nome completo
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-email" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600]/50 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400">Alterar o e-mail pode exigir verificação.</p>
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
              {infoLoading ? 'Salvando…' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Segurança / Senha */}
      <SectionCard
        title="Segurança"
        subtitle="Altere sua senha de acesso"
        icon={Lock}
        iconColor="text-violet-500"
        iconBg="bg-violet-500/10"
        iconBorder="border-violet-500/20"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <PasswordInput
            id="current-password"
            label="Senha atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="••••••••"
          />

          <div className="space-y-1.5">
            <PasswordInput
              id="new-password"
              label="Nova senha"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="••••••••"
            />
            <PasswordStrength password={newPassword} />
          </div>

          <PasswordInput
            id="confirm-password"
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
            hint={confirmPassword && confirmPassword !== newPassword ? '⚠️ As senhas não coincidem.' : undefined}
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
              {passLoading ? 'Alterando…' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Notificações */}
      <SectionCard
        title="Notificações"
        subtitle="Escolha como deseja ser notificado"
        icon={Bell}
        iconColor="text-amber-500"
        iconBg="bg-amber-500/10"
        iconBorder="border-amber-500/20"
      >
        <div className="space-y-0 divide-y divide-gray-100 dark:divide-white/[0.05]">
          {[
            {
              id: 'notif-email', label: 'E-mail de confirmação',
              desc: 'Receba confirmações e lembretes de reservas por e-mail',
              value: notifEmail, onChange: setNotifEmail,
            },
            {
              id: 'notif-sms', label: 'SMS',
              desc: 'Alertas via SMS para sua próxima partida',
              value: notifSms, onChange: setNotifSms,
            },
            {
              id: 'notif-promo', label: 'Promoções e novidades',
              desc: 'Ofertas exclusivas e novidades do PlayHub',
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

      {/* Acesso Rápido */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-sm font-black text-gray-900 dark:text-white">Acesso Rápido</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {[
            { label: 'Minhas Reservas', desc: 'Ver histórico e próximas reservas', href: '/lz_user/dashboard' },
            { label: 'Configurações', desc: 'Tema, idioma e preferências', href: '/config' },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.href)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-left group"
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

      {/* Zona de Perigo */}
      <div className="bg-white dark:bg-white/[0.03] border border-red-200 dark:border-red-900/30 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-red-200 dark:border-red-900/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-black text-red-600 dark:text-red-400">Zona de Perigo</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ações irreversíveis — prossiga com cuidado</p>
          </div>
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Excluir conta</p>
            <p className="text-xs text-gray-400 mt-0.5">Remove permanentemente sua conta e todos os dados associados.</p>
          </div>
          <button
            type="button"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </button>
        </div>
      </div>

    </div>
  );
}



