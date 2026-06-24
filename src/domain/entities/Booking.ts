export type BookingStatus =
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Booking {
  id: string;
  tenantId: string;
  customerId: string;
  petId: string;
  serviceId: string;
  employeeId: string | null;
  startAt: Date;
  endAt: Date;
  durationMin: number;
  totalPrice: number;
  status: BookingStatus;
  notes: string | null;
  paymentMethod?: string | null;
  createdAt: Date;
}
