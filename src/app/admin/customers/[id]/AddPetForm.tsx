"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPetForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    weight: '',
    sizeCategory: 'small',
    behavior: '',
    healthNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/customers/${customerId}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add pet');
      }

      // Reset form and refresh page to show new pet
      setFormData({
        name: '', species: 'dog', breed: '', weight: '', sizeCategory: 'small', behavior: '', healthNotes: ''
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
          <input
            type="text" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Espécie *</label>
          <select
            value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm bg-white"
          >
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="other">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Raça</label>
          <input
            type="text"
            value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Porte *</label>
          <select
            value={formData.sizeCategory} onChange={e => setFormData({...formData, sizeCategory: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm bg-white"
          >
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
            <option value="giant">Gigante</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
          <input
            type="number" step="0.1" inputMode="decimal"
            value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Comportamento</label>
          <select
            value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm bg-white"
          >
            <option value="">(Não informado)</option>
            <option value="calm">Calmo</option>
            <option value="fearful">Medroso</option>
            <option value="hyperactive">Hiperativo</option>
            <option value="aggressive">Agressivo</option>
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações de Saúde (Alergias, etc)</label>
          <input
            type="text"
            value={formData.healthNotes} onChange={e => setFormData({...formData, healthNotes: e.target.value})}
            className="w-full px-4 py-3 min-h-[44px] border rounded-lg text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Adicionando...' : 'Adicionar Pet'}
        </button>
      </div>
    </form>
  );
}
