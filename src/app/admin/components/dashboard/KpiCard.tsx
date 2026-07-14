import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

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
      bg: 'bg-admin-accent-muted',
      text: 'text-admin-accent',
      trendUp: 'text-admin-accent',
      trendDown: 'text-admin-danger'
    },
    emerald: {
      bg: 'bg-admin-success-bg',
      text: 'text-admin-success',
      trendUp: 'text-admin-success',
      trendDown: 'text-admin-danger'
    },
    blue: {
      bg: 'bg-admin-border/50',
      text: 'text-admin-text-primary',
      trendUp: 'text-admin-success',
      trendDown: 'text-admin-danger'
    }
  };

  const colors = colorMap[accentColor];

  return (
    <Card className="hover:border-admin-border-hover transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-admin-text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-admin-text-primary tabular-nums">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className={`font-medium ${trendUp ? colors.trendUp : colors.trendDown}`}>
                {trendUp ? '+' : '-'}{trend}
              </span>
              <span className="text-admin-text-muted">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
