import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreHorizontal,
    MapPin,
    Activity,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Clock,
    MapPin as MapIcon,
    Shield,
    Info,
    Camera,
    Building2
} from 'lucide-react';



import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


import { useManagementCourts } from '@/features/courts/hooks/useCourts';

import { courtService } from '@/features/courts/api/courtService';
import { Court, OperatingDay } from '@/features/courts/types/court.types';
import { SPORTS_LIST } from '@/features/courts/constants';
import { useAuthStore } from '@/data/useAuthStore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



const getCourtSchema = (t: (k: string) => string) => z.object({
    name: z.string().min(3, t('register.validation.nameMin')),
    city: z.string().min(2, t('catalog.searchCity')),
    neighborhood: z.string().min(2, t('gestor.courts.form.neighborhood')),
    address: z.string().min(5, t('gestor.courts.form.location')),
    hourlyRate: z.number().min(1, t('gestor.courts.form.price')),
    capacity: z.number().min(1, t('gestor.courts.form.capacity')),
    description: z.string().optional(),
    openingHour: z.number().min(0).max(23),
    closingHour: z.number().min(0).max(23),
    badge: z.string().optional(),
    type: z.number().min(1, t('gestor.courts.form.type')),
    status: z.number().optional(),
});

type CourtFormValues = z.infer<ReturnType<typeof getCourtSchema>>;

interface GalleryImage {
    id: string;
    url: string;
}

interface SortablePhotoItemProps {
    img: GalleryImage;
    mainImage: string | null;
    onSetMain: (url: string) => void;
    onRemove: (id: string) => void;
}

function SortablePhotoItem({ img, mainImage, onSetMain, onRemove }: SortablePhotoItemProps) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: img.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative aspect-video rounded-[2rem] overflow-hidden border-4 transition-all group ${isDragging ? 'opacity-50 scale-105' : ''
                } ${mainImage === img.url
                    ? 'border-[#8CE600] shadow-xl shadow-[#8CE600]/10'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'
                }`}
        >
            <img
                src={img.url}
                alt={t('gestor.courts.form.galleryTitle')}
                className="w-full h-full object-cover pointer-events-none select-none"
            />

            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
            />

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                <button
                    type="button"
                    onClick={() => onSetMain(img.url)}
                    className={`p-3 rounded-2xl transition-all ${mainImage === img.url
                            ? 'bg-[#8CE600] text-gray-950'
                            : 'bg-white/20 text-white hover:bg-[#8CE600] hover:text-gray-950'
                        }`}
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(img.id)}
                    className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
            {mainImage === img.url && (
                <div className="absolute top-4 left-4 bg-[#8CE600] text-gray-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg z-20">{t('common.cover')}</div>
            )}
        </div>
    );
}

export default function GestorCourt() {
    const { t } = useTranslation();
    
    const AMENITIES_OPTIONS = [
        t('gestor.courts.form.amenities.lockerRoom'),
        t('gestor.courts.form.amenities.parking'),
        t('gestor.courts.form.amenities.lighting'),
        t('gestor.courts.form.amenities.wifi'),
        t('gestor.courts.form.amenities.snackBar'),
        t('gestor.courts.form.amenities.shower'),
        t('gestor.courts.form.amenities.gym'),
        t('gestor.courts.form.amenities.pool'),
        t('gestor.courts.form.amenities.bleachers')
    ];

    const COURT_TYPES: { value: number; label: string }[] = useMemo(() => [
        { value: 1, label: t('sports.tennis') },
        { value: 2, label: t('sports.soccerSociety') },
        { value: 3, label: t('sports.footvolley') },
        { value: 4, label: t('sports.volleyball') },
        { value: 5, label: t('sports.basketball') },
        { value: 6, label: t('sports.futsal') },
        { value: 7, label: t('sports.beachTennis') },
        { value: 8, label: t('sports.padel') },
        { value: 9, label: t('sports.handball') },
        { value: 99, label: t('common.other') },
    ], [t]);

    const COURT_STATUS_OPTIONS = [
        { value: 1, label: t('gestor.courts.active') },
        { value: 3, label: t('gestor.courts.maintenance') },
        { value: 2, label: t('gestor.courts.inactive') },
    ];

    const DAYS_OF_WEEK = [
        { value: 0, label: t('common.days.sunday') },
        { value: 1, label: t('common.days.monday') },
        { value: 2, label: t('common.days.tuesday') },
        { value: 3, label: t('common.days.wednesday') },
        { value: 4, label: t('common.days.thursday') },
        { value: 5, label: t('common.days.friday') },
        { value: 6, label: t('common.days.saturday') },
    ];

    const INITIAL_SCHEDULE: OperatingDay[] = DAYS_OF_WEEK.map(day => ({
        day: day.value,
        openingHour: 6,
        closingHour: 23,
        isClosed: false
    }));

    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedType !== 'all') params.set('type', selectedType);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        setSearchParams(params, { replace: true });
    }, [searchTerm, selectedType, selectedStatus, setSearchParams]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);

    const [activeTab, setActiveTab] = useState('general');

    const { data: pagedData, isLoading } = useManagementCourts({
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        statuses: selectedStatus !== 'all' ? [selectedStatus] : undefined,
        pageSize: 100
    });
    const courts = pagedData?.items ?? [];


    const createMutation = useMutation({
        mutationFn: courtService.createCourt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courts'] });
            toast.success(t('gestor.courts.toasts.createSuccess'));
            setIsDialogOpen(false);
        },
        onError: () => toast.error(t('gestor.courts.toasts.createError'))
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Court> }) => courtService.updateCourt(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courts'] });
            toast.success(t('gestor.courts.toasts.updateSuccess'));
            setIsDialogOpen(false);
        },
        onError: () => toast.error(t('gestor.courts.toasts.updateError'))
    });

    const deleteMutation = useMutation({
        mutationFn: courtService.deleteCourt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courts'] });
            toast.success(t('gestor.courts.toasts.deleteSuccess'));
        },
        onError: () => toast.error(t('gestor.courts.toasts.deleteError'))
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CourtFormValues>({
        resolver: zodResolver(getCourtSchema(t)),
        defaultValues: {
            openingHour: 6,
            closingHour: 23,
            capacity: 10,
            type: 2
        }
    });

    const [selectedSportsList, setSelectedSportsList] = useState<string[]>([]);
    const watchType = watch('type');
    useEffect(() => {
        const typeLabel = COURT_TYPES.find(t => t.value === watchType)?.label;
        if (typeLabel && typeLabel !== t('common.other') && !selectedSportsList.includes(typeLabel)) {
            setSelectedSportsList(prev => [...prev, typeLabel]);
        }
    }, [watchType, selectedSportsList, t, COURT_TYPES]);

    const [selectedAmenitiesList, setSelectedAmenitiesList] = useState<string[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<OperatingDay[]>(INITIAL_SCHEDULE);
    const [newAmenity, setNewAmenity] = useState('');


    const handleAddCustomAmenity = () => {
        if (!newAmenity.trim()) return;
        if (!selectedAmenitiesList.includes(newAmenity.trim())) {
            setSelectedAmenitiesList(prev => [...prev, newAmenity.trim()]);
        }
        setNewAmenity('');
    };



    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setGalleryImages(prev => {
                    const newImage = { id: Math.random().toString(36).substring(7) + Date.now(), url: base64String };
                    const newGallery = [...prev, newImage];
                    if (!mainImage) setMainImage(base64String);
                    return newGallery;
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (id: string) => {
        setGalleryImages(prev => {
            const imgToRemove = prev.find(img => img.id === id);
            const newGallery = prev.filter(img => img.id !== id);
            if (imgToRemove && mainImage === imgToRemove.url) {
                setMainImage(newGallery.length > 0 ? newGallery[0].url : null);
            }
            return newGallery;
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setGalleryImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleSport = (sport: string) => {
        setSelectedSportsList(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenitiesList(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
    };

    const updateSchedule = (day: number, field: keyof OperatingDay, value: OperatingDay[keyof OperatingDay]) => {
        setSchedules(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));
    };

    const applyToAllDays = (opening: number, closing: number) => {
        setSchedules(prev => prev.map(s => ({ ...s, openingHour: opening, closingHour: closing, isClosed: false })));
    };


    const handleOpenCreate = () => {
        setEditingCourt(null);
        setSelectedSportsList([]);
        setSelectedAmenitiesList([]);
        setGalleryImages([]);
        setMainImage(null);
        setSchedules(INITIAL_SCHEDULE);
        setActiveTab('general');
        reset({
            name: '',
            city: '',
            neighborhood: '',
            address: '',
            hourlyRate: 100,
            capacity: 10,
            description: '',
            openingHour: 6,
            closingHour: 23,
            badge: '',
            type: 2,
            status: 1
        });
        setIsDialogOpen(true);
    };


    const handleOpenEdit = (court: Court) => {
        setEditingCourt(court);
        setSelectedSportsList(court.sports || []);
        setSelectedAmenitiesList(court.amenities || []);
        setGalleryImages((court.imagesBase64 || []).map(url => ({
            id: Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7),
            url
        })));
        setMainImage(court.mainImageBase64 || null);
        setSchedules(court.schedules && court.schedules.length > 0 ? court.schedules : INITIAL_SCHEDULE);
        setActiveTab('general');
        reset({
            name: court.name,
            city: court.city,
            neighborhood: court.neighborhood,
            address: court.address,
            hourlyRate: court.hourlyRate,
            capacity: court.capacity,
            description: court.description || '',
            openingHour: court.openingHour,
            closingHour: court.closingHour,
            badge: court.badge || '',
            type: Number(court.type) || 2,
            status: court.status === 'available' ? 1 : (court.status === 'busy' ? 2 : (typeof court.status === 'number' ? court.status : 1))
        });
        setIsDialogOpen(true);
    };


    const onSubmit = (values: CourtFormValues) => {
        const payload = {
            ...values,
            price: values.hourlyRate,
            sports: selectedSportsList,
            amenities: selectedAmenitiesList,
            mainImageBase64: mainImage,
            imagesBase64: galleryImages.map(img => img.url),
            schedules: schedules,
            currentUserId: user?.id,
            currentUserRole: user?.role
        };


        if (editingCourt) {
            updateMutation.mutate({
                id: editingCourt.id,
                data: payload as Partial<Court>
            });
        } else {
            createMutation.mutate(payload as unknown as Court);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm(t('gestor.courts.deleteConfirm.desc'))) {
            deleteMutation.mutate(id);
        }
    };

    const sportToKey: Record<string, string> = {
        'Futebol Society': 'sports.soccerSociety',
        'Beach Tennis': 'sports.beachTennis',
        'Vôlei de Praia': 'sports.beachVolleyball',
        'Basquete': 'sports.basketball',
        'Futsal': 'sports.futsal',
        'Padel': 'sports.padel',
        'Tênis': 'sports.tennis',
        'Handebol': 'sports.handball',
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#8CE600]/10 border border-[#8CE600]/20 flex items-center justify-center text-[#8CE600]">
                            <Building2 className="w-6 h-6" />
                        </div>
                        {t('gestor.courts.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('gestor.courts.subtitle')}</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-[#8CE600] text-gray-950 hover:opacity-90 font-black px-6 py-6 rounded-2xl shadow-lg shadow-[#8CE600]/20">
                    <Plus className="w-5 h-5 mr-2" />
                    {t('gestor.courts.addCourt')}
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t('gestor.courts.stats.total'), value: pagedData?.totalCount || 0, icon: Activity, color: 'text-blue-500' },
                    { label: t('gestor.courts.stats.active'), value: courts.filter(c => c.status === 'available').length, icon: CheckCircle2, color: 'text-[#8CE600]' },
                    {
                        label: t('gestor.courts.stats.occupancy'),
                        value: courts.length > 0
                            ? `${Math.round((courts.filter(c => c.status === 'busy').length / courts.length) * 100)}%`
                            : '0%',
                        icon: TrendingUp,
                        color: 'text-purple-500'
                    },
                    { label: t('gestor.courts.stats.maintenance'), value: courts.filter(c => c.status === 'closed').length, icon: AlertCircle, color: 'text-amber-500' },
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
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t('gestor.courts.searchPlaceholder')}
                            className="pl-11 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#8CE600]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                                <SelectValue placeholder={t('gestor.courts.type')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                                <SelectItem value="all">{t('gestor.courts.allTypes')}</SelectItem>
                                {COURT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={String(type.value)}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full md:w-40 h-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-[#8CE600]/50">
                                <SelectValue placeholder={t('gestor.courts.status')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 dark:border-white/10">
                                <SelectItem value="all">{t('gestor.courts.allStatuses')}</SelectItem>
                                <SelectItem value="available">{t('gestor.courts.active')}</SelectItem>
                                <SelectItem value="busy">{t('gestor.courts.maintenance')}</SelectItem>
                                <SelectItem value="closed">{t('gestor.courts.closed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-gray-100 dark:border-white/10 hover:bg-transparent">
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.courts.table.court')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.courts.table.location')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.courts.table.price')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs uppercase tracking-widest text-gray-400">{t('gestor.courts.table.status')}</TableHead>
                                <TableHead className="px-6 py-4 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-gray-50 dark:border-white/5">
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-20 rounded-lg" /></TableCell>
                                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-10 ml-auto rounded-lg" /></TableCell>
                                    </TableRow>
                                ))
                            ) : courts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4">
                                                <AlertCircle className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold">{t('gestor.courts.noResults')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence>
                                    {courts.map((court) => (
                                        <motion.tr key={court.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/10 flex-shrink-0">
                                                        <img src={court.img} alt={court.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-gray-900 dark:text-white">{court.name}</p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {(court.sports || []).slice(0, 2).map(s => (
                                                                <span key={s} className="text-[9px] font-bold text-[#8CE600] bg-[#8CE600]/10 px-1.5 py-0.5 rounded-full">
                                                                    {t(sportToKey[s] || s)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                    <MapPin className="w-3.5 h-3.5 text-[#8CE600]" />
                                                    {court.city}, {court.neighborhood}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <p className="font-black text-sm text-gray-900 dark:text-white">R$ {court.hourlyRate}</p>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${court.frontendStatus === 'available'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : court.frontendStatus === 'busy'
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    {court.frontendStatus === 'available' ? t('gestor.courts.active') : (court.frontendStatus === 'busy' ? t('gestor.courts.maintenance') : t('gestor.courts.closed'))}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-[#8CE600]/10 hover:text-[#8CE600]">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('gestor.courts.table.actions')}</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleOpenEdit(court)} className="flex items-center gap-2 text-xs font-bold py-2.5 rounded-xl cursor-pointer">
                                                            <Edit2 className="w-3.5 h-3.5" /> {t('gestor.courts.edit')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10" />
                                                        <DropdownMenuItem onClick={() => handleDelete(court.id)} className="flex items-center gap-2 text-xs font-bold text-red-500 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10!">
                                                            <Trash2 className="w-3.5 h-3.5" /> {t('gestor.courts.delete')}
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl bg-white dark:bg-background border-none rounded-[2.5rem] shadow-2xl p-0 overflow-hidden flex flex-col h-[90vh]">
                    <div className="flex h-full overflow-hidden">

                        <div className="w-64 bg-gray-50 dark:bg-white/[0.02] border-r border-gray-100 dark:border-white/10 p-8 flex flex-col">
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-[#8CE600] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#8CE600]/20">
                                    <Building2 className="w-6 h-6 text-gray-950" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight">{editingCourt ? t('gestor.courts.edit') : t('gestor.courts.addCourt')}</h2>
                            </div>

                            <nav className="flex-1 space-y-2">
                                {[
                                    { id: 'general', label: t('gestor.courts.form.tabs.general'), icon: Info },
                                    { id: 'location', label: t('gestor.courts.form.tabs.location'), icon: MapIcon },
                                    { id: 'features', label: t('gestor.courts.form.tabs.features'), icon: Shield },
                                    { id: 'media', label: t('gestor.courts.form.tabs.media'), icon: Camera },
                                    { id: 'availability', label: t('gestor.courts.form.tabs.availability'), icon: Clock },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                                                ? 'bg-[#8CE600] text-gray-950 shadow-md shadow-[#8CE600]/20'
                                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-background">
                            <ScrollArea className="flex-1 p-8">
                                <form id="court-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                                    {activeTab === 'general' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-8 bg-[#8CE600] rounded-full" />
                                                <h3 className="text-xl font-black">{t('gestor.courts.form.tabs.general')}</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.name')}</Label>
                                                    <Input {...register('name')} placeholder={t('gestor.courts.form.namePlaceholder')} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                    {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
                                                </div>

                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.type')}</Label>
                                                    <select
                                                        {...register('type', { valueAsNumber: true })}
                                                        className="w-full h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-2 focus-visible:ring-[#8CE600]/50 px-4 appearance-none outline-none"
                                                    >
                                                        {COURT_TYPES.map(type => (
                                                            <option key={type.value} value={type.value} className="bg-white dark:bg-background">
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.price')}</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                                        <Input type="number" {...register('hourlyRate', { valueAsNumber: true })} className="h-14 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.capacity')}</Label>
                                                    <Input type="number" {...register('capacity', { valueAsNumber: true })} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                </div>

                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.description')}</Label>
                                                    <Textarea {...register('description')} placeholder={t('gestor.courts.form.descPlaceholder')} className="bg-gray-50 dark:bg-white/5 border-none rounded-3xl text-sm font-medium focus-visible:ring-[#8CE600]/50 min-h-[150px] p-4" />
                                                </div>

                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.badge')}</Label>
                                                    <Input {...register('badge')} placeholder={t('gestor.courts.form.badgePlaceholder')} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                </div>

                                                <div className="space-y-4 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.status')}</Label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {COURT_STATUS_OPTIONS.map(opt => {
                                                            const isSelected = watch('status') === opt.value;
                                                            const colors = {
                                                                1: isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20',
                                                                2: isSelected ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-amber-500/5 text-amber-600 border-amber-500/20',
                                                                3: isSelected ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-red-500/5 text-red-600 border-red-500/20',
                                                            }[opt.value as 1 | 2 | 3];

                                                            return (
                                                                <button
                                                                    key={opt.value}
                                                                    type="button"
                                                                    onClick={() => setValue('status', opt.value)}
                                                                    className={`flex items-center justify-center gap-2 h-14 rounded-2xl text-xs font-black border transition-all ${colors} ${!isSelected && 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                                                >
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : colors.split(' ')[1].replace('text-', 'bg-')}`} />
                                                                    {opt.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'location' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                                <h3 className="text-xl font-black">{t('gestor.courts.form.tabs.location')}</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.location')}</Label>
                                                    <div className="relative">
                                                        <MapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <Input {...register('address')} placeholder={t('gestor.courts.form.addressPlaceholder')} className="h-14 pl-12 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.neighborhood')}</Label>
                                                    <Input {...register('neighborhood')} placeholder={t('gestor.courts.form.neighborhoodPlaceholder')} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t('gestor.courts.form.city')}</Label>
                                                    <Input {...register('city')} placeholder={t('gestor.courts.form.cityPlaceholder')} className="h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-base font-bold focus-visible:ring-[#8CE600]/50" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'features' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                                    <h3 className="text-xl font-black">{t('gestor.courts.form.sportsTitle')}</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-2 p-6 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                                                    {SPORTS_LIST.map(sport => (
                                                        <button
                                                            key={sport}
                                                            type="button"
                                                            onClick={() => toggleSport(sport)}
                                                            className={`px-5 py-2.5 rounded-2xl text-xs font-black border transition-all ${selectedSportsList.includes(sport)
                                                                    ? 'bg-[#8CE600] border-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/20 scale-105'
                                                                    : 'bg-white dark:bg-background border-gray-100 dark:border-white/10 text-gray-500 hover:border-[#8CE600]/50'
                                                                }`}
                                                        >
                                                            {sport}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-8 bg-purple-500 rounded-full" />
                                                        <h3 className="text-xl font-black">{t('gestor.courts.form.extrasTitle')}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={newAmenity}
                                                            onChange={(e) => setNewAmenity(e.target.value)}
                                                            placeholder={t('gestor.courts.form.newAmenity')}
                                                            className="h-9 w-40 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs font-bold"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleAddCustomAmenity();
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddCustomAmenity}
                                                            size="sm"
                                                            className="h-9 w-9 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 p-6 bg-gray-50 dark:bg-white/[0.02] rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                                                    {Array.from(new Set([...AMENITIES_OPTIONS, ...selectedAmenitiesList])).map(amenity => (
                                                        <button
                                                            key={amenity}
                                                            type="button"
                                                            onClick={() => toggleAmenity(amenity)}
                                                            className={`px-5 py-2.5 rounded-2xl text-xs font-black border transition-all ${selectedAmenitiesList.includes(amenity)
                                                                    ? 'bg-[#8CE600] border-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/20 scale-105'
                                                                    : 'bg-white dark:bg-background border-gray-100 dark:border-white/10 text-gray-500 hover:border-[#8CE600]/50'
                                                                }`}
                                                        >
                                                            {amenity}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                    {activeTab === 'media' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-8 bg-pink-500 rounded-full" />
                                                    <h3 className="text-xl font-black">{t('gestor.courts.form.galleryTitle')}</h3>
                                                </div>
                                                <label className="bg-[#8CE600] text-gray-950 px-4 py-2 rounded-xl text-xs font-black cursor-pointer hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#8CE600]/20">
                                                    <Plus className="w-4 h-4" /> {t('gestor.courts.form.upload')}
                                                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                                                </label>
                                            </div>

                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={galleryImages.map(img => img.id)}
                                                    strategy={rectSortingStrategy}
                                                >
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <AnimatePresence>
                                                            {galleryImages.map((img) => (
                                                                <SortablePhotoItem
                                                                    key={img.id}
                                                                    img={img}
                                                                    mainImage={mainImage}
                                                                    onSetMain={setMainImage}
                                                                    onRemove={removeImage}
                                                                />
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                </SortableContext>
                                            </DndContext>
                                            {galleryImages.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                                                    <Camera className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                                                    <p className="text-sm font-bold text-gray-500">{t('gestor.courts.form.noImages')}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'availability' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                                                    <h3 className="text-xl font-black">{t('gestor.courts.form.hoursTitle')}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => applyToAllDays(8, 22)} className="text-[10px] font-black uppercase h-8 rounded-lg hover:bg-[#8CE600]/10 hover:text-[#8CE600]">{t('gestor.courts.form.default8')}</Button>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => applyToAllDays(6, 23)} className="text-[10px] font-black uppercase h-8 rounded-lg hover:bg-[#8CE600]/10 hover:text-[#8CE600]">{t('gestor.courts.form.total6')}</Button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {DAYS_OF_WEEK.map(day => {
                                                    const schedule = schedules.find(s => s.day === day.value) || INITIAL_SCHEDULE[0];
                                                    return (
                                                        <div key={day.value} className={`flex items-center gap-6 p-5 rounded-[2rem] border transition-all ${schedule.isClosed ? 'bg-red-50/30 dark:bg-red-950/10 border-red-100 dark:border-red-900/30' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-[#8CE600]/30'}`}>
                                                            <div className="w-32">
                                                                <p className="text-sm font-black text-gray-900 dark:text-white">{day.label}</p>
                                                                <p className={`text-[10px] font-bold uppercase ${schedule.isClosed ? 'text-red-500' : 'text-emerald-500'}`}>{schedule.isClosed ? t('gestor.courts.form.closedState') : t('gestor.courts.form.openState')}</p>
                                                            </div>

                                                            <div className="flex-1 flex items-center gap-8">
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                                                        <span>{t('gestor.courts.form.openingPrefix')} {schedule.openingHour}h</span>
                                                                        <span>{t('gestor.courts.form.closingPrefix')} {schedule.closingHour}h</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <Input
                                                                            type="range" min="0" max="23"
                                                                            value={schedule.openingHour}
                                                                            disabled={schedule.isClosed}
                                                                            onChange={(e) => updateSchedule(day.value, 'openingHour', parseInt(e.target.value))}
                                                                            className="h-1.5 flex-1 appearance-none bg-gray-200 dark:bg-white/10 rounded-full accent-[#8CE600]"
                                                                        />
                                                                        <Input
                                                                            type="range" min="0" max="23"
                                                                            value={schedule.closingHour}
                                                                            disabled={schedule.isClosed}
                                                                            onChange={(e) => updateSchedule(day.value, 'closingHour', parseInt(e.target.value))}
                                                                            className="h-1.5 flex-1 appearance-none bg-gray-200 dark:bg-white/10 rounded-full accent-[#8CE600]"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col items-center gap-1.5">
                                                                    <Label className="text-[9px] font-black uppercase text-gray-400">Status</Label>
                                                                    <Switch
                                                                        checked={!schedule.isClosed}
                                                                        onCheckedChange={(checked) => updateSchedule(day.value, 'isClosed', !checked)}
                                                                        className="data-[state=checked]:bg-[#8CE600]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}


                                </form>
                            </ScrollArea>

                            <div className="p-8 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl font-bold h-12 px-6">{t('gestor.courts.form.discard')}</Button>
                                <div className="flex items-center gap-3">
                                    <Button
                                        form="court-form"
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                        className="bg-[#8CE600] text-gray-950 hover:opacity-90 font-black h-12 px-10 rounded-2xl shadow-xl shadow-[#8CE600]/20"
                                    >
                                        {(createMutation.isPending || updateMutation.isPending) ? (
                                            <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> {t('gestor.courts.form.saving')}</span>
                                        ) : editingCourt ? t('gestor.courts.form.saveChanges') : t('gestor.courts.form.createCourt')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
