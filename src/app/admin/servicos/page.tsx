import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresServiceRepository } from '../../../infra/repositories/PostgresServiceRepository';
import AdminHeader from '../AdminHeader';
import ServiceTable from './ServiceTable';
import CategoryManager from './CategoryManager';

export default async function ServicosPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let services: any[] = [];
  let categories: any[] = [];

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const serviceRepo = new PostgresServiceRepository();
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        const [svcList, catList] = await Promise.all([
          serviceRepo.findAll(adminData.tenantId),
          serviceRepo.findAllCategories(adminData.tenantId),
        ]);

        const categoryMap = new Map(catList.map(c => [c.id, c.name]));
        services = svcList.map(s => ({
          ...s,
          categoryName: s.categoryId ? categoryMap.get(s.categoryId) ?? null : null,
        }));
        categories = catList;
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader email={adminData?.email} role={adminData?.role} activeTab="servicos" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Serviços</h2>
            <p className="text-slate-500 mt-1">Gerencie os serviços do catálogo público.</p>
          </div>
          <div className="flex gap-2">
            <CategoryManager categories={categories} />
            <Link
              href="/admin/servicos/novo"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
            >
              Novo Serviço
            </Link>
          </div>
        </div>

        <ServiceTable services={services} />
      </main>
    </div>
  );
}
