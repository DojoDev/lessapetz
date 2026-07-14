import { CatalogPlan } from '../../domain/entities/CatalogPlan';
import { CatalogPlanRepository } from '../../domain/repositories/CatalogPlanRepository';
import pool from '../database/pool';

export class PostgresCatalogPlanRepository implements CatalogPlanRepository {

  async findAll(tenantId: string): Promise<CatalogPlan[]> {
    const res = await pool.query(
      'SELECT * FROM catalog_plans WHERE tenant_id = $1 ORDER BY display_order ASC, name ASC',
      [tenantId]
    );
    const plans = res.rows.map(this.mapPlan);
    // Load included services for each plan
    for (const plan of plans) {
      plan.includedServiceIds = await this.getIncludedServices(plan.id);
    }
    return plans;
  }

  async findActive(tenantId: string): Promise<CatalogPlan[]> {
    const res = await pool.query(
      'SELECT * FROM catalog_plans WHERE tenant_id = $1 AND is_active = true ORDER BY display_order ASC, name ASC',
      [tenantId]
    );
    const plans = res.rows.map(this.mapPlan);
    for (const plan of plans) {
      plan.includedServiceIds = await this.getIncludedServices(plan.id);
    }
    return plans;
  }

  async findById(tenantId: string, id: string): Promise<CatalogPlan | null> {
    const res = await pool.query(
      'SELECT * FROM catalog_plans WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    const plan = this.mapPlan(res.rows[0]);
    plan.includedServiceIds = await this.getIncludedServices(plan.id);
    return plan;
  }

  async create(tenantId: string, data: Omit<CatalogPlan, 'id' | 'tenantId' | 'createdAt' | 'includedServiceIds'>): Promise<CatalogPlan> {
    const res = await pool.query(
      `INSERT INTO catalog_plans (tenant_id, name, description, monthly_price, image_url, is_active, display_order, quota, cycle_length_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [tenantId, data.name, data.description, data.monthlyPrice, data.imageUrl, data.isActive, data.displayOrder, data.quota || 0, data.cycleLengthDays || 30]
    );
    const plan = this.mapPlan(res.rows[0]);
    plan.includedServiceIds = [];
    return plan;
  }

  async update(tenantId: string, id: string, data: Partial<Omit<CatalogPlan, 'id' | 'tenantId' | 'createdAt' | 'includedServiceIds'>>): Promise<CatalogPlan | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.monthlyPrice !== undefined) { fields.push(`monthly_price = $${idx++}`); values.push(data.monthlyPrice); }
    if (data.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); values.push(data.imageUrl); }
    if (data.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.isActive); }
    if (data.displayOrder !== undefined) { fields.push(`display_order = $${idx++}`); values.push(data.displayOrder); }
    if (data.quota !== undefined) { fields.push(`quota = $${idx++}`); values.push(data.quota); }
    if (data.cycleLengthDays !== undefined) { fields.push(`cycle_length_days = $${idx++}`); values.push(data.cycleLengthDays); }

    if (fields.length === 0) return this.findById(tenantId, id);

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE catalog_plans SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    const plan = this.mapPlan(res.rows[0]);
    plan.includedServiceIds = await this.getIncludedServices(plan.id);
    return plan;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM catalog_plans WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async setIncludedServices(planId: string, serviceIds: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM plan_included_services WHERE plan_id = $1', [planId]);
      for (const serviceId of serviceIds) {
        await client.query(
          'INSERT INTO plan_included_services (plan_id, service_id) VALUES ($1, $2)',
          [planId, serviceId]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getIncludedServices(planId: string): Promise<string[]> {
    const res = await pool.query(
      'SELECT service_id FROM plan_included_services WHERE plan_id = $1',
      [planId]
    );
    return res.rows.map(r => r.service_id);
  }

  private mapPlan(row: any): CatalogPlan {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      monthlyPrice: parseFloat(row.monthly_price),
      imageUrl: row.image_url ?? null,
      isActive: row.is_active,
      displayOrder: row.display_order ?? 0,
      quota: row.quota ?? 0,
      cycleLengthDays: row.cycle_length_days ?? 30,
      includedServiceIds: [],
      createdAt: row.created_at,
    };
  }
}
