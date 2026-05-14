import { ReservationStatus } from '../../reservations/types/reservation.types';

// Mapeamento
export interface DashboardStats {
  totalRevenue: number;
  totalReservations: number;
  activeUsers: number;
  occupancyRate: number; // Porcentagem
  revenueByMonth: { month: string; amount: number }[];
  reservationsByStatus: Partial<Record<ReservationStatus, number>>;
  managedCourts?: number;
  reservationsMonth?: number;
  uniqueClients?: number;
  monthlyRevenue?: number;
}

export interface TopCourt {
  id: string;
  courtId?: string;
  name?: string;
  courtName?: string;
  revenue: number;
  totalBookings?: number;
  revenueGenerated?: number;
}
