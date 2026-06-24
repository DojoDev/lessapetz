import { Customer } from '../entities/Customer';

export interface CustomerRepository {
  findById(tenantId: string, id: string): Promise<Customer | null>;
  findByEmail(tenantId: string, email: string): Promise<Customer | null>;
  findAll(tenantId: string): Promise<Customer[]>;
  create(tenantId: string, data: Omit<Customer, 'id' | 'tenantId' | 'createdAt'>): Promise<Customer>;
  update(tenantId: string, id: string, data: Partial<Customer>): Promise<Customer | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
  count(tenantId: string): Promise<number>;
}
