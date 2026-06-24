import { Tenant } from '../../domain/entities/Tenant';
import { TenantRepository } from '../../domain/repositories/TenantRepository';
import pool from '../database/pool';

export class PostgresTenantRepository implements TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const res = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const res = await pool.query('SELECT * FROM tenants WHERE slug = $1', [slug]);
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  private mapRow(row: any): Tenant {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      settings: row.settings || {},
      createdAt: row.created_at,
    };
  }
}
