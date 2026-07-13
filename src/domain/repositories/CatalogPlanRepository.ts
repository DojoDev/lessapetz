import { CatalogPlan } from '../entities/CatalogPlan';

export interface CatalogPlanRepository {
  findAll(tenantId: string): Promise<CatalogPlan[]>;
  findActive(tenantId: string): Promise<CatalogPlan[]>;
  findById(tenantId: string, id: string): Promise<CatalogPlan | null>;
  create(tenantId: string, data: Omit<CatalogPlan, 'id' | 'tenantId' | 'createdAt' | 'includedServiceIds'>): Promise<CatalogPlan>;
  update(tenantId: string, id: string, data: Partial<Omit<CatalogPlan, 'id' | 'tenantId' | 'createdAt' | 'includedServiceIds'>>): Promise<CatalogPlan | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  setIncludedServices(planId: string, serviceIds: string[]): Promise<void>;
  getIncludedServices(planId: string): Promise<string[]>;
}
