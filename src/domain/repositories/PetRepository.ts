import { Pet } from '../entities/Pet';

export interface PetRepository {
  findById(tenantId: string, id: string): Promise<Pet | null>;
  findByCustomerId(tenantId: string, customerId: string): Promise<Pet[]>;
  findAll(tenantId: string): Promise<Pet[]>;
  create(tenantId: string, data: Omit<Pet, 'id' | 'tenantId' | 'createdAt'>): Promise<Pet>;
  update(tenantId: string, id: string, data: Partial<Pet>): Promise<Pet | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
}
