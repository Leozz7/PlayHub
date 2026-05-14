import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    CreditCard, Search, CheckCircle2, Clock, XCircle, DollarSign, 
    Activity, Eye, User, Calendar, Hash, Tag, Building2,
    MoreHorizontal, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ConfirmDeleteModal, StatusModal } from '@/components/ui/PremiumModal';
import { usePayments, useProcessPayment, useDeletePayment } from '@/features/payments/hooks/usePayments';

export default function GestorPayments() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language.startsWith('pt') ? 'pt-BR' : i18n.language.startsWith('es') ? 'es-ES' : 'en-US';

    const [searchTerm, setSearchTerm] = useState('');
    interface DashboardPayment {
        id: string;
        amount: number;
        status: number;
        method: number | string;
        created: string;
        userName?: string;
        reservationId?: string;
    }

    interface DashboardPaymentExtended extends DashboardPayment {
        displayId: string;
        clientName: string;
        methodLabel: string;
        statusLabel: string;
        date: string;
        statusCode: number;
    }

    const [selectedPayment, setSelectedPayment] = useState<DashboardPaymentExtended | null>(null);
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

    const { data: paymentsData = [], isLoading } = usePayments();
    
    const processMutation = useProcessPayment();
    const deleteMutation = useDeletePayment();

    const handleProcess = (id: string) => {
        setPaymentToProcess(id);
        setTransactionIdInput('');
        setProcessModalOpen(true);
    };

    const handleDelete = (payment: DashboardPaymentExtended) => {
        setPaymentToDelete({ id: payment.id, amount: payment.amount });
        setDeleteModalOpen(true);
    };



    const payments = useMemo(() => {
        const getMethodText = (method: number | string) => {
            if (!method) return t('gestor.payments.methods.credit');
            if (typeof method === 'string') return method;
            switch (method) {
                case 1: return t('gestor.payments.methods.credit');
                case 2: return t('gestor.payments.methods.debit');
                case 3: return t('gestor.payments.methods.pix');
                case 4: return t('gestor.payments.methods.cash');
                default: return t('gestor.payments.methods.other');
            }
        };

        return paymentsData.map((p: DashboardPayment) => ({
            ...p,
            displayId: p.id.split('-')[0].toUpperCase(),
            clientName: p.userName || 'Usuário Excluído',
            methodLabel: getMethodText(p.method),
            statusLabel: p.status === 2
                ? t('gestor.payments.statusLabels.completed') 
                : p.status === 3
                    ? t('gestor.payments.statusLabels.failed') 
                    : p.status === 4
                        ? t('admin.payments.status.refunded')
                        : t('gestor.payments.statusLabels.pending'),
            date: p.created,
            statusCode: p.status
        })).filter(p => 
            p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.displayId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [paymentsData, searchTerm, t]);

    const stats = useMemo(() => {
        const totalRevenue = paymentsData
            .filter((p: DashboardPayment) => p.status === 2)
            .reduce((acc: number, p: DashboardPayment) => acc + p.amount, 0);
        
        const pendingRevenue = paymentsData
            .filter((p: DashboardPayment) => p.status === 1)
            .reduce((acc: number, p: DashboardPayment) => acc + p.amount, 0);

        const successfulPayments = paymentsData.filter((p: DashboardPayment) => p.status === 2).length;
        const failedPayments = paymentsData.filter((p: DashboardPayment) => p.status === 3 || p.status === 4).length;

        return [
            { label: t('gestor.payments.stats.revenue'), value: `R$ ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-[#8CE600]' },
            { label: t('gestor.payments.stats.pending'), value: `R$ ${pendingRevenue.toLocaleString()}`, icon: Clock, color: 'text-amber-500' },
            { label: t('gestor.payments.stats.successful'), value: successfulPayments, icon: CheckCircle2, color: 'text-blue-500' },
            { label: t('gestor.payments.stats.failed'), value: failedPayments, icon: XCircle, color: 'text-red-500' },
        ];
    }, [paymentsData, t]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        {t('gestor.payments.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.payments.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
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
                <div className="p-6 border-b border-gray-100 dark:border-white/10">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t('gestor.payments.searchPlaceholder')}
                            className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.payments.table.id')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.payments.table.client')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.payments.table.amount')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.payments.table.method')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.payments.table.status')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.payments.table.date')}</TableHead>
                                <TableHead className="px-6 py-4 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-24 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                                                <CreditCard className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold">{t('gestor.payments.noResults')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence>
                                    {payments.map((p: DashboardPaymentExtended) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#8CE600] transition-colors">{p.displayId}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="font-black text-sm text-gray-900 dark:text-white">{p.clientName}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="font-black text-sm text-[#8CE600]">R$ {p.amount.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{p.methodLabel}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${
                                                    p.statusCode === 2 || p.statusCode === 4
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : p.statusCode === 3
                                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {p.statusCode === 2 || p.statusCode === 4 ? (
                                                        <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                    ) : p.statusCode === 3 ? (
                                                        <XCircle className="w-3 h-3 mr-1.5" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 mr-1.5" />
                                                    )}
                                                    {p.statusLabel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {new Date(p.date).toLocaleDateString(locale)}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-medium">
                                                        {new Date(p.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600] transition-all">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-2xl border-gray-100 dark:border-white/10 shadow-xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 py-3">{t('common.actions.title', 'Ações')}</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-gray-50 dark:bg-white/5" />
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                setSelectedPayment(p);
                                                                setIsDetailsOpen(true);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-xl"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                            <span className="font-bold text-xs">{t('common.actions.view', 'Visualizar')}</span>
                                                        </DropdownMenuItem>

                                                        {p.statusCode === 1 && (
                                                            <DropdownMenuItem 
                                                                onClick={() => handleProcess(p.id)}
                                                                className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-xl text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/5"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span className="font-bold text-xs">{t('admin.payments.modal.processTitle')}</span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(p)}
                                                            className="flex items-center gap-2 px-4 py-3 cursor-pointer rounded-xl text-red-500 focus:text-red-500 focus:bg-red-500/5"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="font-bold text-xs">{t('common.actions.delete', 'Excluir')}</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                <DialogContent className="sm:max-w-[550px] rounded-3xl border-none bg-white dark:bg-card p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#8CE600]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <DialogHeader className="p-8 pb-4 relative">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 flex items-center justify-center text-[#8CE600]">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('gestor.payments.modal.detailsTitle')}</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('gestor.payments.modal.detailsDesc')}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="px-8 pb-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('gestor.payments.modal.labels.status')}</p>
                                    <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${
                                        selectedPayment.statusCode === 2 || selectedPayment.statusCode === 4
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : selectedPayment.statusCode === 3
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                        {selectedPayment.status}
                                    </Badge>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('gestor.payments.modal.labels.totalAmount')}</p>
                                    <p className="text-xl font-black text-[#8CE600]">R$ {selectedPayment.amount.toFixed(2).replace('.', ',')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/10 pb-2">{t('gestor.payments.modal.labels.reservationInfo')}</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.arena')}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedPayment.courtName}</p>
                                            <p className="text-[10px] text-gray-500">{selectedPayment.courtSport}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.schedule')}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                {new Date(selectedPayment.startTime).toLocaleDateString(locale)}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {new Date(selectedPayment.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })} – {new Date(selectedPayment.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.client')}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedPayment.userName}</p>
                                            <p className="text-[10px] text-gray-500">{selectedPayment.userEmail}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.cpfPhone')}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedPayment.userCpf || 'N/A'}</p>
                                            <p className="text-[10px] text-gray-500">{selectedPayment.userPhone || t('gestor.clients.notInformed')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.methodId')}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedPayment.method}</p>
                                            <p className="text-[10px] font-mono text-gray-500 truncate max-w-[150px]">{selectedPayment.paymentId}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.date')}</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                {new Date(selectedPayment.created).toLocaleDateString(locale)} {t('common.at')} {new Date(selectedPayment.created).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500">{t('gestor.payments.modal.labels.reservationId')}</p>
                                            <p className="text-[10px] font-mono text-gray-500 break-all">{selectedPayment.reservationId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                {selectedPayment.statusCode === 1 && (
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
                                    className="flex-1 h-12 rounded-2xl border-red-100 dark:border-red-500/10 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/5 order-3 sm:order-2"
                                    onClick={() => {
                                        setIsDetailsOpen(false);
                                        handleDelete(selectedPayment);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> {t('common.actions.delete', 'Excluir')}
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl border-gray-100 dark:border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 order-1 sm:order-3"
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
