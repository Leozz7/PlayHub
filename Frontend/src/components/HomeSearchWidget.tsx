import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trophy, Calendar, MapPin, ChevronDown, Check } from 'lucide-react';
import { format } from 'date-fns';
import { SPORTS } from '@/pages/IndexData';
import { useCourtsFilters } from '@/features/courts/hooks/useCourts';

interface HomeSearchWidgetProps {
    onOpenChange?: (isOpen: boolean) => void;
}

export function HomeSearchWidget({ onOpenChange }: HomeSearchWidgetProps) {
    const navigate = useNavigate();
    const { data: filters } = useCourtsFilters();
    
    const [city, setCity] = useState('');
    const [sport, setSport] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [isSportOpen, setIsSportOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    
    const [citySearch, setCitySearch] = useState('');
    const [sportSearch, setSportSearch] = useState('');
    
    const cityRef = useRef<HTMLDivElement>(null);
    const sportRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    const availableCities = useMemo(() => filters?.cities || [], [filters]);
    const filteredCities = useMemo(() => 
        availableCities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())),
        [availableCities, citySearch]
    );

    const availableSports = useMemo(() => {
        if (filters?.sports && filters.sports.length > 0) return filters.sports;
        return SPORTS.map(s => s.name);
    }, [filters]);

    const filteredSports = useMemo(() => 
        availableSports.filter(s => s.toLowerCase().includes(sportSearch.toLowerCase())),
        [availableSports, sportSearch]
    );

    useEffect(() => {
        if (onOpenChange) {
            onOpenChange(isCityOpen || isSportOpen || isDateOpen);
        }
    }, [isCityOpen, isSportOpen, isDateOpen, onOpenChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (cityRef.current && !cityRef.current.contains(target)) setIsCityOpen(false);
            if (sportRef.current && !sportRef.current.contains(target)) setIsSportOpen(false);
            if (dateRef.current && !dateRef.current.contains(target)) setIsDateOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (city) params.append('cities', city);
        if (sport) params.append('sports', sport);
        if (date) params.append('date', format(date, 'yyyy-MM-dd'));
        
        navigate(`/catalog?${params.toString()}`);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const generateDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
        return days;
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="w-full bg-white/95 dark:bg-background/95 backdrop-blur-3xl rounded-[2.5rem] p-2 md:p-3 border border-gray-200/50 dark:border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-none flex flex-col lg:flex-row gap-2 transition-all relative z-[100] ring-1 ring-black/5 dark:ring-white/5">
            
            {/* City Selection */}
            <div className="lg:flex-[3] min-w-0 relative group" ref={cityRef}>
                <div 
                    onClick={() => {
                        setIsCityOpen(!isCityOpen);
                        setIsSportOpen(false);
                        setIsDateOpen(false);
                    }}
                    className={`h-full min-h-[80px] flex items-center bg-gray-50/50 dark:bg-white/[0.03] rounded-3xl lg:rounded-[1.8rem] px-4 xl:px-6 py-3 transition-all border border-transparent cursor-pointer hover:bg-white dark:hover:bg-white/[0.08] ${isCityOpen ? 'border-[#8CE600] ring-4 ring-[#8CE600]/10 bg-white dark:bg-white/10' : ''}`}
                >
                    <div className="w-11 h-11 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mr-3 xl:mr-4 shadow-sm text-gray-400 group-hover:text-[#8CE600] transition-colors border border-gray-100 dark:border-white/5">
                        <MapPin className={`w-5 h-5 ${city ? 'text-[#8CE600]' : ''}`} />
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Localização</span>
                        <span className={`text-sm font-black truncate w-full ${city ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {city || 'Selecione a cidade'}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 ml-2 text-gray-300 transition-transform duration-300 ${isCityOpen ? 'rotate-180 text-[#8CE600]' : ''}`} />
                </div>

                {isCityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-4 border-b border-gray-100 dark:border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    autoFocus
                                    type="text"
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    placeholder="Buscar cidade..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#8CE600]/50 dark:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredCities.length > 0 ? (
                                filteredCities.map((c) => (
                                    <div
                                        key={c}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCity(c);
                                            setIsCityOpen(false);
                                            setCitySearch('');
                                        }}
                                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${city === c ? 'bg-[#8CE600] text-gray-950' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 font-bold'}`}
                                    >
                                        <MapPin className="w-4 h-4 opacity-50" />
                                        <span className="text-sm font-black">{c}</span>
                                        {city === c && <Check className="w-4 h-4 ml-auto" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-400 font-bold italic">Nenhuma cidade encontrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="h-12 w-px bg-gray-100 dark:bg-white/10 self-center hidden lg:block mx-1" />

            {/* Sport Selection */}
            <div className="lg:flex-[2.8] min-w-0 relative group" ref={sportRef}>
                <div 
                    onClick={() => {
                        setIsSportOpen(!isSportOpen);
                        setIsCityOpen(false);
                        setIsDateOpen(false);
                    }}
                    className={`h-full min-h-[80px] flex items-center bg-gray-50/50 dark:bg-white/[0.03] rounded-3xl lg:rounded-[1.8rem] px-4 xl:px-6 py-3 transition-all border border-transparent cursor-pointer hover:bg-white dark:hover:bg-white/[0.08] ${isSportOpen ? 'border-[#8CE600] ring-4 ring-[#8CE600]/10 bg-white dark:bg-white/10' : ''}`}
                >
                    <div className="w-11 h-11 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mr-3 xl:mr-4 shadow-sm text-gray-400 group-hover:text-[#8CE600] transition-colors border border-gray-100 dark:border-white/5">
                        <Trophy className={`w-5 h-5 ${sport ? 'text-[#8CE600]' : ''}`} />
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Modalidade</span>
                        <span className={`text-sm font-black truncate w-full ${sport ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {sport || 'O que jogar?'}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 ml-2 text-gray-300 transition-transform duration-300 ${isSportOpen ? 'rotate-180 text-[#8CE600]' : ''}`} />
                </div>

                {isSportOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-4 border-b border-gray-100 dark:border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    autoFocus
                                    type="text"
                                    value={sportSearch}
                                    onChange={(e) => setSportSearch(e.target.value)}
                                    placeholder="Buscar modalidade..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-[#8CE600]/50 dark:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredSports.length > 0 ? (
                                filteredSports.map((s) => (
                                    <div
                                        key={s}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSport(s);
                                            setIsSportOpen(false);
                                            setSportSearch('');
                                        }}
                                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${sport === s ? 'bg-[#8CE600] text-gray-950' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 font-bold'}`}
                                    >
                                        <Trophy className="w-4 h-4 opacity-50" />
                                        <span className="text-sm font-black">{s}</span>
                                        {sport === s && <Check className="w-4 h-4 ml-auto" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-400 font-bold italic">Nenhuma modalidade encontrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="h-12 w-px bg-gray-100 dark:bg-white/10 self-center hidden lg:block mx-1" />

            {/* Date Picker */}
            <div className="lg:flex-[2.5] min-w-0 relative group" ref={dateRef}>
                <div 
                    onClick={() => {
                        setIsDateOpen(!isDateOpen);
                        setIsCityOpen(false);
                        setIsSportOpen(false);
                    }}
                    className={`h-full min-h-[80px] flex items-center bg-gray-50/50 dark:bg-white/[0.03] rounded-3xl lg:rounded-[1.8rem] px-4 xl:px-6 py-3 transition-all border border-transparent cursor-pointer hover:bg-white dark:hover:bg-white/[0.08] ${isDateOpen ? 'border-[#8CE600] ring-4 ring-[#8CE600]/10 bg-white dark:bg-white/10' : ''}`}
                >
                    <div className="w-11 h-11 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mr-3 xl:mr-4 shadow-sm text-gray-400 group-hover:text-[#8CE600] transition-colors border border-gray-100 dark:border-white/5">
                        <Calendar className={`w-5 h-5 ${date ? 'text-[#8CE600]' : ''}`} />
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Data</span>
                        <span className={`text-sm font-black truncate w-full ${date ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {date ? format(date, 'dd/MM/yyyy') : 'Quando?'}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 ml-2 text-gray-300 transition-transform duration-300 ${isDateOpen ? 'rotate-180 text-[#8CE600]' : ''}`} />
                </div>

                {isDateOpen && (
                    <div className="absolute top-full right-0 mt-3 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-2xl p-7 z-[110] w-[340px] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1)); }}
                                className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
                            >
                                <Search className="w-4 h-4 rotate-180" />
                            </button>
                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1)); }}
                                className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {generateDays().map((d, i) => (
                                <div
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (d) {
                                            setDate(d);
                                            setIsDateOpen(false);
                                        }
                                    }}
                                    className={`
                                        h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all
                                        ${!d ? 'cursor-default' : 'cursor-pointer hover:bg-[#8CE600]/10 hover:text-[#8CE600]'}
                                        ${d && date && d.toDateString() === date.toDateString() ? 'bg-[#8CE600] text-gray-950 shadow-lg shadow-[#8CE600]/30 scale-105 z-10' : 'text-gray-600 dark:text-gray-400'}
                                    `}
                                >
                                    {d ? d.getDate() : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleSearch}
                id="hero-search-btn"
                className="lg:flex-[2] min-w-0 bg-[#8CE600] text-gray-950 px-4 xl:px-6 py-5 lg:py-0 lg:h-[80px] rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-[#7bc900] hover:scale-[1.03] active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 xl:gap-3 shadow-2xl shadow-[#8CE600]/40 group border-b-4 border-black/10 active:border-b-0 active:translate-y-1"
            >
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Buscar agora
            </button>
        </div>
    );
}



