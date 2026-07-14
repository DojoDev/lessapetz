import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { verifyJwt } from '../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../infra/repositories/PostgresAdminRepository';
import { getDictionary, Locale } from '../../i18n';
import { I18nProvider } from '../../i18n/I18nProvider';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';

export const metadata: Metadata = {
  title: 'Admin - VetFlow',
  description: 'Área administrativa',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'pt';
  const dict = getDictionary(locale);

  let email = '';
  let role = '';

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const adminData = await adminRepo.findById(payload.sub);
      if (adminData) {
        email = adminData.email;
        role = adminData.role;
      }
    }
  }

  return (
    <I18nProvider dict={dict} locale={locale}>
      <div className="admin-theme min-h-screen bg-admin-bg text-admin-text-primary selection:bg-admin-accent-muted selection:text-admin-accent">
        <Sidebar />
        <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
          <TopHeader email={email} role={role} />
          {children}
        </div>
      </div>
    </I18nProvider>
  );
}
