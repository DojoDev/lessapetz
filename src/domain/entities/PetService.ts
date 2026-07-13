export interface PetService {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  baseDurationMin: number;
  basePrice: number;
  imageUrl: string | null;
  isStartingPrice: boolean;
  petSizeApplicability: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
}
