import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { BookingStatusHistory } from '../../domain/entities/BookingStatusHistory';
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
       AND status = 'SCHEDULED'
       ORDER BY start_at ASC LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map(this.mapRow);
  }

  async findUpcomingWithDetails(tenantId: string, limit: number = 50): Promise<any[]> {
    const res = await pool.query(
      `SELECT b.*, c.full_name as client_name, p.name as pet_name, s.name as service_name
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN pets p ON b.pet_id = p.id
       JOIN services s ON b.service_id = s.id
       WHERE b.tenant_id = $1
       AND b.start_at >= NOW()
       AND b.status = 'SCHEDULED'
       ORDER BY b.start_at ASC LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map(row => ({
      ...this.mapRow(row),
      clientName: row.client_name,
      petName: row.pet_name,
      serviceName: row.service_name,
    }));
  }

  async create(tenantId: string, data: Omit<Booking, 'id' | 'tenantId' | 'createdAt'>): Promise<Booking> {
    const res = await pool.query(
      `INSERT INTO bookings (tenant_id, customer_id, pet_id, service_id, customer_plan_id, employee_id, start_at, end_at, duration_min, total_price, status, notes, payment_method, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        tenantId, data.customerId, data.petId, data.serviceId, data.customerPlanId || null, data.employeeId,
        data.startAt, data.endAt, data.durationMin, data.totalPrice,
        data.status, data.notes, data.paymentMethod || null, data.paymentStatus || 'pending'
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

  async updateStatusWithHistory(
    tenantId: string, 
    id: string, 
    newStatus: string, 
    previousStatus: string | null, 
    changedByUserId: string | null,
    isAdminOverride: boolean = false,
    notes: string | null = null
  ): Promise<Booking | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        'UPDATE bookings SET status = $1 WHERE tenant_id = $2 AND id = $3 RETURNING *',
        [newStatus, tenantId, id]
      );
      
      if (res.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      await client.query(
        `INSERT INTO booking_status_history (booking_id, tenant_id, previous_status, new_status, changed_by_user_id, is_admin_override, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, tenantId, previousStatus, newStatus, changedByUserId, isAdminOverride, notes]
      );

      await client.query('COMMIT');
      return this.mapRow(res.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getStatusHistory(tenantId: string, id: string): Promise<BookingStatusHistory[]> {
    const res = await pool.query(
      'SELECT * FROM booking_status_history WHERE tenant_id = $1 AND booking_id = $2 ORDER BY created_at DESC',
      [tenantId, id]
    );
    return res.rows.map(row => ({
      id: row.id,
      bookingId: row.booking_id,
      tenantId: row.tenant_id,
      previousStatus: row.previous_status,
      newStatus: row.new_status,
      changedByUserId: row.changed_by_user_id,
      isAdminOverride: row.is_admin_override,
      notes: row.notes,
      createdAt: row.created_at
    }));
  }

  async cancel(tenantId: string, id: string): Promise<Booking | null> {
    return this.updateStatus(tenantId, id, 'CANCELLED');
  }

  async countToday(tenantId: string): Promise<number> {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS count FROM bookings
       WHERE tenant_id = $1 AND start_at::date = CURRENT_DATE AND status NOT IN ('CANCELLED', 'NO_SHOW')`,
      [tenantId]
    );
    return res.rows[0].count;
  }

  async countByStatusToday(tenantId: string, status: string): Promise<number> {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS count FROM bookings
       WHERE tenant_id = $1 AND start_at::date = CURRENT_DATE AND status = $2`,
      [tenantId, status]
    );
    return res.rows[0].count;
  }

  async revenueToday(tenantId: string): Promise<number> {
    const res = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0)::numeric AS revenue FROM bookings
       WHERE tenant_id = $1 AND start_at::date = CURRENT_DATE AND status NOT IN ('CANCELLED', 'NO_SHOW')`,
      [tenantId]
    );
    return parseFloat(res.rows[0].revenue);
  }

  async getTotalRevenue(tenantId: string, from: Date, to: Date): Promise<number> {
    const res = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0)::numeric AS revenue FROM bookings
       WHERE tenant_id = $1 AND start_at >= $2 AND end_at <= $3 
       AND payment_status = 'paid' AND status NOT IN ('CANCELLED', 'NO_SHOW')`,
      [tenantId, from, to]
    );
    return parseFloat(res.rows[0].revenue);
  }

  async getPendingPayments(tenantId: string, from: Date, to: Date): Promise<number> {
    const res = await pool.query(
      `SELECT COALESCE(SUM(total_price), 0)::numeric AS pending FROM bookings
       WHERE tenant_id = $1 AND start_at >= $2 AND end_at <= $3 
       AND payment_status = 'pending' AND status NOT IN ('CANCELLED', 'NO_SHOW')`,
      [tenantId, from, to]
    );
    return parseFloat(res.rows[0].pending);
  }

  async getRevenueTrend(tenantId: string, limitMonths: number = 6): Promise<{ date: string, revenue: number }[]> {
    const res = await pool.query(
      `SELECT 
         to_char(date_trunc('month', start_at), 'Mon YYYY') as month_str,
         date_trunc('month', start_at) as month_date,
         COALESCE(SUM(total_price), 0)::numeric as revenue
       FROM bookings
       WHERE tenant_id = $1 
         AND start_at >= date_trunc('month', current_date - interval '${limitMonths - 1} months')
         AND payment_status = 'paid' AND status NOT IN ('CANCELLED', 'NO_SHOW')
       GROUP BY 1, 2
       ORDER BY month_date ASC`,
      [tenantId]
    );
    return res.rows.map(row => ({
      date: row.month_str,
      revenue: parseFloat(row.revenue)
    }));
  }

  async getRecentBookingsWithDetails(tenantId: string, limit: number = 10): Promise<any[]> {
    const res = await pool.query(
      `SELECT b.id, c.full_name as client_name, s.name as service_name, 
              to_char(b.start_at, 'HH24:MI') as time_str, b.status, b.start_at
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       JOIN services s ON b.service_id = s.id
       WHERE b.tenant_id = $1 AND b.start_at >= CURRENT_DATE
       ORDER BY b.start_at ASC
       LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map(row => ({
      id: row.id,
      clientName: row.client_name,
      service: row.service_name,
      time: row.time_str,
      status: row.status === 'SCHEDULED' ? 'Agendado' : row.status === 'COMPLETED' ? 'Finalizado' : row.status === 'CANCELLED' ? 'Cancelado' : 'Em andamento',
      startAt: row.start_at
    }));
  }

  async getRecentTransactions(tenantId: string, limit: number = 5): Promise<any[]> {
    const res = await pool.query(
      `SELECT b.id, c.full_name as client_name, b.start_at, b.total_price, b.payment_status
       FROM bookings b
       JOIN customers c ON b.customer_id = c.id
       WHERE b.tenant_id = $1 AND b.status NOT IN ('CANCELLED', 'NO_SHOW')
       ORDER BY b.start_at DESC
       LIMIT $2`,
      [tenantId, limit]
    );
    return res.rows.map(row => {
      // Format relative date string
      const dateObj = new Date(row.start_at);
      const isToday = new Date().toDateString() === dateObj.toDateString();
      const isYesterday = new Date(Date.now() - 86400000).toDateString() === dateObj.toDateString();
      const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      let dateStr = dateObj.toLocaleDateString('pt-BR');
      if (isToday) dateStr = `Hoje, ${timeStr}`;
      else if (isYesterday) dateStr = `Ontem, ${timeStr}`;

      return {
        id: row.id,
        client: row.client_name,
        date: dateStr,
        amount: parseFloat(row.total_price),
        status: row.payment_status === 'paid' ? 'Paid' : 'Pending'
      };
    });
  }

  private mapRow(row: any): Booking {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      customerId: row.customer_id,
      petId: row.pet_id,
      serviceId: row.service_id,
      customerPlanId: row.customer_plan_id,
      employeeId: row.employee_id,
      startAt: row.start_at,
      endAt: row.end_at,
      durationMin: row.duration_min,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      notes: row.notes,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status || 'pending',
      createdAt: row.created_at,
    };
  }
}
