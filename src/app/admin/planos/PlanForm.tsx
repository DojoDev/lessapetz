"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../components/ImageUpload';

interface PlanFormProps {
  plan?: any;
  isEditing?: boolean;
}

interface ServiceOption {
  id: string;
  name: string;
  categoryName: string | null;
}

export default function PlanForm({ plan, isEditing = false }: PlanFormProps) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    monthlyPrice: plan?.monthlyPrice?.toString() || '0',
    imageUrl: plan?.imageUrl || '',
    isActive: plan?.isActive ?? true,
    quota: plan?.quota?.toString() || '0',
    cycleLengthDays: plan?.cycleLengthDays?.toString() || '30',
    includedServiceIds: plan?.includedServiceIds || ([] as string[]),
  });

  useEffect(() => {
    fetch('/api/admin/services')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data.map((s: any) => ({
            id: s.id,
            name: s.name,
            categoryName: s.categoryName,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const toggleService = (serviceId: string) => {
    setForm(prev => ({
      ...prev,
      includedServiceIds: prev.includedServiceIds.includes(serviceId)
        ? prev.includedServiceIds.filter((id: string) => id !== serviceId)
        : [...prev.includedServiceIds, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const body = {
        name: form.name,
        description: form.description || null,
        monthlyPrice: parseFloat(form.monthlyPrice) || 0,
        imageUrl: form.imageUrl || null,
        isActive: form.isActive,
        quota: parseInt(form.quota, 10) || 0,
        cycleLengthDays: parseInt(form.cycleLengthDays, 10) || 30,
        includedServiceIds: form.includedServiceIds,
      };

      const url = isEditing ? `/api/admin/plans/${plan.id}` : '/api/admin/plans';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }

      router.push('/admin/planos');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Plano *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]"
          placeholder="Ex: Pacote Mensal - Porte Pequeno"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[44px]"
          placeholder="O que o plano inclui"
        />
      </div>

      {/* Monthly Price */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Preço Mensal (R$) *</label>
        <input
          type="number"
          inputMode="decimal"
          required
          min="0"
          step="0.01"
          value={form.monthlyPrice}
          onChange={e => setForm({ ...form, monthlyPrice: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]"
          placeholder="200.00"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quota */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Quota de Serviços por Ciclo *</label>
          <input
            type="number"
            required
            min="0"
            value={form.quota}
            onChange={e => setForm({ ...form, quota: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]"
            placeholder="Ex: 4"
          />
          <p className="mt-1 text-xs text-slate-500">Nº de vezes que o serviço pode ser usado no ciclo.</p>
        </div>

        {/* Cycle Length */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Duração do Ciclo (dias) *</label>
          <input
            type="number"
            required
            min="1"
            value={form.cycleLengthDays}
            onChange={e => setForm({ ...form, cycleLengthDays: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px]"
            placeholder="Ex: 30"
          />
          <p className="mt-1 text-xs text-slate-500">Normalmente 30 dias para mensal.</p>
        </div>
      </div>

      {/* Included Services Multi-select */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Serviços Incluídos ({form.includedServiceIds.length} selecionado{form.includedServiceIds.length !== 1 ? 's' : ''})
        </label>
        <div className="border border-slate-300 rounded-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
          {services.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">Carregando serviços...</p>
          ) : (
            services.map(s => (
              <label
                key={s.id}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] cursor-pointer hover:bg-slate-50 transition-colors ${
                  form.includedServiceIds.includes(s.id) ? 'bg-indigo-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.includedServiceIds.includes(s.id)}
                  onChange={() => toggleService(s.id)}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-800">{s.name}</span>
                  {s.categoryName && (
                    <span className="ml-2 text-xs text-slate-500">({s.categoryName})</span>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Imagem do Card</label>
        <ImageUpload
          currentImageUrl={form.imageUrl}
          onImageUploaded={(url) => setForm({ ...form, imageUrl: url })}
          folder="plans"
        />
      </div>

      {/* Active Toggle */}
      <button
        type="button"
        onClick={() => setForm({ ...form, isActive: !form.isActive })}
        className="flex items-center gap-3 w-full sm:w-auto text-left py-2"
      >
        <div
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${
            form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
            form.isActive ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </div>
        <span className="text-sm text-slate-700">
          {form.isActive ? 'Ativo — visível no catálogo' : 'Inativo — oculto do catálogo'}
        </span>
      </button>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Plano'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/planos')}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm text-center"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
