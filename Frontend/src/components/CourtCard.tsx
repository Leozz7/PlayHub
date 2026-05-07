import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock } from 'lucide-react';
import { Stars } from '@/components/ui/Stars';
import { FavoriteButton } from '@/components/FavoriteButton';
import { type Court } from '@/pages/CatalogData';

const LocationIcon = () => <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />;
const ClockIcon = () => <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />;

export function StatusPill({ status }: { status: any }) {
    const { t } = useTranslation();
    
    const normalizedStatus = String(status).toLowerCase();
    
    const map: Record<string, { label: string; cls: string; dot: string }> = {
        available: { label: t('catalog.statusLabels.available'), cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 backdrop-blur-md', dot: 'bg-emerald-500' },
        busy:      { label: t('catalog.statusLabels.busy'),      cls: 'bg-amber-500/10  text-amber-600  dark:text-amber-400  border-amber-500/20 backdrop-blur-md', dot: 'bg-amber-500' },
        closed:    { label: t('catalog.statusLabels.closed'),    cls: 'bg-red-500/10    text-red-600    dark:text-red-400    border-red-500/20 backdrop-blur-md', dot: 'bg-red-500' },
    };
    
    let finalStatus = normalizedStatus;
    if (normalizedStatus === '1') finalStatus = 'available';
    else if (normalizedStatus === '2') finalStatus = 'closed';
    else if (normalizedStatus === '3') finalStatus = 'busy';

    const config = map[finalStatus] || map.available;
    
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border shadow-sm ${config.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shadow-[0_0_8px_currentColor]`} />
            {config.label}
        </span>
    );
}

export const CourtCard = memo(function CourtCard({ court }: { court: Court }) {
    const { t } = useTranslation();
    return (
        <div className="group relative block bg-white dark:bg-gradient-to-b dark:from-white/[0.04] dark:to-transparent rounded-[28px] border border-gray-100 dark:border-white/5 overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(140,230,0,0.15)] ring-1 ring-transparent hover:ring-[#8CE600]/30 transition-all duration-500">
            {/* Action Link (Overlay) */}
            <Link to={`/courts/${court.id}`} className="absolute inset-0 z-10" aria-label={court.name}>
                <span className="sr-only">{t('catalog.viewDetails')}</span>
            </Link>

            {/* Favorite button - Higher z-index to stay clickable */}
            <div className="absolute top-5 right-5 z-20">
                <div className="bg-black/20 backdrop-blur-md rounded-full p-1.5 border border-white/20 hover:bg-black/40 hover:scale-110 active:scale-95 transition-all shadow-sm text-white">
                    <FavoriteButton courtId={String(court.id)} size="sm" />
                </div>
            </div>

            {/* Image (Inset style) */}
            <div className="p-2 pb-0">
                <div className="relative h-52 overflow-hidden rounded-[20px] [transform:translateZ(0)]">
                    <img src={court.img} alt={court.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                    
                    {/* Badge */}
                    {court.badge && (
                        <div className="absolute top-3 left-3 bg-[#8CE600] text-[#0A0A0A] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(140,230,0,0.4)]">
                            {t(court.badge)}
                        </div>
                    )}
                    
                    {/* Status Pill over image */}
                    <div className="absolute bottom-3 left-3">
                        <StatusPill status={court.frontendStatus || court.status} />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-black text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors line-clamp-1">{court.name}</h3>
                    <div className="flex items-center shrink-0 bg-gray-50/80 dark:bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                        <Stars rating={court.rating} />
                    </div>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 font-semibold tracking-wide">
                    <LocationIcon /> <span className="line-clamp-1">{court.location}</span>
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                    {court.sports.map(s => (
                        <span key={s} className="text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/5">{t(s)}</span>
                    ))}
                    {court.amenities.slice(0, 2).map(a => (
                        <span key={a} className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-transparent px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5">{a}</span>
                    ))}
                    {court.amenities.length > 2 && (
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-transparent px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                            +{court.amenities.length - 2}
                        </span>
                    )}
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                    <div className="flex flex-col">
                        {court.oldPrice && <span className="text-[10px] font-bold text-gray-400 line-through mb-0.5">{t('common.actions.currency')} {court.oldPrice}{t('common.actions.perHour')}</span>}
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-[#8CE600]">{t('common.actions.currency')}</span>
                            <span className="font-black text-3xl text-gray-900 dark:text-white tracking-tighter leading-none">{court.price}</span>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-500">{t('common.actions.perHour')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <ClockIcon />
                        <span>{court.openingHour}h – {court.closingHour}h</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export const CourtRow = memo(function CourtRow({ court }: { court: Court }) {
    const { t } = useTranslation();
    return (
        <div className="group relative flex gap-4 bg-white dark:bg-gradient-to-r dark:from-white/[0.04] dark:to-transparent rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(140,230,0,0.15)] ring-1 ring-transparent hover:ring-[#8CE600]/30 transition-all duration-500 p-2.5">
            {/* Action Link (Overlay) */}
            <Link to={`/courts/${court.id}`} className="absolute inset-0 z-10" aria-label={court.name}>
                <span className="sr-only">{t('catalog.viewDetails')}</span>
            </Link>

            <div className="relative w-36 h-32 rounded-[18px] overflow-hidden shrink-0 [transform:translateZ(0)]">
                <img src={court.img} alt={court.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                
                {court.badge && <div className="absolute top-2 left-2 bg-[#8CE600] text-[#0A0A0A] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">{t(court.badge)}</div>}
                
                <div className="absolute bottom-2 left-2 scale-90 origin-bottom-left">
                     <StatusPill status={court.frontendStatus || court.status} />
                </div>
            </div>
            
            <div className="flex-1 min-w-0 py-1 pr-3 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white group-hover:text-[#8CE600] transition-colors line-clamp-1">{court.name}</h3>
                    <div className="relative z-20">
                        <div className="bg-gray-50/80 dark:bg-black/30 backdrop-blur-sm rounded-full p-1.5 border border-gray-100 dark:border-white/5 hover:scale-110 active:scale-95 transition-all shadow-sm text-gray-600 dark:text-white">
                            <FavoriteButton courtId={String(court.id)} size="sm" />
                        </div>
                    </div>
                </div>
                
                <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3 font-semibold tracking-wide">
                    <LocationIcon />
                    <span className="truncate">{court.location}</span>
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-auto">
                    {court.sports.map(s => <span key={s} className="text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/5">{t(s)}</span>)}
                </div>
                
                <div className="flex items-end justify-between mt-3">
                    <div className="flex items-center gap-1.5 bg-gray-50/80 dark:bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                        <Stars rating={court.rating} />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">({court.reviewCount})</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black text-[#8CE600]">{t('common.actions.currency')}</span>
                        <span className="font-black text-2xl text-gray-900 dark:text-white tracking-tighter leading-none">{court.price}</span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500">{t('common.actions.perHour')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
