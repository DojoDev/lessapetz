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
      `INSERT INTO customers (tenant_id, full_name, phone, email, address, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenantId, data.fullName, data.phone, data.email, data.address, data.passwordHash]
    );
    return this.mapRow(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<Customer>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.fullName !== undefined) { fields.push(`full_name = $${idx++}`); values.push(data.fullName); }
    if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.address !== undefined) { fields.push(`address = $${idx++}`); values.push(data.address); }

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
      phone: row.phone,
      email: row.email,
      address: row.address,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }
}
