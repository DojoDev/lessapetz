import { Admin } from '../../domain/entities/Admin';
import { AdminRepository } from '../../domain/repositories/AdminRepository';
import pool from '../database/pool';

export class PostgresAdminRepository implements AdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const res = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (res.rows.length === 0) return null;
    return this.mapRowToAdmin(res.rows[0]);
  }

  async findById(id: string): Promise<Admin | null> {
    const res = await pool.query('SELECT * FROM admins WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapRowToAdmin(res.rows[0]);
  }

  private mapRowToAdmin(row: any): Admin {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }
}
