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
      'SELECT * FROM customer_plans WHERE tenant_id = $1 AND pet_id = $2 AND valid_until >= NOW() ORDER BY valid_until ASC',
      [tenantId, petId]
    );
    return res.rows.map(this.mapRow);
  }

  async create(tenantId: string, data: Omit<CustomerPlan, 'id' | 'tenantId' | 'createdAt'>): Promise<CustomerPlan> {
    const res = await pool.query(
      `INSERT INTO customer_plans (tenant_id, customer_id, pet_id, plan_name, valid_until)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, data.customerId, data.petId, data.planName, data.validUntil]
    );
    return this.mapRow(res.rows[0]);
  }

  private mapRow(row: any): CustomerPlan {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      customerId: row.customer_id,
      petId: row.pet_id,
      planName: row.plan_name,
      validUntil: row.valid_until,
      createdAt: row.created_at,
    };
  }
}
