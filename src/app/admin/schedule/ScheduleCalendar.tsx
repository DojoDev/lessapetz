"use client";

import { useState } from 'react';
import BookingDetailsModal from './BookingDetailsModal';
import { BookingStatusService } from '../../../domain/services/BookingStatusService';
import { BookingStatus } from '../../../domain/entities/Booking';

interface ScheduleCalendarProps {
  weekDays: Date[];
  today: Date;
  timeSlots: string[];
  upcomingBookings: any[];
}

export default function ScheduleCalendar({ weekDays, today, timeSlots, upcomingBookings }: ScheduleCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleFastAction = async (e: React.MouseEvent, bookingId: string, nextStatus: string) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex-1 bg-admin-bg rounded-xl shadow-sm border border-admin-border flex flex-col overflow-hidden">
      {/* Header row (Days) */}
      <div className="flex border-b border-admin-border bg-admin-bg/50">
        <div className="w-20 shrink-0 border-r border-admin-border"></div>
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((date, i) => (
            <div key={i} className="py-3 flex flex-col items-center justify-center border-r border-admin-border last:border-r-0">
              <span className="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">
                {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
              </span>
              <span className={`text-xl font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full ${
                date.getDate() === today.getDate() && date.getMonth() === today.getMonth() 
                  ? 'bg-admin-accent text-white' 
                  : 'text-admin-text-secondary'
              }`}>
                {date.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid body */}
      <div className="flex-1 overflow-y-auto flex custom-scrollbar relative">
        <div className="w-20 shrink-0 border-r border-admin-border relative">
          {timeSlots.map((time, i) => (
            <div key={i} className="h-24 relative border-b border-transparent">
              <span className="absolute -top-2.5 right-2 text-xs font-medium text-admin-text-muted">{time}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 relative">
          {/* Background grid lines */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border-r border-admin-border last:border-r-0 h-full relative">
                {timeSlots.map((_, j) => (
                  <div key={j} className="h-24 border-b border-admin-border/50"></div>
                ))}
              </div>
            ))}
          </div>

          {/* Bookings */}
          <div className="absolute inset-0 grid grid-cols-7">
            {weekDays.map((colDate, colIndex) => {
              const dayBookings = upcomingBookings.filter(b => {
                const bDate = new Date(b.startAt);
                return bDate.getDate() === colDate.getDate() && bDate.getMonth() === colDate.getMonth() && bDate.getFullYear() === colDate.getFullYear();
              });

              return (
                <div key={colIndex} className="relative h-full">
                  {dayBookings.map(b => {
                    const bDate = new Date(b.startAt);
                    const hour = bDate.getHours();
                    const min = bDate.getMinutes();
                    
                    // Calculate position: 09:00 is index 0. So hour - 9
                    const startOffset = (hour - 9) * 96 + (min / 60) * 96; // 96px is h-24
                    const height = (b.durationMin / 60) * 96;
                    
                    // hide if outside business hours for simplicity
                    if (startOffset < 0) return null;

                    const statusConfig = BookingStatusService.getStatusConfig(b.status as BookingStatus);
                    const primaryAction = BookingStatusService.getPrimaryAction(b.status as BookingStatus);
                    const isCardUpdating = isUpdating === b.id;

                    return (
                      <div 
                        key={b.id} 
                        onClick={() => setSelectedBooking(b)}
                        className="absolute left-1 right-1 rounded-md bg-admin-accent-muted border-l-4 border-admin-accent p-1.5 shadow-sm overflow-hidden group hover:z-10 transition-all hover:shadow-md cursor-pointer hover:h-auto hover:min-h-[96px] flex flex-col justify-start"
                        style={{ top: `${startOffset}px`, height: `${height}px`, borderColor: statusConfig.color === 'blue' ? '#3b82f6' : statusConfig.color === 'yellow' ? '#eab308' : statusConfig.color === 'purple' ? '#a855f7' : statusConfig.color === 'green' ? '#22c55e' : statusConfig.color === 'red' ? '#ef4444' : statusConfig.color === 'orange' ? '#f97316' : '#64748b' }}
                      >
                        <div className="flex justify-between items-start mb-0.5 gap-1">
                          <div className="text-[11px] font-bold text-admin-accent truncate leading-tight" style={{ color: statusConfig.color === 'blue' ? '#3b82f6' : statusConfig.color === 'yellow' ? '#eab308' : statusConfig.color === 'purple' ? '#a855f7' : statusConfig.color === 'green' ? '#22c55e' : statusConfig.color === 'red' ? '#ef4444' : statusConfig.color === 'orange' ? '#f97316' : '#64748b' }}>
                            {b.serviceName}
                          </div>
                          <span 
                            className="px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0"
                            style={{ 
                              backgroundColor: statusConfig.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : statusConfig.color === 'yellow' ? 'rgba(234, 179, 8, 0.2)' : statusConfig.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' : statusConfig.color === 'green' ? 'rgba(34, 197, 94, 0.2)' : statusConfig.color === 'red' ? 'rgba(239, 68, 68, 0.2)' : statusConfig.color === 'orange' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(100, 116, 139, 0.2)', 
                              color: statusConfig.color === 'blue' ? '#60a5fa' : statusConfig.color === 'yellow' ? '#facc15' : statusConfig.color === 'purple' ? '#c084fc' : statusConfig.color === 'green' ? '#4ade80' : statusConfig.color === 'red' ? '#f87171' : statusConfig.color === 'orange' ? '#fb923c' : '#94a3b8' 
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-admin-text-primary truncate leading-tight font-medium mb-1">
                          {b.petName} <span className="opacity-50 mx-0.5">•</span> <span className="text-admin-text-secondary font-normal">{b.clientName.split(' ')[0]}</span>
                        </div>
                        
                        {primaryAction && (
                          <button 
                            onClick={(e) => handleFastAction(e, b.id, primaryAction.nextStatus)}
                            disabled={isCardUpdating}
                            className="mt-1 mb-2 hidden group-hover:flex w-full py-1 bg-admin-bg/80 hover:bg-admin-bg border border-admin-border rounded items-center justify-center text-[10px] font-medium text-admin-text-primary transition-colors disabled:opacity-50"
                          >
                            {isCardUpdating ? 'Atualizando...' : primaryAction.label}
                          </button>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div className="text-[10px] text-admin-text-secondary font-medium">{hour.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}</div>
                          <div className="text-[9px] uppercase font-bold tracking-wider text-admin-text-muted">
                            {b.paymentStatus === 'covered_by_plan' ? 'PLANO' : b.paymentStatus === 'paid' ? 'PAGO' : (b.paymentMethod || 'A PAGAR')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
}
