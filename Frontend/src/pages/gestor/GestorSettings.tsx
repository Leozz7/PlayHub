import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, User, BellRing, Palette, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/data/useAuthStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/ui/theme-provider';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';

export default function GestorSettings() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const phToast = usePlayHubToast();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    emailNotif: true,
    pushNotif: true
  });

  const handleSave = () => {
    setSaving(true);    
    setTimeout(() => {
      if (user) {
        updateUser({
          ...user,
          name: formData.name,
          phone: formData.phone,
          cpf: formData.cpf
        });
      }
      phToast.success(t('gestor.settings.saveSuccess'));
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <Settings className="w-6 h-6" />
            </div>
            {t('gestor.settings.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('gestor.settings.subtitle')}
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-[#8CE600] hover:bg-[#7bc400] text-gray-950 px-8 py-6 rounded-2xl font-black tracking-widest text-xs shadow-lg shadow-[#8CE600]/20 flex items-center gap-2 transition-all hover:scale-105">
          {saving ? (
             <div className="w-4 h-4 border-2 border-gray-950/20 border-t-gray-950 rounded-full animate-spin" />
          ) : <CheckCircle2 className="w-4 h-4" />}
          {saving ? t('gestor.settings.saving') : t('gestor.settings.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-xl shadow-gray-200/20 dark:shadow-black/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('gestor.settings.profile.title')}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('gestor.settings.profile.name')}</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('gestor.settings.profile.email')}</Label>
                <Input disabled value={formData.email} className="h-14 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-base font-bold text-gray-400 cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('gestor.settings.profile.phone')}</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('gestor.settings.profile.cpf')}</Label>
                  <Input value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-xl shadow-gray-200/20 dark:shadow-black/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                  <BellRing className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('gestor.settings.preferences.title')}</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{t('gestor.settings.preferences.emailNotif')}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t('gestor.settings.preferences.emailNotifDesc')}</p>
                  </div>
                  <Switch checked={formData.emailNotif} onCheckedChange={(checked) => setFormData({...formData, emailNotif: checked})} className="data-[state=checked]:bg-[#8CE600]" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{t('gestor.settings.preferences.pushNotif')}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t('gestor.settings.preferences.pushNotifDesc')}</p>
                  </div>
                  <Switch checked={formData.pushNotif} onCheckedChange={(checked) => setFormData({...formData, pushNotif: checked})} className="data-[state=checked]:bg-[#8CE600]" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-xl shadow-gray-200/20 dark:shadow-black/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-lg shadow-violet-500/10">
                  <Palette className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{t('gestor.settings.preferences.theme')}</h2>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${theme === 'light' ? 'border-violet-500 bg-violet-500/10 text-violet-600 shadow-lg shadow-violet-500/20 scale-105' : 'border-gray-100 dark:border-white/5 text-gray-500 hover:border-violet-500/50'}`}
                >
                  {t('gestor.sidebar.lightTheme')}
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${theme === 'dark' ? 'border-violet-500 bg-violet-500/10 text-violet-400 shadow-lg shadow-violet-500/20 scale-105' : 'border-gray-100 dark:border-white/5 text-gray-500 hover:border-violet-500/50'}`}
                >
                  {t('gestor.sidebar.darkTheme')}
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
