export interface CustomerPlan {
  id: string;
  tenantId: string;
  customerId: string;
  petId: string | null;
  planName: string;
  validUntil: Date;
  createdAt: Date;
}
