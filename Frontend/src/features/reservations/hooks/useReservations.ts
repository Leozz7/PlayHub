import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Reservation } from '../types/reservation.types';
import type { PagedResult } from '@/types/shared';

export type { PagedResult };

export function useReservations(filters?: { courtId?: string; userId?: string; status?: number; date?: string; pageNumber?: number; pageSize?: number }) {
    return useQuery<PagedResult<Reservation>>({
        queryKey: ['reservations', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.courtId) params.append('courtId', filters.courtId);
            if (filters?.userId) params.append('userId', filters.userId);
            if (filters?.status) params.append('status', String(filters.status));
            if (filters?.date) params.append('date', filters.date);
            if (filters?.pageNumber) params.append('pageNumber', String(filters.pageNumber));
            if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

            const response = await api.get(`/Reservations?${params.toString()}`);
            return response.data;
        },
    });
}

export function useUpdateReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: number }) => {
            await api.put(`/Reservations/${id}`, { id, status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
}

export function useDeleteReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/Reservations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
}
