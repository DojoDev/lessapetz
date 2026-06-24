export interface PetService {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  baseDurationMin: number;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
}
