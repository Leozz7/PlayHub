import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CalendarCheck, Search, Filter, CheckCircle2, XCircle, Clock,
  MoreHorizontal, Trash2, Calendar, Check, ChevronsUpDown, Eye,
  User, MapPin, CreditCard, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ConfirmDeleteModal, StatusModal } from '@/components/ui/PremiumModal';
import { useReservations, useUpdateReservation, useDeleteReservation, Reservation } from '@/features/reservations/hooks/useReservations';
import { useCourts } from '@/features/courts/hooks/useCourts';

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const [courtFilterSearch, setCourtFilterSearch] = useState('');
  const [isCourtFilterOpen, setIsCourtFilterOpen] = useState(false);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<{ id: string, courtName: string } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, status: 'loading' | 'success' | 'error', title: string, message?: string }>({
    isOpen: false,
    status: 'loading',
    title: '',
  });

  const selectedStatus = searchParams.get('status') || 'all';
  const selectedCourt = searchParams.get('courtId') || 'all';
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 10;

  const { data: courtsData } = useCourts({ pageSize: 100 });
  const courts = courtsData?.items || [];

  const { data: pagedResult, isLoading } = useReservations({
    status: selectedStatus !== 'all' ? Number(selectedStatus) : undefined,
    courtId: selectedCourt !== 'all' ? selectedCourt : undefined,
    pageNumber: page,
    pageSize: pageSize
  });

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const reservations = pagedResult?.items || [];
  const totalPages = pagedResult?.totalPages || 1;

  const updateMutation = useUpdateReservation();
  const deleteMutation = useDeleteReservation();

  const handleStatusChange = (id: string, newStatus: number) => {
    updateMutation.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        setStatusModal({
          isOpen: true,
          status: 'success',
          title: 'Status Atualizado',
          message: 'A reserva foi atualizada com sucesso.'
        });
        toast.success('Status da reserva atualizado!');
      },
      onError: () => {
        setStatusModal({
          isOpen: true,
          status: 'error',
          title: 'Erro ao Atualizar',
          message: 'Não foi possível alterar o status da reserva.'
        });
        toast.error('Erro ao atualizar status da reserva.');
      }
    });
  };

  const handleDelete = (reservation: Reservation) => {
    setReservationToDelete({ id: reservation.id, courtName: reservation.courtName || 'Reserva' });
    setDeleteModalOpen(true);
  };

  const filteredReservations = reservations.filter(r =>
  (r.userName?.toLowerCase().includes(search.toLowerCase()) ||
    r.courtName?.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5"><Clock className="w-3.5 h-3.5 mr-1.5" /> Pendente</Badge>;
      case 2: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border border-[#8CE600]/20 px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirmada</Badge>;
      case 3: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1.5"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancelada</Badge>;
      case 4: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1.5"><CalendarCheck className="w-3.5 h-3.5 mr-1.5" /> Concluída</Badge>;
      default: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-gray-500/10 text-gray-500 border-gray-500/20 px-3 py-1.5">Desconhecido</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <CalendarCheck className="w-6 h-6" />
            </div>
            Gestão de Reservas
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Acompanhe, aprove e gerencie os agendamentos das suas quadras.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Reservas', value: pagedResult?.totalCount || 0, icon: Calendar, color: 'text-blue-500' },
          { label: 'Pendentes', value: reservations.filter(r => r.status === 1).length, icon: Clock, color: 'text-amber-500' },
          { label: 'Confirmadas', value: reservations.filter(r => r.status === 2).length, icon: CheckCircle2, color: 'text-[#8CE600]' },
          { label: 'Canceladas', value: reservations.filter(r => r.status === 3).length, icon: XCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 p-5 rounded-3xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-2xl bg-gray-50 dark:bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por usuário ou quadra..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="w-full md:w-56">
              <Popover open={isCourtFilterOpen} onOpenChange={setIsCourtFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl justify-between px-4 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center overflow-hidden">
                      <Filter className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {selectedCourt === 'all'
                          ? 'Todas as Quadras'
                          : courts.find(c => c.id === selectedCourt)?.name || 'Selecionar Quadra'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 rounded-xl border-gray-100 dark:border-white/10 bg-white dark:bg-card shadow-2xl" align="start">
                  <div className="p-3 border-b border-gray-100 dark:border-white/10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        placeholder="Pesquisar quadra..."
                        value={courtFilterSearch}
                        onChange={(e) => setCourtFilterSearch(e.target.value)}
                        className="h-10 pl-9 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          updateFilters('courtId', 'all');
                          setIsCourtFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${selectedCourt === 'all' ? 'bg-[#8CE600]/10 text-[#8CE600]' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        Todas as Quadras
                        {selectedCourt === 'all' && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div className="my-1.5 h-px bg-gray-100 dark:bg-white/10 mx-2" />
                      {courts
                        .filter(c => c.name.toLowerCase().includes(courtFilterSearch.toLowerCase()))
                        .map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              updateFilters('courtId', c.id);
                              setIsCourtFilterOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors mb-0.5 ${selectedCourt === c.id ? 'bg-[#8CE600]/10 text-[#8CE600]' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            <span className="truncate mr-2">{c.name}</span>
                            {selectedCourt === c.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        ))}
                      {courts.filter(c => c.name.toLowerCase().includes(courtFilterSearch.toLowerCase())).length === 0 && (
                        <div className="py-8 text-center text-xs text-gray-500 font-medium">
                          Nenhuma quadra encontrada
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedStatus} onValueChange={(val) => updateFilters('status', val)}>
                <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-[#8CE600]/50">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 dark:border-white/10">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="1">Pendentes</SelectItem>
                  <SelectItem value="2">Confirmadas</SelectItem>
                  <SelectItem value="3">Canceladas</SelectItem>
                  <SelectItem value="4">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Quadra</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Usuário</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Data e Hora</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Valor</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">Status</TableHead>
                <TableHead className="px-6 py-4 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-48 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                        <CalendarCheck className="w-8 h-8" />
                      </div>
                      <p className="font-bold">Nenhuma reserva encontrada</p>
                      <p className="text-sm">As reservas feitas pelos usuários aparecerão aqui.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredReservations.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors">{r.courtName || 'Quadra Excluída'}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{r.userName || 'Usuário Excluído'}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {new Date(r.startTime).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(r.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} às {new Date(r.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm font-black text-[#8CE600]">
                          R$ {r.totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(r.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingReservation(r)}
                            className="h-8 w-8 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600]">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl p-2">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 pb-2">Alterar Status</DropdownMenuLabel>

                              {r.status !== 2 && (
                                <DropdownMenuItem onClick={() => handleStatusChange(r.id, 2)} className="flex items-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer hover:bg-[#8CE600]/10 hover:text-[#8CE600] transition-colors">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar / Confirmar
                                </DropdownMenuItem>
                              )}

                              {r.status !== 3 && (
                                <DropdownMenuItem onClick={() => handleStatusChange(r.id, 3)} className="flex items-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer hover:bg-amber-500/10 hover:text-amber-500 transition-colors">
                                  <XCircle className="w-3.5 h-3.5" /> Cancelar Reserva
                                </DropdownMenuItem>
                              )}

                              {r.status === 2 && (
                                <DropdownMenuItem onClick={() => handleStatusChange(r.id, 4)} className="flex items-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                                  <CalendarCheck className="w-3.5 h-3.5" /> Marcar como Concluída
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10 my-2" />

                              <DropdownMenuItem
                                onClick={() => handleDelete(r)}
                                className="flex items-center gap-2 text-xs font-bold text-red-500 py-2.5 px-3 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir Registro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Página <span className="font-bold text-gray-900 dark:text-white">{page}</span> de <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 dark:border-white/10"
                onClick={() => updateFilters('page', String(Math.max(1, page - 1)))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 dark:border-white/10"
                onClick={() => updateFilters('page', String(Math.min(totalPages, page + 1)))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!viewingReservation} onOpenChange={(open) => !open && setViewingReservation(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="relative h-32 bg-gradient-to-br from-[#8CE600] to-[#5c9200]">
            <div className="absolute -bottom-8 left-8 p-1 bg-white dark:bg-card rounded-2xl shadow-xl">
              <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#8CE600]">
                <CalendarCheck className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute top-6 right-16">
              {viewingReservation && getStatusBadge(viewingReservation.status)}
            </div>
          </div>

          <div className="pt-14 pb-8 px-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Detalhes da Reserva
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID: {viewingReservation?.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Quadra</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{viewingReservation?.courtName || 'Não disponível'}</p>
                    <p className="text-xs text-gray-500 font-medium">{viewingReservation?.courtId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Usuário</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{viewingReservation?.userName || 'Não disponível'}</p>
                    <p className="text-xs text-gray-500 font-medium">{viewingReservation?.userId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Pagamento</p>
                    <p className="text-sm font-black text-[#8CE600]">R$ {viewingReservation?.totalPrice.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-gray-500 font-medium">PIX / Cartão</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Data</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {viewingReservation && new Date(viewingReservation.startTime).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Horário</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {viewingReservation && new Date(viewingReservation.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} às {viewingReservation && new Date(viewingReservation.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Criada em</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {viewingReservation && new Date(viewingReservation.created).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => setViewingReservation(null)}
                className="bg-gray-900 dark:bg-[#8CE600] text-white dark:text-gray-950 font-bold rounded-xl px-8 h-12 uppercase tracking-widest text-xs hover:opacity-90 transition-all"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Modals */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => reservationToDelete && deleteMutation.mutate(reservationToDelete.id, {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setStatusModal({
              isOpen: true,
              status: 'success',
              title: 'Reserva Excluída',
              message: 'O registro da reserva foi removido permanentemente.'
            });
            toast.success('Reserva excluída com sucesso!');
          },
          onError: () => {
            setDeleteModalOpen(false);
            setStatusModal({
              isOpen: true,
              status: 'error',
              title: 'Erro na Exclusão',
              message: 'Não foi possível remover o registro desta reserva.'
            });
            toast.error('Erro ao excluir reserva.');
          }
        })}
        isLoading={deleteMutation.isPending}
        title="Excluir Reserva?"
        description="Esta ação removerá permanentemente o registro da reserva do sistema."
        itemName={reservationToDelete?.courtName}
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
