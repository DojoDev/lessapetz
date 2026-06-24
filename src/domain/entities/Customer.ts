export interface Customer {
  id: string;
  tenantId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  passwordHash: string | null;
  createdAt: Date;
}
