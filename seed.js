const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const services = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Banho & Tosa Higiênica - Porte Pequeno', price: 65.00, duration: 60 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Banho & Tosa Higiênica - Porte Médio', price: 80.00, duration: 60 },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Banho & Tosa Higiênica - Porte Grande', price: 110.00, duration: 90 },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Banho - Raças Específicas', price: 140.00, duration: 90 },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Tosa na Máquina - Porte Pequeno', price: 110.00, duration: 90 },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Tosa na Máquina - Porte Médio', price: 130.00, duration: 90 },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Tosa na Máquina - Porte Grande', price: 0, duration: 90 },
  { id: '88888888-8888-8888-8888-888888888888', name: 'Tosa Bebê - Porte Pequeno', price: 120.00, duration: 120 },
  { id: '99999999-9999-9999-9999-999999999999', name: 'Tosa Bebê - Porte Médio', price: 140.00, duration: 120 },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Tosa Bebê - Porte Grande', price: 0, duration: 120 },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Pacote Mensal - Porte Pequeno', price: 200.00, duration: 120 },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Pacote Mensal - Porte Médio', price: 245.00, duration: 120 },
  { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Pacote Mensal - Porte Grande', price: 360.00, duration: 120 }
];
async function seed() {
  const tenantRes = await pool.query('SELECT id FROM tenants LIMIT 1');
  const tenantId = tenantRes.rows.length > 0 ? tenantRes.rows[0].id : null;
  if (!tenantId) { console.error('No tenant found!'); return; }
  
  await pool.query('DELETE FROM services;');
  for (const s of services) {
    await pool.query(
      'INSERT INTO services (id, tenant_id, name, base_price, base_duration_min) VALUES ($1, $2, $3, $4, $5)',
      [s.id, tenantId, s.name, s.price, s.duration]
    );
    console.log('Inserted', s.name);
  }
  pool.end();
}
seed().catch(console.error);
