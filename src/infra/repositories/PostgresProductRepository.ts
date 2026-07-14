import { Product } from '../../domain/entities/Product';
import { StockMovement } from '../../domain/entities/StockMovement';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import pool from '../database/pool';

export class PostgresProductRepository implements ProductRepository {
  
  // ── Products ──────────────────────────────────────────────

  async findAll(tenantId: string): Promise<Product[]> {
    const res = await pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 ORDER BY name ASC',
      [tenantId]
    );
    return res.rows.map(this.mapProduct);
  }

  async getLowStockProducts(tenantId: string): Promise<Product[]> {
    const res = await pool.query(
      `SELECT * FROM products 
       WHERE tenant_id = $1 
         AND is_active = true 
         AND current_stock <= min_stock_threshold 
       ORDER BY current_stock ASC`,
      [tenantId]
    );
    return res.rows.map(this.mapProduct);
  }

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const res = await pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapProduct(res.rows[0]);
  }

  async findByCategory(tenantId: string, category: string): Promise<Product[]> {
    const res = await pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 AND category = $2 ORDER BY name ASC',
      [tenantId, category]
    );
    return res.rows.map(this.mapProduct);
  }

  async create(tenantId: string, data: Omit<Product, 'id' | 'tenantId' | 'currentStock' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const res = await pool.query(
      `INSERT INTO products (
        tenant_id, name, sku, category, brand, unit_of_measure, 
        cost_price, sale_price, description, image_url, 
        is_retail, is_internal, min_stock_threshold, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        tenantId, data.name, data.sku || null, data.category || null, data.brand || null, 
        data.unitOfMeasure || null, data.costPrice, data.salePrice, data.description || null, 
        data.imageUrl || null, data.isRetail, data.isInternal, data.minStockThreshold, data.isActive
      ]
    );
    return this.mapProduct(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<Product>): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Build dynamic update query
    const updatableFields = [
      'name', 'sku', 'category', 'brand', 'unitOfMeasure', 
      'costPrice', 'salePrice', 'description', 'imageUrl', 
      'isRetail', 'isInternal', 'minStockThreshold', 'isActive'
    ];

    const dbFields = [
      'name', 'sku', 'category', 'brand', 'unit_of_measure', 
      'cost_price', 'sale_price', 'description', 'image_url', 
      'is_retail', 'is_internal', 'min_stock_threshold', 'is_active'
    ];

    for (let i = 0; i < updatableFields.length; i++) {
      const field = updatableFields[i];
      const dbField = dbFields[i];
      if (data[field as keyof Product] !== undefined) {
        fields.push(`${dbField} = $${idx++}`);
        values.push(data[field as keyof Product]);
      }
    }

    if (fields.length === 0) return this.findById(tenantId, id);

    fields.push(`updated_at = NOW()`);
    values.push(tenantId, id);

    const res = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    
    if (res.rows.length === 0) return null;
    return this.mapProduct(res.rows[0]);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM products WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Stock Management ──────────────────────────────────────

  async getStockMovements(tenantId: string, productId: string): Promise<StockMovement[]> {
    const res = await pool.query(
      'SELECT * FROM stock_movements WHERE tenant_id = $1 AND product_id = $2 ORDER BY created_at DESC',
      [tenantId, productId]
    );
    return res.rows.map(this.mapStockMovement);
  }

  async addStockMovement(tenantId: string, movement: Omit<StockMovement, 'id' | 'tenantId' | 'createdAt'>): Promise<StockMovement> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Insert Movement
      const res = await client.query(
        `INSERT INTO stock_movements (tenant_id, product_id, type, quantity, user_id, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [tenantId, movement.productId, movement.type, movement.quantity, movement.userId || null, movement.notes || null]
      );
      
      const newMovement = this.mapStockMovement(res.rows[0]);

      // 2. Update Product Stock
      // Quantity is signed: positive for entry, negative for exits/losses
      const productRes = await client.query(
        `UPDATE products SET current_stock = current_stock + $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3 RETURNING *`,
        [movement.quantity, tenantId, movement.productId]
      );
      
      const updatedProduct = productRes.rows[0];

      // 3. Low Stock Notification
      if (updatedProduct && updatedProduct.current_stock <= updatedProduct.min_stock_threshold) {
        // Check if there is already a pending notification for this product to avoid spam
        const pendingCheck = await client.query(
          `SELECT id FROM notifications_queue 
           WHERE tenant_id = $1 AND type = 'low_stock' AND status = 'pending' 
           AND message_payload->>'productId' = $2`,
          [tenantId, movement.productId]
        );

        if (pendingCheck.rows.length === 0) {
          await client.query(
            `INSERT INTO notifications_queue (tenant_id, type, message_payload, status)
             VALUES ($1, 'low_stock', $2, 'pending')`,
            [
              tenantId,
              JSON.stringify({
                productId: movement.productId,
                productName: updatedProduct.name,
                currentStock: updatedProduct.current_stock,
                minStockThreshold: updatedProduct.min_stock_threshold
              })
            ]
          );
        }
      }

      await client.query('COMMIT');
      return newMovement;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }


  // ── Mappers ─────────────────────────────────────────────────

  private mapProduct(row: any): Product {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      sku: row.sku,
      category: row.category,
      brand: row.brand,
      unitOfMeasure: row.unit_of_measure,
      costPrice: parseFloat(row.cost_price),
      salePrice: parseFloat(row.sale_price),
      description: row.description,
      imageUrl: row.image_url,
      isRetail: row.is_retail,
      isInternal: row.is_internal,
      currentStock: parseFloat(row.current_stock),
      minStockThreshold: parseFloat(row.min_stock_threshold),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapStockMovement(row: any): StockMovement {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      productId: row.product_id,
      type: row.type,
      quantity: parseFloat(row.quantity),
      userId: row.user_id,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }
}
