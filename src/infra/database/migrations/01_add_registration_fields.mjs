import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database for migration...');
    
    // Add columns to customers
    await pool.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS cpf VARCHAR(20) UNIQUE,
      ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS street VARCHAR(255),
      ADD COLUMN IF NOT EXISTS number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100);
    `);
    console.log('Added columns to customers');

    // Add columns to pets
    await pool.query(`
      ALTER TABLE pets 
      ADD COLUMN IF NOT EXISTS species VARCHAR(50) DEFAULT 'dog',
      ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255);
    `);
    console.log('Added columns to pets');

    // Add columns to bookings
    await pool.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending';
    `);
    console.log('Added columns to bookings');

    // Create customer_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
        plan_name VARCHAR(100) NOT NULL,
        valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created customer_plans table');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
