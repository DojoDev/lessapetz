import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../infra/repositories/PostgresAdminRepository';
import { PostgresProductRepository } from '../../../infra/repositories/PostgresProductRepository';
import Link from 'next/link';
import ProductTable from './ProductTable';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyJwt(token);
  if (!payload || !payload.sub) {
    redirect('/login');
  }

  const adminRepo = new PostgresAdminRepository();
  const adminData = await adminRepo.findById(payload.sub);
  
  if (!adminData) {
    redirect('/login');
  }

  const productRepo = new PostgresProductRepository();
  const products = await productRepo.findAll(adminData.tenantId);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-admin-text-primary">Inventário de Produtos</h2>
          <p className="text-admin-text-muted mt-1">
            Gerencie o estoque de produtos para venda e de uso interno.
          </p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent-hover text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
        >
          <Plus size={18} />
          Novo Produto
        </Link>
      </div>

      <ProductTable products={products} />
    </main>
  );
}
