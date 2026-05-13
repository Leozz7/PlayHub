import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SPORTS_LIST as HARDCODED_SPORTS, CITIES as HARDCODED_CITIES } from '@/pages/CatalogData';
import { useCourts, useCourtsFilters } from '@/features/courts/hooks/useCourts';
import { SPORT_ICONS } from '@/components/SportIcons';
import { CourtCard, CourtRow } from '@/components/CourtCard';
import { SEO } from '@/components/SEO';

import { 
    Search, 
    Filter, 
    X, 
    LayoutGrid, 
    List, 
    ChevronDown
} from 'lucide-react';

const SearchIcon = () => <Search className="w-4 h-4" strokeWidth={1.5} />;
const FilterIcon = () => <Filter className="w-4 h-4" strokeWidth={1.5} />;
const XIcon = () => <X className="w-3.5 h-3.5" strokeWidth={1.5} />;
const GridIcon = () => <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />;
const ListIcon = () => <List className="w-4 h-4" strokeWidth={1.5} />;
const ChevronIcon = ({ open }: { open: boolean }) => (
    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
);


function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-200/50 dark:border-white/10/50 pb-4 mb-4">
            <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3 hover:text-[#8CE600] transition-colors">
                {title}<ChevronIcon open={open} />
            </button>
            {open && <div className="animate-in fade-in slide-in-from-top-2 duration-300 ease-out">{children}</div>}
        </div>
    );
}

function PillFilter({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 cursor-pointer ${
                checked
                    ? 'bg-gray-50/80 dark:bg-white/5 text-[#8CE600] border-[#8CE600]/30 shadow-[0_2px_10px_-3px_rgba(140,230,0,0.15)]'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
            {checked && <span className="w-1.5 h-1.5 rounded-full bg-[#8CE600] shrink-0 animate-pulse shadow-[0_0_8px_rgba(140,230,0,0.4)]" />}
            {label}
        </button>
    );
}

type SortKey = 'rating' | 'price_asc' | 'price_desc' | 'reviews';

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const options: Record<SortKey, string> = {
        rating: t('catalog.sortKeys.rating'),
        price_asc: t('catalog.sortKeys.price_asc'),
        price_desc: t('catalog.sortKeys.price_desc'),
        reviews: t('catalog.sortKeys.reviews'),
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 hover:border-[#8CE600] dark:hover:border-[#8CE600] transition-all focus:outline-none focus:ring-2 focus:ring-[#8CE600]/50 min-w-[150px] justify-between cursor-pointer"
            >
                <span className="truncate">{options[value]}</span>
                <ChevronIcon open={open} />
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-background border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {Object.entries(options).map(([k, label]) => {
                        const isSelected = value === k;
                        return (
                            <button
                                key={k}
                                onClick={() => {
                                    onChange(k as SortKey);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors cursor-pointer ${isSelected
                                    ? 'bg-[#8CE600]/10 text-[#8CE600]'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {label}
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#8CE600]" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Catalog() {
    const { t } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { data: filtersData } = useCourtsFilters();
    const dynamicSports = filtersData?.sports || [];
    const dynamicCities = filtersData?.cities || [];
    
    const sportsList = dynamicSports.length > 0 ? dynamicSports : HARDCODED_SPORTS;
    const citiesList = dynamicCities.length > 0 ? dynamicCities : HARDCODED_CITIES;
    
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [sportQuery, setSportQuery] = useState('');
    const [cityQuery, setCityQuery] = useState('');
    const [selectedSports, setSelectedSports] = useState<string[]>(
        searchParams.getAll('sports').length > 0 
            ? searchParams.getAll('sports') 
            : (location.state?.selectedSport ? [location.state.selectedSport] : [])
    );
    const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.getAll('cities'));
    const [selectedStatus, setSelectedStatus] = useState<string[]>(searchParams.getAll('statuses'));
    const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
    const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('price')) || 250);
    const [selectedDate, setSelectedDate] = useState<string>(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
    const [selectedHour, setSelectedHour] = useState<number | null>(
        searchParams.get('hour') ? Number(searchParams.get('hour')) : null
    );
    const [sortBy, setSortBy] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'rating');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>((searchParams.get('view') as 'grid' | 'list') || 'grid');
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [pageNumber, setPageNumber] = useState(Number(searchParams.get('page')) || 1);
    const pageSize = 25;

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        selectedSports.forEach(s => params.append('sports', s));
        selectedCities.forEach(c => params.append('cities', c));
        selectedStatus.forEach(s => params.append('statuses', s));
        if (minRating > 0) params.set('rating', String(minRating));
        if (maxPrice < 250) params.set('price', String(maxPrice));
        if (selectedDate) params.set('date', selectedDate);
        if (selectedHour !== null) params.set('hour', String(selectedHour));
        if (sortBy !== 'rating') params.set('sort', sortBy);
        if (viewMode !== 'grid') params.set('view', viewMode);
        if (pageNumber > 1) params.set('page', String(pageNumber));
        
        setSearchParams(params, { replace: true });
    }, [search, selectedSports, selectedCities, selectedStatus, minRating, maxPrice, selectedDate, selectedHour, sortBy, viewMode, pageNumber, setSearchParams]);


    useEffect(() => {
        if (location.state?.selectedSport) {
            setSelectedSports([location.state.selectedSport]);
        }
    }, [location.state?.selectedSport]);

    const toggleArr = <T,>(arr: T[], setArr: (v: T[]) => void, item: T) =>
        setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);

    const queryParams = useMemo(() => ({
        cities: selectedCities.length > 0 ? selectedCities : undefined,
        statuses: selectedStatus.length > 0 ? selectedStatus : undefined,
        neighborhood: undefined,
        sports: selectedSports.length > 0 ? selectedSports : undefined,
        hour: selectedHour ?? undefined,
        maxPrice: maxPrice < 250 ? maxPrice : undefined,
        date: selectedDate || undefined,
        search: search || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        pageNumber,
        pageSize,
    }), [selectedCities, selectedStatus, selectedSports, selectedHour, maxPrice, selectedDate, search, minRating, pageNumber]);


    const { data: pagedData, isLoading, isError } = useCourts(queryParams);
    const courts = pagedData?.items ?? [];


    const filtered = useMemo(() => {
        if (!Array.isArray(courts)) return [];
        return [...courts].sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
            return 0;
        });
    }, [courts, sortBy]);

    const activeFilters = [
        ...selectedSports, ...selectedCities,
        ...selectedStatus.map(s => t(`catalog.statusLabels.${s}`)),
        ...(minRating > 0 ? [`≥ ${minRating}★`] : []),
        ...(maxPrice < 250 ? [`≤ R$${maxPrice}`] : []),
        ...(selectedDate && !isNaN(new Date(selectedDate + 'T12:00:00').getTime()) ? [format(new Date(selectedDate + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })] : []),
        ...(selectedHour !== null ? [`${selectedHour}h`] : []),
    ];

    const clearAll = () => {
        setSelectedSports([]); setSelectedCities([]); setSelectedStatus([]);
        setMinRating(0); setMaxPrice(250); setSearch('');
        setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setSelectedHour(null);
        setSportQuery(''); setCityQuery('');
        setPageNumber(1);
    };


    return (
        <div className="min-h-screen bg-white dark:bg-background text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-500 flex flex-col">
            <SEO 
                title={t('catalog.seo.title', 'Catálogo de Quadras - PlayHub')}
                description={t('catalog.seo.description', 'Encontre e reserve as melhores quadras de {{sports}} em {{cities}}. Filtre por preço, avaliação e disponibilidade.', { 
                    sports: selectedSports.length > 0 ? selectedSports.join(', ') : 'todos os esportes',
                    cities: selectedCities.length > 0 ? selectedCities.join(', ') : 'sua região'
                })}
            />
            <Header />

            <section className="relative pt-28 pb-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-background overflow-hidden">
                {(() => {
                    const Icon1 = SPORT_ICONS[0];
                    const Icon2 = SPORT_ICONS[4];
                    const Icon3 = SPORT_ICONS[3];
                    return (
                        <>
                            <div className="absolute top-0 right-10 text-[#8CE600] opacity-[0.08] dark:opacity-[0.04] rotate-12 w-64 h-64 pointer-events-none">
                                <Icon1 className="w-full h-full" />
                            </div>
                            <div className="absolute -bottom-10 right-1/4 text-[#8CE600] opacity-[0.08] dark:opacity-[0.04] -rotate-12 w-48 h-48 pointer-events-none">
                                <Icon2 className="w-full h-full" />
                            </div>
                            <div className="absolute top-10 left-10 text-[#8CE600] opacity-[0.08] dark:opacity-[0.04] -rotate-45 w-40 h-40 pointer-events-none">
                                <Icon3 className="w-full h-full" />
                            </div>
                        </>
                    );
                })()}
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-3">{t('catalog.title')}</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
                        {t('catalog.heading')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                        {t('catalog.description', { count: pagedData?.totalCount || 0 })}
                    </p>



                    <div className="relative mt-8 max-w-xl">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('catalog.searchPlaceholder')}
                            className="pl-11 h-12 rounded-2xl bg-white dark:bg-background border-gray-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"><XIcon /></button>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8 w-full flex-1">

                <aside
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    className={`shrink-0 transition-all duration-500 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden ${filtersOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
                >
                    <div className="w-72 rounded-2xl bg-white/80 dark:bg-background/80 backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{t('catalog.filtersTitle')}</h2>
                            {activeFilters.length > 0 && (
                                <button onClick={clearAll} className="text-xs font-bold text-[#8CE600] hover:underline">{t('catalog.clearAll')}</button>
                            )}
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5">
                                {activeFilters.map(f => (
                                    <span key={f} className="flex items-center gap-1.5 text-[10px] font-semibold bg-gray-50/80 dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-full shadow-sm">
                                        <span className="w-1 h-1 rounded-full bg-[#8CE600] shrink-0" />
                                        {f}
                                    </span>
                                ))}
                            </div>
                        )}

                        <FilterSection title={t('catalog.availability')}>
                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('catalog.selectDate')}</p>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    placeholder="DD/MM/AAAA"
                                />
                                    {selectedDate && !isNaN(new Date(selectedDate + 'T12:00:00').getTime()) && (
                                        <p className="text-[10px] text-[#8CE600] font-semibold">
                                            {t('catalog.showingCourtsFor', { date: format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR }) })}
                                        </p>
                                    )}
                            </div>

                            <div className="space-y-2 mt-4">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('catalog.selectHour', 'Selecione o horário')}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setSelectedHour(selectedHour === h ? null : h)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
                                                selectedHour === h
                                                    ? 'bg-gray-50/80 dark:bg-white/5 text-[#8CE600] border-[#8CE600]/30 shadow-[0_2px_10px_-3px_rgba(140,230,0,0.15)]'
                                                    : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </FilterSection>

                        <FilterSection title={t('catalog.sport')}>
                            <div className="relative mb-3 group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8CE600] transition-colors"><SearchIcon /></span>
                                <input
                                    type="text"
                                    value={sportQuery}
                                    onChange={e => setSportQuery(e.target.value)}
                                    placeholder={t('catalog.searchSport', 'Buscar esporte...')}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600] transition-all placeholder:text-gray-400 dark:text-white"
                                />
                                {sportQuery && (
                                    <button onClick={() => setSportQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                        <XIcon />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {sportsList.filter(s => s.toLowerCase().includes(sportQuery.toLowerCase())).map(s => (
                                    <PillFilter key={s} label={s} checked={selectedSports.includes(s)} onChange={() => toggleArr(selectedSports, setSelectedSports, s)} />
                                ))}
                                {sportsList.filter(s => s.toLowerCase().includes(sportQuery.toLowerCase())).length === 0 && (
                                    <p className="text-xs text-gray-500 text-center py-2 w-full">{t('catalog.noSportFound', 'Nenhum esporte encontrado.')}</p>
                                )}
                            </div>
                        </FilterSection>

                        <FilterSection title={t('catalog.city')}>
                            <div className="relative mb-3 group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8CE600] transition-colors"><SearchIcon /></span>
                                <input
                                    type="text"
                                    value={cityQuery}
                                    onChange={e => setCityQuery(e.target.value)}
                                    placeholder={t('catalog.searchCity', 'Buscar cidade...')}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8CE600]/30 focus:border-[#8CE600] transition-all placeholder:text-gray-400 dark:text-white"
                                />
                                {cityQuery && (
                                    <button onClick={() => setCityQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                        <XIcon />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {citiesList.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase())).map(c => (
                                    <PillFilter key={c} label={c} checked={selectedCities.includes(c)} onChange={() => toggleArr(selectedCities, setSelectedCities, c)} />
                                ))}
                                {citiesList.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase())).length === 0 && (
                                    <p className="text-xs text-gray-500 text-center py-2 w-full">{t('catalog.noCityFound', 'Nenhuma cidade encontrada.')}</p>
                                )}
                            </div>
                        </FilterSection>

                        <FilterSection title={t('catalog.status')}>
                            <div className="flex flex-wrap gap-1.5">
                                {(['available', 'busy', 'closed'] as const).map(s => {
                                    const label = { available: t('catalog.statusLabels.available'), busy: t('catalog.statusLabels.busy'), closed: t('catalog.statusLabels.closed') }[s];
                                    return <PillFilter key={s} label={label} checked={selectedStatus.includes(s)} onChange={() => toggleArr(selectedStatus, setSelectedStatus, s)} />;
                                })}
                            </div>
                        </FilterSection>

                        <FilterSection title={t('catalog.minRating')}>
                            {[4.5, 4, 3.5, 0].map(r => (
                                <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                                    <div onClick={() => setMinRating(r)} className={`w-4 h-4 rounded-full border-2 transition-all ${minRating === r ? 'bg-[#8CE600] border-[#8CE600]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#8CE600]'}`} />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        {r === 0 ? t('catalog.anyRating') : t('catalog.ratingOrMore', { rating: r })}
                                    </span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title={t('catalog.maxPrice')}>
                            <div className="px-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-500">R$ 0</span>
                                    <span className="text-sm font-black text-[#8CE600]">R$ {maxPrice}{maxPrice === 250 ? '+' : ''}</span>
                                </div>
                                <div className="relative h-5 flex items-center">
                                    <div className="absolute w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div
                                        className="absolute h-1.5 rounded-full bg-[#8CE600]"
                                        style={{ width: `${((maxPrice - 30) / (250 - 30)) * 100}%` }}
                                    />
                                    <input
                                        type="range" min={30} max={250} step={10} value={maxPrice}
                                        onChange={e => setMaxPrice(Number(e.target.value))}
                                        className="relative w-full appearance-none bg-transparent cursor-pointer
                                            [&::-webkit-slider-thumb]:appearance-none
                                            [&::-webkit-slider-thumb]:w-4
                                            [&::-webkit-slider-thumb]:h-4
                                            [&::-webkit-slider-thumb]:rounded-full
                                            [&::-webkit-slider-thumb]:bg-white
                                            [&::-webkit-slider-thumb]:border-2
                                            [&::-webkit-slider-thumb]:border-[#8CE600]
                                            [&::-webkit-slider-thumb]:shadow-md
                                            [&::-webkit-slider-thumb]:shadow-[#8CE600]/40
                                            [&::-webkit-slider-thumb]:transition-transform
                                            [&::-webkit-slider-thumb]:hover:scale-125
                                            [&::-moz-range-thumb]:appearance-none
                                            [&::-moz-range-thumb]:w-4
                                            [&::-moz-range-thumb]:h-4
                                            [&::-moz-range-thumb]:rounded-full
                                            [&::-moz-range-thumb]:bg-white
                                            [&::-moz-range-thumb]:border-2
                                            [&::-moz-range-thumb]:border-[#8CE600]
                                            [&::-moz-range-thumb]:shadow-md
                                            [&::-moz-range-thumb]:cursor-pointer
                                            [&::-webkit-slider-runnable-track]:bg-transparent
                                            [&::-moz-range-track]:bg-transparent"
                                    />
                                </div>
                            </div>
                        </FilterSection>

                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setFiltersOpen(v => !v)}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-[#8CE600] dark:hover:text-[#8CE600] transition-all bg-white dark:bg-background border border-gray-200 dark:border-white/10 px-3 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                            >
                                <FilterIcon />
                                {filtersOpen ? t('catalog.hide') : t('catalog.filtersTitle')}
                                {activeFilters.length > 0 && <span className="bg-[#8CE600] text-gray-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilters.length}</span>}
                            </button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-white">{pagedData?.totalCount || 0}</span> {t('catalog.courtsFound')}
                            </span>

                        </div>

                        <div className="flex items-center gap-3">
                            <SortDropdown value={sortBy} onChange={setSortBy} />

                            <div className="flex items-center bg-white dark:bg-background border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <button onClick={() => setViewMode('grid')} className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><GridIcon /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 transition-all ${viewMode === 'list' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><ListIcon /></button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-28 gap-4">
                            <div className="w-12 h-12 border-4 border-[#8CE600]/20 border-t-[#8CE600] rounded-full animate-spin" />
                            <p className="text-sm font-bold text-gray-500">{t('catalog.loading', 'Carregando quadras...')}</p>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-28 text-center">
                            <h3 className="text-xl font-black text-red-500 mb-2">{t('catalog.errorLoading')}</h3>
                            <p className="text-gray-500 text-sm">{t('catalog.errorLoadingDesc')}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-28 text-center">
                            <div className="relative w-24 h-24 rounded-[2rem] bg-gray-50 dark:bg-background/50 border border-gray-100 dark:border-white/10 shadow-xl shadow-gray-200/20 dark:shadow-black/20 flex items-center justify-center mb-6 text-[#8CE600]">
                                <div className="absolute inset-0 bg-[#8CE600]/10 blur-xl rounded-[2rem]" />
                                <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.803 15.803A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l5 5m0-5l-5 5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-2">{t('catalog.noCourts')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('catalog.noCourtsDesc')}</p>
                            <button onClick={clearAll} className="px-6 py-2.5 rounded-xl bg-[#8CE600] text-gray-950 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">{t('catalog.clearFiltersBtn')}</button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filtered.map((court) => <CourtCard key={court.id} court={court} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filtered.map((court) => <CourtRow key={court.id} court={court} />)}
                        </div>
                    )}

                    {pagedData && pagedData.totalPages > 1 && (
                        <div className="mt-20 mb-10 flex flex-col items-center gap-6">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
                            
                            <div className="flex items-center gap-2 p-1.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100/50 dark:border-white/10 rounded-2xl backdrop-blur-sm">
                                <button
                                    onClick={() => {
                                        setPageNumber(prev => Math.max(1, prev - 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={!pagedData.hasPreviousPage}
                                    className="p-2.5 rounded-xl border border-transparent text-gray-500 disabled:opacity-30 enabled:hover:bg-white dark:enabled:hover:bg-black enabled:hover:text-[#8CE600] enabled:hover:border-gray-100 dark:enabled:hover:border-white/10 transition-all cursor-pointer"
                                    title="Anterior"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pagedData.totalPages }, (_, i) => i + 1).map(p => {
                                        const isCurrent = p === pageNumber;
                                        // Simple logic to show current, first, last and neighbors
                                        const show = p === 1 || p === pagedData.totalPages || Math.abs(p - pageNumber) <= 1;
                                        
                                        if (!show) {
                                            if (p === 2 || p === pagedData.totalPages - 1) return <span key={p} className="w-8 text-center text-gray-400">...</span>;
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    setPageNumber(p);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/20 scale-110 z-10'
                                                        : 'text-gray-500 hover:bg-white dark:hover:bg-black hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => {
                                        setPageNumber(prev => Math.min(pagedData.totalPages, prev + 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={!pagedData.hasNextPage}
                                    className="p-2.5 rounded-xl border border-transparent text-gray-500 disabled:opacity-30 enabled:hover:bg-white dark:enabled:hover:bg-black enabled:hover:text-[#8CE600] enabled:hover:border-gray-100 dark:enabled:hover:border-white/10 transition-all cursor-pointer"
                                    title="Próxima"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                            
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Página {pageNumber} de {pagedData.totalPages} • Total de {pagedData.totalCount} quadras
                            </p>
                        </div>
                    )}


                </div>
            </div>

            <Footer />
        </div>
    );
}



