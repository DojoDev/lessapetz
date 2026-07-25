export type BookingStatus =
  | 'SCHEDULED'
  | 'PET_ARRIVED'
  | 'IN_PROGRESS'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Booking {
  id: string;
  tenantId: string;
  customerId: string;
  petId: string;
  serviceId: string;
  customerPlanId: string | null;
  employeeId: string | null;
  startAt: Date;
  endAt: Date;
  durationMin: number;
  totalPrice: number;
  status: BookingStatus;
  notes: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  createdAt: Date;
}
