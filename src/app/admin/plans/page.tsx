import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresCatalogPlanRepository } from '../../../infra/repositories/PostgresCatalogPlanRepository';
import PlanTable from './PlanTable';

export default async function PlanosPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let plans: any[] = [];

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const planRepo = new PostgresCatalogPlanRepository();
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        plans = await planRepo.findAll(adminData.tenantId);
      }
    }
  }

  return (
    <>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Planos</h2>
            <p className="text-slate-400 mt-1">Gerencie os planos mensais oferecidos.</p>
          </div>
          <Link
            href="/admin/plans/new"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
          >
            Novo Plano
          </Link>
        </div>

        <PlanTable plans={plans} />
      </main>
    </>
  );
}
