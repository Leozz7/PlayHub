import { useQuery } from '@tanstack/react-query';
import { courtService } from '../api/courtService';

export const useCourtAvailability = (id: string, date: string) => {
  return useQuery({
    queryKey: ['court-availability', id, date],
    queryFn: () => courtService.getCourtAvailability(id, date),
    enabled: !!id && !!date,
  });
};
