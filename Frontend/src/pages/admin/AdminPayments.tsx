import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  CreditCard, Search, Filter, CheckCircle2, XCircle, Clock, 
  MoreHorizontal, Trash2, ArrowUpRight, DollarSign, Wallet,
  Eye, Calendar, User, Hash, Tag, Activity, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDeleteModal, StatusModal } from '@/components/ui/PremiumModal';
import { usePayments, useProcessPayment, useDeletePayment } from '@/features/payments/hooks/usePayments';

export default function AdminPayments() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('pt') ? 'pt-BR' : i18n.language.startsWith('es') ? 'es-ES' : 'en-US';

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const selectedStatus = searchParams.get('status') || 'all';
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string, amount: number } | null>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [paymentToProcess, setPaymentToProcess] = useState<string | null>(null);
  const [transactionIdInput, setTransactionIdInput] = useState('');
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

  const { data: payments = [], isLoading } = usePayments(
    selectedStatus !== 'all' ? { status: Number(selectedStatus) } : undefined
  );

  const processMutation = useProcessPayment();
  const deleteMutation = useDeletePayment();

  const handleProcess = (id: string) => {
    setPaymentToProcess(id);
    setTransactionIdInput('');
    setProcessModalOpen(true);
  };

  const handleDelete = (payment: any) => {
    setPaymentToDelete({ id: payment.id, amount: payment.amount });
    setDeleteModalOpen(true);
  };

  const filteredPayments = payments.filter(p => 
    p.transactionId?.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 1: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5"><Clock className="w-3.5 h-3.5 mr-1.5" /> {t('admin.payments.status.pending')}</Badge>;
      case 2: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-[#8CE600]/10 text-[#6aad00] dark:text-[#8CE600] border border-[#8CE600]/20 px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {t('admin.payments.status.approved')}</Badge>;
      case 3: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1.5"><XCircle className="w-3.5 h-3.5 mr-1.5" /> {t('admin.payments.status.failed')}</Badge>;
      case 4: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1.5"><ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> {t('admin.payments.status.refunded')}</Badge>;
      default: return <Badge className="rounded-full font-black text-[10px] uppercase tracking-widest bg-gray-500/10 text-gray-500 border-gray-500/20 px-3 py-1.5">{t('admin.payments.status.unknown')}</Badge>;
    }
  };

  const getMethodText = (method: number) => {
      switch(method) {
          case 1: return t('admin.payments.methods.credit');
          case 2: return t('admin.payments.methods.debit');
          case 3: return t('admin.payments.methods.pix');
          case 4: return t('admin.payments.methods.cash');
          default: return t('admin.payments.methods.other');
      }
  };

  const totalRevenue = payments.filter(p => p.status === 2).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
              <CreditCard className="w-6 h-6" />
            </div>
            {t('admin.payments.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('admin.payments.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('admin.payments.stats.totalRevenue'), value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'text-[#8CE600]' },
          { label: t('admin.payments.stats.pending'), value: payments.filter(p => p.status === 1).length, icon: Clock, color: 'text-amber-500' },
          { label: t('admin.payments.stats.approved'), value: payments.filter(p => p.status === 2).length, icon: CheckCircle2, color: 'text-blue-500' },
          { label: t('admin.payments.stats.failed'), value: payments.filter(p => p.status === 3 || p.status === 4).length, icon: XCircle, color: 'text-red-500' },
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
              placeholder={t('admin.payments.filters.searchPlaceholder')}
              value={search}
              onChange={(e) => updateFilters('search', e.target.value)}
              className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedStatus} onValueChange={(v) => updateFilters('status', v)}>
              <SelectTrigger className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder={t('admin.payments.filters.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                <SelectItem value="all">{t('admin.payments.filters.allStatus')}</SelectItem>
                <SelectItem value="1">{t('admin.payments.filters.pending')}</SelectItem>
                <SelectItem value="2">{t('admin.payments.filters.approved')}</SelectItem>
                <SelectItem value="3">{t('admin.payments.filters.failed')}</SelectItem>
                <SelectItem value="4">{t('admin.payments.filters.refunded')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.payments.table.id')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.payments.table.transaction')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.payments.table.method')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.payments.table.dateTime')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.payments.table.amount')}</TableHead>
                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('admin.payments.table.status')}</TableHead>
                <TableHead className="px-6 py-4 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                        <Wallet className="w-8 h-8" />
                      </div>
                      <p className="font-bold">Nenhum pagamento encontrado</p>
                      <p className="text-sm">As transações financeiras aparecerão aqui.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredPayments.map((p) => (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="px-6 py-4">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{p.id.split('-')[0].toUpperCase()}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.transactionId ? 'bg-[#8CE600]' : 'bg-amber-400 animate-pulse'}`} />
                          <span className={`text-sm font-black ${p.transactionId ? 'text-gray-900 dark:text-white' : 'text-amber-500 italic font-bold'}`}>
                            {p.transactionId || t('admin.payments.filters.pending')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className="rounded-lg border-gray-200 dark:border-white/10 font-bold text-xs">{getMethodText(p.method)}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {new Date(p.created).toLocaleDateString(locale)}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(p.created).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          R$ {p.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(p.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedPayment(p);
                              setIsDetailsOpen(true);
                            }}
                            className="h-9 w-9 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl p-2">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 pb-2">{t('admin.payments.table.actions')}</DropdownMenuLabel>
                              
                              {p.status === 1 && (
                                <DropdownMenuItem onClick={() => handleProcess(p.id)} className="flex items-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer hover:bg-[#8CE600]/10 hover:text-[#8CE600] transition-colors">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('admin.payments.modal.processTitle')}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10 my-2" />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDelete(p)}
                                className="flex items-center gap-2 text-xs font-bold text-red-500 py-2.5 px-3 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> {t('admin.payments.modal.deleteTitle')}
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
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl border-none bg-white dark:bg-card p-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#8CE600]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 flex items-center justify-center text-[#8CE600]">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('admin.payments.modal.detailsTitle')}</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('admin.payments.modal.detailsDesc')}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedPayment && (
            <div className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('admin.payments.table.status')}</p>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('admin.payments.table.amount')}</p>
                  <p className="text-xl font-black text-[#8CE600]">R$ {selectedPayment.amount.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/10 pb-2">{t('admin.payments.modal.detailsDesc')}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.modal.labels.court')}</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedPayment.courtName || 'N/A'}</p>
                      <p className="text-[10px] text-gray-500">{selectedPayment.courtSport}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.modal.labels.customer')}</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {selectedPayment.userName || 'N/A'}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {selectedPayment.userEmail || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.table.id')}</p>
                      <p className="text-xs font-mono font-medium text-gray-900 dark:text-gray-300 break-all">{selectedPayment.id}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.table.transaction')}</p>
                      <p className={`text-xs font-black ${selectedPayment.transactionId ? 'text-gray-900 dark:text-white' : 'text-amber-500 italic'}`}>
                        {selectedPayment.transactionId || t('admin.payments.filters.pending')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.table.dateTime')}</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-300">
                        {new Date(selectedPayment.created).toLocaleDateString(locale)} {t('common.at')} {new Date(selectedPayment.created).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.table.method')}</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-300">{getMethodText(selectedPayment.method)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.modal.labels.reservationId')}</p>
                      <p className="text-xs font-mono font-medium text-gray-900 dark:text-gray-300 break-all">{selectedPayment.reservationId}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('admin.payments.table.id')}</p>
                      <p className="text-xs font-mono font-medium text-gray-900 dark:text-gray-300 break-all">{selectedPayment.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {selectedPayment.status === 1 && (
                  <Button 
                    className="flex-1 h-12 rounded-xl bg-[#8CE600] text-gray-950 font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all order-2 sm:order-1"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      handleProcess(selectedPayment.id);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> {t('admin.payments.modal.processTitle')}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-red-100 dark:border-red-500/10 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/5 order-3 sm:order-2"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleDelete(selectedPayment);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {t('common.actions.delete', 'Excluir')}
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-gray-100 dark:border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 order-1 sm:order-3"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Process Modal */}
      <Dialog open={processModalOpen} onOpenChange={setProcessModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-card rounded-2xl shadow-2xl">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8CE600]/10 text-[#8CE600] mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">{t('admin.payments.modal.processTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">{t('admin.payments.modal.processDesc')}</p>
            
            <Input 
              value={transactionIdInput}
              onChange={(e) => setTransactionIdInput(e.target.value)}
              placeholder="Ex: PIX123456789"
              className="h-12 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-center font-bold mb-6 focus-visible:ring-[#8CE600]/50"
            />

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="ghost" onClick={() => setProcessModalOpen(false)} className="h-12 font-bold rounded-xl">{t('common.actions.cancel')}</Button>
              <Button 
                disabled={!transactionIdInput || processMutation.isPending}
                onClick={() => {
                  if (paymentToProcess) {
                    processMutation.mutate({ id: paymentToProcess, transactionId: transactionIdInput }, {
                      onSuccess: () => {
                        setProcessModalOpen(false);
                        setStatusModal({
                          isOpen: true,
                          status: 'success',
                          title: t('admin.payments.messages.processSuccessTitle'),
                          message: t('admin.payments.messages.processSuccessMsg')
                        });
                        toast.success(t('admin.payments.toasts.processSuccess'));
                      },
                      onError: () => {
                        setStatusModal({
                          isOpen: true,
                          status: 'error',
                          title: t('admin.payments.messages.processErrorTitle'),
                          message: t('admin.payments.messages.processErrorMsg')
                        });
                        toast.error(t('admin.payments.toasts.processError'));
                      }
                    });
                  }
                }}
                className="h-12 bg-[#8CE600] text-gray-950 font-bold rounded-xl transition-all active:scale-95"
              >
                {processMutation.isPending ? t('common.actions.processing') : t('common.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Modals */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => paymentToDelete && deleteMutation.mutate(paymentToDelete.id, {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setStatusModal({
              isOpen: true,
              status: 'success',
              title: t('admin.payments.messages.deleteSuccessTitle'),
              message: t('admin.payments.messages.deleteSuccessMsg')
            });
            toast.success(t('admin.payments.toasts.deleteSuccess'));
          },
          onError: () => {
            setDeleteModalOpen(false);
            setStatusModal({
              isOpen: true,
              status: 'error',
              title: t('admin.payments.messages.deleteErrorTitle'),
              message: t('admin.payments.messages.deleteErrorMsg')
            });
            toast.error(t('admin.payments.toasts.deleteError'));
          }
        })}
        isLoading={deleteMutation.isPending}
        title={t('admin.payments.messages.deleteConfirmTitle')}
        description={t('admin.payments.messages.deleteConfirmDesc')}
        itemName={paymentToDelete ? `R$ ${paymentToDelete.amount.toFixed(2)}` : undefined}
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
