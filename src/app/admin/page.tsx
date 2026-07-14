import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DollarSign, CalendarDays, CreditCard } from 'lucide-react';
import { verifyJwt } from '../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../infra/repositories/PostgresAdminRepository';
import { PostgresBookingRepository } from '../../infra/repositories/PostgresBookingRepository';
import { PostgresCustomerPlanRepository } from '../../infra/repositories/PostgresCustomerPlanRepository';

import KpiCard from './components/dashboard/KpiCard';
import RevenueChart from './components/dashboard/RevenueChart';
import ActivityList from './components/dashboard/ActivityList';
import DataTable, { ColumnDef } from './components/dashboard/DataTable';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  if (!token) redirect('/login');

  const payload = await verifyJwt(token);
  if (!payload || !payload.sub || !payload.tenantId) redirect('/login');

  const adminRepo = new PostgresAdminRepository();
  const bookingRepo = new PostgresBookingRepository();
  const planRepo = new PostgresCustomerPlanRepository();

  const adminData = await adminRepo.findById(payload.sub);
  if (!adminData) redirect('/login');

  const tenantId = adminData.tenantId;

  // Real dates setup (Last 30 days)
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  // Fetch real data concurrently
  const [
    todayCount,
    totalRevenue,
    pendingPayments,
    revenueTrend,
    recentActivities,
    recentTransactions,
    planUsage
  ] = await Promise.all([
    bookingRepo.countToday(tenantId),
    bookingRepo.getTotalRevenue(tenantId, from, to),
    bookingRepo.getPendingPayments(tenantId, from, to),
    bookingRepo.getRevenueTrend(tenantId, 6), // Last 6 months
    bookingRepo.getRecentBookingsWithDetails(tenantId, 6),
    bookingRepo.getRecentTransactions(tenantId, 5),
    planRepo.getPlanUsageWithDetails(tenantId, 5)
  ]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Setup columns for DataTable (transactions)
  const transactionColumns: ColumnDef<any>[] = [
    { header: 'Cliente', accessorKey: 'client' },
    { header: 'Data', accessorKey: 'date' },
    { 
      header: 'Valor', 
      accessorKey: 'amount', 
      align: 'right',
      cell: (item) => <span className="font-medium text-white">{formatCurrency(item.amount)}</span> 
    },
    { 
      header: 'Status', 
      align: 'right',
      cell: (item) => (
        <span className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${
          item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
        }`}>
          {item.status === 'Paid' ? 'Pago' : 'Pendente'}
        </span>
      )
    },
  ];

  // Setup columns for DataTable (plan usage)
  const planColumns: ColumnDef<any>[] = [
    { header: 'Cliente', accessorKey: 'client' },
    { 
      header: 'Plano', 
      cell: (item) => <span className="text-teal-400 font-medium">{item.plan}</span>
    },
    { header: 'Uso', accessorKey: 'usesLeft', align: 'center' },
    { header: 'Renovação', accessorKey: 'renewalDate', align: 'right' },
  ];

  return (
    <>
      
      <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">Bem-vindo(a). Aqui está o resumo do sistema (Últimos 30 dias).</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard 
            title="Receita Total (30d)" 
            value={formatCurrency(totalRevenue)} 
            icon={DollarSign} 
            trend="12.5%" 
            trendUp={true} 
            accentColor="emerald"
          />
          <KpiCard 
            title="Agendamentos Hoje" 
            value={todayCount} 
            icon={CalendarDays} 
            accentColor="blue"
          />
          <KpiCard 
            title="Pagamentos Pendentes" 
            value={formatCurrency(pendingPayments)} 
            icon={CreditCard} 
            accentColor="teal"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueTrend} />
          </div>
          <div className="lg:col-span-1">
            <ActivityList activities={recentActivities} />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataTable 
            title="Transações Recentes" 
            subtitle="Últimos pagamentos registrados"
            columns={transactionColumns} 
            data={recentTransactions} 
          />
          <DataTable 
            title="Uso de Planos" 
            subtitle="Assinaturas próximas da renovação"
            columns={planColumns} 
            data={planUsage} 
          />
        </div>

      </main>
    </>
  );
}
