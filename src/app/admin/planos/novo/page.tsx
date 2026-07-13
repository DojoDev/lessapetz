import { cookies } from 'next/headers';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import AdminHeader from '../../AdminHeader';
import PlanForm from '../PlanForm';

export default async function NovoPlanPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      adminData = await adminRepo.findById(payload.sub);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader email={adminData?.email} role={adminData?.role} activeTab="planos" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Novo Plano</h2>
          <p className="text-slate-500 mt-1">Configure um novo plano mensal.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <PlanForm />
        </div>
      </main>
    </div>
  );
}
