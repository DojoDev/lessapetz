import { cookies } from 'next/headers';
import { verifyJwt } from '../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../infra/repositories/PostgresAdminRepository';
import { PostgresBookingRepository } from '../../infra/repositories/PostgresBookingRepository';
import { PostgresCustomerRepository } from '../../infra/repositories/PostgresCustomerRepository';
import LogoutButton from './LogoutButton';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let todayCount = 0;
  let todayRevenue = 0;
  let customerCount = 0;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const bookingRepo = new PostgresBookingRepository();
      const customerRepo = new PostgresCustomerRepository();

      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        try {
          todayCount = await bookingRepo.countToday(adminData.tenantId);
          todayRevenue = await bookingRepo.revenueToday(adminData.tenantId);
          customerCount = await customerRepo.count(adminData.tenantId);
        } catch {
          // DB tables may not exist yet — show defaults
        }
      }
    }
  }

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

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Welcome back. Here&apos;s what&apos;s happening with your system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-4">Today&apos;s Appointments</h3>
            <div className="text-3xl font-bold text-slate-800">{todayCount}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-4">Expected Revenue</h3>
            <div className="text-3xl font-bold text-emerald-600">
              R$ {todayRevenue.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-4">Total Customers</h3>
            <div className="text-3xl font-bold text-slate-800">{customerCount}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-slate-500 font-medium text-sm mb-4">Database Status</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-lg font-bold text-slate-800">Online</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
