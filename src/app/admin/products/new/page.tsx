import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '../../../../infra/auth/jwt';
import ProductForm from '../ProductForm';

export default async function NewProductPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    redirect('/login');
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
      <ProductForm />
    </main>
  );
}
