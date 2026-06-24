import { Booking } from '../../domain/entities/Booking';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import pool from '../database/pool';

export class PostgresBookingRepository implements BookingRepository {
  async findById(tenantId: string, id: string): Promise<Booking | null> {
    const res = await pool.query(
      'SELECT * FROM bookings WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findByDate(tenantId: string, date: string): Promise<Booking[]> {
    const res = await pool.query(
      `SELECT * FROM bookings WHERE tenant_id = $1
       AND start_at::date = $2::date
       AND status != 'cancelled'
       ORDER BY start_at ASC`,
      [tenantId, date]
    );
    return res.rows.map(this.mapRow);
  }

  async findByEmployee(tenantId: string, employeeId: string, from: Date, to: Date): Promise<Booking[]> {
    const res = await pool.query(
      `SELECT * FROM bookings WHERE tenant_id = $1
       AND employee_id = $2
       AND start_at >= $3 AND end_at <= $4
       AND status != 'cancelled'
       ORDER BY start_at ASC`,
      [tenantId, employeeId, from, to]
    );
    return res.rows.map(this.mapRow);
  }

  async findByCustomer(tenantId: string, customerId: string): Promise<Booking[]> {
    const res = await pool.query(
      'SELECT * FROM bookings WHERE tenant_id = $1 AND customer_id = $2 ORDER BY start_at DESC',
      [tenantId, customerId]
    );
    return res.rows.map(this.mapRow);
  }

  async findUpcoming(tenantId: string, limit: number = 10): Promise<Booking[]> {
    const res = await pool.query(
      `SELECT * FROM bookings WHERE tenant_id = $1
       AND start_at >= NOW()
       AND status = 'confirmed'
       ORDER BY start_at ASC LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map(this.mapRow);
  }

  async create(tenantId: string, data: Omit<Booking, 'id' | 'tenantId' | 'createdAt'>): Promise<Booking> {
    const res = await pool.query(
      `INSERT INTO bookings (tenant_id, customer_id, pet_id, service_id, employee_id, start_at, end_at, duration_min, total_price, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        tenantId, data.customerId, data.petId, data.serviceId, data.employeeId,
        data.startAt, data.endAt, data.durationMin, data.totalPrice,
        data.status, data.notes,
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<Booking | null> {
    const res = await pool.query(
      'UPDATE bookings SET status = $1 WHERE tenant_id = $2 AND id = $3 RETURNING *',
      [status, tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async cancel(tenantId: string, id: string): Promise<Booking | null> {
    return this.updateStatus(tenantId, id, 'cancelled');
  }

  async countToday(tenantId: string): Promise<number> {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS count FROM bookings
       WHERE tenant_id = $1 AND start_at::date = CURRENT_DATE AND status != 'cancelled'`,
      [tenantId]
    );
    return res.rows[0].count;
  }

  async revenueToday(tenantId: string): Promise<number> {
    const res = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0)::numeric AS revenue FROM bookings
       WHERE tenant_id = $1 AND start_at::date = CURRENT_DATE AND status != 'cancelled'`,
      [tenantId]
    );
    return parseFloat(res.rows[0].revenue);
  }

  private mapRow(row: any): Booking {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      customerId: row.customer_id,
      petId: row.pet_id,
      serviceId: row.service_id,
      employeeId: row.employee_id,
      startAt: row.start_at,
      endAt: row.end_at,
      durationMin: row.duration_min,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }
}
