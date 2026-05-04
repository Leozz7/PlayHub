import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Reservation {
    id: string;
    courtId: string;
    courtName?: string;
    userId: string;
    userName?: string;
    startTime: string;
    endTime: string;
    status: number;
    totalPrice: number;
    paymentId?: string;
    created: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

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
