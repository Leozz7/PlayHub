import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    MapPin, Clock, Calendar, Shield, CheckCircle2,
    ArrowLeft, Undo2, Mail, CreditCard, AlertCircle,
    QrCode, Copy, Check
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { useAuthStore } from '@/data/useAuthStore';
import { api } from '@/lib/api';


export interface BookingConfirmationState {
    court: {
        id: string;
        name: string;
        address: string;
        neighborhood: string;
        city: string;
        price: number;
        img: string;
        sports: string[];
    };
    date: string;     
    slots: number[];  
}

function formatSlots(slots: number[]): string {
    if (slots.length === 0) return '—';
    const sorted = [...slots].sort((a, b) => a - b);
    const groups: number[][] = [];
    let cur = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) cur.push(sorted[i]);
        else { groups.push(cur); cur = [sorted[i]]; }
    }
    groups.push(cur);
    return groups
        .map(g => `${String(g[0]).padStart(2, '0')}:00 – ${String(g[g.length - 1] + 1).padStart(2, '0')}:00`)
        .join(', ');
}

export default function BookingConfirmation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as BookingConfirmationState | null;

    const { user } = useAuthStore();
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed]   = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix');
    const [copiedPix, setCopiedPix] = useState(false);
    const phToast = usePlayHubToast();

    if (!state) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-background">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                    <AlertCircle className="w-12 h-12 text-[#8CE600]" />
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                        {t('confirmation.noData')}
                    </p>
                    <Link
                        to="/catalog"
                        className="px-6 py-3 rounded-2xl bg-[#8CE600] text-gray-950 font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                        {t('details.backToCatalog')}
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const { court, date, slots } = state;
    const dateObj = new Date(date);
    const total   = slots.length * court.price;

    if (confirmed) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-background">
                <Header />
                <div className="flex-1 flex items-center justify-center flex-col gap-6 text-center px-6 py-20">
                    {/* Ícone animado */}
                    <div className="relative">
                        <div className="w-28 h-28 rounded-3xl bg-[#8CE600]/10 flex items-center justify-center animate-bounce-slow">
                            <span className="text-6xl">🎉</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#8CE600] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8CE600]/40">
                            <CheckCircle2 className="w-5 h-5 text-gray-950" />
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                            {t('confirmation.successTitle')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            {t('confirmation.successDesc1')}{' '}
                            <strong className="text-gray-900 dark:text-white">{court.name}</strong>{' '}
                            {t('confirmation.successDesc2')}{' '}
                            <strong className="text-[#8CE600]">
                                {format(dateObj, "dd 'de' MMMM", { locale: ptBR })}
                            </strong>{' '}
                            {t('confirmation.successDesc3')}
                        </p>
                    </div>

                    {/* Detalhes rápidos */}
                    <div className="bg-gray-50 dark:bg-background border border-gray-100 dark:border-white/10 rounded-3xl p-5 w-full max-w-sm text-sm space-y-3">
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <Calendar className="w-4 h-4 text-[#8CE600] shrink-0" />
                            <span>{format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <Clock className="w-4 h-4 text-[#8CE600] shrink-0" />
                            <span>{formatSlots(slots)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <MapPin className="w-4 h-4 text-[#8CE600] shrink-0" />
                            <span>{court.address}, {court.neighborhood} – {court.city}</span>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex justify-between font-black text-gray-900 dark:text-white">
                            <span>Total pago</span>
                            <span className="text-[#8CE600]">R$ {total}</span>
                        </div>
                    </div>

                    {/* Aviso de e-mail */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-background/50 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 max-w-sm">
                        <Mail className="w-4 h-4 text-[#8CE600] shrink-0" />
                        {t('confirmation.emailNotice')}
                    </div>

                    <div className="flex gap-4 flex-wrap justify-center">
                        <Link
                            to="/"
                            className="px-6 py-3 rounded-2xl bg-[#8CE600] text-gray-950 font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#8CE600]/20"
                        >
                            {t('details.goToHome')}
                        </Link>
                        <Link
                            to="/catalog"
                            className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:border-[#8CE600] transition-all"
                        >
                            {t('details.viewCatalog')}
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    async function handleConfirm() {
        if (!user) {
            phToast.error("Você precisa estar logado para confirmar uma reserva.");
            return;
        }

        setConfirming(true);
        try {
            const sortedSlots = [...slots].sort((a, b) => a - b);
            const firstSlot = sortedSlots[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];

            const start = new Date(date);
            start.setUTCHours(firstSlot, 0, 0, 0);

            const end = new Date(date);
            end.setUTCHours(lastSlot + 1, 0, 0, 0);

            const payload = {
                courtId: court.id,
                userId: user.id,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                totalPrice: total,
                status: 1 // Pending
            };

            const reservationResponse = await api.post('/Reservations', payload);
            const reservationId = reservationResponse.data.id;

            const methodMapping: Record<string, number> = {
                'credit': 1,
                'debit': 2,
                'pix': 3
            };

            const paymentPayload = {
                reservationId: reservationId,
                userId: user.id,
                amount: total,
                method: methodMapping[paymentMethod] || 3, // Default to PIX
                status: 1 // Pending
            };

            await api.post('/Payments', paymentPayload);

            setConfirmed(true);
            phToast.bookingConfirmed(court.name);
        } catch (error) {
            console.error('Error creating reservation:', error);
            phToast.error("Erro ao confirmar reserva. Tente novamente.");
        } finally {
            setConfirming(false);
        }
    }

    function handleCopyPix() {
        navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913PlayHub LTDA6009Sao Paulo62070503***6304");
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
        phToast.success("Código PIX copiado com sucesso!");
    }

    return (
        <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans antialiased flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Botão voltar */}
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#8CE600] text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('confirmation.back')}
                    </button>

                    {/* Cabeçalho */}
                    <div className="mb-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#8CE600] mb-2">
                            {t('confirmation.eyebrow')}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                            {t('confirmation.title')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-lg">
                            {t('confirmation.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">

                        {/* ── Coluna esquerda: detalhes ── */}
                        <div className="space-y-6">

                            {/* Card: Quadra */}
                            <div className="bg-gray-50 dark:bg-background rounded-[2rem] border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                                <div className="relative h-56">
                                    <img
                                        src={court.img}
                                        alt={court.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-5 left-5 right-5">
                                        <h2 className="text-2xl font-black text-white mb-1">{court.name}</h2>
                                        <p className="text-white/80 text-sm flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {court.address}, {court.neighborhood} – {court.city}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-6 py-5 flex flex-wrap gap-2 bg-white dark:bg-gray-900/50">
                                    {court.sports.map(s => (
                                        <span
                                            key={s}
                                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#8CE600]/10 text-[#8CE600] border border-[#8CE600]/20 shadow-sm"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Card: Data e horário */}
                            <div className="bg-gray-50 dark:bg-background rounded-[2rem] border border-gray-100 dark:border-white/10 p-6 space-y-6 shadow-sm">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    {t('confirmation.scheduleLabel')}
                                </p>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-[#8CE600]/10 flex items-center justify-center shrink-0 border border-[#8CE600]/20 shadow-inner">
                                        <Calendar className="w-6 h-6 text-[#8CE600]" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white capitalize text-lg">
                                            {format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {t('confirmation.dateLabel')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-[#8CE600]/10 flex items-center justify-center shrink-0 border border-[#8CE600]/20 shadow-inner">
                                        <Clock className="w-6 h-6 text-[#8CE600]" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white text-lg">
                                            {formatSlots(slots)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {slots.length} {t('confirmation.hoursLabel')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Políticas */}
                            <div className="space-y-3 pt-2">
                                {[
                                    { icon: <CheckCircle2 className="w-4 h-4 text-[#8CE600]" />, text: t('confirmation.policy1') },
                                    { icon: <Shield className="w-4 h-4 text-[#8CE600]" />, text: t('confirmation.policy2') },
                                    { icon: <Undo2 className="w-4 h-4 text-[#8CE600]" />, text: t('confirmation.policy3') },
                                    { icon: <Mail className="w-4 h-4 text-[#8CE600]" />, text: t('confirmation.policy4') },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 px-2">
                                        {p.icon}
                                        <span>{p.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Coluna direita: resumo e pagamento ── */}
                        <div className="space-y-5 sticky top-24">

                            {/* Resumo de preço */}
                            <div className="bg-white dark:bg-background rounded-[2rem] border border-gray-100 dark:border-white/10 p-7 shadow-2xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden">
                                
                                {/* Decorator Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8CE600]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                                <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white mb-6 relative">
                                    Pagamento
                                </h3>
                                
                                <div className="space-y-4 text-sm mb-6 relative">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>{slots.length} {t('details.hoursCount')} × R$ {court.price}/h</span>
                                        <span className="font-medium">R$ {total}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>{t('confirmation.serviceFee')}</span>
                                        <span className="text-[#8CE600] font-bold bg-[#8CE600]/10 px-2 py-0.5 rounded-md">{t('confirmation.free')}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className="font-black text-gray-900 dark:text-white text-base">Total</span>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-500 block mb-0.5">BRL</span>
                                            <span className="text-[#8CE600] font-black text-2xl leading-none">R$ {total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Método de pagamento */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-white/5 relative">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">
                                        {t('confirmation.paymentMethod')}
                                    </p>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'pix', label: 'PIX', icon: <QrCode className="w-4 h-4" /> },
                                            { id: 'credit', label: 'Cartão', icon: <CreditCard className="w-4 h-4" /> },
                                            { id: 'debit', label: 'Débito', icon: <CreditCard className="w-4 h-4" /> }
                                        ].map((m) => {
                                            const isSelected = paymentMethod === m.id;
                                            return (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setPaymentMethod(m.id as any)}
                                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                                                        isSelected
                                                            ? 'border-[#8CE600] bg-[#8CE600]/10 text-[#8CE600] shadow-sm'
                                                            : 'border-transparent bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                                >
                                                    {m.icon}
                                                    {m.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Conteúdo Dinâmico do Pagamento */}
                                    <div className="mt-4 transition-all duration-300">
                                        {paymentMethod === 'pix' ? (
                                            <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                                                <div className="flex justify-center p-5 bg-white dark:bg-white rounded-xl border border-gray-200 shadow-sm mx-auto w-max">
                                                    <QrCode className="w-32 h-32 text-gray-900" strokeWidth={1} />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center font-medium">Escaneie o QR Code ou copie o código</p>
                                                    <div className="flex items-center gap-2 bg-white dark:bg-background border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-inner">
                                                        <input 
                                                            type="text" 
                                                            readOnly 
                                                            value="00020126580014BR.GOV.BCB.PIX..." 
                                                            className="flex-1 bg-transparent border-none text-[11px] text-gray-500 py-2 px-3 font-mono focus:ring-0 outline-none" 
                                                        />
                                                        <button 
                                                            onClick={handleCopyPix}
                                                            className="p-2 bg-[#8CE600]/10 text-[#8CE600] hover:bg-[#8CE600] hover:text-gray-950 rounded-lg transition-colors flex items-center justify-center"
                                                            title="Copiar PIX"
                                                        >
                                                            {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-top-2 space-y-3.5">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                                                        Número do Cartão
                                                    </label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            placeholder="0000 0000 0000 0000" 
                                                            className="w-full bg-white dark:bg-background border border-gray-200 dark:border-gray-800 focus:border-[#8CE600] rounded-xl text-sm py-3 pl-11 pr-3 transition-colors outline-none text-gray-900 dark:text-white shadow-sm"
                                                        />
                                                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                                                        Nome Impresso
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="NOME NO CARTÃO" 
                                                        className="w-full bg-white dark:bg-background border border-gray-200 dark:border-gray-800 focus:border-[#8CE600] rounded-xl text-sm py-3 px-4 transition-colors outline-none text-gray-900 dark:text-white uppercase shadow-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                                                            Validade
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="MM/AA" 
                                                            className="w-full bg-white dark:bg-background border border-gray-200 dark:border-gray-800 focus:border-[#8CE600] rounded-xl text-sm py-3 px-4 transition-colors outline-none text-gray-900 dark:text-white shadow-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                                                            CVV
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="123" 
                                                            maxLength={4}
                                                            className="w-full bg-white dark:bg-background border border-gray-200 dark:border-gray-800 focus:border-[#8CE600] rounded-xl text-sm py-3 px-4 transition-colors outline-none text-gray-900 dark:text-white shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5 pt-2 ml-1">
                                                    <input type="checkbox" id="save-card" className="rounded-sm text-[#8CE600] focus:ring-[#8CE600] bg-white dark:bg-background border-gray-300 dark:border-gray-700 w-4 h-4 cursor-pointer" />
                                                    <label htmlFor="save-card" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer font-medium select-none">
                                                        Salvar cartão para a próxima reserva
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Botão confirmar */}
                                <button
                                    id="btn-confirm-booking"
                                    onClick={handleConfirm}
                                    disabled={confirming}
                                    className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-[#8CE600] text-gray-950 hover:bg-[#7bc900] shadow-xl shadow-[#8CE600]/20 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 skew-x-12" />
                                    {confirming ? (
                                        <span className="flex items-center justify-center gap-2 relative z-10">
                                            <span className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                                            Processando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 relative z-10">
                                            {paymentMethod === 'pix' ? (
                                                <>Confirmar Pagamento PIX</>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4" />
                                                    Pagar R$ {total}
                                                </>
                                            )}
                                        </span>
                                    )}
                                </button>

                                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                    <Shield className="w-4 h-4 text-[#8CE600]" />
                                    Ambiente 100% seguro e criptografado
                                </div>
                            </div>

                            {/* Aviso cancelamento */}
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3 shadow-sm">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                                    {t('confirmation.cancelWarning')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}




