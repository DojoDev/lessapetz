import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import { PostgresProductRepository } from '../../../../infra/repositories/PostgresProductRepository';
import ProductForm from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const product = await productRepo.findById(adminData.tenantId, id);

  if (!product) {
    return (
      <div className="p-8 text-center text-slate-400">
        Produto não encontrado.
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
      <ProductForm initialData={product} />
    </main>
  );
}
