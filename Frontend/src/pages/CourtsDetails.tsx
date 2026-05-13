import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, isSameDay, addMonths, subMonths, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Clock, CheckCircle2, ArrowLeft, Star, Shield, Calendar, Wifi, ParkingCircle, Lightbulb, ShowerHead, Coffee, Dumbbell, Waves, Users, CircleDollarSign, Undo2, ChevronLeft, ChevronRight, X, Camera, Share, MessageSquare, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stars } from '@/components/ui/Stars';
import { useAuthStore } from '@/data/useAuthStore';
import { usePlayHubToast } from '@/hooks/usePlayHubToast';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useCourt, useCourtReviews, useSubmitReview } from '@/features/courts/hooks/useCourts';
import { useCourtAvailability } from '@/features/courts/hooks/useCourtAvailability';
import { useQueryClient } from '@tanstack/react-query';
import { signalRService } from '@/lib/signalr';
import { SEO } from '@/components/SEO';

import { Court } from './CatalogData';

const ClockIcon = () => <Clock className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />;
const CheckIcon = () => <CheckCircle2 className="w-3.5 h-3.5 text-[#8CE600]" strokeWidth={1.5} />;
const ShieldIcon = () => <Shield className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />;
const CalendarIcon = () => <Calendar className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />;
const StarIcon = () => <Star className="w-3.5 h-3.5" fill="currentColor" strokeWidth={1.5} />;

const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
    'Vestiário': <ShowerHead className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Estacionamento': <ParkingCircle className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Iluminação': <Lightbulb className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Wifi': <Wifi className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Lanchonete': <Coffee className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Ducha': <ShowerHead className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Academia': <Dumbbell className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Piscina': <Waves className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
    'Arquibancada': <Users className="w-4 h-4 text-[#8CE600]" strokeWidth={1.5} />,
};


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
        available: 'bg-white dark:bg-background border-gray-200 dark:border-white/10 hover:border-[#8CE600] hover:bg-[#8CE600]/10 cursor-pointer text-gray-700 dark:text-gray-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8CE600]/10',
        busy: 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-white/10/60 cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60',
        selected: 'bg-[#8CE600] border-[#8CE600] text-gray-950 cursor-pointer shadow-lg shadow-[#8CE600]/30 ring-2 ring-[#8CE600] ring-offset-2 ring-offset-white dark:ring-offset-gray-950 scale-[1.02] z-10',
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

function BookingSummary({ court, date, slots, onBook, isAuthenticated }: {
    court: Court;
    date: Date;
    slots: number[];
    onBook: () => void;
    isAuthenticated: boolean;
}) {
    const { t } = useTranslation();
    const total = slots.length * court.price;
    return (
        <div className="bg-white dark:bg-background rounded-3xl border border-gray-100 dark:border-white/10 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none sticky top-24">
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

            {isAuthenticated ? (
                <button
                    onClick={onBook}
                    disabled={slots.length === 0}
                    className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#8CE600] text-gray-950 hover:opacity-90 shadow-lg shadow-[#8CE600]/20"
                >
                    {slots.length === 0 ? 'Selecione um horário' : `Reservar ${slots.length} hora${slots.length > 1 ? 's' : ''}`}
                </button>
            ) : (
                <Link
                    to="/login"
                    className="flex justify-center items-center w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 bg-gray-900 text-[#8CE600] dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 shadow-lg"
                >
                    Faça login para reservar
                </Link>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                <ShieldIcon />
                {t('details.securePayment')}
            </div>
        </div>
    );
}

export default function CourtsDetails() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data: court, isLoading: isCourtLoading, isError: isCourtError } = useCourt(id || '');
    const { isAuthenticated, user } = useAuthStore();

    // Dynamic document title handled by SEO component

    const navigate = useNavigate();
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [modalActiveIndex, setModalActiveIndex] = useState(0);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isCpfModalOpen, setIsCpfModalOpen] = useState(false);
    const phToast = usePlayHubToast();

    const { data: reviews = [], isLoading: isReviewsLoading } = useCourtReviews(id || '');
    const submitReview = useSubmitReview(id || '');
    const queryClient = useQueryClient();

    // Ouvir atualizações em tempo real do SignalR
    useEffect(() => {
        const connection = signalRService.connection;
        if (!connection) return;

        const handleReservationCreated = (data: { courtId: string, startTime: string }) => {
            if (data.courtId === id) {
                // Invalidamos a busca de disponibilidade
                queryClient.invalidateQueries({ queryKey: ['courtAvailability', id] });

                // Verificamos se o horário reservado conflita com a seleção atual
                // Convertemos a string ISO para data e pegamos a hora
                const reservedHour = new Date(data.startTime).getHours();

                setSelectedSlots(prev => {
                    if (prev.includes(reservedHour)) {
                        phToast.error(t('details.slotTakenWarning', "Este horário acabou de ser reservado por outro usuário!"));
                        return prev.filter(h => h !== reservedHour);
                    }
                    phToast.info(t('details.realTimeUpdate', "A disponibilidade da quadra foi atualizada."));
                    return prev;
                });
            }
        };

        connection.on("ReservationCreated", handleReservationCreated);
        return () => {
            connection.off("ReservationCreated", handleReservationCreated);
        };
    }, [id, queryClient, phToast]);

    const alreadyReviewed = useMemo(() => {
        if (!user || reviews.length === 0) return false;
        return reviews.some((r) => r.userId === user.id);
    }, [reviews, user]);

    const handleShare = async () => {
        if (!court) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${court.name} - PlayHub`,
                    text: `Confira ${court.name} no PlayHub!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado para a área de transferência!');
        }
    };

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMonth, setPickerMonth] = useState<Date>(startOfMonth(new Date()));

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(pickerMonth), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(pickerMonth), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [pickerMonth]);

    const days = useMemo(() => getNext7Days(), []);
    const isSelectedInDays = days.some(d => format(d, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd'));

    const allImages = useMemo(() => {
        if (!court) return [];
        const list: string[] = [];

        if (court.mainImageBase64) {
            list.push(court.mainImageBase64);
        } else if (court.img) {
            list.push(court.img);
        }

        if (court.imagesBase64 && court.imagesBase64.length > 0) {
            court.imagesBase64.forEach((img: string) => {
                if (!list.includes(img)) list.push(img);
            });
        }

        if (court.imageUrls && court.imageUrls.length > 0) {
            court.imageUrls.forEach((url: string) => {
                if (!list.includes(url)) list.push(url);
            });
        }

        if (list.length > 0 && list.length < 4) {
            const first = list[0];
            while (list.length < 4) {
                list.push(first);
            }
        }

        return list;
    }, [court]);

    const { data: availability, isLoading: isAvailabilityLoading } = useCourtAvailability(id || '', format(selectedDay, 'yyyy-MM-dd'));

    const busySlots = useMemo(() => {
        return availability?.busySlots || [];
    }, [availability]);

    const isDateUnavailable = court?.unavailableDates?.includes(format(selectedDay, 'yyyy-MM-dd')) ?? false;

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
        if (!court) return;

        if (isAuthenticated && user && !user.cpf) {
            setIsCpfModalOpen(true);
            return;
        }

        navigate('/booking/confirm', {
            state: {
                court: {
                    id: court.id,
                    name: court.name,
                    address: court.address,
                    neighborhood: court.neighborhood,
                    city: court.city,
                    price: court.price,
                    img: court.img,
                    sports: court.sports,
                },
                date: selectedDay.toISOString(),
                slots: selectedSlots,
            },
        });
    }

    if (isCourtLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-background">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#8CE600]/20 border-t-[#8CE600] rounded-full animate-spin" />
                    <p className="text-sm font-bold text-gray-500">{t('details.loading', 'Carregando detalhes...')}</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!court || isCourtError) {
        return (
            <div className="min-h-screen flex flex-col bg-white dark:bg-background">
                <Header />
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{t('details.notFound')}</p>
                    <Link to="/catalog" className="text-[#8CE600] font-bold underline">{t('details.backToCatalog')}</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const hours = Array.from(
        { length: (court.closingHour || 23) - (court.openingHour || 6) },
        (_, i) => (court.openingHour || 6) + i
    );

    return (
        <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans antialiased flex flex-col">
            <SEO
                title={court.name}
                description={`${court.name} em ${court.city} - ${court.neighborhood}. Agende agora sua partida de ${court.sports.join(', ')}. Preço: R$ ${court.price}/h.`}
                ogImage={allImages[0]}
                ogType="article"
            />
            <Header />

            {/* Galeria de imagens */}
            <section className="pt-24 bg-gray-50/50 dark:bg-background">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#8CE600] text-xs font-bold uppercase tracking-widest mb-5 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {t('details.backToCatalog')}
                    </Link>

                    <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-[2.5rem] overflow-hidden">
                        <div
                            className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer group"
                            onClick={() => {
                                setModalActiveIndex(0);
                                setIsGalleryModalOpen(true);
                            }}
                        >
                            <img
                                src={allImages[0]}
                                alt={court.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute bottom-6 left-6">
                                {court.badge && (
                                    <span className="bg-[#8CE600] text-gray-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-[#8CE600]/20 mb-3 inline-block">
                                        {court.badge}
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-sm">{court.name}</h1>
                                <p className="flex items-center gap-1.5 text-white/80 text-sm mt-1.5 font-medium">
                                    <MapPin className="w-4 h-4 text-[#8CE600]" />
                                    {court.address}, {court.neighborhood}
                                </p>
                            </div>
                        </div>

                        {allImages.slice(1, 4).map((src, i) => (
                            <div
                                key={i}
                                className="relative overflow-hidden cursor-pointer group"
                                onClick={() => {
                                    setModalActiveIndex(i + 1);
                                    setIsGalleryModalOpen(true);
                                }}
                            >
                                <img
                                    src={src}
                                    alt={`${court.name} ${i + 2}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                                {i === 2 && allImages.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center group-hover:bg-black/40 transition-all backdrop-blur-[2px]">
                                        <span className="text-white font-black text-lg">+{allImages.length - 3}</span>
                                        <span className="text-white/80 font-bold text-[10px] uppercase tracking-widest mt-1">Ver fotos</span>
                                    </div>
                                )}
                                {i === 2 && allImages.length <= 4 && (
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                        <div className="p-3 rounded-full bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isGalleryModalOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
                            <button
                                onClick={() => setIsGalleryModalOpen(false)}
                                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="w-full max-w-6xl h-full md:h-[85vh] flex flex-col md:flex-row gap-4 p-4 md:p-8 pt-20 md:pt-8">
                                <div className="flex-1 relative rounded-[2rem] overflow-hidden bg-black/50 flex items-center justify-center border border-white/10">
                                    <img
                                        src={allImages[modalActiveIndex]}
                                        alt={`Gallery ${modalActiveIndex}`}
                                        className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-500"
                                        key={modalActiveIndex}
                                    />

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setModalActiveIndex(idx => idx > 0 ? idx - 1 : allImages.length - 1); }}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-[#8CE600] text-white hover:text-black rounded-full backdrop-blur-md transition-all hover:scale-110 border border-white/10"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setModalActiveIndex(idx => idx < allImages.length - 1 ? idx + 1 : 0); }}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-[#8CE600] text-white hover:text-black rounded-full backdrop-blur-md transition-all hover:scale-110 border border-white/10"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>

                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs font-bold">
                                        {modalActiveIndex + 1} / {allImages.length}
                                    </div>
                                </div>

                                <div className="w-full md:w-48 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-none py-2 md:py-0 md:pr-2" style={{ scrollbarWidth: 'none' }}>
                                    {allImages.map((src, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setModalActiveIndex(idx)}
                                            className={`relative shrink-0 w-24 md:w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${modalActiveIndex === idx ? 'border-[#8CE600] scale-100 opacity-100 shadow-lg shadow-[#8CE600]/20' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-[1.02]'}`}
                                        >
                                            <img src={src} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                        <Stars rating={court.rating} />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">({court.reviewCount} avaliações)</span>
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><ClockIcon />{court.openingHour}h – {court.closingHour}h</span>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
                            title="Compartilhar"
                        >
                            <Share className="w-3.5 h-3.5" /> Compartilhar
                        </button>
                        <FavoriteButton courtId={String(court.id)} variant="pill" size="sm" />
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-12 w-full flex gap-10 flex-col lg:flex-row">
                <div className="flex-1 min-w-0 space-y-10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <Star className="w-6 h-6 text-[#8CE600]" />, label: 'Avaliação', value: `${court.rating.toFixed(1)} / 5` },
                            { icon: <CircleDollarSign className="w-6 h-6 text-[#8CE600]" />, label: 'Preço', value: `R$ ${court.price}/h` },
                            { icon: <Clock className="w-6 h-6 text-[#8CE600]" />, label: 'Horário', value: `${court.openingHour}h – ${court.closingHour}h` },
                            { icon: <MapPin className="w-6 h-6 text-[#8CE600]" />, label: 'Cidade', value: court.city },
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 dark:bg-background rounded-2xl p-4 border border-gray-100 dark:border-white/10">
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
                                <div key={a} className="flex items-center gap-2.5 bg-gray-50 dark:bg-background rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10">
                                    {AMENITY_ICON_MAP[a] ?? <CheckCircle2 className="w-4 h-4 text-[#8CE600]" />}
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{a}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-1">Agendamento</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('details.schedulingDesc')}</p>

                        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                            {days.map((day) => {
                                const iso = format(day, 'yyyy-MM-dd');
                                const isSelected = format(selectedDay, 'yyyy-MM-dd') === iso;
                                const isUnavail = court.unavailableDates?.includes(iso);
                                return (
                                    <button
                                        key={iso}
                                        onClick={() => handleDaySelect(day)}
                                        disabled={isUnavail}
                                        className={`shrink-0 flex flex-col items-center rounded-2xl px-4 py-3 border-2 transition-all duration-200 min-w-[64px] ${isUnavail
                                            ? 'border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-background/50 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-[#8CE600] bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/30'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background hover:border-[#8CE600] text-gray-700 dark:text-gray-300'
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
                                className={`relative shrink-0 flex flex-col items-center justify-center rounded-2xl px-2 py-3 border-2 transition-all duration-200 min-w-[64px] ${!isSelectedInDays
                                    ? 'border-[#8CE600] bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/30'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background hover:border-[#8CE600] text-gray-700 dark:text-gray-300'
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
                                <div className="relative z-10 bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-2xl w-full max-w-[320px]">
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
                                                    className={`h-10 w-full rounded-xl flex items-center justify-center text-sm transition-all ${isSelected
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
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white dark:bg-background border-2 border-gray-300 dark:border-gray-600 inline-block" /></span> Disponível
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" /></span> Ocupado
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#8CE600] inline-block" /></span> Selecionado
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {isAvailabilityLoading ? (
                                        <div className="col-span-full py-12 flex justify-center">
                                            <div className="w-8 h-8 border-3 border-[#8CE600]/20 border-t-[#8CE600] rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        hours.map(hour => {
                                            const now = new Date();
                                            const isToday = isSameDay(selectedDay, now);
                                            const hasPassed = isToday && hour <= now.getHours();

                                            const isBusy = busySlots.includes(hour) || hasPassed;
                                            const isSelected = selectedSlots.includes(hour);

                                            // Se o horário ficou ocupado enquanto estava selecionado, removemos da seleção
                                            if (isBusy && isSelected) {
                                                setSelectedSlots(prev => prev.filter(h => h !== hour));
                                            }

                                            const status: SlotStatus = isBusy ? 'busy' : isSelected ? 'selected' : 'available';
                                            return (
                                                <TimeSlot key={hour} hour={hour} status={status} onClick={() => toggleSlot(hour)} />
                                            );
                                        })
                                    )}
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

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Avaliações</h2>
                            <div className="flex items-center gap-2">
                                <StarIcon />
                                <span className="font-black text-gray-900 dark:text-white">{court.rating.toFixed(1)}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">({court.reviewCount} {court.reviewCount === 1 ? 'avaliação' : 'avaliações'})</span>
                            </div>
                        </div>

                        {/* Rating distribution bar */}
                        {reviews.length > 0 && (
                            <div className="mb-6 bg-gray-50 dark:bg-background/50 rounded-3xl p-5 border border-gray-100 dark:border-white/10">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="text-center shrink-0">
                                        <p className="text-5xl font-black text-gray-900 dark:text-white">{court.rating.toFixed(1)}</p>
                                        <div className="flex justify-center gap-0.5 my-1">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <Star key={n} className="w-4 h-4" fill={n <= Math.round(court.rating) ? '#8CE600' : 'none'} stroke={n <= Math.round(court.rating) ? '#8CE600' : 'currentColor'} strokeWidth={1.5} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{reviews.length} avaliações</p>
                                    </div>
                                    <div className="flex-1 w-full space-y-1.5">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = reviews.filter(r => r.rating === star).length;
                                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-2 text-xs">
                                                    <span className="w-2 text-right font-bold text-gray-500 dark:text-gray-400">{star}</span>
                                                    <Star className="w-3 h-3 text-[#8CE600]" fill="#8CE600" strokeWidth={0} />
                                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#8CE600] rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-6 text-right text-gray-400 font-bold">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isReviewsLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-7 h-7 text-[#8CE600] animate-spin" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-10 text-center bg-gray-50 dark:bg-background/50 rounded-3xl border border-gray-100 dark:border-white/10">
                                <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                <p className="font-bold text-gray-500 dark:text-gray-400 text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {reviews.slice(0, 5).map((r) => (
                                        <div key={r.id} className="bg-gray-50 dark:bg-background/50 rounded-3xl p-5 border border-gray-100 dark:border-white/10">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-2xl bg-[#8CE600] text-gray-950 flex items-center justify-center text-xs font-black shrink-0">{r.userInitials}</div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{r.userName}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {format(new Date(r.createdAt), "dd 'de' MMM yyyy", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <Star key={n} className="w-3.5 h-3.5" fill={n <= r.rating ? '#8CE600' : 'none'} stroke={n <= r.rating ? '#8CE600' : 'currentColor'} strokeWidth={1.5} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{r.text}"</p>
                                        </div>
                                    ))}
                                </div>

                                {reviews.length > 5 && (
                                    <button
                                        onClick={() => setIsReviewsModalOpen(true)}
                                        className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#8CE600]/30 bg-[#8CE600]/5 hover:bg-[#8CE600]/10 hover:border-[#8CE600]/60 text-[#8CE600] font-black text-sm uppercase tracking-widest transition-all duration-200 group"
                                    >
                                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Ver todas as {reviews.length} avaliações
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                )}

                                {/* Reviews Modal */}
                                {isReviewsModalOpen && (
                                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                                        <div
                                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                                            onClick={() => setIsReviewsModalOpen(false)}
                                        />
                                        <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0a0f1a] rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            {/* Modal Header */}
                                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                                                <div>
                                                    <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Todas as Avaliações</h2>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{court.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl px-3 py-1.5 border border-gray-100 dark:border-white/10">
                                                        <Star className="w-4 h-4" fill="#8CE600" stroke="#8CE600" strokeWidth={1.5} />
                                                        <span className="font-black text-gray-900 dark:text-white text-sm">{court.rating.toFixed(1)}</span>
                                                        <span className="text-gray-400 text-xs font-bold">({reviews.length})</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsReviewsModalOpen(false)}
                                                        className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rating distribution bar in modal */}
                                            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0">
                                                <div className="flex items-center gap-5">
                                                    <div className="text-center shrink-0">
                                                        <p className="text-4xl font-black text-gray-900 dark:text-white">{court.rating.toFixed(1)}</p>
                                                        <div className="flex justify-center gap-0.5 my-1">
                                                            {[1, 2, 3, 4, 5].map(n => (
                                                                <Star key={n} className="w-3.5 h-3.5" fill={n <= Math.round(court.rating) ? '#8CE600' : 'none'} stroke={n <= Math.round(court.rating) ? '#8CE600' : 'currentColor'} strokeWidth={1.5} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{reviews.length} avaliações</p>
                                                    </div>
                                                    <div className="flex-1 space-y-1.5">
                                                        {[5, 4, 3, 2, 1].map(star => {
                                                            const count = reviews.filter(r => r.rating === star).length;
                                                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                            return (
                                                                <div key={star} className="flex items-center gap-2 text-xs">
                                                                    <span className="w-2 text-right font-bold text-gray-500 dark:text-gray-400">{star}</span>
                                                                    <Star className="w-3 h-3" fill="#8CE600" stroke="#8CE600" strokeWidth={0} />
                                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-[#8CE600] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span className="w-5 text-right text-gray-400 font-bold">{count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Scrollable reviews list */}
                                            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                                {reviews.map((r) => (
                                                    <div key={r.id} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-xl bg-[#8CE600] text-gray-950 flex items-center justify-center text-[11px] font-black shrink-0">{r.userInitials}</div>
                                                                <div>
                                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{r.userName}</p>
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                        {format(new Date(r.createdAt), "dd 'de' MMM yyyy", { locale: ptBR })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(n => (
                                                                    <Star key={n} className="w-3.5 h-3.5" fill={n <= r.rating ? '#8CE600' : 'none'} stroke={n <= r.rating ? '#8CE600' : 'currentColor'} strokeWidth={1.5} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{r.text}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CPF Modal */}
                                {isCpfModalOpen && (
                                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                                        <div
                                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                            onClick={() => setIsCpfModalOpen(false)}
                                        />
                                        <div className="relative z-10 w-full max-w-sm flex flex-col bg-white dark:bg-background rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                                            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
                                                <Shield className="w-8 h-8" />
                                            </div>
                                            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-2">{t('details.cpfModal.title')}</h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                                {t('details.cpfModal.description')}
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => navigate('/lz_user/profile')}
                                                    className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-[#8CE600] text-gray-950 hover:bg-[#7bc900] transition-colors"
                                                >
                                                    {t('details.cpfModal.completeProfile')}
                                                </button>
                                                <button
                                                    onClick={() => setIsCpfModalOpen(false)}
                                                    className="w-full py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    {t('details.cpfModal.cancel')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </>
                        )}

                        <div className="mt-8">
                            <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">{t('details.leaveReview')}</h3>
                            {!isAuthenticated ? (
                                <div className="flex flex-col items-center gap-3 py-8 bg-gray-50 dark:bg-background/50 rounded-3xl border border-gray-100 dark:border-white/10 text-center px-6">
                                    <Star className="w-8 h-8 text-[#8CE600]" />
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('details.loginToReview')}</p>
                                    <Link to="/login" className="px-5 py-2 rounded-xl bg-[#8CE600] text-gray-950 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">{t('details.loginBtn')}</Link>
                                </div>
                            ) : alreadyReviewed ? (
                                <div className="flex flex-col items-center gap-3 py-8 bg-[#8CE600]/5 rounded-3xl border border-[#8CE600]/20 text-center px-6">
                                    <CheckCircle2 className="w-8 h-8 text-[#8CE600]" />
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Você já avaliou esta quadra. Obrigado!</p>
                                </div>
                            ) : (
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!reviewRating || !reviewText.trim()) return;
                                    try {
                                        await submitReview.mutateAsync({ rating: reviewRating, text: reviewText.trim() });
                                        setReviewText('');
                                        setReviewRating(0);
                                        phToast.reviewSuccess();
                                    } catch (err: any) {
                                        const msg = err?.response?.data?.message || 'Erro ao publicar avaliação.';
                                        phToast.error?.(msg) ?? alert(msg);
                                    }
                                }} className="bg-gray-50 dark:bg-background/50 rounded-3xl p-5 border border-gray-100 dark:border-white/10 space-y-4">
                                    <div className="flex items-center gap-1">
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2">{t('details.yourRating')}</p>
                                        {[1, 2, 3, 4, 5].map(n => (
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
                                        className="w-full rounded-2xl bg-white dark:bg-background border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CE600] focus:border-transparent resize-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!reviewRating || !reviewText.trim() || submitReview.isPending}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8CE600] text-gray-950 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {submitReview.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Publicar avaliação
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80 xl:w-96 shrink-0">
                    <BookingSummary
                        court={court}
                        date={selectedDay}
                        slots={selectedSlots}
                        onBook={handleBook}
                        isAuthenticated={isAuthenticated}
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
