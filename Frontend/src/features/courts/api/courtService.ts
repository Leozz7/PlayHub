import { api } from '@/lib/api';
import { Court } from '../types/court.types';
import type { PagedResult } from '@/types/shared';

export type { PagedResult };

export interface GetCourtsParams {
  type?: string;
  cities?: string[];
  statuses?: string[];
  neighborhood?: string;
  sports?: string[];
  hour?: number;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  search?: string;
  minRating?: number;
  sortBy?: string;
  isDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}


export interface CourtsFilters {
  cities: string[];
  sports: string[];
}

export interface CourtAvailability {
  openingHour: number;
  closingHour: number;
  busySlots: number[];
  available: boolean;
}

export interface ReviewDto {
  id: string;
  courtId: string;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  text: string;
  createdAt: string;
}

export const courtService = {
  getCourts: async (params: GetCourtsParams): Promise<PagedResult<Court>> => {
    const response = await api.get<PagedResult<Court>>('/courts', { params });
    return response.data;
  },

  getManagementCourts: async (params: GetCourtsParams): Promise<PagedResult<Court>> => {
    const response = await api.get<PagedResult<Court>>('/courts/management', { params });
    return response.data;
  },

  getCourtsFilters: async (): Promise<CourtsFilters> => {
    const response = await api.get<CourtsFilters>('/courts/filters');
    return response.data;
  },


  getCourtById: async (id: string): Promise<Court> => {
    const response = await api.get<Court>(`/courts/${id}`);
    return response.data;
  },

  getCourtAvailability: async (id: string, date: string): Promise<CourtAvailability> => {
    const response = await api.get<CourtAvailability>(`/courts/${id}/availability`, {
      params: { date }
    });
    return response.data;
  },

  createCourt: async (courtData: Partial<Court>): Promise<Court> => {
    const response = await api.post<Court>('/courts', courtData);
    return response.data;
  },

  updateCourt: async (id: string, courtData: Partial<Court>): Promise<void> => {
    await api.put(`/courts/${id}`, { id, ...courtData });
  },

  deleteCourt: async (id: string): Promise<void> => {
    await api.delete(`/courts/${id}`);
  },

  getReviews: async (courtId: string): Promise<ReviewDto[]> => {
    const response = await api.get<ReviewDto[]>(`/courts/${courtId}/reviews`);
    return response.data;
  },

  submitReview: async (courtId: string, rating: number, text: string): Promise<ReviewDto> => {
    const response = await api.post<ReviewDto>(`/courts/${courtId}/reviews`, { rating, text });
    return response.data;
  },
};
