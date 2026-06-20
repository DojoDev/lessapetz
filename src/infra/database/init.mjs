import pg from 'pg';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const { Pool } = pg;

async function init() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL.');

    console.log('Creating admins table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not found in env. Skipping root admin creation.');
    } else {
      const res = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
      if (res.rows.length === 0) {
        console.log('Creating root admin...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await pool.query(
          'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
          [email, hash]
        );
        console.log('Root admin created successfully.');
      } else {
        console.log('Root admin already exists.');
      }
    }
    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

// Check if running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  init();
}
