import { CustomerPlan } from '../../domain/entities/CustomerPlan';
import pool from '../database/pool';

export class PostgresCustomerPlanRepository {
  async findByCustomerId(tenantId: string, customerId: string): Promise<CustomerPlan[]> {
    const res = await pool.query(
      'SELECT * FROM customer_plans WHERE tenant_id = $1 AND customer_id = $2 ORDER BY created_at DESC',
      [tenantId, customerId]
    );
    return res.rows.map(this.mapRow);
  }

  async findByPetId(tenantId: string, petId: string): Promise<CustomerPlan[]> {
    const res = await pool.query(
      'SELECT * FROM customer_plans WHERE tenant_id = $1 AND pet_id = $2 ORDER BY created_at DESC',
      [tenantId, petId]
    );
    return res.rows.map(this.mapRow);
  }

  async findActiveByPetId(tenantId: string, petId: string): Promise<CustomerPlan[]> {
    const res = await pool.query(
      "SELECT * FROM customer_plans WHERE tenant_id = $1 AND pet_id = $2 AND valid_until >= NOW() AND status = 'active' ORDER BY valid_until ASC",
      [tenantId, petId]
    );
    return res.rows.map(this.mapRow);
  }

  async create(tenantId: string, data: Omit<CustomerPlan, 'id' | 'tenantId' | 'createdAt'>): Promise<CustomerPlan> {
    const res = await pool.query(
      `INSERT INTO customer_plans (tenant_id, customer_id, pet_id, catalog_plan_id, plan_name, valid_until, status, cycle_start_date, cycle_end_date, total_quota, uses_consumed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        tenantId, 
        data.customerId, 
        data.petId, 
        data.catalogPlanId, 
        data.planName, 
        data.validUntil,
        data.status || 'active',
        data.cycleStartDate,
        data.cycleEndDate,
        data.totalQuota || 0,
        data.usesConsumed || 0
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async findAtRiskSubscriptions(tenantId: string): Promise<any[]> {
    const res = await pool.query(`
      SELECT cp.*, c.full_name as client_name
      FROM customer_plans cp
      JOIN customers c ON c.id = cp.customer_id
      WHERE cp.tenant_id = $1 
        AND cp.status = 'active'
        AND cp.total_quota > cp.uses_consumed
        AND CURRENT_DATE > (cp.cycle_start_date + ((cp.cycle_end_date - cp.cycle_start_date) * 0.75)::integer)
      ORDER BY cp.cycle_end_date ASC
    `, [tenantId]);
    return res.rows;
  }

  async consumeQuota(id: string): Promise<void> {
    await pool.query(
      `UPDATE customer_plans 
       SET uses_consumed = uses_consumed + 1 
       WHERE id = $1`,
      [id]
    );
  }

  private mapRow(row: any): CustomerPlan {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      customerId: row.customer_id,
      petId: row.pet_id,
      catalogPlanId: row.catalog_plan_id,
      planName: row.plan_name,
      validUntil: row.valid_until,
      status: row.status,
      cycleStartDate: row.cycle_start_date,
      cycleEndDate: row.cycle_end_date,
      totalQuota: row.total_quota,
      usesConsumed: row.uses_consumed,
      createdAt: row.created_at,
    };
  }
}
