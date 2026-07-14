'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '../../../../i18n/I18nProvider';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { dict } = useI18n();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      {dict.sidebar.logout}
    </button>
  );
}
