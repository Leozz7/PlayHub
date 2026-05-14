import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, CheckCircle2, Building2, Search, ArrowRight, Lock, Unlock, AlertCircle, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ActionModal } from '@/components/ui/PremiumModal';
import { DatePicker } from '@/components/ui/date-picker';
import { useManagementCourts } from '@/features/courts/hooks/useCourts';
import { useReservations } from '@/features/reservations/hooks/useReservations';
import { useAuthStore } from '@/data/useAuthStore';
import { api } from '@/lib/api';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { Input } from '@/components/ui/input';

interface DashboardCourt {
  id: string;
  name: string;
  sport: string;
  openingHour: number;
  closingHour: number;
  mainImageBase64?: string;
  img?: string;
  hourlyRate?: number;
  price?: number;
}

interface DashboardReservation {
  id: string;
  userName?: string;
  userPhone?: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: number;
}

function CourtScheduleModal({ court, isOpen, onClose }: { court: DashboardCourt | null, isOpen: boolean, onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuthStore();
  const phToast = usePlayHubToast();
  const { t, i18n } = useTranslation();
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [slotToBlock, setSlotToBlock] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<DashboardReservation | null>(null);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  
  const dateLocale = i18n.language === 'pt' ? ptBR : i18n.language === 'es' ? es : enUS;

  const { data: reservationsData, isLoading, refetch } = useReservations({
    courtId: court?.id,
    date: format(selectedDate, 'yyyy-MM-dd'), 
    pageSize: 100
  });

  const reservations = reservationsData?.items || [];

  const hours = Array.from(
    { length: (court?.closingHour || 23) - (court?.openingHour || 6) },
    (_, i) => (court?.openingHour || 6) + i
  );

  const handleBlockSlot = async () => {
    if (!user || isBlocking || slotToBlock === null) return;

    setIsBlocking(true);
    try {
      const start = new Date(selectedDate);
      start.setHours(slotToBlock, 0, 0, 0);
      
      const end = new Date(selectedDate);
      end.setHours(slotToBlock + 1, 0, 0, 0);

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
                    {t('gestor.schedule.modal.officialSchedule')}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {court?.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {t('gestor.schedule.modal.manageAvailability')}
                </DialogDescription>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('gestor.schedule.modal.modality')}</p>
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
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('gestor.schedule.modal.selectedDay')}</span>
                <span className="text-base font-black text-[#8CE600] capitalize">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: dateLocale })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 w-full md:w-auto justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8CE600]/20 border border-[#8CE600] shadow-[0_0_8px_rgba(140,230,0,0.3)]" />
                <span className="text-xs font-bold text-gray-500">{t('gestor.schedule.modal.status.free')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                <span className="text-xs font-bold text-gray-500">{t('gestor.schedule.modal.status.occupied')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400/20 border border-gray-400" />
                <span className="text-xs font-bold text-gray-500">{t('gestor.schedule.modal.status.blocked')}</span>
              </div>
            </div>
          </div>

          {/* Grid de Horários */}
          <div className="flex-1 overflow-y-auto p-8 pt-0 scrollbar-none">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-3 border-[#8CE600]/20 border-t-[#8CE600] rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400">{t('gestor.schedule.loading')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hours.map(hour => {
                  const reservation = reservations.find((r: DashboardReservation) => {
                    const resDate = new Date(r.startTime);
                    return resDate.getHours() === hour && r.status !== 3; 
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
                            <p className="text-sm font-bold text-gray-500">{t('gestor.schedule.modal.details.internalUse')}</p>
                            <p className="text-[10px] text-gray-400">Clique para ver detalhes</p>
                          </div>
                        ) : isOccupied ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-black">
                                {reservation.userName?.charAt(0) || 'U'}
                              </div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {reservation.userName || t('gestor.schedule.modal.details.client')}
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
               {t('gestor.schedule.modal.warning')}
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
          title={t('gestor.schedule.modal.blockConfirm.title')}
          description={t('gestor.schedule.modal.blockConfirm.desc', { start: slotToBlock, end: Number(slotToBlock) + 1 })}
          actionText={t('gestor.schedule.modal.blockConfirm.confirm')}
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
                    {selectedReservation?.status === 5 ? t('gestor.schedule.modal.details.blockedTitle') : t('gestor.schedule.modal.details.reservedTitle')}
                  </DialogTitle>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('gestor.schedule.modal.details.opInfo')}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('gestor.schedule.modal.details.time')}</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {selectedReservation && new Date(selectedReservation.startTime).getHours()}:00 – {selectedReservation && new Date(selectedReservation.startTime).getHours() + 1}:00
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('gestor.schedule.modal.details.status')}</p>
                  <p className={`text-sm font-black ${selectedReservation?.status === 5 ? 'text-gray-500' : 'text-red-500'}`}>
                    {selectedReservation?.status === 5 ? t('gestor.schedule.modal.status.blocked') : t('gestor.schedule.modal.status.occupied')}
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
                     <p className="text-sm font-black text-gray-900 dark:text-white">{selectedReservation?.userName || t('gestor.schedule.modal.details.internalUse')}</p>
                     <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-[10px] text-gray-400 font-bold">{t('gestor.schedule.modal.details.responsible')}</p>
                        {selectedReservation?.userPhone && (
                           <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                             <Phone className="w-3 h-3" /> {selectedReservation.userPhone}
                           </p>
                        )}
                     </div>
                   </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-bold">{t('gestor.schedule.modal.details.reservationId')}</span>
                     <span className="text-gray-900 dark:text-white font-mono">{selectedReservation?.id.substring(0, 12)}...</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-bold">{t('gestor.schedule.modal.details.totalValue')}</span>
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
                  {t('gestor.schedule.modal.details.close')}
                </Button>
                
                {selectedReservation?.status === 5 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowReleaseConfirm(true)}
                    className="w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-500/20"
                  >
                    {t('gestor.schedule.modal.details.release')}
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
          title={t('gestor.schedule.modal.releaseConfirm.title')}
          description={t('gestor.schedule.modal.releaseConfirm.desc')}
          actionText={t('gestor.schedule.modal.releaseConfirm.confirm')}
          variant="danger"
          icon={Unlock}
        />
      </DialogContent>
    </Dialog>
  );
}

function CourtCard({ court, onOpenSchedule }: { court: DashboardCourt, onOpenSchedule: () => void }) {
  const { t } = useTranslation();
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('gestor.schedule.card.time')}</p>
            <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#8CE600]" />
              {court.openingHour}h – {court.closingHour}h
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('gestor.schedule.card.price')}</p>
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
          {t('gestor.schedule.card.manageSchedule')}
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
    const [selectedCourt, setSelectedCourt] = useState<DashboardCourt | null>(null);
    const { t } = useTranslation();

    const courts = useMemo(() => pagedData?.items || [], [pagedData?.items]);

    const filteredCourts = useMemo(() => {
        return courts.filter((c: DashboardCourt) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.sport.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courts, searchTerm]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <Clock className="w-6 h-6" />
                        </div>
                        {t('gestor.schedule.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.schedule.subtitle')}</p>
                </div>
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder={t('gestor.schedule.searchPlaceholder')}
                        className="pl-11 h-12 bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[400px] bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : filteredCourts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                        <Building2 className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('gestor.schedule.noCourts')}</h3>
                    <p className="text-gray-500 max-w-sm">{t('gestor.schedule.noCourtsDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCourts.map((court: DashboardCourt) => (
                        <CourtCard
                            key={court.id}
                            court={court}
                            onOpenSchedule={() => setSelectedCourt(court)}
                        />
                    ))}
                </div>
            )}

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
