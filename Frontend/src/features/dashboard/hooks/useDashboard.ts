import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/dashboardService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });
};

export const useDashboardTopCourts = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-courts'],
    queryFn: () => dashboardService.getTopCourts(),
  });
};
