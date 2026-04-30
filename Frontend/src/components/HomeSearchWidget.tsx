import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SPORTS } from '@/pages/IndexData';

interface HomeSearchWidgetProps {
    onOpenChange?: (isOpen: boolean) => void;
}

export function HomeSearchWidget({ onOpenChange }: HomeSearchWidgetProps) {
    const [sport, setSport] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [isSportOpen, setIsSportOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onOpenChange) {
            onOpenChange(isSportOpen || isDateOpen);
        }
    }, [isSportOpen, isDateOpen, onOpenChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSportOpen(false);
            }
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
                setIsDateOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const formatDate = (d: Date | null) => {
        if (!d) return 'Selecione a data';
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-3xl rounded-[2rem] p-2 md:p-3 border border-gray-200/50 dark:border-gray-800/50 shadow-2xl shadow-gray-300/40 dark:shadow-black/60 flex flex-col md:flex-row gap-2 transition-all">
            {/* Sport Selection */}
            <div className="flex-1 relative" ref={dropdownRef}>
                <div 
                    onClick={() => setIsSportOpen(!isSportOpen)}
                    className={`h-full min-h-[64px] flex items-center bg-gray-50 dark:bg-gray-900/60 rounded-3xl md:rounded-[1.5rem] px-5 py-3 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer group border ${isSportOpen ? 'border-[#8CE600] ring-4 ring-[#8CE600]/10' : 'border-transparent'}`}
                >
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className={`w-5 h-5 ${sport ? 'text-[#8CE600]' : 'text-gray-400'} transition-colors`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M12 2v2M12 20v2M2 12h2M20 12h2" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden text-left">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest mb-0.5">O que jogar?</span>
                        <span className={`text-sm font-bold truncate w-full ${sport ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {sport || 'Selecione a modalidade'}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-300 ${isSportOpen ? 'rotate-180 text-[#8CE600]' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {isSportOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 grid grid-cols-1 gap-1">
                            {SPORTS.map((s) => (
                                <div
                                    key={s.name}
                                    onClick={() => {
                                        setSport(s.name);
                                        setIsSportOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${sport === s.name ? 'bg-[#8CE600] text-gray-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${sport === s.name ? 'bg-gray-950' : 'bg-gray-300 dark:bg-gray-700'}`} />
                                    <span className="text-sm font-bold">{s.name}</span>
                                    <span className="ml-auto text-[10px] opacity-60 font-medium">{s.courts} quadras</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Date Picker */}
            <div className="flex-1 relative" ref={dateRef}>
                <div 
                    onClick={() => setIsDateOpen(!isDateOpen)}
                    className={`h-full min-h-[64px] flex items-center bg-gray-50 dark:bg-gray-900/60 rounded-3xl md:rounded-[1.5rem] px-5 py-3 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer group border ${isDateOpen ? 'border-[#8CE600] ring-4 ring-[#8CE600]/10' : 'border-transparent'}`}
                >
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className={`w-5 h-5 ${date ? 'text-[#8CE600]' : 'text-gray-400'} transition-colors`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-start flex-1 overflow-hidden text-left">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest mb-0.5">Quando?</span>
                        <span className={`text-sm font-bold truncate w-full ${date ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatDate(date)}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-300 ${isDateOpen ? 'rotate-180 text-[#8CE600]' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {isDateOpen && (
                    <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-4 z-50 w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1)); }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1)); }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] font-bold text-gray-600 dark:text-gray-400 text-center">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
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
                                        h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all
                                        ${!d ? 'cursor-default' : 'cursor-pointer hover:bg-[#8CE600]/10 hover:text-[#8CE600]'}
                                        ${d && date && d.toDateString() === date.toDateString() ? 'bg-[#8CE600] text-gray-950 font-bold' : 'text-gray-600 dark:text-gray-400'}
                                    `}
                                >
                                    {d ? d.getDate() : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Link
                to="/catalog"
                id="hero-search-btn"
                className="bg-[#8CE600] text-gray-950 px-8 py-4 md:py-0 md:h-[64px] rounded-3xl md:rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-[#7bc900] hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-3 shadow-xl shadow-[#8CE600]/20 group"
            >
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                Buscar agora
            </Link>
        </div>
    );
}
