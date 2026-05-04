import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Payment {
    id: string;
    reservationId: string;
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    status: number; // 1 = Pending, 2 = Paid, 3 = Failed, 4 = Refunded
    method: number; // 1 = CreditCard, 2 = Pix
    paymentDate?: string;
    transactionId?: string;
    created: string;
}

export function usePayments(filters?: { status?: number }) {
    return useQuery<Payment[]>({
        queryKey: ['payments', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', String(filters.status));

            const response = await api.get(`/Payments?${params.toString()}`);
            return response.data;
        },
    });
}

export function useProcessPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, transactionId }: { id: string; transactionId: string }) => {
            await api.post(`/Payments/${id}/process`, {
                transactionId,
                paymentDate: new Date().toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/Payments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
}
