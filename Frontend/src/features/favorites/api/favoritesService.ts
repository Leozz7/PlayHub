import { api } from '@/lib/api';
import type { CourtDto } from '@/features/favorites/types/favorites.types';

export const favoritesService = {
  /** Busca todas as quadras favoritas do usuário autenticado. */
  getMyFavorites: async (): Promise<CourtDto[]> => {
    const { data } = await api.get<CourtDto[]>('/favorites');
    return data;
  },

  /** Adiciona uma quadra aos favoritos. */
  addFavorite: async (courtId: string): Promise<void> => {
    await api.post(`/favorites/${courtId}`);
  },

  /** Remove uma quadra dos favoritos. */
  removeFavorite: async (courtId: string): Promise<void> => {
    await api.delete(`/favorites/${courtId}`);
  },
};
