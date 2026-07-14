"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBookingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [catalogPlans, setCatalogPlans] = useState<any[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    // Fetch customers, services and catalog plans
    Promise.all([
      fetch('/api/admin/customers').then(r => r.json()),
      fetch('/api/admin/services').then(r => r.json()),
      fetch('/api/admin/plans').then(r => r.json())
    ]).then(([custData, servData, planData]) => {
      setCustomers(Array.isArray(custData) ? custData : []);
      setServices(Array.isArray(servData) ? servData : []);
      setCatalogPlans(Array.isArray(planData) ? planData : []);
    }).catch(err => {
      console.error(err);
      setError('Erro ao carregar dados');
    });
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedPet = selectedCustomer?.pets?.find((p: any) => p.id === selectedPetId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  
  // Find valid active plans for the selected pet
  const activePlans = selectedCustomer?.plans?.filter((p: any) => p.petId === selectedPetId && p.status === 'active' && p.usesConsumed < p.totalQuota && new Date(p.cycleEndDate) >= new Date()) || [];
  
  // Find which of these active plans actually cover the selected service
  const plansCoveringService = activePlans.filter((activePlan: any) => {
    const catalogPlan = catalogPlans.find((cp: any) => cp.id === activePlan.catalogPlanId);
    return catalogPlan?.includedServiceIds?.includes(selectedServiceId);
  });
  
  const hasActivePlanForService = plansCoveringService.length > 0;

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
          usePlan: hasActivePlanForService, // Send flag if we want to use the plan
          customerPlanId: hasActivePlanForService ? plansCoveringService[0].id : null,
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
      <div className="bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">Novo Agendamento</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cliente *</label>
              <select 
                required
                value={selectedCustomerId} 
                onChange={e => { setSelectedCustomerId(e.target.value); setSelectedPetId(''); }}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-900"
              >
                <option value="">Selecione um cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} - {c.phone || c.email}</option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pet *</label>
                <select 
                  required
                  value={selectedPetId} 
                  onChange={e => setSelectedPetId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-900"
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
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h4 className="text-sm font-medium text-white mb-2">Status do Pet</h4>
                {activePlans.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {activePlans.map((ap: any) => (
                      <div key={ap.id} className="flex items-center gap-2 text-admin-accent text-sm font-medium bg-admin-accent-muted px-3 py-2 rounded-md border border-admin-border">
                        <span>✅ Plano Ativo: {ap.planName} ({ap.totalQuota - ap.usesConsumed} usos restantes)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-300">
                    Pagamento avulso / à la carte
                  </div>
                )}
              </div>
            )}

            {selectedPetId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Serviço *</label>
                  <select 
                    required
                    value={selectedServiceId} 
                    onChange={e => setSelectedServiceId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-900"
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Data e Hora *</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={startAt} 
                    onChange={e => setStartAt(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-900"
                  />
                </div>

                {!hasActivePlanForService && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Forma de Pagamento *</label>
                    <select 
                      required
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-900"
                    >
                      <option value="">Selecione...</option>
                      <option value="pix">PIX</option>
                      <option value="credit">Cartão de Crédito</option>
                      <option value="debit">Cartão de Débito</option>
                      <option value="money">Dinheiro</option>
                    </select>
                  </div>
                )}
                
                {hasActivePlanForService && selectedService && (
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/20 flex justify-between">
                    <span>Serviço coberto pelo plano</span>
                    <span>R$ 0,00</span>
                  </div>
                )}
                {!hasActivePlanForService && selectedService && (
                  <div className="p-3 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-lg border border-slate-800 flex justify-between">
                    <span>Valor a cobrar</span>
                    <span>R$ {selectedService.price}</span>
                  </div>
                )}
              </>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/20"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="booking-form"
            disabled={loading || !selectedPetId || !selectedServiceId || !startAt}
            className="px-4 py-2 bg-teal-500 rounded-lg text-sm font-medium text-white hover:bg-teal-400 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
