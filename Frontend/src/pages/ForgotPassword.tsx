import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import { HeroBackground } from '@/components/ui/HeroBackground';
import logo from '/assets/logo.png';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('E-mail inválido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [showDevModal, setShowDevModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = () => {
    setShowDevModal(true);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-background transition-colors duration-500">

      <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-background items-center justify-center overflow-hidden border-r border-gray-100 dark:border-white/10">
        <HeroBackground />
        <div className="relative z-10 p-12 max-w-xl text-center">
          <img src={logo} alt="PlayHub" className="h-16 w-auto object-contain mx-auto mb-8" />
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-tight whitespace-pre-line">
            {t('forgotPassword.brandingTitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
            {t('forgotPassword.brandingSubtitle')}
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
          <Link to="/login" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-background flex items-center justify-center group-hover:bg-[#8CE600] group-hover:text-gray-950 transition-all border border-gray-100 dark:border-white/10 group-hover:border-transparent">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">{t('forgotPassword.backToLogin')}</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1.5">
                {t('forgotPassword.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('forgotPassword.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {t('forgotPassword.emailLabel')}
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

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-13 rounded-2xl bg-[#8CE600] hover:bg-[#7bc900] text-gray-950 font-black tracking-widest uppercase text-[11px] shadow-xl shadow-[#8CE600]/20 hover:shadow-[#8CE600]/30 transition-all active:scale-[0.98]"
                >
                  {t('forgotPassword.submitBtn')}
                </Button>
              </div>
            </form>

            <p className="mt-8 text-sm text-center text-gray-600 dark:text-gray-400 font-medium">
              <Link to="/login" className="font-bold text-gray-900 dark:text-white hover:text-[#8CE600] dark:hover:text-[#8CE600] transition-colors underline underline-offset-4 decoration-gray-200 dark:decoration-gray-700 hover:decoration-[#8CE600]">
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>

          </div>
        </div>
      </div>

      <AlertDialog open={showDevModal} onOpenChange={setShowDevModal}>
        <AlertDialogContent className="rounded-3xl border-gray-100 dark:border-white/10 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
              {t('forgotPassword.underDevelopment.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed pt-2">
              {t('forgotPassword.underDevelopment.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction 
              onClick={() => setShowDevModal(false)}
              className="bg-[#8CE600] hover:bg-[#7bc900] text-gray-950 font-bold px-8 h-12 rounded-2xl transition-all shadow-lg shadow-[#8CE600]/20"
            >
              {t('forgotPassword.underDevelopment.close')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



