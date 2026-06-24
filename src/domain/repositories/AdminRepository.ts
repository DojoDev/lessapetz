import { Admin } from '../entities/Admin';

export interface AdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findByTenantAndEmail(tenantId: string, email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
}
