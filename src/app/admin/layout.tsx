import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Lessa Petz',
  description: 'Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
