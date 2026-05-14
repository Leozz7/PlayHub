import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invoice, CreateRecurringReservationPayload, CreateRecurringReservationResult } from '../types/invoice.types';

interface InvoiceFilters {
  recurringGroupId?: string;
  userId?: string;
  month?: number;
  year?: number;
}

export function useInvoices(filters?: InvoiceFilters) {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.recurringGroupId) params.append('recurringGroupId', filters.recurringGroupId);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.month) params.append('month', String(filters.month));
      if (filters?.year) params.append('year', String(filters.year));
      const res = await api.get(`/Invoices?${params.toString()}`);
      return res.data;
    },
  });
}

export function useCreateRecurringReservation() {
  const queryClient = useQueryClient();

  return useMutation<CreateRecurringReservationResult, Error, CreateRecurringReservationPayload>({
    mutationFn: async (payload) => {
      const res = await api.post('/Reservations/recurring', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

interface CancelRecurringResult {
  reservationsCancelled: number;
  invoicesUpdated: number;
}

export function useCancelRecurringReservation() {
  const queryClient = useQueryClient();

  return useMutation<CancelRecurringResult, Error, string>({
    mutationFn: async (groupId) => {
      const res = await api.delete(`/Reservations/recurring/${groupId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
