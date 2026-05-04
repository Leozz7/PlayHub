import { CourtType, CourtStatus } from '@/features/courts/types/court.types';

export interface CourtDto {
  id: string;
  name: string;
  type: CourtType;
  hourlyRate: number;
  status: CourtStatus;
  capacity: number;
  description?: string;
  amenities: string[];
  imageUrls: string[];
  created: string;
  
  // New Fields
  location: string;
  address: string;
  neighborhood: string;
  city: string;
  sport: string;
  sports: string[];
  rating: number;
  reviewCount: number;
  price: number;
  oldPrice?: number;
  frontendStatus: 'available' | 'busy' | 'closed';
  badge?: string;
  img: string;
  openingHour: number;
  closingHour: number;
  mainImageBase64?: string;
  imagesBase64?: string[];
  availableToday: boolean;
}
