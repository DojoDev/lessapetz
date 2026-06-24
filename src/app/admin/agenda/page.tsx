import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresBookingRepository } from '../../../infra/repositories/PostgresBookingRepository';
import LogoutButton from '../LogoutButton';

// Utility para formatação de datas
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda-feira
  return new Date(d.setDate(diff));
};

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
        upcomingBookings = await bookingRepo.findUpcoming(adminData.tenantId, 50);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            L
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Admin</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 flex flex-col items-end">
            <span className="font-medium text-slate-700">{adminData?.email}</span>
            <span className="text-xs">{adminData?.role === 'root' ? 'Root Administrator' : 'Administrator'}</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-6 flex gap-6 text-sm font-medium sticky top-[73px] z-10">
        <Link href="/admin" className="py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
          Visão Geral
        </Link>
        <Link href="/admin/agenda" className="py-3 border-b-2 border-indigo-600 text-indigo-600">
          Agenda
        </Link>
      </div>

      <main className="flex-1 w-full mx-auto p-6 md:p-8 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        <div className="mb-6 flex justify-between items-end shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Agenda da Semana</h2>
            <p className="text-slate-500 mt-1">Acompanhe os agendamentos futuros.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Hoje</button>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-3 py-1 bg-white shadow-sm rounded-md text-sm font-medium">Semana</button>
              <button className="px-3 py-1 text-slate-500 text-sm font-medium hover:text-slate-700 disabled:opacity-50" disabled>Mês</button>
            </div>
          </div>
        </div>

        {/* Google Calendar-like Grid */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Header row (Days) */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <div className="w-20 shrink-0 border-r border-slate-200"></div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((date, i) => (
                <div key={i} className="py-3 flex flex-col items-center justify-center border-r border-slate-200 last:border-r-0">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span className={`text-xl font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full ${
                    date.getDate() === today.getDate() && date.getMonth() === today.getMonth() 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-700'
                  }`}>
                    {date.getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid body */}
          <div className="flex-1 overflow-y-auto flex custom-scrollbar relative">
            <div className="w-20 shrink-0 border-r border-slate-200 relative">
              {timeSlots.map((time, i) => (
                <div key={i} className="h-24 relative border-b border-transparent">
                  <span className="absolute -top-2.5 right-2 text-xs font-medium text-slate-400">{time}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-7 relative">
              {/* Background grid lines */}
              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="border-r border-slate-200 last:border-r-0 h-full relative">
                    {timeSlots.map((_, j) => (
                      <div key={j} className="h-24 border-b border-slate-100"></div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Bookings */}
              <div className="absolute inset-0 grid grid-cols-7">
                {weekDays.map((colDate, colIndex) => {
                  const dayBookings = upcomingBookings.filter(b => {
                    const bDate = new Date(b.startAt);
                    return bDate.getDate() === colDate.getDate() && bDate.getMonth() === colDate.getMonth() && bDate.getFullYear() === colDate.getFullYear();
                  });

                  return (
                    <div key={colIndex} className="relative h-full">
                      {dayBookings.map(b => {
                        const bDate = new Date(b.startAt);
                        const hour = bDate.getHours();
                        const min = bDate.getMinutes();
                        
                        // Calculate position: 09:00 is index 0. So hour - 9
                        const startOffset = (hour - 9) * 96 + (min / 60) * 96; // 96px is h-24
                        const height = (b.durationMin / 60) * 96;
                        
                        // hide if outside business hours for simplicity
                        if (startOffset < 0) return null;

                        return (
                          <div 
                            key={b.id} 
                            className="absolute left-1 right-1 rounded-md bg-indigo-100 border-l-4 border-indigo-600 p-2 shadow-sm overflow-hidden group hover:z-10 transition-all hover:shadow-md cursor-pointer hover:h-auto hover:min-h-[96px]"
                            style={{ top: `${startOffset}px`, height: `${height}px` }}
                          >
                            <div className="text-xs font-bold text-indigo-900 truncate">Svc ID: {b.serviceId.substring(0,6)}...</div>
                            <div className="text-xs text-indigo-700 font-medium opacity-90">{hour.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}</div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 mt-1">{b.paymentMethod || 'A Pagar'}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
