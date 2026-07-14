import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import { PostgresCatalogPlanRepository } from '../../../../infra/repositories/PostgresCatalogPlanRepository';
import PlanForm from '../PlanForm';

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let plan = null;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const planRepo = new PostgresCatalogPlanRepository();
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        plan = await planRepo.findById(adminData.tenantId, id);
      }
    }
  }

  if (!plan) return notFound();

  return (
    <>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Editar Plano</h2>
          <p className="text-slate-400 mt-1">{plan.name}</p>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 md:p-8">
          <PlanForm plan={plan} isEditing />
        </div>
      </main>
    </>
  );
}
