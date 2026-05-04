import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bell, Search, Filter, Clock, 
  Send, Users, Trash2, Smartphone, Mail, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDeleteModal, StatusModal } from '@/components/ui/PremiumModal';

const MOCK_NOTIFICATIONS = [
  { id: 'NOT-1', title: 'Manutenção Programada', message: 'O sistema ficará indisponível amanhã às 03:00.', type: 'system', audience: 'Todos', date: new Date(Date.now() - 3600000).toISOString(), status: 'sent' },
  { id: 'NOT-2', title: 'Promoção de Inverno', message: 'Ganhe 20% de desconto usando o cupom INVERNO20.', type: 'marketing', audience: 'Usuários Comuns', date: new Date(Date.now() - 86400000).toISOString(), status: 'sent' },
  { id: 'NOT-3', title: 'Atualização de Termos', message: 'Nossos termos de serviço foram atualizados.', type: 'alert', audience: 'Todos', date: new Date(Date.now() - 172800000).toISOString(), status: 'sent' },
  { id: 'NOT-4', title: 'Falha no Servidor de Email', message: 'Emails atrasados nas últimas 2 horas.', type: 'alert', audience: 'Gestores', date: new Date(Date.now() + 86400000).toISOString(), status: 'scheduled' },
];

export default function AdminNotification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const selectedType = searchParams.get('type') || 'all';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newAudience, setNewAudience] = useState('Todos');

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, status: 'loading' | 'success' | 'error', title: string, message?: string }>({
    isOpen: false,
    status: 'loading',
    title: '',
  });

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  const filteredNotifications = MOCK_NOTIFICATIONS.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(search.toLowerCase()) || notif.message.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || notif.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'system': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1.5"><Smartphone className="w-3.5 h-3.5 mr-1.5" /> Sistema</Badge>;
      case 'marketing': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border border-[#8CE600]/20 px-3 py-1.5"><Mail className="w-3.5 h-3.5 mr-1.5" /> Marketing</Badge>;
      case 'alert': return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5"><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Alerta</Badge>;
      default: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-gray-500/10 text-gray-500 border-gray-500/20 px-3 py-1.5">Outro</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'sent') return <Badge className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 rounded-full border-none px-3 font-bold text-[10px] uppercase">Enviada</Badge>;
    if (status === 'scheduled') return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full px-3 font-bold text-[10px] uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Agendada</Badge>;
    return null;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <Bell className="w-6 h-6" />
            </div>
            Central de Notificações
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Envie alertas, campanhas e recados em massa para os usuários da plataforma.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#8CE600] text-gray-950 hover:bg-[#7bc900] font-black px-6 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20">
                    <Send className="w-5 h-5 mr-2" />
                    Nova Notificação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="mb-6">
                    <div className="w-10 h-10 bg-[#8CE600]/10 text-[#8CE600] rounded-xl flex items-center justify-center mb-4">
                        <Send className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight dark:text-white">Enviar Mensagem</h2>
                    <p className="text-sm text-gray-500 mt-1">Defina o público e o conteúdo do aviso.</p>
                        <div className="space-y-2 mt-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Público-Alvo</Label>
                        <Select value={newAudience} onValueChange={setNewAudience}>
                            <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-[#8CE600]/50 text-sm font-bold">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="Selecione o público" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 dark:border-white/10">
                                <SelectItem value="Todos">Todos os Usuários</SelectItem>
                                <SelectItem value="Gestores">Apenas Gestores de Arena</SelectItem>
                                <SelectItem value="Usuários Comuns">Apenas Usuários Comuns</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Título da Notificação</Label>
                        <Input 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-base font-bold focus-visible:ring-[#8CE600]/50" 
                            placeholder="Ex: Atualização Importante" 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mensagem</Label>
                        <Textarea 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm font-medium focus-visible:ring-[#8CE600]/50 min-h-[120px] p-4" 
                            placeholder="Escreva os detalhes aqui..." 
                        />
                    </div>

                    <div className="pt-4 flex gap-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Cancelar</Button>
                        <Button 
                            disabled={!newTitle || !newMessage}
                            onClick={() => {
                                setIsModalOpen(false);
                                setStatusModal({
                                    isOpen: true,
                                    status: 'loading',
                                    title: 'Disparando Notificações',
                                    message: 'Enviando sua mensagem para o público selecionado...'
                                });

                                setTimeout(() => {
                                    setStatusModal({
                                        isOpen: true,
                                        status: 'success',
                                        title: 'Notificações Enviadas',
                                        message: `A mensagem "${newTitle}" foi enviada com sucesso para: ${newAudience}.`
                                    });
                                    setNewTitle('');
                                    setNewMessage('');
                                }, 1500);
                            }} 
                            className="flex-1 h-12 bg-[#8CE600] text-gray-950 hover:bg-[#7bc900] font-bold rounded-xl"
                        >
                            <Send className="w-4 h-4 mr-2" /> Disparar Agora
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou mensagem..."
              value={search}
              onChange={(e) => updateFilters('search', e.target.value)}
              className="pl-11 h-12 bg-white dark:bg-card border-none shadow-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedType} onValueChange={(val) => updateFilters('type', val)}>
              <SelectTrigger className="h-12 bg-white dark:bg-card shadow-sm border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="alert">Alerta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Conteúdo</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Público</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Categoria</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Data e Hora</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Status</TableHead>
                <TableHead className="px-6 py-4 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                        <Bell className="w-8 h-8" />
                      </div>
                      <p className="font-bold">Nenhuma notificação encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredNotifications.map((notif) => (
                    <motion.tr 
                      key={notif.id}
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col max-w-sm">
                          <span className="text-sm font-black text-gray-900 dark:text-white truncate">{notif.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{notif.message}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{notif.audience}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getTypeBadge(notif.type)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {new Date(notif.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(notif.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(notif.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setNotificationToDelete(notif.id);
                            setDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Premium Modals */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          setStatusModal({
            isOpen: true,
            status: 'success',
            title: 'Notificação Removida',
            message: 'O registro da notificação foi excluído permanentemente.'
          });
        }}
        isLoading={false}
        title="Excluir Notificação?"
        description="Esta ação removerá o registro desta notificação do histórico do sistema."
        itemName={notificationToDelete || undefined}
      />

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
