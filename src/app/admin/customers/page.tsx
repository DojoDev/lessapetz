import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresCustomerRepository } from '../../../infra/repositories/PostgresCustomerRepository';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';

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
    <>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-admin-text-primary">Clientes</h2>
            <p className="text-admin-text-muted mt-1">Gerencie os clientes e seus pets.</p>
          </div>
          <Link href="/admin/customers/new" className="px-4 py-2 bg-admin-accent hover:bg-admin-accent-hover text-white font-medium rounded-lg shadow-sm transition-colors">
            Novo Cliente
          </Link>
        </div>

        <Card noPadding>
          {/* --- DESKTOP TABLE VIEW --- */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead align="right">Ações</TableHead>
                </tr>
              </TableHeader>
              <tbody className="divide-y divide-admin-border/50">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6">
                      <EmptyState title="Nenhum cliente cadastrado" />
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium text-admin-text-primary">{c.fullName}</div>
                        {c.cpf && <div className="text-xs text-admin-text-muted mt-1">CPF: {c.cpf}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-admin-text-secondary">{c.phone || '-'}</div>
                        <div className="text-sm text-admin-text-muted">{c.email || '-'}</div>
                      </TableCell>
                      <TableCell align="right">
                        <Link href={`/admin/customers/${c.id}`} className="inline-flex items-center justify-center text-admin-accent hover:text-admin-accent-hover bg-admin-accent-muted px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]">
                          Detalhes
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* --- MOBILE CARDS VIEW --- */}
          <div className="md:hidden flex flex-col divide-y divide-admin-border/50">
            {customers.length === 0 ? (
              <div className="p-4">
                <EmptyState title="Nenhum cliente cadastrado" />
              </div>
            ) : (
              customers.map((c) => (
                <div key={c.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-admin-text-primary text-base leading-tight truncate">{c.fullName}</h3>
                      {c.cpf && <p className="text-xs text-admin-text-muted mt-1">CPF: {c.cpf}</p>}
                    </div>
                  </div>
                  
                  <div className="bg-admin-bg/50 rounded-lg p-3 flex flex-col gap-1.5 border border-admin-border">
                    <div className="flex items-center gap-2 text-sm text-admin-text-secondary">
                      <svg className="w-4 h-4 text-admin-text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.439-4.14-7.036-7.036l1.292-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      <span>{c.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-admin-text-secondary">
                      <svg className="w-4 h-4 text-admin-text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      <span className="truncate">{c.email || 'Não informado'}</span>
                    </div>
                  </div>

                  <Link href={`/admin/customers/${c.id}`} className="mt-1 w-full flex items-center justify-center text-admin-accent bg-admin-accent-muted hover:opacity-80 rounded-lg min-h-[44px] text-sm font-medium transition-colors">
                    Ver Detalhes
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </>
  );
}
