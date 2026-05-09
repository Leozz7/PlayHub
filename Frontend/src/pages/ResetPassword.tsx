import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { ArrowLeft, Lock } from 'lucide-react';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { api } from '@/lib/api';
import logo from '/assets/logo.png';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phToast = usePlayHubToast();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      phToast.error('Link de recuperação inválido ou incompleto.');
      navigate('/login');
    }
  }, [token, email, navigate, phToast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword: data.password,
      });
      phToast.success('Sua senha foi redefinida com sucesso!');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao redefinir senha.';
      phToast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-background transition-colors duration-500">
      <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-background items-center justify-center overflow-hidden border-r border-gray-100 dark:border-white/10">
        <HeroBackground />
        <div className="relative z-10 p-12 max-w-xl text-center">
          <img src={logo} alt="PlayHub" className="h-16 w-auto object-contain mx-auto mb-8" />
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight whitespace-pre-line">
            Crie sua nova senha
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
            Mantenha sua conta segura com uma senha forte e única.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col relative bg-white dark:bg-background">
        <div className="absolute top-4 left-6 z-20">
          <Link to="/login" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-background flex items-center justify-center group-hover:bg-[#8CE600] group-hover:text-gray-950 transition-all border border-gray-100 dark:border-white/10 group-hover:border-transparent">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">Voltar para Login</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1.5">
                Redefinir Senha
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Digite sua nova senha abaixo.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600]"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-11 bg-gray-50/50 dark:bg-background/50 border-gray-200 dark:border-white/10 h-13 rounded-2xl font-medium transition-all focus:bg-white dark:focus:bg-gray-900 focus-visible:ring-2 focus-visible:ring-[#8CE600]"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 rounded-2xl bg-[#8CE600] hover:bg-[#7bc900] text-gray-950 font-black tracking-widest uppercase text-[11px] shadow-xl transition-all"
                >
                  {isSubmitting ? 'Redefinindo...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
