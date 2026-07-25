export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  tenantId: string;
  previousStatus: string | null;
  newStatus: string;
  changedByUserId: string | null;
  isAdminOverride: boolean;
  notes: string | null;
  createdAt: Date;
}
