import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courtService, GetCourtsParams } from '../api/courtService';

export const useCourts = (params: GetCourtsParams) => {
  return useQuery({
    queryKey: ['courts', params],
    queryFn: () => courtService.getCourts(params),
  });
};

export const useManagementCourts = (params: GetCourtsParams) => {
  return useQuery({
    queryKey: ['courts', 'management', params],
    queryFn: () => courtService.getManagementCourts(params),
  });
};

export const useCourtsFilters = () => {
  return useQuery({
    queryKey: ['courts', 'filters'],
    queryFn: () => courtService.getCourtsFilters(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};


export const useCourt = (id: string) => {
  return useQuery({
    queryKey: ['court', id],
    queryFn: () => courtService.getCourtById(id),
    enabled: !!id,
  });
};

export const useCourtReviews = (courtId: string) => {
  return useQuery({
    queryKey: ['court-reviews', courtId],
    queryFn: () => courtService.getReviews(courtId),
    enabled: !!courtId,
    staleTime: 1000 * 30, // 30s
  });
};

export const useSubmitReview = (courtId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, text }: { rating: number; text: string }) =>
      courtService.submitReview(courtId, rating, text),
    onSuccess: () => {
      // Invalidate both the reviews list and the court data (rating changed)
      queryClient.invalidateQueries({ queryKey: ['court-reviews', courtId] });
      queryClient.invalidateQueries({ queryKey: ['court', courtId] });
    },
  });
};
