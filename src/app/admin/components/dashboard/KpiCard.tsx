import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accentColor?: 'teal' | 'emerald' | 'blue';
}

export default function KpiCard({ title, value, icon: Icon, trend, trendUp, accentColor = 'teal' }: KpiCardProps) {
  const colorMap = {
    teal: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      trendUp: 'text-teal-400',
      trendDown: 'text-red-400'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
      trendUp: 'text-emerald-500',
      trendDown: 'text-red-400'
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      trendUp: 'text-blue-400',
      trendDown: 'text-red-400'
    }
  };

  const colors = colorMap[accentColor];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm shadow-black/20 hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tabular-nums">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className={`font-medium ${trendUp ? colors.trendUp : colors.trendDown}`}>
                {trendUp ? '+' : '-'}{trend}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
