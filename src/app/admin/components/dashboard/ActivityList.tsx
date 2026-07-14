import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface RecentActivity {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

interface ActivityListProps {
  activities: RecentActivity[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge variant="accent">Confirmed</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Pending':
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <Card noPadding className="flex flex-col h-full">
      <CardHeader className="mb-2 border-b-0 bg-transparent">
        <div>
          <h3 className="text-lg font-bold text-admin-text-primary">Próximos Agendamentos</h3>
          <p className="text-admin-text-muted text-sm">Agenda de hoje</p>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0">
        <ul className="space-y-4">
          {activities.length === 0 ? (
            <li className="text-sm text-admin-text-muted text-center py-4">Nenhum agendamento recente.</li>
          ) : activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-admin-card-hover transition-colors border border-transparent hover:border-admin-border group cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-admin-bg border border-admin-border flex items-center justify-center font-bold text-admin-text-secondary text-sm">
                  {activity.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-admin-text-primary font-medium text-sm">{activity.clientName}</p>
                  <p className="text-admin-text-muted text-xs mt-0.5">{activity.service} • {activity.time}</p>
                </div>
              </div>
              <div>
                {getStatusBadge(activity.status)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
