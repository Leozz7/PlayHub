import { Link } from 'react-router-dom';
import { 
  Heart, ArrowUpRight, Search, Loader2, LayoutGrid, 
  MapPin, Star, Clock, Trophy, Sparkles, Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyFavorites } from '@/features/favorites/hooks/useFavorites';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_MAP = {
  available: { label: 'Disponível', dot: 'bg-[#8CE600]', text: 'text-[#8CE600]', bg: 'bg-[#8CE600]/10' },
  busy: { label: 'Ocupada', dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
  closed: { label: 'Fechada', dot: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10' },
};

function FavoriteCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2rem] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function UserFavorites() {
  const { data: courts = [], isLoading } = useMyFavorites();

  return (
    <div className="min-h-screen bg-white dark:bg-[#02060d] pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest"
            >
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              Minha Coleção
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white leading-none"
            >
              Quadras <span className="text-[#8CE600]">Favoritas</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-gray-400 text-lg max-w-xl font-medium"
            >
              {courts.length > 0
                ? `Você selecionou ${courts.length} arena${courts.length !== 1 ? 's' : ''} incríveis para o seu próximo jogo.`
                : 'Sua lista de desejos está pronta para ser preenchida com as melhores arenas da região.'}
            </motion.p>
          </div>

          {!isLoading && courts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/10"
            >
              <div className="flex -space-x-3">
                {courts.slice(0, 3).map((c, i) => (
                  <div key={c.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#02060d] overflow-hidden bg-gray-200">
                    <img src={c.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {courts.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#02060d] bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">
                    +{courts.length - 3}
                  </div>
                )}
              </div>
              <div className="pr-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Salvo</p>
                <p className="text-xl font-black dark:text-white leading-tight">{courts.length}</p>
              </div>
            </motion.div>
          )}
        </div>

        {!isLoading && courts.length > 0 && (
          <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                <LayoutGrid className="w-4 h-4" />
                Visualização em Grade
              </div>
            </div>
            <Button variant="ghost" asChild className="text-[#8CE600] hover:text-[#8CE600] hover:bg-[#8CE600]/10 font-black text-xs uppercase tracking-widest rounded-xl">
              <Link to="/catalog" className="flex items-center gap-2">
                Explorar Mais <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="relative">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              <FavoriteCardSkeleton />
              <FavoriteCardSkeleton />
              <FavoriteCardSkeleton />
            </div>
          ) : courts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 px-6 rounded-[3rem] bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20" />
                <div className="relative w-24 h-24 rounded-[2rem] bg-white dark:bg-card border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-2xl">
                  <Heart className="w-10 h-10 text-red-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#8CE600] flex items-center justify-center shadow-lg shadow-[#8CE600]/20 animate-bounce">
                  <Sparkles className="w-4 h-4 text-gray-950" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Sua coleção está vazia</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 font-medium">
                Encontre as melhores quadras e arenas. Toque no coração para salvá-las aqui e facilitar sua próxima reserva.
              </p>
              <Button asChild className="h-14 px-10 bg-[#8CE600] hover:bg-[#7bc400] text-gray-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#8CE600]/20 transition-all hover:scale-105 active:scale-95 group">
                <Link to="/catalog">
                  <Search className="w-4 h-4 mr-2" />
                  Explorar Catálogo
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {courts.map((court) => (
                  <motion.div
                    layout
                    key={court.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="group bg-white dark:bg-card border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-[#8CE600]/10 transition-all duration-500"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={court.img || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'}
                        alt={court.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      <div className="absolute top-5 left-5 flex flex-col gap-2">
                        {court.badge && (
                          <Badge className="bg-[#8CE600] text-gray-950 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                            {court.badge}
                          </Badge>
                        )}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest ${STATUS_MAP[court.frontendStatus as keyof typeof STATUS_MAP]?.text || 'text-white'} bg-black/40`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[court.frontendStatus as keyof typeof STATUS_MAP]?.dot || 'bg-white'} shadow-[0_0_8px_currentColor]`} />
                          {STATUS_MAP[court.frontendStatus as keyof typeof STATUS_MAP]?.label || 'Disponível'}
                        </div>
                      </div>

                      <div className="absolute top-5 right-5 z-20">
                        <FavoriteButton courtId={court.id} size="lg" />
                      </div>

                      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-black">{court.rating.toFixed(1)}</span>
                          <span className="text-white/50 text-[10px] font-bold">({court.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-[#8CE600] text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                          <Trophy className="w-3 h-3" />
                          {court.sport}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-[#8CE600] transition-colors">
                          {court.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#8CE600]" />
                          {court.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor Hora</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">R$ {court.price}</span>
                            <span className="text-[10px] font-bold text-gray-400">/h</span>
                          </div>
                        </div>

                        <Button asChild className="h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-[#8CE600] dark:hover:bg-[#8CE600] hover:text-gray-950 dark:hover:text-gray-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg group/btn">
                          <Link to={`/courts/${court.id}`}>
                            Reservar
                            <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



