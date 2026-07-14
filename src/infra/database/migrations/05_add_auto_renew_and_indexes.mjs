import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database for migration 05...');

    // 1. Add auto_renew to customer_plans
    await pool.query(`
      ALTER TABLE customer_plans
      ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;
    `);
    console.log('Added auto_renew to customer_plans');

    // 2. Add index on notifications_queue for n8n polling
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_queue_status ON notifications_queue(status);
    `);
    console.log('Added index on notifications_queue(status)');

    // 3. Add index on customer_plans for at-risk query
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_plans_active ON customer_plans(tenant_id, status, cycle_end_date);
    `);
    console.log('Added index on customer_plans for at-risk queries');

    console.log('Migration 05 complete.');
  } catch (err) {
    console.error('Migration 05 error:', err);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
