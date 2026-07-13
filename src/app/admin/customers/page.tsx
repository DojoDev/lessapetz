import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresCustomerRepository } from '../../../infra/repositories/PostgresCustomerRepository';
import AdminHeader from '../AdminHeader';

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
      <AdminHeader email={adminData?.email} role={adminData?.role} activeTab="customers" />

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
          {/* --- DESKTOP TABLE VIEW --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
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
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/customers/${c.id}`} className="inline-flex items-center justify-center text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]">
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- MOBILE CARDS VIEW --- */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100">
            {customers.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Nenhum cliente cadastrado.
              </div>
            ) : (
              customers.map((c) => (
                <div key={c.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-base leading-tight truncate">{c.fullName}</h3>
                      {c.cpf && <p className="text-xs text-slate-500 mt-1">CPF: {c.cpf}</p>}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.439-4.14-7.036-7.036l1.292-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      <span>{c.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      <span className="truncate">{c.email || 'Não informado'}</span>
                    </div>
                  </div>

                  <Link href={`/admin/customers/${c.id}`} className="mt-1 w-full flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg min-h-[44px] text-sm font-medium transition-colors">
                    Ver Detalhes
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
