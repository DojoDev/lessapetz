import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import { PostgresServiceRepository } from '../../../../infra/repositories/PostgresServiceRepository';
import AdminHeader from '../../AdminHeader';
import ServiceForm from '../ServiceForm';

export default async function EditServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let service = null;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const serviceRepo = new PostgresServiceRepository();
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        service = await serviceRepo.findById(adminData.tenantId, id);
      }
    }
  }

  if (!service) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader email={adminData?.email} role={adminData?.role} activeTab="servicos" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Editar Serviço</h2>
          <p className="text-slate-500 mt-1">{service.name}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <ServiceForm service={service} isEditing />
        </div>
      </main>
    </div>
  );
}
