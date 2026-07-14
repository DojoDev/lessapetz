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
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400">Confirmed</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500">Completed</span>;
      case 'Pending':
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500">Pending</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Próximos Agendamentos</h3>
          <p className="text-slate-400 text-sm">Agenda de hoje</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        <ul className="space-y-4">
          {activities.length === 0 ? (
            <li className="text-sm text-slate-500 text-center py-4">Nenhum agendamento recente.</li>
          ) : activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800 group cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                  {activity.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{activity.clientName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{activity.service} • {activity.time}</p>
                </div>
              </div>
              <div>
                {getStatusBadge(activity.status)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
