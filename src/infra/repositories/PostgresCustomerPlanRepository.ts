import { CustomerPlan } from '../../domain/entities/CustomerPlan';
import pool from '../database/pool';

export class PostgresCustomerPlanRepository {
  async findById(tenantId: string, id: string): Promise<CustomerPlan | null> {
    const res = await pool.query(
      'SELECT * FROM customer_plans WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

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
      `SELECT * FROM customer_plans 
       WHERE tenant_id = $1 AND pet_id = $2 
         AND valid_until >= NOW() AND status = 'active' 
       ORDER BY valid_until ASC`,
      [tenantId, petId]
    );
    return res.rows.map(this.mapRow);
  }

  /**
   * Find active plans for a pet that include a specific service via catalog_plan -> plan_included_services.
   */
  async findActiveByPetIdAndService(tenantId: string, petId: string, serviceId: string): Promise<CustomerPlan[]> {
    const res = await pool.query(
      `SELECT cp.* FROM customer_plans cp
       INNER JOIN plan_included_services pis ON pis.plan_id = cp.catalog_plan_id
       WHERE cp.tenant_id = $1 AND cp.pet_id = $2 
         AND pis.service_id = $3
         AND cp.valid_until >= NOW() AND cp.status = 'active'
         AND cp.uses_consumed < cp.total_quota
       ORDER BY cp.valid_until ASC`,
      [tenantId, petId, serviceId]
    );
    return res.rows.map(this.mapRow);
  }

  async create(tenantId: string, data: Omit<CustomerPlan, 'id' | 'tenantId' | 'createdAt'>): Promise<CustomerPlan> {
    const res = await pool.query(
      `INSERT INTO customer_plans (tenant_id, customer_id, pet_id, catalog_plan_id, plan_name, valid_until, status, cycle_start_date, cycle_end_date, total_quota, uses_consumed, auto_renew)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
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
        data.usesConsumed || 0,
        data.autoRenew ?? false
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<Omit<CustomerPlan, 'id' | 'tenantId' | 'createdAt'>>): Promise<CustomerPlan | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.cycleStartDate !== undefined) { fields.push(`cycle_start_date = $${idx++}`); values.push(data.cycleStartDate); }
    if (data.cycleEndDate !== undefined) { fields.push(`cycle_end_date = $${idx++}`); values.push(data.cycleEndDate); }
    if (data.validUntil !== undefined) { fields.push(`valid_until = $${idx++}`); values.push(data.validUntil); }
    if (data.totalQuota !== undefined) { fields.push(`total_quota = $${idx++}`); values.push(data.totalQuota); }
    if (data.usesConsumed !== undefined) { fields.push(`uses_consumed = $${idx++}`); values.push(data.usesConsumed); }
    if (data.autoRenew !== undefined) { fields.push(`auto_renew = $${idx++}`); values.push(data.autoRenew); }
    if (data.planName !== undefined) { fields.push(`plan_name = $${idx++}`); values.push(data.planName); }

    if (fields.length === 0) return this.findById(tenantId, id);

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE customer_plans SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
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
        AND cp.cycle_end_date >= CURRENT_DATE
        AND CURRENT_DATE > (cp.cycle_start_date + ((cp.cycle_end_date - cp.cycle_start_date) * 0.75)::integer)
      ORDER BY cp.cycle_end_date ASC
    `, [tenantId]);
    return res.rows;
  }

  /**
   * Safely increment uses_consumed. Returns false if quota already full (race-safe).
   */
  async consumeQuota(id: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE customer_plans 
       SET uses_consumed = uses_consumed + 1 
       WHERE id = $1 AND uses_consumed < total_quota
       RETURNING id`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Safely decrement uses_consumed (e.g. when a booking is cancelled).
   */
  async refundQuota(id: string): Promise<void> {
    await pool.query(
      `UPDATE customer_plans 
       SET uses_consumed = GREATEST(0, uses_consumed - 1) 
       WHERE id = $1`,
      [id]
    );
  }

  async getPlanUsageWithDetails(tenantId: string, limit: number = 5): Promise<any[]> {
    const res = await pool.query(
      `SELECT cp.id, c.full_name as client_name, cp.plan_name as plan, 
              cp.uses_consumed, cp.total_quota, cp.cycle_end_date
       FROM customer_plans cp
       JOIN customers c ON cp.customer_id = c.id
       WHERE cp.tenant_id = $1 AND cp.status = 'active'
       ORDER BY cp.cycle_end_date ASC
       LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map(row => ({
      id: row.id,
      client: row.client_name,
      plan: row.plan,
      usesLeft: `${row.uses_consumed}/${row.total_quota}`,
      renewalDate: new Date(row.cycle_end_date).toLocaleDateString('pt-BR')
    }));
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
      totalQuota: row.total_quota ?? 0,
      usesConsumed: row.uses_consumed ?? 0,
      autoRenew: row.auto_renew ?? false,
      createdAt: row.created_at,
    };
  }
}
