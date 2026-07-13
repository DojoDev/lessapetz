import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database for migration 03...');

    // 1. Add display_order to services table for admin reordering
    await pool.query(`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    `);
    console.log('Added display_order to services');

    // 2. Add description and image_url to service_categories
    await pool.query(`
      ALTER TABLE service_categories
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    `);
    console.log('Added description and image_url to service_categories');

    // 3. Add display_order to catalog_plans
    await pool.query(`
      ALTER TABLE catalog_plans
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    `);
    console.log('Added display_order to catalog_plans');

    // 4. Set initial display_order for existing services based on created_at
    await pool.query(`
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY created_at ASC) as rn
        FROM services
        WHERE display_order = 0 OR display_order IS NULL
      )
      UPDATE services SET display_order = ordered.rn
      FROM ordered WHERE services.id = ordered.id;
    `);
    console.log('Set initial display_order for existing services');

    // 5. Set default category images for existing categories
    const categoryImages = [
      { name: 'Banho', imageUrl: '/assets/pet_bath_spa.png' },
      { name: 'Tosa', imageUrl: '/assets/pet_tosa_grooming.png' },
      { name: 'Extras', imageUrl: '/assets/spa_dog.png' },
    ];

    for (const cat of categoryImages) {
      await pool.query(
        `UPDATE service_categories SET image_url = $1 WHERE name = $2 AND image_url IS NULL`,
        [cat.imageUrl, cat.name]
      );
    }
    console.log('Set default category images');

    console.log('Migration 03 complete.');
  } catch (err) {
    console.error('Migration 03 error:', err);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
