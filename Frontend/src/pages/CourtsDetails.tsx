import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, isSameDay, addMonths, subMonths, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Clock, CheckCircle2, ArrowLeft, Star, Shield, Calendar, Wifi, ParkingCircle, Lightbulb, ShowerHead, Coffee, Dumbbell, Waves, Users, CircleDollarSign, Undo2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stars } from '@/components/ui/Stars';
import { useAuthStore } from '@/data/useAuthStore';
import { CATALOG_COURTS } from '@/pages/CatalogData';

// Ícones e componentes de apoio
const LocationIcon = () => <MapPin className="w-4 h-4 text-[#8CE600]" />;
const ClockIcon    = () => <Clock className="w-4 h-4 text-[#8CE600]" />;
const CheckIcon    = () => <CheckCircle2 className="w-3.5 h-3.5 text-[#8CE600]" />;
const ShieldIcon   = () => <Shield className="w-4 h-4 text-[#8CE600]" />;
const CalendarIcon = () => <Calendar className="w-4 h-4 text-[#8CE600]" />;
const StarIcon     = () => <Star className="w-3.5 h-3.5" fill="currentColor" />;

const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
    'Vestiário':      <ShowerHead className="w-4 h-4 text-[#8CE600]" />,
    'Estacionamento': <ParkingCircle className="w-4 h-4 text-[#8CE600]" />,
    'Iluminação':     <Lightbulb className="w-4 h-4 text-[#8CE600]" />,
    'Wifi':           <Wifi className="w-4 h-4 text-[#8CE600]" />,
    'Lanchonete':     <Coffee className="w-4 h-4 text-[#8CE600]" />,
    'Ducha':          <ShowerHead className="w-4 h-4 text-[#8CE600]" />,
    'Academia':       <Dumbbell className="w-4 h-4 text-[#8CE600]" />,
    'Piscina':        <Waves className="w-4 h-4 text-[#8CE600]" />,
    'Arquibancada':   <Users className="w-4 h-4 text-[#8CE600]" />,
};
import React from 'react';

const MOCK_REVIEWS = [
    { name: 'Mariana Costa', avatar: 'MC', rating: 5, date: '15 Abr 2025', text: 'Estrutura impecável! Vestiários limpos, quadra bem cuidada e atendimento excelente.' },
    { name: 'Rafael Souza',  avatar: 'RS', rating: 5, date: '10 Abr 2025', text: 'Melhor arena da região. Iluminação perfeita para jogar à noite. Recomendo!' },
    { name: 'Julia Alves',   avatar: 'JA', rating: 4, date: '02 Abr 2025', text: 'Ótima quadra, bem localizada. Só faltou um pouco mais de espaço no estacionamento.' },
];

function getNext7Days() {
    return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
}

type SlotStatus = 'available' | 'busy' | 'selected';

function formatSlots(slots: number[], t: any) {
    if (slots.length === 0) return t('details.noSlotSelected');
    const sorted = [...slots].sort((a, b) => a - b);
    const groups: number[][] = [];
    let currentGroup = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
            currentGroup.push(sorted[i]);
        } else {
            groups.push(currentGroup);
            currentGroup = [sorted[i]];
        }
    }
    groups.push(currentGroup);
    
    return groups.map(g => `${String(g[0]).padStart(2, '0')}:00 às ${String(g[g.length - 1] + 1).padStart(2, '0')}:00`).join(', ');
}

function TimeSlot({ hour, status, onClick }: { hour: number; status: SlotStatus; onClick: () => void }) {
    const start = `${String(hour).padStart(2, '0')}:00`;
    const end = `${String(hour + 1).padStart(2, '0')}:00`;
    const styles: Record<SlotStatus, string> = {
        available: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#8CE600] hover:bg-[#8CE600]/10 cursor-pointer text-gray-700 dark:text-gray-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8CE600]/10',
        busy:      'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/60 cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60',
        selected:  'bg-[#8CE600] border-[#8CE600] text-gray-950 cursor-pointer shadow-lg shadow-[#8CE600]/30 ring-2 ring-[#8CE600] ring-offset-2 ring-offset-white dark:ring-offset-gray-950 scale-[1.02] z-10',
    };
    return (
        <button
            onClick={onClick}
            disabled={status === 'busy'}
            className={`relative flex items-center justify-center gap-1.5 rounded-2xl border-2 py-3 px-2 transition-all duration-300 ${styles[status]}`}
        >
            {status === 'selected' && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-950 text-[#8CE600] rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
            )}
            <div className="flex items-center justify-center gap-1.5 w-full">
                <Clock className={`w-3.5 h-3.5 shrink-0 ${status === 'selected' ? 'text-gray-800' : status === 'busy' ? 'text-gray-400 dark:text-gray-600' : 'text-[#8CE600]'}`} />
                <span className={`text-[13px] font-black tracking-tight ${status === 'selected' ? 'text-gray-950' : ''} ${status === 'busy' ? 'line-through decoration-gray-400/50' : ''}`}>
                    {start}
                </span>
                <span className={`text-[11px] font-bold ${status === 'selected' ? 'text-gray-800' : 'text-gray-400 dark:text-gray-500'} ${status === 'busy' ? 'line-through decoration-gray-400/50' : ''}`}>
                    - {end}
                </span>
            </div>
        </button>
    );
}

function BookingSummary({ court, date, slots, onBook }: {
    court: typeof CATALOG_COURTS[0];
    date: Date;
    slots: number[];
    onBook: () => void;
}) {
    const { t } = useTranslation();
    const total = slots.length * court.price;
    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-100/50 dark:shadow-black/30 sticky top-24">
            <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white mb-1">{t('details.bookingSummary')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">{t('details.confirmDetails')}</p>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon />
                    <span className="text-gray-700 dark:text-gray-300">{format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <ClockIcon />
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {formatSlots(slots, t)}
                    </span>
                </div>
            </div>

            {slots.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>{slots.length} {t('details.hoursCount')} × R$ {court.price}/h</span>
                        <span>R$ {total}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                    <div className="flex justify-between font-black text-gray-900 dark:text-white text-base">
                        <span>Total</span>
                        <span className="text-[#8CE600]">R$ {total}</span>
                    </div>
                </div>
            )}

            <button
                onClick={onBook}
                disabled={slots.length === 0}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#8CE600] text-gray-950 hover:opacity-90 shadow-lg shadow-[#8CE600]/20"
            >
                {slots.length === 0 ? 'Selecione um horário' : `Reservar ${slots.length} hora${slots.length > 1 ? 's' : ''}`}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                <ShieldIcon />
                {t('details.securePayment')}
            </div>
        </div>
    );
}

export default function CourtsDetails() {
    // Hooks e estado
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const court = CATALOG_COURTS.find(c => c.id === Number(id));
    const { isAuthenticated } = useAuthStore();

    const [selectedDay, setSelectedDay]   = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [booked, setBooked]             = useState(false);
    const [galleryIdx, setGalleryIdx]     = useState(0);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover,  setReviewHover]  = useState(0);
    const [reviewText,   setReviewText]   = useState('');
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMonth, setPickerMonth] = useState<Date>(startOfMonth(new Date()));

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(pickerMonth), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(pickerMonth), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [pickerMonth]);


    const days = useMemo(() => getNext7Days(), []);
    const isSelectedInDays = days.some(d => format(d, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd'));

    // Generate busy slots deterministically based on day + court id
    const busySlots = useMemo(() => {
        if (!court) return [];
        const seed = selectedDay.getDate() + court.id;
        return Array.from({ length: court.closingHour - court.openingHour }, (_, i) => court.openingHour + i)
            .filter((_, i) => (i + seed) % 3 === 0);
    }, [court, selectedDay]);

    const isDateUnavailable = court?.unavailableDates.includes(format(selectedDay, 'yyyy-MM-dd')) ?? false;

    function toggleSlot(hour: number) {
        setSelectedSlots(prev =>
            prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort((a, b) => a - b)
        );
    }

    function handleDaySelect(day: Date) {
        setSelectedDay(day);
        setSelectedSlots([]);
    }

    function handleBook() {
        setBooked(true);
    }

    if (!court) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
                <Header />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{t('details.notFound')}</p>
                    <Link to="/catalog" className="text-[#8CE600] font-bold underline">{t('details.backToCatalog')}</Link>
                </div>
                <Footer />
            </div>
        );
    }

    if (booked) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
                <Header />
                <div className="flex-1 flex items-center justify-center flex-col gap-6 text-center px-6">
                    <div className="w-24 h-24 rounded-3xl bg-[#8CE600]/10 flex items-center justify-center text-5xl">🎉</div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{t('details.bookingConfirmed')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        {t('details.bookingSuccess')} <strong>{court.name}</strong> para {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })} {t('details.bookingSuccessSuffix')}
                    </p>
                    <div className="flex gap-4">
                        <Link to="/" className="px-6 py-3 rounded-2xl bg-[#8CE600] text-gray-950 font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all">{t('details.goToHome')}</Link>
                        <Link to="/catalog" className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:border-[#8CE600] transition-all">{t('details.viewCatalog')}</Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const hours = Array.from(
        { length: court.closingHour - court.openingHour },
        (_, i) => court.openingHour + i
    );

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased flex flex-col">
            <Header />

            // Galeria de imagens 
            <section className="pt-24 bg-gray-50 dark:bg-gray-900">
                {(() => {
                    const imgs = [
                        court.img,
                        court.img.replace('w=800', 'w=801'),
                        court.img.replace('w=800', 'w=802'),
                        court.img.replace('w=800', 'w=803'),
                    ];
                    return (
                        <div className="max-w-7xl mx-auto px-6 py-6">
                            <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#8CE600] text-xs font-bold uppercase tracking-widest mb-5 transition-colors">
                                <ArrowLeft /> {t('details.backToCatalog')}
                            </Link>
                            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-3xl overflow-hidden">
                                <div className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer group" onClick={() => setGalleryIdx(0)}>
                                    <img src={imgs[galleryIdx === 0 ? 0 : galleryIdx]} alt={court.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <div className="absolute bottom-4 left-4">
                                        {court.badge && <span className="bg-[#8CE600] text-gray-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{court.badge}</span>}
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white mt-2">{court.name}</h1>
                                        <p className="flex items-center gap-1.5 text-white/70 text-sm mt-1"><LocationIcon />{court.address}, {court.neighborhood} - {court.city}</p>
                                    </div>
                                </div>
                                {imgs.slice(1).map((src, i) => (
                                    <div key={i} className="relative overflow-hidden cursor-pointer group" onClick={() => setGalleryIdx(i + 1)}>
                                        <img src={src} alt={`${court.name} ${i+2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className={`absolute inset-0 transition-colors ${galleryIdx === i+1 ? 'bg-[#8CE600]/20 ring-2 ring-inset ring-[#8CE600]' : 'bg-black/10 hover:bg-black/0'}`} />
                                        {i === 2 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-black text-sm">{t('details.seeMore')}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                                <Stars rating={court.rating} />
                                <span className="text-gray-500 dark:text-gray-400 text-sm">({court.reviewCount} avaliações)</span>
                                <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><ClockIcon />{court.openingHour}h – {court.closingHour}h</span>
                            </div>
                        </div>
                    );
                })()}
            </section>

            // Conteúdo principal
            <div className="max-w-7xl mx-auto px-6 py-12 w-full flex gap-10 flex-col lg:flex-row">

                <div className="flex-1 min-w-0 space-y-10">

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <Star className="w-6 h-6 text-[#8CE600]" />, label: 'Avaliação', value: `${court.rating.toFixed(1)} / 5` },
                            { icon: <CircleDollarSign className="w-6 h-6 text-[#8CE600]" />, label: 'Preço', value: `R$ ${court.price}/h` },
                            { icon: <Clock className="w-6 h-6 text-[#8CE600]" />, label: 'Horário', value: `${court.openingHour}h – ${court.closingHour}h` },
                            { icon: <MapPin className="w-6 h-6 text-[#8CE600]" />, label: 'Cidade', value: court.city },
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="mb-2">{item.icon}</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{item.label}</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Modalidades</h2>
                        <div className="flex flex-wrap gap-2">
                            {court.sports.map(s => (
                                <span key={s} className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#8CE600]/10 text-[#8CE600] border border-[#8CE600]/20">{s}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Comodidades</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {court.amenities.map(a => (
                                <div key={a} className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-800">
                                    {AMENITY_ICON_MAP[a] ?? <CheckCircle2 className="w-4 h-4 text-[#8CE600]" />}
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{a}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Seletor de data e horários */}
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-1">Agendamento</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('details.schedulingDesc')}</p>

                        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                            {days.map((day) => {
                                const iso = format(day, 'yyyy-MM-dd');
                                const isSelected = format(selectedDay, 'yyyy-MM-dd') === iso;
                                const isUnavail  = court.unavailableDates.includes(iso);
                                return (
                                    <button
                                        key={iso}
                                        onClick={() => handleDaySelect(day)}
                                        disabled={isUnavail}
                                        className={`shrink-0 flex flex-col items-center rounded-2xl px-4 py-3 border-2 transition-all duration-200 min-w-[64px] ${
                                            isUnavail
                                                ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-[#8CE600] bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/30'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#8CE600] text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{format(day, 'EEE', { locale: ptBR })}</span>
                                        <span className="text-lg font-black leading-tight">{format(day, 'dd')}</span>
                                        {isUnavail && <span className="text-[8px] font-bold mt-0.5">{t('details.fullyBooked')}</span>}
                                    </button>
                                );
                            })}

                            <button 
                                onClick={() => setShowDatePicker(true)}
                                className={`relative shrink-0 flex flex-col items-center justify-center rounded-2xl px-2 py-3 border-2 transition-all duration-200 min-w-[64px] ${
                                    !isSelectedInDays 
                                        ? 'border-[#8CE600] bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/30' 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#8CE600] text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                <Calendar className={`w-5 h-5 mb-1 ${!isSelectedInDays ? 'text-gray-950' : 'text-gray-400 dark:text-gray-500'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-center mt-0.5">
                                    {!isSelectedInDays ? format(selectedDay, 'dd/MM') : t('details.otherDates')}
                                </span>
                            </button>
                        </div>

                        {showDatePicker && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDatePicker(false)} />
                                <div className="relative z-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl w-full max-w-[320px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <button onClick={() => setPickerMonth(subMonths(pickerMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="font-black text-gray-900 dark:text-white capitalize text-lg">
                                            {format(pickerMonth, 'MMMM yyyy', { locale: ptBR })}
                                        </span>
                                        <button onClick={() => setPickerMonth(addMonths(pickerMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                            <div key={i} className="text-[11px] font-black text-gray-400">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays.map((day, i) => {
                                            const isPast = isBefore(day, startOfDay(new Date()));
                                            const isSelected = isSameDay(day, selectedDay);
                                            const isCurrentMonth = day.getMonth() === pickerMonth.getMonth();
                                            
                                            return (
                                                <button
                                                    key={i}
                                                    disabled={isPast}
                                                    onClick={() => {
                                                        handleDaySelect(day);
                                                        setShowDatePicker(false);
                                                    }}
                                                    className={`h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all ${
                                                        isSelected 
                                                            ? 'bg-[#8CE600] text-gray-950 font-black shadow-md shadow-[#8CE600]/20' 
                                                            : isPast 
                                                                ? 'text-gray-200 dark:text-gray-800 cursor-not-allowed' 
                                                                : isCurrentMonth
                                                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold'
                                                                    : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {format(day, 'd')}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isDateUnavailable ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30">
                                <p className="text-3xl mb-3">😔</p>
                                <p className="font-black text-gray-900 dark:text-white">{t('details.courtUnavailable')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('details.tryAnotherDate')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 inline-block"/></span> Disponível
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 inline-block"/></span> Ocupado
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#8CE600] inline-block"/></span> Selecionado
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {hours.map(hour => {
                                        const status: SlotStatus = selectedSlots.includes(hour) ? 'selected' : busySlots.includes(hour) ? 'busy' : 'available';
                                        return (
                                            <TimeSlot key={hour} hour={hour} status={status} onClick={() => toggleSlot(hour)} />
                                        );
                                    })}
                                </div>
                                {selectedSlots.length > 0 && (
                                    <div className="mt-4 p-4 bg-[#8CE600]/5 border border-[#8CE600]/20 rounded-2xl text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                        <span className="text-[#8CE600] mt-0.5"><CheckIcon /></span>
                                        <span className="leading-relaxed">
                                            <strong>{selectedSlots.length} hora{selectedSlots.length > 1 ? 's' : ''}</strong> selecionada{selectedSlots.length > 1 ? 's' : ''}:&nbsp;
                                            {formatSlots(selectedSlots, t)} —&nbsp;
                                            <strong className="text-[#8CE600]">R$ {selectedSlots.length * court.price}</strong>
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Comentários e feedback */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Avaliações</h2>
                            <div className="flex items-center gap-2">
                                <StarIcon />
                                <span className="font-black text-gray-900 dark:text-white">{court.rating.toFixed(1)}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">({court.reviewCount})</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {MOCK_REVIEWS.map((r) => (
                                <div key={r.name} className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-2xl bg-[#8CE600] text-gray-950 flex items-center justify-center text-xs font-black">{r.avatar}</div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{r.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{r.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-[#8CE600] gap-0.5">
                                            {Array.from({ length: r.rating }).map((_, i) => <StarIcon key={i} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{r.text}"</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">{t('details.leaveReview')}</h3>
                            {!isAuthenticated ? (
                                <div className="flex flex-col items-center gap-3 py-8 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 text-center px-6">
                                    <Star className="w-8 h-8 text-[#8CE600]" />
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('details.loginToReview')}</p>
                                    <Link to="/login" className="px-5 py-2 rounded-xl bg-[#8CE600] text-gray-950 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">{t('details.loginBtn')}</Link>
                                </div>
                            ) : (
                                <form onSubmit={e => { e.preventDefault(); setReviewText(''); setReviewRating(0); }} className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
                                    <div className="flex items-center gap-1">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2">{t('details.yourRating')}</p>
                                        {[1,2,3,4,5].map(n => (
                                            <button key={n} type="button"
                                                onMouseEnter={() => setReviewHover(n)}
                                                onMouseLeave={() => setReviewHover(0)}
                                                onClick={() => setReviewRating(n)}
                                                className={`w-7 h-7 transition-all ${n <= (reviewHover || reviewRating) ? 'text-[#8CE600] scale-110' : 'text-gray-300 dark:text-gray-600'}`}
                                            >
                                                <Star fill={n <= (reviewHover || reviewRating) ? 'currentColor' : 'none'} className="w-full h-full" />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={reviewText}
                                        onChange={e => setReviewText(e.target.value)}
                                        placeholder={t('details.reviewPlaceholder')}
                                        rows={3}
                                        className="w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600] focus:border-transparent resize-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!reviewRating || !reviewText.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-[#8CE600] text-gray-950 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Publicar avaliação
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                // Coluna lateral: Resumo da reserva
                <div className="w-full lg:w-80 xl:w-96 shrink-0">
                    <BookingSummary
                        court={court as any}
                        date={selectedDay}
                        slots={selectedSlots}
                        onBook={handleBook}
                    />

                    <div className="mt-4 space-y-2">
                        {[
                            { icon: <CheckCircle2 className="w-4 h-4 text-[#8CE600]" />, text: 'Confirmação imediata por e-mail' },
                            { icon: <Shield className="w-4 h-4 text-[#8CE600]" />, text: 'Pagamento criptografado (SSL)' },
                            { icon: <Undo2 className="w-4 h-4 text-[#8CE600]" />, text: 'Cancelamento gratuito em até 24h' },
                        ].map(b => (
                            <div key={b.text} className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 px-2">
                                {b.icon}
                                <span>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
