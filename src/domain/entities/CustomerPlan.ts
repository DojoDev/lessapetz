export interface CustomerPlan {
  id: string;
  tenantId: string;
  customerId: string;
  petId: string | null;
  catalogPlanId: string | null;
  planName: string;
  validUntil: Date;
  status: string;
  cycleStartDate: Date;
  cycleEndDate: Date;
  totalQuota: number;
  usesConsumed: number;
  autoRenew: boolean;
  createdAt: Date;
}
