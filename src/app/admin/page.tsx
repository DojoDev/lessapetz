import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DollarSign, CalendarDays, CreditCard } from 'lucide-react';
import { verifyJwt } from '../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../infra/repositories/PostgresAdminRepository';
import { PostgresBookingRepository } from '../../infra/repositories/PostgresBookingRepository';
import { PostgresCustomerPlanRepository } from '../../infra/repositories/PostgresCustomerPlanRepository';
import { PostgresProductRepository } from '../../infra/repositories/PostgresProductRepository';

import KpiCard from './components/dashboard/KpiCard';
import RevenueChart from './components/dashboard/RevenueChart';
import ActivityList from './components/dashboard/ActivityList';
import DataTable, { ColumnDef } from './components/dashboard/DataTable';
import { Badge } from './components/ui/Badge';

import { getDictionary, Locale } from '../../i18n';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'pt';
  const dict = getDictionary(locale);

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

  const productRepo = new PostgresProductRepository();

  // Fetch real data concurrently
  const [
    todayCount,
    totalRevenue,
    pendingPayments,
    revenueTrend,
    recentActivities,
    recentTransactions,
    planUsage,
    lowStockProducts,
    scheduledCount,
    inProgressCount,
    readyCount,
    completedCount,
    cancelledCount,
    noShowCount
  ] = await Promise.all([
    bookingRepo.countToday(tenantId),
    bookingRepo.getTotalRevenue(tenantId, from, to),
    bookingRepo.getPendingPayments(tenantId, from, to),
    bookingRepo.getRevenueTrend(tenantId, 6), // Last 6 months
    bookingRepo.getRecentBookingsWithDetails(tenantId, 6),
    bookingRepo.getRecentTransactions(tenantId, 5),
    planRepo.getPlanUsageWithDetails(tenantId, 5),
    productRepo.getLowStockProducts(tenantId),
    bookingRepo.countByStatusToday(tenantId, 'SCHEDULED'),
    bookingRepo.countByStatusToday(tenantId, 'IN_PROGRESS'),
    bookingRepo.countByStatusToday(tenantId, 'READY_FOR_PICKUP'),
    bookingRepo.countByStatusToday(tenantId, 'COMPLETED'),
    bookingRepo.countByStatusToday(tenantId, 'CANCELLED'),
    bookingRepo.countByStatusToday(tenantId, 'NO_SHOW')
  ]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Setup columns for DataTable (transactions)
  const transactionColumns: ColumnDef<any>[] = [
    { header: dict.dashboard.client, accessorKey: 'client' },
    { header: dict.dashboard.date, accessorKey: 'date' },
    { 
      header: dict.dashboard.value, 
      accessorKey: 'amount', 
      align: 'right',
      cell: (item) => <span className="font-medium text-admin-text-primary">{formatCurrency(item.amount)}</span> 
    },
    { 
      header: dict.dashboard.status, 
      align: 'right',
      cell: (item) => (
        <Badge variant={item.status === 'Paid' ? 'success' : 'warning'}>
          {item.status === 'Paid' ? dict.dashboard.statusPaid : dict.dashboard.statusPending}
        </Badge>
      )
    },
  ];

  // Setup columns for DataTable (plan usage)
  const planColumns: ColumnDef<any>[] = [
    { header: dict.dashboard.client, accessorKey: 'client' },
    { 
      header: dict.dashboard.plan, 
      cell: (item) => <span className="text-teal-400 font-medium">{item.plan}</span>
    },
    { header: dict.dashboard.usage, accessorKey: 'usesLeft', align: 'center' },
    { header: dict.dashboard.renewal, accessorKey: 'renewalDate', align: 'right' },
  ];

  // Setup columns for DataTable (low stock)
  const lowStockColumns: ColumnDef<any>[] = [
    { header: dict.dashboard.product, accessorKey: 'name' },
    { 
      header: dict.dashboard.currentMin, 
      align: 'right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          <span className="text-red-400 font-bold">{item.currentStock}</span>
          <span className="text-slate-500 text-xs">/ {item.minStockThreshold} {item.unitOfMeasure}</span>
        </div>
      )
    },
  ];

  return (
    <>
      
      <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-white">{dict.dashboard.title}</h2>
          <p className="text-slate-400 mt-1">{dict.dashboard.subtitle}</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard 
            title={dict.dashboard.revenue} 
            value={formatCurrency(totalRevenue)} 
            icon={DollarSign} 
            trend="12.5%" 
            trendUp={true} 
            accentColor="emerald"
          />
          <KpiCard 
            title={dict.dashboard.appointmentsToday} 
            value={todayCount} 
            icon={CalendarDays} 
            accentColor="blue"
          />
          <KpiCard 
            title={dict.dashboard.pendingPayments} 
            value={formatCurrency(pendingPayments)} 
            icon={CreditCard} 
            accentColor="teal"
          />
        </div>

        {/* Operational Flow */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-center">
            <h4 className="text-xs font-bold text-admin-text-muted uppercase mb-1">Aguardando</h4>
            <p className="text-2xl font-bold text-blue-400">{scheduledCount}</p>
          </div>
          <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-center">
            <h4 className="text-xs font-bold text-admin-text-muted uppercase mb-1">Em Atendimento</h4>
            <p className="text-2xl font-bold text-purple-400">{inProgressCount}</p>
          </div>
          <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-center">
            <h4 className="text-xs font-bold text-admin-text-muted uppercase mb-1">Retirada</h4>
            <p className="text-2xl font-bold text-green-400">{readyCount}</p>
          </div>
          <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-center">
            <h4 className="text-xs font-bold text-admin-text-muted uppercase mb-1">Finalizados</h4>
            <p className="text-2xl font-bold text-slate-300">{completedCount}</p>
          </div>
          <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-center">
            <h4 className="text-xs font-bold text-admin-text-muted uppercase mb-1">Cancelados</h4>
            <p className="text-2xl font-bold text-red-400">{cancelledCount}</p>
          </div>
          <div className="bg-admin-bg p-4 rounded-xl border border-admin-border text-center">
            <h4 className="text-xs font-bold text-admin-text-muted uppercase mb-1">Faltas</h4>
            <p className="text-2xl font-bold text-orange-400">{noShowCount}</p>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DataTable 
              title={dict.dashboard.lowStock} 
              subtitle={dict.dashboard.lowStockDesc}
              columns={lowStockColumns} 
              data={lowStockProducts} 
            />
          </div>
          <div className="lg:col-span-1">
            <DataTable 
              title={dict.dashboard.planUsage} 
              subtitle={dict.dashboard.planUsageDesc}
              columns={planColumns} 
              data={planUsage} 
            />
          </div>
          <div className="lg:col-span-1">
            <DataTable 
              title={dict.dashboard.recentTransactions} 
              subtitle={dict.dashboard.recentTransactionsDesc}
              columns={transactionColumns} 
              data={recentTransactions} 
            />
          </div>
        </div>

      </main>
    </>
  );
}
