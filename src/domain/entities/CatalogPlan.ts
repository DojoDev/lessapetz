export interface CatalogPlan {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  includedServiceIds: string[];
  createdAt: Date;
}
