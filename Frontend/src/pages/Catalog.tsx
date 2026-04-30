import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Stars } from '@/components/ui/Stars';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CATALOG_COURTS, SPORTS_LIST, CITIES, type Court } from '@/pages/CatalogData';

// Componentes de ícones
const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
const FilterIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const LocationIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ClockIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const XIcon = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const GridIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const ListIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const ChevronIcon = ({ open }: { open: boolean }) => <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>;

// Sub-componentes do catálogo
function StatusPill({ status }: { status: Court['status'] }) {
    const { t } = useTranslation();
    const map = {
        available: { label: t('catalog.statusLabels.available'), cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        busy:      { label: t('catalog.statusLabels.busy'),    cls: 'bg-amber-500/10  text-amber-500  border-amber-500/20'  },
        closed:    { label: t('catalog.statusLabels.closed'),    cls: 'bg-red-500/10    text-red-500    border-red-500/20'    },
    }[status];
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${map.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {map.label}
        </span>
    );
}

function AmenityChip({ label }: { label: string }) {
    return <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{label}</span>;
}

function CourtCard({ court }: { court: Court }) {
    return (
        <Link to={`/courts/${court.id}`} className="group block bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-black/40 transition-all duration-300">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                    <img src={court.img} alt={court.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {court.badge && (
                        <div className="absolute top-3 left-3 bg-[#8CE600] text-gray-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                            {court.badge}
                        </div>
                    )}
                    <div className="absolute bottom-3 right-3"><StatusPill status={court.status} /></div>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-black text-base tracking-tight text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors leading-tight">{court.name}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                            <Stars rating={court.rating} />
                        </div>
                    </div>

                    <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <LocationIcon /> {court.location}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                        {court.sports.map(s => (
                            <span key={s} className="text-[10px] font-bold text-[#8CE600] bg-[#8CE600]/10 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                        {court.amenities.slice(0, 3).map(a => <AmenityChip key={a} label={a} />)}
                        {court.amenities.length > 3 && <AmenityChip label={`+${court.amenities.length - 3}`} />}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            {court.oldPrice && <p className="text-[10px] text-gray-400 line-through">R$ {court.oldPrice}/h</p>}
                            <p className="font-black text-lg text-gray-900 dark:text-white">
                                R$ {court.price}<span className="text-xs font-normal text-gray-500">/h</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                            <ClockIcon />
                            {court.openingHour}h–{court.closingHour}h
                        </div>
                    </div>
                </div>
            </Link>
    );
}

function CourtRow({ court }: { court: Court }) {
    return (
        <Link to={`/courts/${court.id}`} className="group flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/30 transition-all duration-300 p-4">
                <div className="relative w-28 h-24 rounded-2xl overflow-hidden shrink-0">
                    <img src={court.img} alt={court.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {court.badge && <div className="absolute top-1.5 left-1.5 bg-[#8CE600] text-gray-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">{court.badge}</div>}
                </div>
                {/* Lista de resultados */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-sm text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors">{court.name}</h3>
                        <StatusPill status={court.status} />
                    </div>
                    <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2"><LocationIcon />{court.location}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {court.sports.map(s => <span key={s} className="text-[9px] font-bold text-[#8CE600] bg-[#8CE600]/10 px-1.5 py-0.5 rounded-full">{s}</span>)}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1"><Stars rating={court.rating} /><span className="text-xs font-bold text-gray-700 dark:text-gray-300">{court.rating.toFixed(1)} ({court.reviewCount})</span></div>
                        <p className="font-black text-base text-gray-900 dark:text-white">R$ {court.price}<span className="text-[10px] font-normal text-gray-400">/h</span></p>
                    </div>
                </div>
            </Link>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3 hover:text-[#8CE600] transition-colors">
                {title}<ChevronIcon open={open} />
            </button>
            {open && <div className="space-y-2">{children}</div>}
        </div>
    );
}

function CheckFilter({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <div onClick={onChange} className={`w-4 h-4 rounded-[5px] border-2 flex items-center justify-center transition-all ${checked ? 'bg-[#8CE600] border-[#8CE600]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#8CE600]'}`}>
                {checked && <svg className="w-2.5 h-2.5 text-gray-950" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
        </label>
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
                className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 hover:border-[#8CE600] dark:hover:border-[#8CE600] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8CE600]/50 min-w-[150px] justify-between cursor-pointer"
            >
                <span className="truncate">{options[value]}</span>
                <ChevronIcon open={open} />
            </button>
            
            {open && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {Object.entries(options).map(([k, label]) => {
                        const isSelected = value === k;
                        return (
                            <button
                                key={k}
                                onClick={() => {
                                    onChange(k as SortKey);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors cursor-pointer ${
                                    isSelected 
                                        ? 'bg-[#8CE600]/10 text-[#8CE600]' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
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

// Componente principal do Catálogo
export default function Catalog() {
    const { t } = useTranslation();
    const [search, setSearch]               = useState('');
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [minRating, setMinRating]         = useState(0);
    const [maxPrice, setMaxPrice]           = useState(250);
    const [selectedDate, setSelectedDate]     = useState<string>('');
    const [onlyToday, setOnlyToday]         = useState(false);
    const [sortBy, setSortBy]               = useState<SortKey>('rating');
    const [viewMode, setViewMode]           = useState<'grid' | 'list'>('grid');
    const [filtersOpen, setFiltersOpen]     = useState(true);

    const toggleArr = <T,>(arr: T[], setArr: (v: T[]) => void, item: T) =>
        setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);

    const filtered = useMemo(() => {
        let out = CATALOG_COURTS.filter(c => {
            if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
                !c.location.toLowerCase().includes(search.toLowerCase())) return false;
            if (selectedSports.length && !c.sports.some(s => selectedSports.includes(s))) return false;
            if (selectedCities.length && !selectedCities.includes(c.city)) return false;
            if (selectedStatus.length && !selectedStatus.includes(c.status)) return false;
            if (c.rating < minRating) return false;
            if (c.price > maxPrice) return false;
            if (onlyToday && !c.availableToday) return false;
            if (selectedDate && c.unavailableDates.includes(selectedDate)) return false;
            return true;
        });
        return out.sort((a, b) => {
            if (sortBy === 'rating')     return b.rating - a.rating;
            if (sortBy === 'price_asc')  return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'reviews')    return b.reviewCount - a.reviewCount;
            return 0;
        });
    }, [search, selectedSports, selectedCities, selectedStatus, minRating, maxPrice, onlyToday, selectedDate, sortBy]);

    const activeFilters = [
        ...selectedSports, ...selectedCities, ...selectedStatus,
        ...(minRating > 0 ? [`≥ ${minRating}★`] : []),
        ...(maxPrice < 250 ? [`≤ R$${maxPrice}`] : []),
        ...(onlyToday ? ['Hoje'] : []),
        ...(selectedDate ? [format(new Date(selectedDate + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })] : []),
    ];

    const clearAll = () => {
        setSelectedSports([]); setSelectedCities([]); setSelectedStatus([]);
        setMinRating(0); setMaxPrice(250); setOnlyToday(false); setSearch('');
        setSelectedDate('');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-500 flex flex-col">
            <Header />

            // Cabeçalho e busca
            <section className="relative pt-28 pb-10 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8CE600] mb-3">{t('catalog.title')}</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-3">
                        {t('catalog.heading')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                        {t('catalog.description', { count: CATALOG_COURTS.length })}
                    </p>

                    {/* Search bar */}
                    <div className="relative mt-8 max-w-xl">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('catalog.searchPlaceholder')}
                            className="pl-11 h-12 rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-2 focus-visible:ring-[#8CE600] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 shadow-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"><XIcon /></button>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8 w-full flex-1">

                {/* Sidebar filters */}
                // Filtros laterais
                <aside
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    className={`shrink-0 transition-all duration-300 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden ${filtersOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
                >
                    <div className="w-72">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{t('catalog.filtersTitle')}</h2>
                            {activeFilters.length > 0 && (
                                <button onClick={clearAll} className="text-xs font-bold text-[#8CE600] hover:underline">{t('catalog.clearAll')}</button>
                            )}
                        </div>

                        {/* Active filter chips */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5">
                                {activeFilters.map(f => (
                                    <span key={f} className="flex items-center gap-1 text-[10px] font-bold bg-[#8CE600]/10 text-[#8CE600] border border-[#8CE600]/20 px-2 py-0.5 rounded-full">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Sport */}
                        <FilterSection title={t('catalog.sport')}>
                            {SPORTS_LIST.map(s => (
                                <CheckFilter key={s} label={s} checked={selectedSports.includes(s)} onChange={() => toggleArr(selectedSports, setSelectedSports, s)} />
                            ))}
                        </FilterSection>

                        {/* City */}
                        <FilterSection title={t('catalog.city')}>
                            {CITIES.map(c => (
                                <CheckFilter key={c} label={c} checked={selectedCities.includes(c)} onChange={() => toggleArr(selectedCities, setSelectedCities, c)} />
                            ))}
                        </FilterSection>

                        {/* Status */}
                        <FilterSection title={t('catalog.status')}>
                            {(['available', 'busy', 'closed'] as const).map(s => {
                                const label = { available: t('catalog.statusLabels.available'), busy: t('catalog.statusLabels.busy'), closed: t('catalog.statusLabels.closed') }[s];
                                return <CheckFilter key={s} label={label} checked={selectedStatus.includes(s)} onChange={() => toggleArr(selectedStatus, setSelectedStatus, s)} />;
                            })}
                        </FilterSection>

                        {/* Rating */}
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

                        {/* Price */}
                        <FilterSection title={t('catalog.maxPrice')}>
                            <div className="px-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">R$ 0</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">R$ {maxPrice}{maxPrice === 250 ? '+' : ''}</span>
                                </div>
                                <input
                                    type="range" min={30} max={250} step={10} value={maxPrice}
                                    onChange={e => setMaxPrice(Number(e.target.value))}
                                    className="w-full h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-[#8CE600] cursor-pointer"
                                />
                            </div>
                        </FilterSection>

                        {/* Availability */}
                        <FilterSection title={t('catalog.availability')}>
                            {/* Date picker */}
                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('catalog.selectDate')}</p>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    placeholder="DD/MM/AAAA"
                                />
                                {selectedDate && (
                                    <p className="text-[10px] text-[#8CE600] font-semibold">
                                        {t('catalog.showingCourtsFor', { date: format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR }) })}
                                    </p>
                                )}
                            </div>
                            {/* Today toggle */}
                            <label className="flex items-center gap-2.5 cursor-pointer group mt-2">
                                <div
                                    onClick={() => setOnlyToday(v => !v)}
                                    className={`w-9 h-5 rounded-full relative transition-all ${onlyToday ? 'bg-[#8CE600]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${onlyToday ? 'left-[18px]' : 'left-0.5'}`} />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t('catalog.availableToday')}</span>
                            </label>
                        </FilterSection>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setFiltersOpen(v => !v)}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-[#8CE600] dark:hover:text-[#8CE600] transition-colors bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-2 rounded-xl"
                            >
                                <FilterIcon />
                                {filtersOpen ? t('catalog.hide') : t('catalog.filtersTitle')}
                                {activeFilters.length > 0 && <span className="bg-[#8CE600] text-gray-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilters.length}</span>}
                            </button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> {t('catalog.courtsFound')}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sort */}
                            <SortDropdown value={sortBy} onChange={setSortBy} />

                            {/* View toggle */}
                            <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><GridIcon /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#8CE600] text-gray-950' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><ListIcon /></button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-28 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6 text-4xl">🏟️</div>
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
                </div>
            </div>

            <Footer />
        </div>
    );
}
