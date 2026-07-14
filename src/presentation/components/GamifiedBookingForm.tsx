"use client";

import { useState } from "react";
import { PetService } from "@/domain/entities/PetService";
import { useRouter } from "next/navigation";

interface Props {
  services: any[];
}

export default function GamifiedBookingForm({ services }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [customer, setCustomer] = useState({ fullName: "", phone: "", email: "" });
  const [pet, setPet] = useState({ name: "", breed: "", sizeCategory: "small" });
  const [booking, setBooking] = useState({ serviceId: "", date: "", time: "", paymentMethod: "" });

  const totalSteps = 4;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create a dummy date from date + time strings
      const startAt = new Date(`${booking.date}T${booking.time}:00`);

      const payload = {
        customer,
        pet,
        booking: {
          serviceId: booking.serviceId,
          startAt: startAt.toISOString(),
          paymentMethod: booking.paymentMethod,
        },
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        alert("Erro ao agendar: " + data.error);
      }
    } catch (error) {
      alert("Erro de conexão ao tentar agendar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const serviceName = services.find(s => s.id === booking.serviceId)?.name || 'Serviço';
    const text = `Olá! Realizei um agendamento na Lessa Petz:%0A%0A*Cliente:* ${customer.fullName}%0A*Pet:* ${pet.name}%0A*Serviço:* ${serviceName}%0A*Data/Hora:* ${booking.date} às ${booking.time}%0A*Pagamento:* ${booking.paymentMethod}`;
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5519992938321";
    const phone = waNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    router.replace('/', { scroll: false });
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100 text-center max-w-lg w-full transform transition-all relative">
          <button 
            onClick={() => router.replace('/', { scroll: false })}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-4">Agendamento Confirmado!</h2>
          <p className="text-stone-500 mb-8 text-lg">
            Obrigado, {customer.fullName.split(' ')[0]}! O horário para {pet.name} foi reservado com sucesso.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleWhatsAppRedirect}
              className="w-full bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Enviar pelo WhatsApp
            </button>
            <button 
              onClick={() => router.replace('/', { scroll: false })}
              className="w-full text-stone-500 px-8 py-3 rounded-xl font-bold hover:bg-stone-100 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to generate dummy dates including today
  const today = new Date();
  const availableDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Base business hours
  const baseTimes = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

  const getAvailableTimesForDate = (dateStr: string) => {
    if (!dateStr) return [];
    
    const todayStr = today.toISOString().split('T')[0];
    
    // If it's today, filter out times that have already passed
    if (dateStr === todayStr) {
      const now = new Date();
      return baseTimes.filter(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      });
    }
    
    return baseTimes;
  };

  const availableTimes = getAvailableTimesForDate(booking.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl border border-stone-100 max-h-[90vh] flex flex-col relative">
        {/* Close Button */}
        <button 
          onClick={() => router.replace('/', { scroll: false })}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 shadow-sm transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Bar */}
        <div className="flex h-2 bg-stone-100 shrink-0">
          <div 
            className="bg-brand-gold transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1">
        <div className="mb-8">
          <span className="text-sm font-bold text-brand-gold-dark tracking-widest uppercase mb-2 block">
            Passo {step} de {totalSteps}
          </span>
          <h2 className="text-3xl font-bold text-brand-burgundy">
            {step === 1 && "Seus Dados"}
            {step === 2 && "Sobre o Pet"}
            {step === 3 && "O Serviço Ideal"}
            {step === 4 && "Data e Hora"}
          </h2>
          <p className="text-stone-500 mt-2">
            {step === 1 && "Precisamos conhecer você para confirmar o agendamento."}
            {step === 2 && "Conte-nos mais sobre o seu melhor amigo."}
            {step === 3 && "O que o seu pet está precisando hoje?"}
            {step === 4 && "Escolha o melhor momento para nos visitar."}
          </p>
        </div>

        <div className="space-y-6 min-h-[300px]">
          {/* STEP 1: CUSTOMER */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Celular / WhatsApp *</label>
                <input 
                  type="tel" 
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
                <input 
                  type="email" 
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Seu melhor e-mail"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PET */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome do Pet *</label>
                <input 
                  type="text" 
                  value={pet.name}
                  onChange={(e) => setPet({ ...pet, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Ex: Rex"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Raça</label>
                <input 
                  type="text" 
                  value={pet.breed}
                  onChange={(e) => setPet({ ...pet, breed: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                  placeholder="Ex: Poodle (ou SRD)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">Porte *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'small', label: 'Pequeno' },
                    { id: 'medium', label: 'Médio' },
                    { id: 'large', label: 'Grande' },
                    { id: 'giant', label: 'Gigante' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setPet({ ...pet, sizeCategory: s.id })}
                      className={`py-3 px-2 rounded-xl border font-medium transition-all ${
                        pet.sizeCategory === s.id 
                          ? 'border-brand-burgundy bg-brand-burgundy text-white' 
                          : 'border-stone-200 text-stone-600 hover:border-brand-gold'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SERVICE */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {services.map(svc => (
                <div 
                  key={svc.id}
                  onClick={() => setBooking({ ...booking, serviceId: svc.id })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    booking.serviceId === svc.id 
                      ? 'border-brand-burgundy bg-brand-cream/30' 
                      : 'border-stone-100 hover:border-brand-gold hover:shadow-md'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-lg text-stone-800">{svc.name}</h4>
                    <p className="text-stone-500 text-sm mt-1">{svc.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-4">
                    {booking.serviceId === svc.id && <div className="w-3 h-3 bg-brand-burgundy rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: DATE AND TIME */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wider">Escolha a Data</label>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
                  {availableDates.map(date => {
                    const dateObj = new Date(date);
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    const weekDay = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                    const isSelected = booking.date === date;
                    
                    return (
                      <button
                        key={date}
                        onClick={() => setBooking({ ...booking, date })}
                        className={`min-w-[80px] shrink-0 snap-start p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected 
                            ? 'bg-brand-burgundy text-white border-brand-burgundy shadow-lg' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-brand-gold'
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase opacity-80">{weekDay}</span>
                        <span className="text-2xl font-black">{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {booking.date && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wider">Escolha o Horário</label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setBooking({ ...booking, time })}
                        className={`py-3 rounded-xl border font-bold text-lg transition-all ${
                          booking.time === time 
                            ? 'bg-brand-burgundy text-white border-brand-burgundy shadow-md' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-brand-gold'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {booking.time && (
                    <div className="mt-8 animate-fade-in">
                      <label className="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wider">Forma de Pagamento</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(method => (
                          <button
                            key={method}
                            onClick={() => setBooking({ ...booking, paymentMethod: method })}
                            className={`py-3 px-2 rounded-xl border font-medium transition-all ${
                              booking.paymentMethod === method 
                                ? 'bg-brand-burgundy text-white border-brand-burgundy' 
                                : 'bg-white text-stone-600 border-stone-200 hover:border-brand-gold'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex gap-4 pt-6 border-t border-stone-100">
          {step > 1 && (
            <button 
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-6 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Voltar
            </button>
          )}
          
          {step < totalSteps ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && (!customer.fullName || !customer.phone)) ||
                (step === 2 && !pet.name) ||
                (step === 3 && !booking.serviceId)
              }
              className="flex-1 bg-brand-burgundy text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-burgundy-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-burgundy/20"
            >
              Continuar
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !booking.date || !booking.time || !booking.paymentMethod}
              className="flex-1 bg-brand-gold text-brand-burgundy px-8 py-4 rounded-xl font-black text-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-gold/30 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-brand-burgundy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirmando...
                </>
              ) : (
                "Finalizar Agendamento"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
