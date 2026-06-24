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

    // ── Tenants ──────────────────────────────────────────────
    console.log('Creating tenants table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Admins ───────────────────────────────────────────────
    console.log('Creating admins table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email)
      );
    `);

    // ── Customers ────────────────────────────────────────────
    console.log('Creating customers table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        email VARCHAR(255),
        address TEXT,
        password_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email)
      );
    `);

    // ── Pets ─────────────────────────────────────────────────
    console.log('Creating pets table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        breed VARCHAR(100),
        date_of_birth DATE,
        gender VARCHAR(20),
        weight DECIMAL(6,2),
        size_category VARCHAR(20) NOT NULL,
        coat_type VARCHAR(30),
        behavior VARCHAR(50),
        health_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Service Categories ───────────────────────────────────
    console.log('Creating service_categories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        display_order INTEGER DEFAULT 0,
        UNIQUE(tenant_id, name)
      );
    `);

    // ── Services ─────────────────────────────────────────────
    console.log('Creating services table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        base_duration_min INTEGER NOT NULL DEFAULT 60,
        base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Service Pricing Rules ────────────────────────────────
    console.log('Creating service_pricing_rules table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        size_category VARCHAR(20),
        coat_type VARCHAR(30),
        breed VARCHAR(100),
        price_modifier DECIMAL(10,2) DEFAULT 0,
        duration_modifier_min INTEGER DEFAULT 0
      );
    `);

    // ── Employees ────────────────────────────────────────────
    console.log('Creating employees table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        max_concurrent_pets INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Employee Services (junction) ─────────────────────────
    console.log('Creating employee_services table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE(employee_id, service_id)
      );
    `);

    // ── Employee Schedules ───────────────────────────────────
    console.log('Creating employee_schedules table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        UNIQUE(employee_id, day_of_week)
      );
    `);

    // ── Employee Blocked Times ───────────────────────────────
    console.log('Creating employee_blocked_times table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_blocked_times (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        start_at TIMESTAMP WITH TIME ZONE NOT NULL,
        end_at TIMESTAMP WITH TIME ZONE NOT NULL,
        reason VARCHAR(255)
      );
    `);

    // ── Bookings ─────────────────────────────────────────────
    console.log('Creating bookings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
        employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        start_at TIMESTAMP WITH TIME ZONE NOT NULL,
        end_at TIMESTAMP WITH TIME ZONE NOT NULL,
        duration_min INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Create indexes for performance ───────────────────────
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_admins_tenant ON admins(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_pets_tenant ON pets(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_pets_customer ON pets(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_employee ON bookings(employee_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start_at)',
      'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
    ];
    for (const idx of indexes) {
      await pool.query(idx);
    }

    // ── Seed default tenant and root admin ───────────────────
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const tenantName = process.env.TENANT_NAME || 'Lessa Petz';
    const tenantSlug = process.env.TENANT_SLUG || 'lessapetz';

    // Upsert tenant
    let tenantId;
    const tenantRes = await pool.query('SELECT id FROM tenants WHERE slug = $1', [tenantSlug]);
    if (tenantRes.rows.length === 0) {
      console.log(`Creating tenant "${tenantName}"...`);
      const insertRes = await pool.query(
        'INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id',
        [tenantName, tenantSlug]
      );
      tenantId = insertRes.rows[0].id;
      console.log(`Tenant created with ID: ${tenantId}`);
    } else {
      tenantId = tenantRes.rows[0].id;
      console.log(`Tenant "${tenantName}" already exists (ID: ${tenantId}).`);
    }

    // Upsert root admin
    if (!email || !password) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not found in env. Skipping root admin creation.');
    } else {
      const adminRes = await pool.query(
        'SELECT * FROM admins WHERE tenant_id = $1 AND email = $2',
        [tenantId, email]
      );
      if (adminRes.rows.length === 0) {
        console.log('Creating root admin...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await pool.query(
          'INSERT INTO admins (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
          [tenantId, email, hash, 'root']
        );
        console.log('Root admin created successfully.');
      } else {
        console.log('Root admin already exists.');
      }
    }

    // ── Seed default service categories ──────────────────────
    const defaultCategories = [
      { name: 'Banho', order: 1 },
      { name: 'Tosa', order: 2 },
      { name: 'Extras', order: 3 },
    ];

    for (const cat of defaultCategories) {
      const catRes = await pool.query(
        'SELECT id FROM service_categories WHERE tenant_id = $1 AND name = $2',
        [tenantId, cat.name]
      );
      if (catRes.rows.length === 0) {
        await pool.query(
          'INSERT INTO service_categories (tenant_id, name, display_order) VALUES ($1, $2, $3)',
          [tenantId, cat.name, cat.order]
        );
        console.log(`Category "${cat.name}" created.`);
      }
    }

    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  init();
}
