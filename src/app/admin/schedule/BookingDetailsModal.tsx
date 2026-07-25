"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, UserCheck, Dog, CreditCard, Tag, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BookingStatusService } from '../../../domain/services/BookingStatusService';
import { BookingStatus } from '../../../domain/entities/Booking';

export default function BookingDetailsModal({ booking, onClose }: { booking: any, onClose: () => void }) {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [booking.id]);

  const handleAction = async (nextStatus: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setUpdating(false);
    }
  };
  
  const bDate = new Date(booking.startAt);
  const endDate = new Date(booking.endAt);
  
  const dateStr = bDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = `${bDate.getHours().toString().padStart(2, '0')}:${bDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

  const statusConfig = BookingStatusService.getStatusConfig(booking.status as BookingStatus);
  const primaryAction = BookingStatusService.getPrimaryAction(booking.status as BookingStatus);

  const getStatusBadge = () => {
    return (
      <span 
        className="px-2 py-1 text-xs font-semibold rounded-md uppercase tracking-wider"
        style={{ 
          backgroundColor: statusConfig.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : statusConfig.color === 'yellow' ? 'rgba(234, 179, 8, 0.2)' : statusConfig.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' : statusConfig.color === 'green' ? 'rgba(34, 197, 94, 0.2)' : statusConfig.color === 'red' ? 'rgba(239, 68, 68, 0.2)' : statusConfig.color === 'orange' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(100, 116, 139, 0.2)', 
          color: statusConfig.color === 'blue' ? '#60a5fa' : statusConfig.color === 'yellow' ? '#facc15' : statusConfig.color === 'purple' ? '#c084fc' : statusConfig.color === 'green' ? '#4ade80' : statusConfig.color === 'red' ? '#f87171' : statusConfig.color === 'orange' ? '#fb923c' : '#94a3b8' 
        }}
      >
        {statusConfig.label}
      </span>
    );
  };

  const getPaymentBadge = (method: string, status: string) => {
    if (status === 'covered_by_plan') return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-md uppercase tracking-wider">Plano</span>;
    if (status === 'paid') return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md uppercase tracking-wider">Pago</span>;
    return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-md uppercase tracking-wider">Pendente (\${method || 'A DEFINIR'})</span>;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-admin-bg rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-admin-border animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-admin-border flex justify-between items-center bg-admin-bg/50">
          <div>
            <h3 className="text-xl font-bold text-admin-text-primary">Detalhes do Agendamento</h3>
            <p className="text-sm text-admin-text-muted mt-0.5">Informações do serviço e cliente</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-admin-text-muted hover:text-admin-text-primary hover:bg-admin-border/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Status Header & Action */}
          <div className="flex gap-3 pb-4 border-b border-admin-border justify-between items-center">
            <div className="flex gap-3">
              {getStatusBadge()}
              {getPaymentBadge(booking.paymentMethod, booking.paymentStatus)}
            </div>
            {primaryAction && (
              <button 
                onClick={() => handleAction(primaryAction.nextStatus)}
                disabled={updating}
                className="px-3 py-1.5 bg-admin-accent hover:bg-admin-accent-hover text-white text-xs font-bold rounded-md shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {updating && <RefreshCcw className="w-3 h-3 animate-spin" />}
                {primaryAction.label}
              </button>
            )}
          </div>

          {/* Time Info */}
          <div className="flex items-start gap-4">
            <div className="bg-admin-accent-muted p-3 rounded-xl border border-admin-border">
              <Calendar className="text-admin-accent w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-admin-text-muted font-medium mb-1 capitalize">{dateStr}</p>
              <div className="flex items-center gap-1.5 text-lg font-semibold text-admin-text-primary">
                <Clock className="w-4 h-4 text-admin-text-secondary" />
                {timeStr}
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-admin-border/20 rounded-xl p-4 border border-admin-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Serviço
            </h4>
            <div className="flex justify-between items-center">
              <p className="text-base font-semibold text-admin-text-primary">{booking.serviceName}</p>
              <p className="text-lg font-bold text-admin-accent">R$ {Number(booking.totalPrice).toFixed(2)}</p>
            </div>
          </div>

          {/* Customer & Pet Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-admin-border/20 rounded-xl p-4 border border-admin-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-2 flex items-center gap-1.5">
                <Dog className="w-3.5 h-3.5" /> Pet
              </h4>
              <p className="text-sm font-semibold text-admin-text-primary">{booking.petName}</p>
            </div>
            <div className="bg-admin-border/20 rounded-xl p-4 border border-admin-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Cliente
              </h4>
              <p className="text-sm font-semibold text-admin-text-primary">{booking.clientName}</p>
            </div>
          </div>
          
          {booking.notes && (
            <div className="bg-admin-border/20 rounded-xl p-4 border border-admin-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-2">Observações</h4>
              <p className="text-sm text-admin-text-secondary">{booking.notes}</p>
            </div>
          )}

          {/* Status History Timeline */}
          <div className="bg-admin-border/20 rounded-xl p-4 border border-admin-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-admin-text-muted mb-4">Histórico de Status</h4>
            {loading ? (
              <p className="text-sm text-admin-text-muted">Carregando...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-admin-text-muted">Nenhum histórico encontrado.</p>
            ) : (
              <div className="space-y-4">
                {history.map((item, idx) => {
                  const hConf = BookingStatusService.getStatusConfig(item.newStatus as BookingStatus);
                  const hDate = new Date(item.createdAt);
                  
                  let elapsedStr = '';
                  if (idx === 0) {
                    const diffMins = Math.floor((Date.now() - hDate.getTime()) / 60000);
                    if (diffMins < 60) elapsedStr = `há ${diffMins} min`;
                    else elapsedStr = `há ${Math.floor(diffMins / 60)}h`;
                  }

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: hConf.color === 'blue' ? '#3b82f6' : hConf.color === 'yellow' ? '#eab308' : hConf.color === 'purple' ? '#a855f7' : hConf.color === 'green' ? '#22c55e' : hConf.color === 'red' ? '#ef4444' : hConf.color === 'orange' ? '#f97316' : '#64748b' }} 
                        />
                        {idx !== history.length - 1 && <div className="w-0.5 h-full bg-admin-border my-1"></div>}
                      </div>
                      <div className="pb-1">
                        <p className="text-sm font-semibold text-admin-text-primary flex items-center gap-2">
                          {hConf.label}
                          {idx === 0 && elapsedStr && (
                            <span className="text-xs font-normal text-admin-text-muted">· {elapsedStr}</span>
                          )}
                        </p>
                        <p className="text-xs text-admin-text-muted mt-0.5">
                          {hDate.toLocaleDateString('pt-BR')} às {hDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {item.notes && <p className="text-xs text-admin-text-secondary mt-1 bg-admin-bg p-1.5 rounded">{item.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-admin-border bg-admin-bg/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-sm font-medium text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-border/50 transition-colors"
          >
            Fechar
          </button>
          {/* <button 
            type="button" 
            onClick={() => router.push(\`/admin/bookings/\${booking.id}\`)}
            className="px-4 py-2 bg-admin-accent rounded-lg text-sm font-medium text-white hover:bg-admin-accent-hover transition-colors shadow-sm"
          >
            Ver Detalhes
          </button> */}
        </div>
      </div>
    </div>
  );
}
