import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Running Migration 06: Add Products and Inventory');

    // 1. Create Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        category VARCHAR(100),
        brand VARCHAR(100),
        unit_of_measure VARCHAR(50),
        cost_price DECIMAL(10, 2) DEFAULT 0,
        sale_price DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        image_url VARCHAR(255),
        is_retail BOOLEAN DEFAULT true,
        is_internal BOOLEAN DEFAULT false,
        current_stock DECIMAL(10, 2) DEFAULT 0,
        min_stock_threshold DECIMAL(10, 2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_products_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        CONSTRAINT uq_products_tenant_sku UNIQUE NULLS NOT DISTINCT (tenant_id, sku)
      );
    `);

    // 2. Create Stock Movements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        product_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'entry', 'sale', 'internal_use', 'adjustment', 'loss'
        quantity DECIMAL(10, 2) NOT NULL,
        user_id UUID, -- Optional: who registered the movement (could be an admin/employee ID)
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_movements_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        CONSTRAINT fk_movements_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    // 3. Create Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(tenant_id, category);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements(tenant_id);
    `);

    await client.query('COMMIT');
    console.log('Migration 06 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration 06 failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
