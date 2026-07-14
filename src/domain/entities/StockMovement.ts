export type StockMovementType = 'entry' | 'sale' | 'internal_use' | 'adjustment' | 'loss';

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  userId: string | null;
  notes: string | null;
  createdAt?: Date;
}
