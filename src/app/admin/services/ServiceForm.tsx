"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../components/ImageUpload';

interface ServiceFormProps {
  service?: any;
  isEditing?: boolean;
}

interface Category {
  id: string;
  name: string;
}

const PET_SIZE_OPTIONS = [
  { value: 'all', label: 'Todos os portes' },
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Médio' },
  { value: 'large', label: 'Grande' },
];

export default function ServiceForm({ service, isEditing = false }: ServiceFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: service?.name || '',
    description: service?.description || '',
    categoryId: service?.categoryId || '',
    baseDurationMin: service?.baseDurationMin?.toString() || '60',
    basePrice: service?.basePrice?.toString() || '0',
    isStartingPrice: service?.isStartingPrice || false,
    petSizeApplicability: service?.petSizeApplicability || 'all',
    imageUrl: service?.imageUrl || '',
    isActive: service?.isActive ?? true,
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const body = {
        name: form.name,
        description: form.description || null,
        categoryId: form.categoryId || null,
        baseDurationMin: parseInt(form.baseDurationMin) || 0,
        basePrice: parseFloat(form.basePrice) || 0,
        isStartingPrice: form.isStartingPrice,
        petSizeApplicability: form.petSizeApplicability,
        imageUrl: form.imageUrl || null,
        isActive: form.isActive,
      };

      const url = isEditing ? `/api/admin/services/${service.id}` : '/api/admin/services';
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

      router.push('/admin/services');
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome do Serviço *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px]"
          placeholder="Ex: Banho & Tosa Higiênica - Porte Pequeno"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[44px]"
          placeholder="Descrição do serviço para o catálogo"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
        <select
          value={form.categoryId}
          onChange={e => setForm({ ...form, categoryId: e.target.value })}
          className="w-full px-4 py-3 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-900 min-h-[44px]"
        >
          <option value="">Sem categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Duration & Price Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Duração (minutos) *</label>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            min="0"
            value={form.baseDurationMin}
            onChange={e => setForm({ ...form, baseDurationMin: e.target.value })}
            className="w-full px-4 py-3 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px]"
            placeholder="60"
          />
          <p className="text-xs text-slate-400 mt-1">Use 0 para serviços mensais/recorrentes</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Preço Base (R$) *</label>
          <input
            type="number"
            inputMode="decimal"
            required
            min="0"
            step="0.01"
            value={form.basePrice}
            onChange={e => setForm({ ...form, basePrice: e.target.value })}
            className="w-full px-4 py-3 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px]"
            placeholder="65.00"
          />
          <p className="text-xs text-slate-400 mt-1">Use 0 para &quot;valor a consultar&quot;</p>
        </div>
      </div>

      {/* Starting Price Toggle */}
      <button
        type="button"
        onClick={() => setForm({ ...form, isStartingPrice: !form.isStartingPrice })}
        className="flex items-center gap-3 w-full sm:w-auto text-left py-2"
      >
        <div
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${
            form.isStartingPrice ? 'bg-teal-500' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-slate-900 shadow-sm transition-transform ${
            form.isStartingPrice ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </div>
        <span className="text-sm text-slate-300">Exibir como &quot;A partir de&quot;</span>
      </button>

      {/* Pet Size */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Porte do Pet</label>
        <div className="flex flex-wrap gap-2">
          {PET_SIZE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm({ ...form, petSizeApplicability: opt.value })}
              className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
                form.petSizeApplicability === opt.value
                  ? 'bg-teal-500 text-white border-indigo-600'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Imagem do Card</label>
        <ImageUpload
          currentImageUrl={form.imageUrl}
          onImageUploaded={(url) => setForm({ ...form, imageUrl: url })}
          folder="services"
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
          <span className={`inline-block h-6 w-6 transform rounded-full bg-slate-900 shadow-sm transition-transform ${
            form.isActive ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </div>
        <span className="text-sm text-slate-300">
          {form.isActive ? 'Ativo — visível no catálogo' : 'Inativo — oculto do catálogo'}
        </span>
      </button>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-teal-500 hover:bg-teal-400 disabled:bg-indigo-400 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Serviço'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/services')}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800/20 transition-colors text-sm text-center"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
