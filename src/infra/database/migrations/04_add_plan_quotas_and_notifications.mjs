import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database for migration 04...');

    // 1. Add quota and cycle_length_days to catalog_plans
    await pool.query(`
      ALTER TABLE catalog_plans
      ADD COLUMN IF NOT EXISTS quota INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cycle_length_days INTEGER DEFAULT 30;
    `);
    console.log('Added quota and cycle_length_days to catalog_plans');

    // 2. Add subscription fields to customer_plans
    await pool.query(`
      ALTER TABLE customer_plans
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS cycle_start_date DATE,
      ADD COLUMN IF NOT EXISTS cycle_end_date DATE,
      ADD COLUMN IF NOT EXISTS total_quota INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS uses_consumed INTEGER DEFAULT 0;
    `);
    
    // Set some defaults for existing rows to avoid null issues
    await pool.query(`
      UPDATE customer_plans
      SET cycle_start_date = CURRENT_DATE,
          cycle_end_date = valid_until::DATE,
          total_quota = 0,
          uses_consumed = 0
      WHERE cycle_start_date IS NULL;
    `);
    console.log('Added subscription fields to customer_plans');

    // 3. Add customer_plan_id to bookings
    await pool.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS customer_plan_id UUID REFERENCES customer_plans(id) ON DELETE SET NULL;
    `);
    console.log('Added customer_plan_id to bookings');

    // 4. Create notifications_queue table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES customer_plans(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        message_payload JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('Created notifications_queue table');

    console.log('Migration 04 complete.');
  } catch (err) {
    console.error('Migration 04 error:', err);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
