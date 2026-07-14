"use client";

import { useEffect, useState } from 'react';
import AdminHeader from '../AdminHeader';

interface AlertData {
  id: string;
  client_name: string;
  plan_name: string;
  uses_consumed: number;
  total_quota: number;
  cycle_start_date: string;
  cycle_end_date: string;
  customer_id: string;
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/subscriptions/alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const notifyClient = async (alert: AlertData) => {
    setNotifyingId(alert.id);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: alert.customer_id,
          subscriptionId: alert.id,
          type: 'package_ending',
          messagePayload: {
            clientName: alert.client_name,
            planName: alert.plan_name,
            usesLeft: alert.total_quota - alert.uses_consumed,
            expirationDate: alert.cycle_end_date,
          }
        }),
      });

      if (res.ok) {
        window.alert('Notificação enfileirada com sucesso (n8n assumirá).');
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      } else {
        const error = await res.json();
        window.alert('Erro ao enfileirar notificação: ' + error.error);
      }
    } catch (err) {
      window.alert('Erro de conexão ao tentar notificar.');
    } finally {
      setNotifyingId(null);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader activeTab="planos" />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Planos Próximos do Vencimento</h1>
          <p className="text-slate-500 mt-1">
            Clientes que já passaram de 75% do tempo do ciclo mas ainda possuem serviços não utilizados.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Carregando...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            Nenhum alerta no momento. Todos os planos ativos estão em dia ou com a cota consumida.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-200">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{alert.client_name}</h3>
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium text-slate-800">{alert.plan_name}</span> • 
                    <span className="ml-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                      Vence em {getDaysRemaining(alert.cycle_end_date)} dias
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    Uso: <span className="font-medium text-slate-700">{alert.uses_consumed} de {alert.total_quota}</span> consumidos 
                    ({alert.total_quota - alert.uses_consumed} restantes)
                  </div>
                </div>
                
                <button
                  onClick={() => notifyClient(alert)}
                  disabled={notifyingId === alert.id}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {notifyingId === alert.id ? 'Aguarde...' : 'Notificar Cliente'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
