import { PetService } from '../entities/PetService';
import { ServiceCategory } from '../entities/ServiceCategory';
import { ServicePricingRule } from '../entities/ServicePricingRule';

export interface ServiceRepository {
  // Categories
  findAllCategories(tenantId: string): Promise<ServiceCategory[]>;
  createCategory(tenantId: string, name: string, displayOrder: number): Promise<ServiceCategory>;
  updateCategory(tenantId: string, id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory | null>;
  deleteCategory(tenantId: string, id: string): Promise<boolean>;

  // Services
  findById(tenantId: string, id: string): Promise<PetService | null>;
  findAll(tenantId: string): Promise<PetService[]>;
  findByCategory(tenantId: string, categoryId: string): Promise<PetService[]>;
  findActive(tenantId: string): Promise<PetService[]>;
  create(tenantId: string, data: Omit<PetService, 'id' | 'tenantId' | 'createdAt'>): Promise<PetService>;
  update(tenantId: string, id: string, data: Partial<PetService>): Promise<PetService | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  reorder(tenantId: string, orderedIds: string[]): Promise<void>;

  // Pricing Rules
  findPricingRules(serviceId: string): Promise<ServicePricingRule[]>;
  createPricingRule(data: Omit<ServicePricingRule, 'id'>): Promise<ServicePricingRule>;
  updatePricingRule(id: string, data: Partial<ServicePricingRule>): Promise<ServicePricingRule | null>;
  deletePricingRule(id: string): Promise<boolean>;
}

