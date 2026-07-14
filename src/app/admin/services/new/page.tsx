import { cookies } from 'next/headers';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import ServiceForm from '../ServiceForm';

export default async function NovoServicoPage() {
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
    <>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Novo Serviço</h2>
          <p className="text-slate-400 mt-1">Preencha os dados do serviço para o catálogo.</p>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 md:p-8">
          <ServiceForm />
        </div>
      </main>
    </>
  );
}
