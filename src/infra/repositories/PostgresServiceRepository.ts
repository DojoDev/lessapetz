import { PetService } from '../../domain/entities/PetService';
import { ServiceCategory } from '../../domain/entities/ServiceCategory';
import { ServicePricingRule } from '../../domain/entities/ServicePricingRule';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import pool from '../database/pool';

export class PostgresServiceRepository implements ServiceRepository {
  // ── Categories ──────────────────────────────────────────────

  async findAllCategories(tenantId: string): Promise<ServiceCategory[]> {
    const res = await pool.query(
      'SELECT * FROM service_categories WHERE tenant_id = $1 ORDER BY display_order ASC',
      [tenantId]
    );
    return res.rows.map(this.mapCategory);
  }

  async createCategory(tenantId: string, name: string, displayOrder: number): Promise<ServiceCategory> {
    const res = await pool.query(
      'INSERT INTO service_categories (tenant_id, name, display_order) VALUES ($1, $2, $3) RETURNING *',
      [tenantId, name, displayOrder]
    );
    return this.mapCategory(res.rows[0]);
  }

  async updateCategory(tenantId: string, id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.displayOrder !== undefined) { fields.push(`display_order = $${idx++}`); values.push(data.displayOrder); }

    if (fields.length === 0) return null;

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE service_categories SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    return this.mapCategory(res.rows[0]);
  }

  async deleteCategory(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM service_categories WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Services ────────────────────────────────────────────────

  async findById(tenantId: string, id: string): Promise<PetService | null> {
    const res = await pool.query(
      'SELECT * FROM services WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapService(res.rows[0]);
  }

  async findAll(tenantId: string): Promise<PetService[]> {
    const res = await pool.query(
      'SELECT * FROM services WHERE tenant_id = $1 ORDER BY name ASC',
      [tenantId]
    );
    return res.rows.map(this.mapService);
  }

  async findByCategory(tenantId: string, categoryId: string): Promise<PetService[]> {
    const res = await pool.query(
      'SELECT * FROM services WHERE tenant_id = $1 AND category_id = $2 ORDER BY name ASC',
      [tenantId, categoryId]
    );
    return res.rows.map(this.mapService);
  }

  async findActive(tenantId: string): Promise<PetService[]> {
    const res = await pool.query(
      'SELECT * FROM services WHERE tenant_id = $1 AND is_active = true ORDER BY name ASC',
      [tenantId]
    );
    return res.rows.map(this.mapService);
  }

  async create(tenantId: string, data: Omit<PetService, 'id' | 'tenantId' | 'createdAt'>): Promise<PetService> {
    const res = await pool.query(
      `INSERT INTO services (tenant_id, category_id, name, description, base_duration_min, base_price, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenantId, data.categoryId, data.name, data.description, data.baseDurationMin, data.basePrice, data.isActive]
    );
    return this.mapService(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<PetService>): Promise<PetService | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(data.categoryId); }
    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.baseDurationMin !== undefined) { fields.push(`base_duration_min = $${idx++}`); values.push(data.baseDurationMin); }
    if (data.basePrice !== undefined) { fields.push(`base_price = $${idx++}`); values.push(data.basePrice); }
    if (data.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.isActive); }

    if (fields.length === 0) return this.findById(tenantId, id);

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE services SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    return this.mapService(res.rows[0]);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM services WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Pricing Rules ───────────────────────────────────────────

  async findPricingRules(serviceId: string): Promise<ServicePricingRule[]> {
    const res = await pool.query(
      'SELECT * FROM service_pricing_rules WHERE service_id = $1',
      [serviceId]
    );
    return res.rows.map(this.mapPricingRule);
  }

  async createPricingRule(data: Omit<ServicePricingRule, 'id'>): Promise<ServicePricingRule> {
    const res = await pool.query(
      `INSERT INTO service_pricing_rules (service_id, size_category, coat_type, breed, price_modifier, duration_modifier_min)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.serviceId, data.sizeCategory, data.coatType, data.breed, data.priceModifier, data.durationModifierMin]
    );
    return this.mapPricingRule(res.rows[0]);
  }

  async updatePricingRule(id: string, data: Partial<ServicePricingRule>): Promise<ServicePricingRule | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.sizeCategory !== undefined) { fields.push(`size_category = $${idx++}`); values.push(data.sizeCategory); }
    if (data.coatType !== undefined) { fields.push(`coat_type = $${idx++}`); values.push(data.coatType); }
    if (data.breed !== undefined) { fields.push(`breed = $${idx++}`); values.push(data.breed); }
    if (data.priceModifier !== undefined) { fields.push(`price_modifier = $${idx++}`); values.push(data.priceModifier); }
    if (data.durationModifierMin !== undefined) { fields.push(`duration_modifier_min = $${idx++}`); values.push(data.durationModifierMin); }

    if (fields.length === 0) return null;

    values.push(id);
    const res = await pool.query(
      `UPDATE service_pricing_rules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    return this.mapPricingRule(res.rows[0]);
  }

  async deletePricingRule(id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM service_pricing_rules WHERE id = $1',
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Mappers ─────────────────────────────────────────────────

  private mapCategory(row: any): ServiceCategory {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      displayOrder: row.display_order,
    };
  }

  private mapService(row: any): PetService {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      baseDurationMin: row.base_duration_min,
      basePrice: parseFloat(row.base_price),
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  private mapPricingRule(row: any): ServicePricingRule {
    return {
      id: row.id,
      serviceId: row.service_id,
      sizeCategory: row.size_category,
      coatType: row.coat_type,
      breed: row.breed,
      priceModifier: parseFloat(row.price_modifier),
      durationModifierMin: row.duration_modifier_min,
    };
  }
}
