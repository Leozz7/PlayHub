import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { ArrowLeft, User, Mail, Lock, ShieldCheck, Info, CreditCard, Eye, EyeOff } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { HeroBackground } from '@/components/ui/HeroBackground';
import logo from '/assets/logo.png';
import { api } from '@/lib/api';
import { useAuthStore } from '@/data/useAuthStore';

const formatCpf = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const isValidCpf = (cpf: string) => {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

  return true;
};

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const phToast = usePlayHubToast();
  const setAuth = useAuthStore((state) => state.setAuth);

  const registerSchema = z.object({
    firstName: z.string().min(2, t('register.validation.nameMin')),
    lastName: z.string().min(2, t('register.validation.lastNameMin')),
    email: z.string().email(t('register.validation.emailInvalid')),
    password: z.string()
      .min(8, t('register.validation.passwordMin'))
      .regex(/[A-Z]/, t('register.validation.passwordUpper'))
      .regex(/[0-9]/, t('register.validation.passwordNumber')),
    confirmPassword: z.string(),
    cpf: z.string().optional().refine((val) => {
      if (!val || val === "") return true;
      return isValidCpf(val);
    }, {
      message: t('register.validation.cpfInvalid')
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.validation.passwordMismatch'),
    path: ["confirmPassword"],
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf: ''
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        cpf: data.cpf?.replace(/\D/g, '') || null
      };

      const response = await api.post('/auth/register', payload);

      if (response.data?.user) {
        setAuth(response.data.user);
        phToast.registerSuccess();

        if (response.data.user.role === 'Admin' || response.data.user.role === 'Manager') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        phToast.registerSuccess();
        navigate('/login');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      phToast.registerError(err?.response?.data?.message || t('register.validation.genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-background transition-colors duration-500">
      <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-background items-center justify-center overflow-hidden border-r border-gray-100 dark:border-white/10">
        <HeroBackground />
        <div className="relative z-10 p-12 max-w-xl text-center">
          <img src={logo} alt="PlayHub" className="h-16 w-auto object-contain mx-auto mb-8" />
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight whitespace-pre-line">
            {t('register.brandingTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
            {t('register.brandingSubtitle')}
          </p>

          <div className="mt-10 flex flex-col gap-4 text-left">
            {(t('register.steps', { returnObjects: true }) as { n: string, label: string }[]).map(step => (
              <div key={step.n} className="flex items-center gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-gray-100 dark:border-gray-700/50">
                <span className="text-xs font-black text-[#8CE600]">{step.n}</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col relative bg-white dark:bg-background overflow-y-auto">

        <div className="absolute top-4 left-6 z-20">
          <Link to="/" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-background flex items-center justify-center group-hover:bg-[#8CE600] group-hover:text-gray-950 transition-all border border-gray-100 dark:border-white/10 group-hover:border-transparent">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">{t('login.backToHome')}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 pt-24 lg:pt-12">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1.5">
                {t('register.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('register.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('register.nameLabel')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="firstName"
                      placeholder="João"
                      className="pl-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-500 font-medium">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('register.lastNameLabel')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="lastName"
                      placeholder="Silva"
                      className="pl-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                      {...register('lastName')}
                    />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-500 font-medium">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {t('register.emailLabel')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="cpf" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('register.cpfLabel')}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="w-3.5 h-3.5 text-gray-400 hover:text-[#8CE600] transition-colors" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-white dark:bg-gray-800 border-gray-100 dark:border-white/10 shadow-xl max-w-[220px] p-3">
                        <p className="text-[11px] font-medium leading-relaxed text-gray-600 dark:text-gray-300">
                          {t('register.cpfInfo')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cpf"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="pl-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                        onChange={(e) => {
                          const formatted = formatCpf(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    )}
                  />
                </div>
                {errors.cpf && <p className="text-xs text-red-500 font-medium">{errors.cpf.message}</p>}
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('register.securityDivider')}</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('register.passwordLabel')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-11 pr-10 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('register.confirmLabelShort')}
                  </Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-11 pr-10 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                {t('register.termsNotice')}{' '}
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 underline underline-offset-2 hover:text-[#8CE600] transition-colors">{t('register.termsLink')}</Link>
                {' '}{t('footer.institutional.privacy').toLowerCase() === 'privacidade' ? 'e' : (t('footer.institutional.privacy').toLowerCase() === 'privacy' ? 'and' : 'y')}{' '}
                <Link to="/privacy" className="text-gray-600 dark:text-gray-300 underline underline-offset-2 hover:text-[#8CE600] transition-colors">{t('register.privacyLink')}</Link>.
              </p>

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-13 rounded-2xl bg-[#8CE600] hover:bg-[#7bc900] text-gray-950 font-black tracking-widest uppercase text-[11px] shadow-xl shadow-[#8CE600]/20 hover:shadow-[#8CE600]/30 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {t('register.creatingAccount')}
                    </span>
                  ) : t('register.submitBtn')}
                </Button>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{t('login.or')}</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400 font-medium pb-8 lg:pb-0">
              {t('register.loginPrompt')}{' '}
              <Link to="/login" className="font-bold text-gray-900 dark:text-white hover:text-[#8CE600] dark:hover:text-[#8CE600] transition-colors underline underline-offset-4 decoration-gray-200 dark:decoration-gray-700 hover:decoration-[#8CE600]">
                {t('register.loginLink')}
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
