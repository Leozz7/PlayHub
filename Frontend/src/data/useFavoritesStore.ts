import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoritesState {
  favoriteIds: Set<string>;
  isFavorite: (courtId: string) => boolean;
  addFavorite: (courtId: string) => void;
  removeFavorite: (courtId: string) => void;
  toggleFavorite: (courtId: string) => void;
  setFavoriteIds: (ids: string[]) => void;
  clear: () => void;
  count: number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: new Set<string>(),
      count: 0,

      isFavorite: (courtId) => get().favoriteIds.has(courtId),

      addFavorite: (courtId) =>
        set((state) => {
          const next = new Set(state.favoriteIds);
          next.add(courtId);
          return { favoriteIds: next, count: next.size };
        }),

      removeFavorite: (courtId) =>
        set((state) => {
          const next = new Set(state.favoriteIds);
          next.delete(courtId);
          return { favoriteIds: next, count: next.size };
        }),

      toggleFavorite: (courtId) => {
        if (get().isFavorite(courtId)) {
          get().removeFavorite(courtId);
        } else {
          get().addFavorite(courtId);
        }
      },

      // Chamado após sincronização com a API
      setFavoriteIds: (ids) =>
        set(() => {
          const next = new Set(ids);
          return { favoriteIds: next, count: next.size };
        }),

      clear: () =>
        set(() => ({
          favoriteIds: new Set<string>(),
          count: 0,
        })),
    }),
    {
      name: 'playhub-favorites',
      // Set não é serializável pelo JSON padrão — serializa como array
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              favoriteIds: new Set(parsed.state?.favoriteIds ?? []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              favoriteIds: Array.from(value.state.favoriteIds),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
