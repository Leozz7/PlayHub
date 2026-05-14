export enum InvoiceStatus {
  Pending = 1,
  Paid = 2,
  Overdue = 3,
}

export interface Invoice {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  recurringGroupId: string;
  month: number;
  year: number;
  totalAmount: number;
  status: InvoiceStatus;
  reservationIds: string[];
  created: string;
}

export interface CreateRecurringReservationPayload {
  courtId: string;
  userId: string;
  firstStartTime: string;
  firstEndTime: string;
  monthsToBlock: number;
}

export interface CreateRecurringReservationResult {
  recurringGroupId: string;
  reservations: import('./reservation.types').Reservation[];
  invoices: Invoice[];
}
