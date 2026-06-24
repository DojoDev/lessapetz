export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface EmployeeBlockedTime {
  id: string;
  employeeId: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
}
