'use client';

import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { useI18n } from '../../../../i18n/I18nProvider';

export interface RevenuePoint {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const { dict } = useI18n();
  const [view, setView] = useState<'Weekly' | 'Monthly'>('Monthly');

  // Format currency for Y-axis and Tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-admin-card border border-admin-border p-3 rounded-lg shadow-xl">
          <p className="text-admin-text-muted text-xs mb-1">{label}</p>
          <p className="text-admin-accent font-bold tabular-nums text-lg">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card noPadding className="flex flex-col h-full">
      <CardHeader className="mb-2 border-b-0 bg-transparent">
        <div>
          <h3 className="text-lg font-bold text-admin-text-primary">Desempenho da Receita</h3>
          <p className="text-admin-text-muted text-sm">Faturamento ao longo do tempo</p>
        </div>
        <div className="bg-admin-bg p-1 rounded-lg border border-admin-border flex text-sm">
          <button 
            onClick={() => setView('Weekly')}
            className={`px-3 py-1.5 rounded-md transition-colors ${view === 'Weekly' ? 'bg-admin-card-hover text-admin-text-primary shadow-sm' : 'text-admin-text-muted hover:text-admin-text-secondary'}`}
          >
            Semanal
          </button>
          <button 
            onClick={() => setView('Monthly')}
            className={`px-3 py-1.5 rounded-md transition-colors ${view === 'Monthly' ? 'bg-admin-card-hover text-admin-text-primary shadow-sm' : 'text-admin-text-muted hover:text-admin-text-secondary'}`}
          >
            Mensal
          </button>
        </div>
      </CardHeader>

      <div className="flex-1 min-h-[300px] w-full p-6 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-admin-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-admin-accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-admin-border)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-admin-text-muted)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-admin-text-muted)', fontSize: 12 }}
              tickFormatter={(val) => `R$${val/1000}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-admin-border-hover)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-admin-accent)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
