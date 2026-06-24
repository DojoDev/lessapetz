import { Pet } from '../../domain/entities/Pet';
import { PetRepository } from '../../domain/repositories/PetRepository';
import pool from '../database/pool';

export class PostgresPetRepository implements PetRepository {
  async findById(tenantId: string, id: string): Promise<Pet | null> {
    const res = await pool.query(
      'SELECT * FROM pets WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findByCustomerId(tenantId: string, customerId: string): Promise<Pet[]> {
    const res = await pool.query(
      'SELECT * FROM pets WHERE tenant_id = $1 AND customer_id = $2 ORDER BY created_at DESC',
      [tenantId, customerId]
    );
    return res.rows.map(this.mapRow);
  }

  async findAll(tenantId: string): Promise<Pet[]> {
    const res = await pool.query(
      'SELECT * FROM pets WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return res.rows.map(this.mapRow);
  }

  async create(tenantId: string, data: Omit<Pet, 'id' | 'tenantId' | 'createdAt'>): Promise<Pet> {
    const res = await pool.query(
      `INSERT INTO pets (tenant_id, customer_id, name, breed, date_of_birth, gender, weight, size_category, coat_type, behavior, health_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        tenantId, data.customerId, data.name, data.breed, data.dateOfBirth,
        data.gender, data.weight, data.sizeCategory, data.coatType,
        data.behavior, data.healthNotes,
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<Pet>): Promise<Pet | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.breed !== undefined) { fields.push(`breed = $${idx++}`); values.push(data.breed); }
    if (data.dateOfBirth !== undefined) { fields.push(`date_of_birth = $${idx++}`); values.push(data.dateOfBirth); }
    if (data.gender !== undefined) { fields.push(`gender = $${idx++}`); values.push(data.gender); }
    if (data.weight !== undefined) { fields.push(`weight = $${idx++}`); values.push(data.weight); }
    if (data.sizeCategory !== undefined) { fields.push(`size_category = $${idx++}`); values.push(data.sizeCategory); }
    if (data.coatType !== undefined) { fields.push(`coat_type = $${idx++}`); values.push(data.coatType); }
    if (data.behavior !== undefined) { fields.push(`behavior = $${idx++}`); values.push(data.behavior); }
    if (data.healthNotes !== undefined) { fields.push(`health_notes = $${idx++}`); values.push(data.healthNotes); }

    if (fields.length === 0) return this.findById(tenantId, id);

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE pets SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM pets WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  private mapRow(row: any): Pet {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      customerId: row.customer_id,
      name: row.name,
      breed: row.breed,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      weight: row.weight ? parseFloat(row.weight) : null,
      sizeCategory: row.size_category,
      coatType: row.coat_type,
      behavior: row.behavior,
      healthNotes: row.health_notes,
      createdAt: row.created_at,
    };
  }
}
