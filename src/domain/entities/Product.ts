export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string | null;
  category: string | null;
  brand: string | null;
  unitOfMeasure: string | null;
  costPrice: number;
  salePrice: number;
  description: string | null;
  imageUrl: string | null;
  isRetail: boolean;
  isInternal: boolean;
  currentStock: number;
  minStockThreshold: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
