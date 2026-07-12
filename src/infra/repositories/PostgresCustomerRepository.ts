import { Customer } from '../../domain/entities/Customer';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import pool from '../database/pool';

export class PostgresCustomerRepository implements CustomerRepository {
  async findById(tenantId: string, id: string): Promise<Customer | null> {
    const res = await pool.query(
      'SELECT * FROM customers WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findByEmail(tenantId: string, email: string): Promise<Customer | null> {
    const res = await pool.query(
      'SELECT * FROM customers WHERE tenant_id = $1 AND email = $2',
      [tenantId, email]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findAll(tenantId: string): Promise<Customer[]> {
    const res = await pool.query(
      'SELECT * FROM customers WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return res.rows.map(this.mapRow);
  }

  async create(
    tenantId: string,
    data: Omit<Customer, 'id' | 'tenantId' | 'createdAt'>
  ): Promise<Customer> {
    const res = await pool.query(
      `INSERT INTO customers (tenant_id, full_name, cpf, phone, email, address, zip_code, street, number, neighborhood, city, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [tenantId, data.fullName, data.cpf, data.phone, data.email, data.address, data.zipCode, data.street, data.number, data.neighborhood, data.city, data.passwordHash]
    );
    return this.mapRow(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<Customer>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.fullName !== undefined) { fields.push(`full_name = $${idx++}`); values.push(data.fullName); }
    if (data.cpf !== undefined) { fields.push(`cpf = $${idx++}`); values.push(data.cpf); }
    if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.address !== undefined) { fields.push(`address = $${idx++}`); values.push(data.address); }
    if (data.zipCode !== undefined) { fields.push(`zip_code = $${idx++}`); values.push(data.zipCode); }
    if (data.street !== undefined) { fields.push(`street = $${idx++}`); values.push(data.street); }
    if (data.number !== undefined) { fields.push(`number = $${idx++}`); values.push(data.number); }
    if (data.neighborhood !== undefined) { fields.push(`neighborhood = $${idx++}`); values.push(data.neighborhood); }
    if (data.city !== undefined) { fields.push(`city = $${idx++}`); values.push(data.city); }

    if (fields.length === 0) return this.findById(tenantId, id);

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE customers SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM customers WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async count(tenantId: string): Promise<number> {
    const res = await pool.query(
      'SELECT COUNT(*)::int AS count FROM customers WHERE tenant_id = $1',
      [tenantId]
    );
    return res.rows[0].count;
  }

  private mapRow(row: any): Customer {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      fullName: row.full_name,
      cpf: row.cpf,
      phone: row.phone,
      email: row.email,
      address: row.address,
      zipCode: row.zip_code,
      street: row.street,
      number: row.number,
      neighborhood: row.neighborhood,
      city: row.city,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }
}
