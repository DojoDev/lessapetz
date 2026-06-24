import { Employee } from '../entities/Employee';
import { EmployeeSchedule, EmployeeBlockedTime } from '../entities/EmployeeSchedule';

export interface EmployeeRepository {
  findById(tenantId: string, id: string): Promise<Employee | null>;
  findAll(tenantId: string): Promise<Employee[]>;
  findActive(tenantId: string): Promise<Employee[]>;
  findByService(tenantId: string, serviceId: string): Promise<Employee[]>;
  create(tenantId: string, data: Omit<Employee, 'id' | 'tenantId' | 'createdAt'>): Promise<Employee>;
  update(tenantId: string, id: string, data: Partial<Employee>): Promise<Employee | null>;
  delete(tenantId: string, id: string): Promise<boolean>;

  // Services assignment
  getAssignedServices(employeeId: string): Promise<string[]>;
  assignService(employeeId: string, serviceId: string): Promise<void>;
  unassignService(employeeId: string, serviceId: string): Promise<void>;

  // Schedule
  getSchedule(employeeId: string): Promise<EmployeeSchedule[]>;
  setSchedule(employeeId: string, schedules: Omit<EmployeeSchedule, 'id' | 'employeeId'>[]): Promise<void>;

  // Blocked Times
  getBlockedTimes(employeeId: string, from?: Date, to?: Date): Promise<EmployeeBlockedTime[]>;
  addBlockedTime(employeeId: string, data: Omit<EmployeeBlockedTime, 'id' | 'employeeId'>): Promise<EmployeeBlockedTime>;
  removeBlockedTime(id: string): Promise<boolean>;
}
