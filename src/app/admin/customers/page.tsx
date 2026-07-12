import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresCustomerRepository } from '../../../infra/repositories/PostgresCustomerRepository';
import LogoutButton from '../LogoutButton';

export default async function CustomersPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let customers: any[] = [];

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const customerRepo = new PostgresCustomerRepository();
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        customers = await customerRepo.findAll(adminData.tenantId);
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

      <div className="bg-white border-b border-slate-200 px-6 flex gap-6 text-sm font-medium">
        <Link href="/admin" className="py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
          Visão Geral
        </Link>
        <Link href="/admin/agenda" className="py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
          Agenda
        </Link>
        <Link href="/admin/customers" className="py-3 border-b-2 border-indigo-600 text-indigo-600">
          Clientes
        </Link>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Clientes</h2>
            <p className="text-slate-500 mt-1">Gerencie os clientes e seus pets.</p>
          </div>
          <Link href="/admin/customers/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition-colors">
            Novo Cliente
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{c.fullName}</div>
                      {c.cpf && <div className="text-xs text-slate-500 mt-1">CPF: {c.cpf}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{c.phone || '-'}</div>
                      <div className="text-sm text-slate-500">{c.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/customers/${c.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
