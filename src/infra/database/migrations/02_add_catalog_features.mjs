import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database for migration 02...');
    
    // 1. Add columns to services table
    await pool.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_starting_price BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS pet_size_applicability VARCHAR(50) DEFAULT 'all';
    `);
    console.log('Added columns to services');

    // 2. Create catalog_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS catalog_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created catalog_plans table');

    // 3. Create plan_included_services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plan_included_services (
        plan_id UUID NOT NULL REFERENCES catalog_plans(id) ON DELETE CASCADE,
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        PRIMARY KEY(plan_id, service_id)
      );
    `);
    console.log('Created plan_included_services table');

    // 4. Update customer_plans table to reference catalog_plans
    await pool.query(`
      ALTER TABLE customer_plans 
      ADD COLUMN IF NOT EXISTS catalog_plan_id UUID REFERENCES catalog_plans(id) ON DELETE SET NULL;
    `);
    console.log('Updated customer_plans table with catalog_plan_id');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
