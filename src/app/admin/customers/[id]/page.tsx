import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import { PostgresCustomerRepository } from '../../../../infra/repositories/PostgresCustomerRepository';
import { PostgresPetRepository } from '../../../../infra/repositories/PostgresPetRepository';
import { PostgresCustomerPlanRepository } from '../../../../infra/repositories/PostgresCustomerPlanRepository';
import LogoutButton from '../../LogoutButton';

// Note: In a real app we'd break this into smaller client components, 
// but we'll use a single server component for simplicity and add a client form later if needed.
import AddPetForm from './AddPetForm';
import AdminHeader from '../../AdminHeader';

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let adminData = null;
  let customer: any = null;
  let pets: any[] = [];
  let plans: any[] = [];
  
  const resolvedParams = await params;
  const customerId = resolvedParams.id;

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const customerRepo = new PostgresCustomerRepository();
      const petRepo = new PostgresPetRepository();
      const planRepo = new PostgresCustomerPlanRepository();
      
      adminData = await adminRepo.findById(payload.sub);

      if (adminData) {
        customer = await customerRepo.findById(adminData.tenantId, customerId);
        if (customer) {
          pets = await petRepo.findByCustomerId(adminData.tenantId, customerId);
          plans = await planRepo.findByCustomerId(adminData.tenantId, customerId);
        }
      }
    }
  }

  if (!customer) {
    return <div className="p-8">Cliente não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader email={adminData?.email} role={adminData?.role} activeTab="customers" />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/customers" className="text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Voltar
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{customer.fullName}</h2>
            <p className="text-slate-500 mt-1">Detalhes do cliente e seus pets.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">Dados do Cliente</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-slate-500 mb-1">CPF</span>
                  <span className="font-medium text-slate-900">{customer.cpf || 'Não informado'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Telefone</span>
                  <span className="font-medium text-slate-900">{customer.phone}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">E-mail</span>
                  <span className="font-medium text-slate-900">{customer.email || 'Não informado'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">Endereço</span>
                  <span className="font-medium text-slate-900">
                    {customer.street ? `${customer.street}, ${customer.number || 'S/N'} - ${customer.neighborhood} - ${customer.city} (${customer.zipCode})` : 'Não informado'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Active Plans Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">Planos Ativos</h3>
              {plans.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum plano ativo.</p>
              ) : (
                <ul className="space-y-3">
                  {plans.map(p => (
                    <li key={p.id} className="text-sm p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="font-bold text-indigo-900">{p.planName}</div>
                      <div className="text-indigo-700 mt-1">Validade: {new Date(p.validUntil).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Pets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">Pets Cadastrados</h3>
              
              {pets.length === 0 ? (
                <p className="text-slate-500 text-sm mb-6">Nenhum pet cadastrado para este cliente.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {pets.map(p => (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-4 flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {p.species === 'dog' ? '🐶' : p.species === 'cat' ? '🐱' : '🐾'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                        <div className="text-xs text-slate-500 mt-1 flex flex-col gap-1">
                          <span>Raça: {p.breed || 'Não inf.'}</span>
                          <span>Porte: {p.sizeCategory}</span>
                          <span>Peso: {p.weight ? `${p.weight}kg` : 'Não inf.'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Pet Form */}
              <div className="border-t pt-6">
                <h4 className="font-bold text-slate-800 mb-4">Adicionar Novo Pet</h4>
                <AddPetForm customerId={customer.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
