import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Save, Globe, Mail, Shield, 
  Smartphone, Bell, Moon, Sun, 
  Activity, MonitorSmartphone, Database, AlertTriangle, User, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/ui/theme-provider';
import { StatusModal } from '@/components/ui/PremiumModal';
import { useAuthStore } from '@/data/useAuthStore';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';

export default function AdminConfig() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuthStore();
  const phToast = usePlayHubToast();
  
  const [siteName, setSiteName] = useState('PlayHub');
  const [supportEmail, setSupportEmail] = useState('suporte@playhub.com');
  const [currency, setCurrency] = useState('BRL');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [adminPhone, setAdminPhone] = useState(user?.phone || '');
  const [adminCpf, setAdminCpf] = useState(user?.cpf || '');

  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, status: 'loading' | 'success' | 'error', title: string, message?: string }>({
    isOpen: false,
    status: 'loading',
    title: '',
  });

  const handleSave = () => {
    setIsSaving(true);
    setStatusModal({
      isOpen: true,
      status: 'loading',
      title: t('admin.settings.statusModal.loadingTitle'),
      message: t('admin.settings.statusModal.loadingMsg')
    });

    setTimeout(() => {
      if (user) {
        updateUser({
          ...user,
          phone: adminPhone,
          cpf: adminCpf
        });
      }

      setIsSaving(false);
      setStatusModal({
        isOpen: true,
        status: 'success',
        title: t('admin.settings.statusModal.successTitle'),
        message: t('admin.settings.statusModal.successMsg')
      });
      phToast.success(t('admin.settings.saveSuccess'));
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <Settings className="w-6 h-6" />
            </div>
            {t('admin.settings.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('admin.settings.subtitle')}</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#8CE600] text-gray-950 hover:bg-[#7bc900] font-black px-8 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20 text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
        >
          {isSaving ? (
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> {t('admin.settings.saving')}</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {t('admin.settings.save')}</span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA - GERAL & PERFIL */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.settings.sections.general.title')}</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{t('admin.settings.sections.general.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('admin.settings.sections.general.siteName')}</Label>
                  <Input 
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold px-5 focus-visible:ring-2 focus-visible:ring-[#8CE600]/50 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('admin.settings.sections.general.currency')}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 focus:ring-2 focus:ring-[#8CE600]/50 font-bold transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10 shadow-xl">
                      <SelectItem value="BRL" className="font-semibold py-3 rounded-xl">BRL (R$) - Real Brasileiro</SelectItem>
                      <SelectItem value="USD" className="font-semibold py-3 rounded-xl">USD ($) - Dólar Americano</SelectItem>
                      <SelectItem value="EUR" className="font-semibold py-3 rounded-xl">EUR (€) - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('admin.settings.sections.general.supportEmail')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                      className="h-14 pl-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#8CE600]/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* NOVO: PERFIL DO ADMIN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.settings.sections.profile.title')}</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{t('admin.settings.sections.profile.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('admin.settings.sections.profile.phone')}</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="h-14 pl-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#8CE600]/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('admin.settings.sections.profile.cpf')}</Label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={adminCpf}
                      onChange={e => setAdminCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="h-14 pl-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#8CE600]/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.settings.sections.notifications.title')}</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{t('admin.settings.sections.notifications.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white dark:bg-white/5 shadow-sm rounded-2xl text-gray-500 dark:text-gray-400">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{t('admin.settings.sections.notifications.email')}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{t('admin.settings.sections.notifications.emailDesc')}</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} className="data-[state=checked]:bg-[#8CE600]" />
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white dark:bg-white/5 shadow-sm rounded-2xl text-gray-500 dark:text-gray-400">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{t('admin.settings.sections.notifications.sms')}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{t('admin.settings.sections.notifications.smsDesc')}</p>
                    </div>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} className="data-[state=checked]:bg-[#8CE600]" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* COLUNA DIREITA - SISTEMA E APARÊNCIA */}
        <div className="space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                  <MonitorSmartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.settings.sections.appearance.title')}</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{t('admin.settings.sections.appearance.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${theme === 'light' ? 'border-[#8CE600] bg-[#8CE600]/5' : 'border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}
                >
                  <div className="p-4 bg-white shadow-md rounded-full text-amber-500">
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t('admin.settings.sections.appearance.light')}</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${theme === 'dark' ? 'border-[#8CE600] bg-[#8CE600]/5' : 'border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}
                >
                  <div className="p-4 bg-gray-900 shadow-inner rounded-full text-blue-400">
                    <Moon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>{t('admin.settings.sections.appearance.dark')}</span>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-card border border-red-500/20 rounded-[2.5rem] shadow-xl shadow-black/5 dark:shadow-none relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.settings.sections.danger.title')}</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{t('admin.settings.sections.danger.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" /> {t('admin.settings.sections.danger.maintenance')}
                    </Label>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} className="data-[state=checked]:bg-amber-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{t('admin.settings.sections.danger.maintenanceDesc')}</p>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-black uppercase tracking-widest text-xs transition-all">
                    <Database className="w-4 h-4 mr-2" />
                    {t('admin.settings.sections.danger.clearCache')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
