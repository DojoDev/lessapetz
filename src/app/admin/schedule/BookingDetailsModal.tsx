"use client";

import { X, Calendar, Clock, User, UserCheck, Dog, CreditCard, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookingDetailsModal({ booking, onClose }: { booking: any, onClose: () => void }) {
  const router = useRouter();
  
  const bDate = new Date(booking.startAt);
  const endDate = new Date(booking.endAt);
  
  const dateStr = bDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = `${bDate.getHours().toString().padStart(2, '0')}:${bDate.getMinutes().toString().padStart(2, '0')} - ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-md uppercase tracking-wider">Confirmado</span>;
      case 'completed': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md uppercase tracking-wider">Concluído</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-md uppercase tracking-wider">Cancelado</span>;
      default: return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-semibold rounded-md uppercase tracking-wider">{status}</span>;
    }
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
          
          {/* Status Header */}
          <div className="flex gap-3 pb-4 border-b border-admin-border">
            {getStatusBadge(booking.status)}
            {getPaymentBadge(booking.paymentMethod, booking.paymentStatus)}
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
