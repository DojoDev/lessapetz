export interface ServiceCategory {
  id: string;
  tenantId: string;
  name: string;
  displayOrder: number;
  description: string | null;
  imageUrl: string | null;
}
