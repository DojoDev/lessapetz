import { Product } from '../entities/Product';
import { StockMovement } from '../entities/StockMovement';

export interface ProductRepository {
  // Product CRUD
  findAll(tenantId: string): Promise<Product[]>;
  findById(tenantId: string, id: string): Promise<Product | null>;
  findByCategory(tenantId: string, category: string): Promise<Product[]>;
  create(tenantId: string, data: Omit<Product, 'id' | 'tenantId' | 'currentStock' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(tenantId: string, id: string, data: Partial<Product>): Promise<Product | null>;
  delete(tenantId: string, id: string): Promise<boolean>;

  // Stock Management
  getStockMovements(tenantId: string, productId: string): Promise<StockMovement[]>;
  addStockMovement(tenantId: string, movement: Omit<StockMovement, 'id' | 'tenantId' | 'createdAt'>): Promise<StockMovement>;
  
  // Dashboard & Alerts
  getLowStockProducts(tenantId: string): Promise<Product[]>;
}
