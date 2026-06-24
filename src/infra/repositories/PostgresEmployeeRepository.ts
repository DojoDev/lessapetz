import { Employee } from '../../domain/entities/Employee';
import { EmployeeSchedule, EmployeeBlockedTime } from '../../domain/entities/EmployeeSchedule';
import { EmployeeRepository } from '../../domain/repositories/EmployeeRepository';
import pool from '../database/pool';

export class PostgresEmployeeRepository implements EmployeeRepository {
  async findById(tenantId: string, id: string): Promise<Employee | null> {
    const res = await pool.query(
      'SELECT * FROM employees WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    return this.mapEmployee(res.rows[0]);
  }

  async findAll(tenantId: string): Promise<Employee[]> {
    const res = await pool.query(
      'SELECT * FROM employees WHERE tenant_id = $1 ORDER BY name ASC',
      [tenantId]
    );
    return res.rows.map(this.mapEmployee);
  }

  async findActive(tenantId: string): Promise<Employee[]> {
    const res = await pool.query(
      'SELECT * FROM employees WHERE tenant_id = $1 AND is_active = true ORDER BY name ASC',
      [tenantId]
    );
    return res.rows.map(this.mapEmployee);
  }

  async findByService(tenantId: string, serviceId: string): Promise<Employee[]> {
    const res = await pool.query(
      `SELECT e.* FROM employees e
       INNER JOIN employee_services es ON e.id = es.employee_id
       WHERE e.tenant_id = $1 AND es.service_id = $2 AND e.is_active = true
       ORDER BY e.name ASC`,
      [tenantId, serviceId]
    );
    return res.rows.map(this.mapEmployee);
  }

  async create(tenantId: string, data: Omit<Employee, 'id' | 'tenantId' | 'createdAt'>): Promise<Employee> {
    const res = await pool.query(
      `INSERT INTO employees (tenant_id, name, email, is_active, max_concurrent_pets)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, data.name, data.email, data.isActive, data.maxConcurrentPets]
    );
    return this.mapEmployee(res.rows[0]);
  }

  async update(tenantId: string, id: string, data: Partial<Employee>): Promise<Employee | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(data.isActive); }
    if (data.maxConcurrentPets !== undefined) { fields.push(`max_concurrent_pets = $${idx++}`); values.push(data.maxConcurrentPets); }

    if (fields.length === 0) return this.findById(tenantId, id);

    values.push(tenantId, id);
    const res = await pool.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE tenant_id = $${idx++} AND id = $${idx} RETURNING *`,
      values
    );
    if (res.rows.length === 0) return null;
    return this.mapEmployee(res.rows[0]);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const res = await pool.query(
      'DELETE FROM employees WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // ── Service Assignments ──────────────────────────────────────

  async getAssignedServices(employeeId: string): Promise<string[]> {
    const res = await pool.query(
      'SELECT service_id FROM employee_services WHERE employee_id = $1',
      [employeeId]
    );
    return res.rows.map((r: any) => r.service_id);
  }

  async assignService(employeeId: string, serviceId: string): Promise<void> {
    await pool.query(
      'INSERT INTO employee_services (employee_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [employeeId, serviceId]
    );
  }

  async unassignService(employeeId: string, serviceId: string): Promise<void> {
    await pool.query(
      'DELETE FROM employee_services WHERE employee_id = $1 AND service_id = $2',
      [employeeId, serviceId]
    );
  }

  // ── Schedule ─────────────────────────────────────────────────

  async getSchedule(employeeId: string): Promise<EmployeeSchedule[]> {
    const res = await pool.query(
      'SELECT * FROM employee_schedules WHERE employee_id = $1 ORDER BY day_of_week ASC',
      [employeeId]
    );
    return res.rows.map(this.mapSchedule);
  }

  async setSchedule(employeeId: string, schedules: Omit<EmployeeSchedule, 'id' | 'employeeId'>[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM employee_schedules WHERE employee_id = $1', [employeeId]);
      for (const s of schedules) {
        await client.query(
          'INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [employeeId, s.dayOfWeek, s.startTime, s.endTime]
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

  // ── Blocked Times ────────────────────────────────────────────

  async getBlockedTimes(employeeId: string, from?: Date, to?: Date): Promise<EmployeeBlockedTime[]> {
    let query = 'SELECT * FROM employee_blocked_times WHERE employee_id = $1';
    const params: any[] = [employeeId];

    if (from) {
      params.push(from);
      query += ` AND end_at >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      query += ` AND start_at <= $${params.length}`;
    }
    query += ' ORDER BY start_at ASC';

    const res = await pool.query(query, params);
    return res.rows.map(this.mapBlockedTime);
  }

  async addBlockedTime(employeeId: string, data: Omit<EmployeeBlockedTime, 'id' | 'employeeId'>): Promise<EmployeeBlockedTime> {
    const res = await pool.query(
      'INSERT INTO employee_blocked_times (employee_id, start_at, end_at, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [employeeId, data.startAt, data.endAt, data.reason]
    );
    return this.mapBlockedTime(res.rows[0]);
  }

  async removeBlockedTime(id: string): Promise<boolean> {
    const res = await pool.query('DELETE FROM employee_blocked_times WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  // ── Mappers ──────────────────────────────────────────────────

  private mapEmployee(row: any): Employee {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      email: row.email,
      isActive: row.is_active,
      maxConcurrentPets: row.max_concurrent_pets,
      createdAt: row.created_at,
    };
  }

  private mapSchedule(row: any): EmployeeSchedule {
    return {
      id: row.id,
      employeeId: row.employee_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
    };
  }

  private mapBlockedTime(row: any): EmployeeBlockedTime {
    return {
      id: row.id,
      employeeId: row.employee_id,
      startAt: row.start_at,
      endAt: row.end_at,
      reason: row.reason,
    };
  }
}
