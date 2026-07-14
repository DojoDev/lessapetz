"use client";

import { useState } from 'react';
import BookingDetailsModal from './BookingDetailsModal';

interface ScheduleCalendarProps {
  weekDays: Date[];
  today: Date;
  timeSlots: string[];
  upcomingBookings: any[];
}

export default function ScheduleCalendar({ weekDays, today, timeSlots, upcomingBookings }: ScheduleCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

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

                    return (
                      <div 
                        key={b.id} 
                        onClick={() => setSelectedBooking(b)}
                        className="absolute left-1 right-1 rounded-md bg-admin-accent-muted border-l-4 border-admin-accent p-1.5 shadow-sm overflow-hidden group hover:z-10 transition-all hover:shadow-md cursor-pointer hover:h-auto hover:min-h-[96px] flex flex-col justify-start"
                        style={{ top: `${startOffset}px`, height: `${height}px` }}
                      >
                        <div className="text-[11px] font-bold text-admin-accent truncate leading-tight mb-0.5">{b.serviceName}</div>
                        <div className="text-[10px] text-admin-text-primary truncate leading-tight font-medium">
                          {b.petName} <span className="opacity-50 mx-0.5">•</span> <span className="text-admin-text-secondary font-normal">{b.clientName.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div className="text-[10px] text-admin-text-secondary font-medium">{hour.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}</div>
                          <div className="text-[9px] uppercase font-bold tracking-wider text-admin-accent">
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
