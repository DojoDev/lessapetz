"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBookingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    // Fetch customers and services
    Promise.all([
      fetch('/api/admin/customers').then(r => r.json()),
      fetch('/api/admin/services').then(r => r.json())
    ]).then(([custData, servData]) => {
      setCustomers(Array.isArray(custData) ? custData : []);
      setServices(Array.isArray(servData) ? servData : []);
    }).catch(err => {
      console.error(err);
      setError('Erro ao carregar dados');
    });
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedPet = selectedCustomer?.pets?.find((p: any) => p.id === selectedPetId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const activePlans = selectedCustomer?.plans?.filter((p: any) => p.petId === selectedPetId && p.status === 'active' && p.usesConsumed < p.totalQuota && new Date(p.cycleEndDate) >= new Date()) || [];
  const hasActivePlan = activePlans.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedService) throw new Error('Selecione um serviço');

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          petId: selectedPetId,
          serviceId: selectedServiceId,
          startAt: new Date(startAt).toISOString(),
          durationMin: selectedService.durationMin,
          totalPrice: selectedService.price,
          paymentMethod: paymentMethod || null,
          usePlan: hasActivePlan, // Send flag if we want to use the plan
          customerPlanId: hasActivePlan ? activePlans[0].id : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao agendar');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Novo Agendamento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
              <select 
                required
                value={selectedCustomerId} 
                onChange={e => { setSelectedCustomerId(e.target.value); setSelectedPetId(''); }}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="">Selecione um cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} - {c.phone || c.email}</option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pet *</label>
                <select 
                  required
                  value={selectedPetId} 
                  onChange={e => setSelectedPetId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Selecione o pet...</option>
                  {selectedCustomer.pets?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </select>
                {selectedCustomer.pets?.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Este cliente não possui pets cadastrados.</p>
                )}
              </div>
            )}

            {selectedPetId && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Status do Pet</h4>
                {hasActivePlan ? (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100">
                    <span>✅ Plano Ativo: {activePlans[0].planName} ({activePlans[0].totalQuota - activePlans[0].usesConsumed} usos restantes)</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    Pagamento avulso / à la carte
                  </div>
                )}
              </div>
            )}

            {selectedPetId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serviço *</label>
                  <select 
                    required
                    value={selectedServiceId} 
                    onChange={e => setSelectedServiceId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data e Hora *</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={startAt} 
                    onChange={e => setStartAt(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  />
                </div>

                {!hasActivePlan && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento *</label>
                    <select 
                      required
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="pix">PIX</option>
                      <option value="credit">Cartão de Crédito</option>
                      <option value="debit">Cartão de Débito</option>
                      <option value="money">Dinheiro</option>
                    </select>
                  </div>
                )}
                
                {hasActivePlan && selectedService && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200 flex justify-between">
                    <span>Serviço coberto pelo plano</span>
                    <span>R$ 0,00</span>
                  </div>
                )}
                {!hasActivePlan && selectedService && (
                  <div className="p-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 flex justify-between">
                    <span>Valor a cobrar</span>
                    <span>R$ {selectedService.price}</span>
                  </div>
                )}
              </>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="booking-form"
            disabled={loading || !selectedPetId || !selectedServiceId || !startAt}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
