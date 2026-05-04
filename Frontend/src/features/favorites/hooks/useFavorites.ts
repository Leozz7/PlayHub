import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '../api/favoritesService';
import { useFavoritesStore, type FavoritesState } from '../../../data/useFavoritesStore';
import { useAuthStore } from '../../../data/useAuthStore';

export const FAVORITES_QUERY_KEY = 'favorites';

/**
 * Hook que sincroniza os favoritos do usuário com a API.
 * Enquanto o usuário não está autenticado, os favoritos ficam desabilitados.
 */
export function useMyFavorites() {
  const user = useAuthStore(s => s.user);
  const isAuthenticated = !!user;
  const setFavoriteIds = useFavoritesStore((s: FavoritesState) => s.setFavoriteIds);

  return useQuery({
    queryKey: [FAVORITES_QUERY_KEY, user?.id],
    queryFn: async () => {
      const courts = await favoritesService.getMyFavorites();
      // Sincroniza o store local com os IDs vindos da API
      setFavoriteIds(courts.map(c => c.id));
      return courts;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

/**
 * Mutation para alternar (toggle) o estado de favorito de uma quadra.
 * Utiliza optimistic update para resposta imediata na UI.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  return useMutation({
    mutationFn: async (courtId: string) => {
      // IMPORTANTE: O onMutate roda ANTES desta função e já inverteu o estado no store.
      // Usamos getState() para garantir que pegamos o estado já atualizado.
      const isNowFavorite = useFavoritesStore.getState().isFavorite(courtId);

      if (isNowFavorite) {
        await favoritesService.addFavorite(courtId);
        return { courtId, action: 'added' as const };
      } else {
        await favoritesService.removeFavorite(courtId);
        return { courtId, action: 'removed' as const };
      }
    },

    // Optimistic update — atualiza o store instantaneamente
    onMutate: async (courtId: string) => {
      // Cancela refetches em andamento para não sobrescrever o estado otimista
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });

      const wasFavorite = isFavorite(courtId);

      if (wasFavorite) {
        removeFavorite(courtId);
      } else {
        addFavorite(courtId);
      }

      // Retorna o estado anterior para rollback
      return { wasFavorite };
    },

    // Em caso de erro, restaura o estado anterior
    onError: (_err, courtId, context) => {
      const user = useAuthStore.getState().user;
      if (context) {
        if (context.wasFavorite) {
          addFavorite(courtId);
        } else {
          removeFavorite(courtId);
        }
      }
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY, user?.id] });
    },

    // Sempre revalida após sucesso para garantir sincronia com o servidor
    onSuccess: () => {
      const user = useAuthStore.getState().user;
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY, user?.id] });
    },
  });
}
