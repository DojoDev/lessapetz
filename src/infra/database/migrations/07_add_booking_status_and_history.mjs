import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Running Migration 07: Add Booking Status and History');

    // 1. Update existing statuses in bookings to match new enum
    await client.query(`
      UPDATE bookings SET status = 'SCHEDULED' WHERE status = 'confirmed';
      UPDATE bookings SET status = 'IN_PROGRESS' WHERE status = 'in_progress';
      UPDATE bookings SET status = 'COMPLETED' WHERE status = 'completed';
      UPDATE bookings SET status = 'CANCELLED' WHERE status = 'cancelled';
      UPDATE bookings SET status = 'NO_SHOW' WHERE status = 'no_show';
    `);

    // 2. Create Booking Status History table
    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL,
        tenant_id UUID NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by_user_id UUID,
        is_admin_override BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_history_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        CONSTRAINT fk_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      );
    `);

    // 3. Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
      CREATE INDEX IF NOT EXISTS idx_booking_status_history_tenant_id ON booking_status_history(tenant_id);
    `);

    await client.query('COMMIT');
    console.log('Migration 07 completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration 07 failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
