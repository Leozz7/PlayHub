import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavoritesStore } from '@/data/useFavoritesStore';
import { useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { useAuthStore } from '@/data/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  courtId: string;
  variant?: 'icon' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 'w-3.5 h-3.5', btn: 'w-8 h-8' },
  md: { icon: 'w-4 h-4',   btn: 'w-9 h-9' },
  lg: { icon: 'w-5 h-5',   btn: 'w-11 h-11' },
};
export function FavoriteButton({
  courtId,
  variant = 'icon',
  size = 'md',
  className = '',
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isFav = useFavoritesStore(s => s.isFavorite(courtId));
  const { mutate: toggle, isPending } = useToggleFavorite();
  const navigate = useNavigate();

  const sz = SIZE_MAP[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    toggle(courtId);
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={isFav ? t('common.actions.removeFavorite') : t('common.actions.addFavorite')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 disabled:opacity-60 ${
          isFav
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30 text-red-500'
            : 'bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-red-300 hover:text-red-500'
        } ${className}`}
      >
        <Heart
          className={`${sz.icon} transition-all duration-200 ${isFav ? 'fill-red-500 text-red-500' : ''}`}
        />
        {isFav ? t('common.actions.favorited') : t('common.actions.favorite')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFav ? t('common.actions.removeFavorite') : t('common.actions.addFavorite')}
      className={`group/fav ${sz.btn} rounded-full flex items-center justify-center border transition-all duration-200 disabled:opacity-60 ${
        isFav
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30'
          : 'bg-white/80 dark:bg-background/40 border-gray-200 dark:border-white/[0.08] hover:border-red-300 dark:hover:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-950/20'
      } backdrop-blur-sm shadow-sm ${className}`}
    >
      <Heart
        className={`${sz.icon} transition-all duration-200 ${
          isFav
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 group-hover/fav:text-red-400'
        } ${isPending ? 'scale-90 opacity-60' : isFav ? 'scale-110' : 'scale-100'}`}
      />
    </button>
  );
}



