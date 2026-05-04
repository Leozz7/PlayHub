import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Settings, Save, Globe, Mail, Shield, 
  Smartphone, Bell, Moon, Sun, 
  Activity, MonitorSmartphone, Database, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/ui/theme-provider';
import { StatusModal } from '@/components/ui/PremiumModal';

export default function AdminConfig() {
  const { theme, setTheme } = useTheme();
  
  const [siteName, setSiteName] = useState('PlayHub');
  const [supportEmail, setSupportEmail] = useState('suporte@playhub.com');
  const [currency, setCurrency] = useState('BRL');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      title: 'Salvando Configurações',
      message: 'Aguarde um instante enquanto aplicamos as novas diretrizes ao sistema.'
    });

    setTimeout(() => {
      setIsSaving(false);
      setStatusModal({
        isOpen: true,
        status: 'success',
        title: 'Configurações Salvas',
        message: 'Tudo pronto! As alterações foram aplicadas com sucesso em toda a plataforma.'
      });
      toast.success('Configurações salvas com sucesso!');
    }, 1500);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white/10 border border-gray-800 dark:border-white/20 flex items-center justify-center text-white">
              <Settings className="w-6 h-6" />
            </div>
            Configurações do Sistema
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Ajuste os parâmetros globais da plataforma e preferências do painel.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#8CE600] text-gray-950 hover:bg-[#7bc900] font-black px-8 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20 text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
        >
          {isSaving ? (
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> Salvando...</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar Alterações</span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA - GERAL */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Informações Básicas</h2>
                <p className="text-xs text-gray-500">Dados principais de identificação da plataforma.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nome da Plataforma</Label>
                <Input 
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Moeda Padrão</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-[#8CE600]/50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 dark:border-white/10">
                    <SelectItem value="BRL">BRL (R$) - Real Brasileiro</SelectItem>
                    <SelectItem value="USD">USD ($) - Dólar Americano</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">E-mail de Suporte</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className="h-12 pl-11 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Notificações</h2>
                <p className="text-xs text-gray-500">Controle os alertas enviados pelo sistema aos usuários.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#8CE600]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-card shadow-sm rounded-xl text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">E-mails Transacionais</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Enviar confirmações de reserva e alertas por e-mail.</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} className="data-[state=checked]:bg-[#8CE600]" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#8CE600]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-card shadow-sm rounded-xl text-gray-500">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Alertas por SMS / WhatsApp</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Notificar os jogadores via celular. (Requer integração).</p>
                  </div>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} className="data-[state=checked]:bg-[#8CE600]" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* COLUNA DIREITA - SISTEMA E APARÊNCIA */}
        <div className="space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <MonitorSmartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Aparência</h2>
                <p className="text-xs text-gray-500">Tema do painel atual.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-[#8CE600] bg-[#8CE600]/5' : 'border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}
              >
                <div className="p-3 bg-white shadow-sm rounded-full text-amber-500">
                  <Sun className="w-5 h-5" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-900' : 'text-gray-500'}`}>Claro</span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-[#8CE600] bg-[#8CE600]/5' : 'border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}
              >
                <div className="p-3 bg-gray-900 shadow-inner rounded-full text-blue-400">
                  <Moon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>Escuro</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-card border border-red-500/20 rounded-[2rem] p-8 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Zona de Risco</h2>
                <p className="text-xs text-gray-500">Ações críticas do sistema.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Modo de Manutenção
                  </Label>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} className="data-[state=checked]:bg-amber-500" />
                </div>
                <p className="text-xs text-gray-500 font-medium">Bloqueia o acesso de usuários comuns. Apenas administradores poderão entrar no sistema.</p>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                <Button variant="outline" className="w-full h-12 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold">
                  <Database className="w-4 h-4 mr-2" />
                  Limpar Cache do Sistema
                </Button>
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
