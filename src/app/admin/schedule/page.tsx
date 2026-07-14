import { cookies } from 'next/headers';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresBookingRepository } from '../../../infra/repositories/PostgresBookingRepository';
import NewBookingButton from './NewBookingButton';
import ScheduleCalendar from './ScheduleCalendar';

export default async function AgendaPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let upcomingBookings: any[] = [];

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const bookingRepo = new PostgresBookingRepository();
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        upcomingBookings = await bookingRepo.findUpcomingWithDetails(adminData.tenantId, 50);
      }
    }
  }

  // Generate 7 days from today
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <>
      
      <main className="flex-1 w-full mx-auto p-6 md:p-8 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        <div className="mb-6 flex justify-between items-end shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-admin-text-primary">Agenda da Semana</h2>
            <p className="text-admin-text-muted mt-1">Acompanhe os agendamentos futuros.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-sm font-medium hover:bg-admin-border text-admin-text-primary">Hoje</button>
            <div className="flex bg-admin-border/50 p-1 rounded-lg">
              <button className="px-3 py-1 bg-admin-bg shadow-sm rounded-md text-sm font-medium text-admin-text-primary">Semana</button>
              <button className="px-3 py-1 text-admin-text-muted text-sm font-medium hover:text-admin-text-primary disabled:opacity-50" disabled>Mês</button>
            </div>
            <NewBookingButton />
          </div>
        </div>

        {/* Google Calendar-like Grid */}
        <ScheduleCalendar 
          weekDays={weekDays} 
          today={today} 
          timeSlots={timeSlots} 
          upcomingBookings={upcomingBookings} 
        />
      </main>
    </>
  );
}
