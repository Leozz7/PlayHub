// Mapeamento 
export enum CourtType {
  Fut7 = 'Fut7',
  Futsal = 'Futsal',
  Society = 'Society',
  Tennis = 'Tennis'
}

export enum CourtStatus {
  Available = 'Available',
  Maintenance = 'Maintenance',
  Inactive = 'Inactive'
}

// Mapeamento do CourtDto.cs
export interface Court {
  id: string;
  name: string;
  type?: CourtType | number | string;
  hourlyRate?: number;
  status?: CourtStatus | number | string;
  amenities?: string[]; 
  description?: string;
  img?: string;
  neighborhood?: string;
  city?: string;
  badge?: string;
  rating?: number;
  location?: string;
  price?: number;
  oldPrice?: number;
  address?: string;
  sport?: string;
  sports?: string[];
  reviewCount?: number;
  frontendStatus?: 'available' | 'busy' | 'closed' | string;
  availableToday?: boolean;
  openingHour?: number;
  closingHour?: number;
  mainImageBase64?: string;
  imagesBase64?: string[];
  schedules?: OperatingDay[];
  latitude?: number;
  longitude?: number;
  capacity?: number;
  imageUrls?: string[];
  unavailableDates?: string[];
}

export interface OperatingDay {
  day: number; // 0-6 (Sunday-Saturday)
  openingHour: number;
  closingHour: number;
  isClosed: boolean;
}
