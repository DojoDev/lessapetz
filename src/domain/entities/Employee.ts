export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  isActive: boolean;
  maxConcurrentPets: number;
  createdAt: Date;
}
