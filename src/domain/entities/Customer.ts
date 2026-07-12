export interface Customer {
  id: string;
  tenantId: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  passwordHash: string | null;
  createdAt: Date;
}
