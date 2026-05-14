/** Mapeamento */
export enum ReservationStatus {
  Pending = 1,
  Confirmed = 2,
  Cancelled = 3,
  Completed = 4,
  Blocked = 5,
}

// Mapeamento do ReservationDto.cs
export interface Reservation {
  id: string;
  courtId: string;
  courtName?: string;
  courtSport?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userCpf?: string;
  startTime: string; // ISO 8601 Date string
  endTime: string;
  totalPrice: number;
  status: ReservationStatus;
  paymentId?: string;
  paymentMethod?: number;
  created: string;
  // Recurring (Mensalista) fields
  isRecurring?: boolean;
  recurringGroupId?: string;
}
