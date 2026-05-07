import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { HeroBackground } from '@/components/ui/HeroBackground';
import logo from '/assets/logo.png';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const phToast = usePlayHubToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { email: data.email, password: data.password, provider: 'email' },
      {
        onSuccess: () => {
          phToast.loginSuccess();
          navigate('/');
        },
        onError: (err: any) => {
          phToast.loginError(err?.response?.data?.message);
        },
      }
    );
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-background transition-colors duration-500">
      <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-background items-center justify-center overflow-hidden border-r border-gray-100 dark:border-white/10">
        <HeroBackground />
        <div className="relative z-10 p-12 max-w-xl text-center">
          <img src={logo} alt="PlayHub" className="h-16 w-auto object-contain mx-auto mb-8" />
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight whitespace-pre-line">
            {t('login.brandingTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
            {t('login.brandingSubtitle')}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {(t('login.badges', { returnObjects: true }) as string[]).map(badge => (
              <span key={badge} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CE600]" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col relative bg-white dark:bg-background">

        <div className="absolute top-4 left-6 z-20">
          <Link to="/" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-background flex items-center justify-center group-hover:bg-[#8CE600] group-hover:text-gray-950 transition-all border border-gray-100 dark:border-white/10 group-hover:border-transparent">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">{t('login.backToHome')}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1.5">
                {t('login.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('login.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {t('login.emailLabel')}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t('login.passwordLabel')}
                  </Label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-[#8CE600] hover:underline uppercase tracking-widest">
                    {t('login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-11 pr-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed pt-2">
                {t('register.termsNotice')}{' '}
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 underline underline-offset-2 hover:text-[#8CE600] transition-colors">{t('register.termsLink')}</Link>
                {' '}{t('footer.institutional.privacy').toLowerCase() === 'privacidade' ? 'e' : (t('footer.institutional.privacy').toLowerCase() === 'privacy' ? 'and' : 'y')}{' '}
                <Link to="/privacy" className="text-gray-600 dark:text-gray-300 underline underline-offset-2 hover:text-[#8CE600] transition-colors">{t('register.privacyLink')}</Link>.
              </p>

              <div className="pt-2">
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
                      {t('login.authenticating')}
                    </span>
                  ) : t('login.submitBtn')}
                </Button>
              </div>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{t('login.or')}</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400 font-medium">
              {t('login.registerPrompt')}{' '}
              <Link to="/register" className="font-bold text-gray-900 dark:text-white hover:text-[#8CE600] dark:hover:text-[#8CE600] transition-colors underline underline-offset-4 decoration-gray-200 dark:decoration-gray-700 hover:decoration-[#8CE600]">
                {t('login.registerLink')}
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}



