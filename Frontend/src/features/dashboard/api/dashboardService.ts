import { api } from '@/lib/api';

export interface DashboardStatsDto {
  managedCourts: number;
  reservationsMonth: number;
  uniqueClients: number;
  monthlyRevenue: number;
}

export interface TopCourtDto {
  id: string;
  name: string;
  revenue: number;
  reservations: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const response = await api.get<DashboardStatsDto>('/Dashboard/stats');
    return response.data;
  },

  getTopCourts: async (): Promise<TopCourtDto[]> => {
    const response = await api.get<TopCourtDto[]>('/Dashboard/top-courts');
    return response.data;
  }
};
