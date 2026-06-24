import { Booking } from '../entities/Booking';

export interface BookingRepository {
  findById(tenantId: string, id: string): Promise<Booking | null>;
  findByDate(tenantId: string, date: string): Promise<Booking[]>;
  findByEmployee(tenantId: string, employeeId: string, from: Date, to: Date): Promise<Booking[]>;
  findByCustomer(tenantId: string, customerId: string): Promise<Booking[]>;
  findUpcoming(tenantId: string, limit?: number): Promise<Booking[]>;
  create(tenantId: string, data: Omit<Booking, 'id' | 'tenantId' | 'createdAt'> & { paymentMethod?: string | null }): Promise<Booking>;
  updateStatus(tenantId: string, id: string, status: string): Promise<Booking | null>;
  cancel(tenantId: string, id: string): Promise<Booking | null>;
  countToday(tenantId: string): Promise<number>;
  revenueToday(tenantId: string): Promise<number>;
}
