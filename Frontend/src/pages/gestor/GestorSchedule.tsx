import { useState, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle2, Building2, Search, ArrowRight, Lock, Unlock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ActionModal } from '@/components/ui/PremiumModal';
import { DatePicker } from '@/components/ui/date-picker';
import { useManagementCourts } from '@/features/courts/hooks/useCourts';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { useAuthStore } from '@/data/useAuthStore';
import { api } from '@/lib/api';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';

// Modal de Agenda da Quadra
function CourtScheduleModal({ court, isOpen, onClose }: { court: any, isOpen: boolean, onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuthStore();
  const phToast = usePlayHubToast();
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [slotToBlock, setSlotToBlock] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  
  // Busca as reservas APENAS da quadra selecionada e do dia selecionado
  const { data: reservationsData, isLoading, refetch } = useReservations({
    courtId: court?.id,
    date: format(selectedDate, 'yyyy-MM-dd'), 
    pageSize: 100
  });

  const reservations = reservationsData?.items || [];

  // Gera os horários de funcionamento da quadra (ex: 6h as 23h)
  const hours = Array.from(
    { length: (court?.closingHour || 23) - (court?.openingHour || 6) },
    (_, i) => (court?.openingHour || 6) + i
  );

  const handleBlockSlot = async () => {
    if (!user || isBlocking || slotToBlock === null) return;

    setIsBlocking(true);
    try {
      const start = new Date(selectedDate);
      // Usamos setUTCHours para alinhar com o sistema de reservas global
      start.setUTCHours(slotToBlock, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setUTCHours(slotToBlock + 1, 0, 0, 0);

      const payload = {
        courtId: court.id,
        userId: user.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalPrice: 0,
        status: 5 // Blocked
      };

      await api.post('/Reservations', payload);
      phToast.success(`Horário das ${slotToBlock}:00 bloqueado com sucesso.`);
      refetch();
      setShowBlockConfirm(false);
      setSlotToBlock(null);
    } catch (error) {
      console.error('Error blocking slot:', error);
      phToast.error("Erro ao bloquear horário.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleReleaseSlot = async () => {
    if (!selectedReservation) return;
    try {
      await api.delete(`/Reservations/${selectedReservation.id}`);
      phToast.success("Horário liberado com sucesso!");
      refetch();
      setShowReleaseConfirm(false);
      setSelectedReservation(null);
    } catch (e) {
      phToast.error("Erro ao liberar horário.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-white dark:bg-[#0a0f1a] border-gray-100 dark:border-white/10 rounded-[2.5rem] p-0 overflow-hidden">
        <div className="flex flex-col h-[85vh] md:h-auto max-h-[90vh]">
          {/* Header */}
          <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-[#8CE600]/10 text-[#8CE600] text-[10px] font-black uppercase tracking-widest rounded-md border border-[#8CE600]/20">
                    Agenda Oficial
                  </span>
                </div>
                <DialogTitle className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {court?.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Gerencie a disponibilidade e visualize as reservas em tempo real.
                </DialogDescription>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Modalidade</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{court?.sport}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-transparent">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <DatePicker 
                value={selectedDate}
                onChange={(val) => setSelectedDate(new Date(val + 'T12:00:00'))}
                className="w-full md:w-56"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dia Selecionado</span>
                <span className="text-base font-black text-[#8CE600] capitalize">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 w-full md:w-auto justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8CE600]/20 border border-[#8CE600] shadow-[0_0_8px_rgba(140,230,0,0.3)]" />
                <span className="text-xs font-bold text-gray-500">Livre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                <span className="text-xs font-bold text-gray-500">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400/20 border border-gray-400" />
                <span className="text-xs font-bold text-gray-500">Bloqueado</span>
              </div>
            </div>
          </div>

          {/* Grid de Horários */}
          <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-none">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-3 border-[#8CE600]/20 border-t-[#8CE600] rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400">Carregando horários...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hours.map(hour => {
                  const reservation = reservations.find((r: any) => {
                    const resDate = new Date(r.startTime);
                    // Usamos getUTCHours() pois salvamos em UTC no backend (setUTCHours)
                    return resDate.getUTCHours() === hour && r.status !== 3; 
                  });

                  const isOccupied = !!reservation;
                  const isBlocked = reservation?.status === 5;
                  const isConfirmed = reservation?.status === 2;

                  return (
                    <div 
                      key={hour} 
                      onClick={() => {
                        if (isOccupied) {
                          setSelectedReservation(reservation);
                        } else {
                          setSlotToBlock(hour);
                          setShowBlockConfirm(true);
                        }
                      }}
                      className={`group flex flex-col p-4 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
                        isBlocked 
                          ? 'bg-gray-100/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 opacity-80 cursor-not-allowed hover:border-gray-400'
                          : isOccupied 
                            ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/20 hover:border-red-500/50 cursor-pointer' 
                            : 'bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 hover:border-[#8CE600] hover:shadow-lg hover:shadow-[#8CE600]/10 cursor-pointer active:scale-95'
                      }`}
                    >
                      {/* Badge Status */}
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                          isBlocked ? 'bg-gray-200 dark:bg-white/10 text-gray-500' :
                          isOccupied ? 'bg-red-500/10 text-red-500' : 'bg-[#8CE600]/10 text-[#8CE600]'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-black">{String(hour).padStart(2, '0')}:00</span>
                        </div>
                        
                        {isBlocked ? (
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                             <Lock className="w-3 h-3" /> Bloqueado
                           </span>
                        ) : isOccupied ? (
                           <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                             {isConfirmed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                             {isConfirmed ? 'Confirmado' : 'Pendente'}
                           </span>
                        ) : (
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#8CE600] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Unlock className="w-3 h-3" /> Bloquear
                           </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        {isBlocked ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-500">Manutenção / Interno</p>
                            <p className="text-[10px] text-gray-400">Clique para ver detalhes</p>
                          </div>
                        ) : isOccupied ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-black">
                                {reservation.userName?.charAt(0) || 'U'}
                              </div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {reservation.userName || 'Cliente'}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold">
                               <span className="text-gray-400">R$ {reservation.totalPrice}</span>
                               <span className="text-[#8CE600] opacity-0 group-hover:opacity-100 transition-opacity">Ver Detalhes →</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm font-black text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Disponível</p>
                            <p className="text-[10px] text-gray-400 font-medium">Clique para bloquear este horário</p>
                          </div>
                        )}
                      </div>

                      {/* Hover background effect */}
                      {!isOccupied && !isBlocked && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#8CE600]/5 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer Warning */}
          <div className="px-8 py-4 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
             <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
             <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
               Alterações na agenda são permanentes. Bloqueios impedem que novos clientes reservem estes horários.
             </p>
          </div>
        </div>

        {/* Modal de Confirmação de Bloqueio */}
        <ActionModal 
          isOpen={showBlockConfirm}
          onClose={() => {
            setShowBlockConfirm(false);
            setSlotToBlock(null);
          }}
          onAction={handleBlockSlot}
          title="Bloquear Horário"
          description={`Você deseja bloquear o horário das ${slotToBlock}:00 às ${Number(slotToBlock) + 1}:00 para manutenção ou uso interno?`}
          actionText="Confirmar Bloqueio"
          variant="premium"
          icon={Lock}
          isLoading={isBlocking}
        />

        {/* Modal de Detalhes da Reserva / Bloqueio */}
        <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
          <DialogContent className="max-w-md bg-white dark:bg-[#0a0f1a] border-gray-100 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedReservation?.status === 5 ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'}`}>
                  {selectedReservation?.status === 5 ? <Lock className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-gray-900 dark:text-white">
                    {selectedReservation?.status === 5 ? 'Horário Bloqueado' : 'Detalhes da Reserva'}
                  </DialogTitle>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Informações Operacionais</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Horário</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {selectedReservation && new Date(selectedReservation.startTime).getUTCHours()}:00 – {selectedReservation && new Date(selectedReservation.startTime).getUTCHours() + 1}:00
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-sm font-black ${selectedReservation?.status === 5 ? 'text-gray-500' : 'text-red-500'}`}>
                    {selectedReservation?.status === 5 ? 'Bloqueado' : 'Reservado'}
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 rounded-full bg-[#8CE600]/10 flex items-center justify-center text-[#8CE600] font-black">
                     {selectedReservation?.userName?.charAt(0) || 'U'}
                   </div>
                   <div>
                     <p className="text-sm font-black text-gray-900 dark:text-white">{selectedReservation?.userName || 'Uso Interno'}</p>
                     <p className="text-[10px] text-gray-400 font-bold">Responsável pela ocupação</p>
                   </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-bold">ID da Reserva:</span>
                     <span className="text-gray-900 dark:text-white font-mono">{selectedReservation?.id.substring(0, 12)}...</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-bold">Valor Total:</span>
                     <span className="text-[#8CE600] font-black">R$ {selectedReservation?.totalPrice || '0,00'}</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedReservation(null)}
                  className="w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest border-gray-200 dark:border-white/10"
                >
                  Fechar Detalhes
                </Button>
                
                {selectedReservation?.status === 5 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowReleaseConfirm(true)}
                    className="w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-500/20"
                  >
                    Liberar Horário
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Liberação */}
        <ActionModal 
          isOpen={showReleaseConfirm}
          onClose={() => setShowReleaseConfirm(false)}
          onAction={handleReleaseSlot}
          title="Liberar Horário"
          description="Você deseja liberar este horário? Ele voltará a ficar disponível para reserva por qualquer cliente."
          actionText="Confirmar Liberação"
          variant="danger"
          icon={Unlock}
        />
      </DialogContent>
    </Dialog>
  );
}

// Componente de Card de Quadra
function CourtCard({ court, onOpenSchedule }: { court: any, onOpenSchedule: () => void }) {
  return (
    <div className="group bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/40 transition-all duration-500 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={court.mainImageBase64 || court.img || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'} 
          alt={court.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-[#8CE600] text-gray-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#8CE600]/20">
            {court.sport}
          </span>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{court.name}</h3>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Horário</p>
            <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#8CE600]" />
              {court.openingHour}h – {court.closingHour}h
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preço/h</p>
            <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <span className="text-[#8CE600]">R$</span> {court.hourlyRate || court.price}
            </p>
          </div>
        </div>

        <Button 
          onClick={onOpenSchedule}
          className="w-full py-6 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#8CE600] dark:hover:bg-[#8CE600] hover:text-gray-950 transition-all group/btn shadow-lg mt-auto"
        >
          <Calendar className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
          Gerenciar Agenda
          <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
        </Button>
      </div>
    </div>
  );
}

// Página Principal
export default function GestorSchedule() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: pagedData, isLoading } = useManagementCourts({ pageSize: 100 });
  const [selectedCourt, setSelectedCourt] = useState<any | null>(null);

  const courts = pagedData?.items || [];
  
  const filteredCourts = useMemo(() => {
    return courts.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.sport.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courts, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Header Section */}
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8CE600]/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#8CE600]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gestão de Disponibilidade</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                Agenda das Quadras
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                Visualize ocupações, confirme reservas pendentes e realize bloqueios estratégicos para manutenção ou uso interno.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8CE600] transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar quadra ou esporte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8CE600] transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredCourts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Nenhuma quadra encontrada</h3>
            <p className="text-gray-500 max-w-sm">
              {searchTerm 
                ? 'Tente ajustar sua busca para encontrar o que procura.' 
                : 'Você ainda não possui quadras vinculadas para gerenciar a agenda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourts.map(court => (
              <CourtCard 
                key={court.id} 
                court={court} 
                onOpenSchedule={() => setSelectedCourt(court)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCourt && (
        <CourtScheduleModal 
          court={selectedCourt} 
          isOpen={!!selectedCourt} 
          onClose={() => setSelectedCourt(null)} 
        />
      )}
    </div>
  );
}
