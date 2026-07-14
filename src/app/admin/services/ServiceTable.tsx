"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
interface ServiceRow {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  baseDurationMin: number;
  basePrice: number;
  isStartingPrice: boolean;
  petSizeApplicability: string;
  isActive: boolean;
  displayOrder: number;
  imageUrl: string | null;
}

interface ServiceTableProps {
  services: ServiceRow[];
}

const SIZE_LABELS: Record<string, string> = {
  all: 'Todos',
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
};

export default function ServiceTable({ services: initial }: ServiceTableProps) {
  const [services, setServices] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleActive = async (id: string, currentActive: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !currentActive } : s));
      }
    } finally {
      setLoadingId(null);
    }
  };

  const deleteService = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } finally {
      setLoadingId(null);
    }
  };

  const moveService = async (index: number, direction: 'up' | 'down') => {
    const newServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;

    [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
    setServices(newServices);

    const orderedIds = newServices.map(s => s.id);
    await fetch('/api/admin/services/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
  };

  const formatPrice = (price: number, isStarting: boolean) => {
    if (price === 0) return 'Consultar';
    const formatted = price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    return isStarting ? `A partir de R$ ${formatted}` : `R$ ${formatted}`;
  };

  return (
    <Card noPadding>
      
      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-12">Ordem</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Porte</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead align="right">Ações</TableHead>
            </tr>
          </TableHeader>
          <tbody className="divide-y divide-admin-border/50">
            {services.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6">
                  <EmptyState title="Nenhum serviço cadastrado" description="Clique em Novo Serviço para começar." />
                </td>
              </tr>
            ) : (
              services.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveService(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-admin-text-muted hover:text-admin-text-primary disabled:opacity-30 disabled:cursor-not-allowed min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Mover para cima"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                      </button>
                      <button
                        onClick={() => moveService(idx, 'down')}
                        disabled={idx === services.length - 1}
                        className="p-1 text-admin-text-muted hover:text-admin-text-primary disabled:opacity-30 disabled:cursor-not-allowed min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Mover para baixo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-admin-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-admin-border/50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-admin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5V19.5a1.5 1.5 0 001.5 1.5z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-admin-text-primary text-sm">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-admin-border/50 text-admin-text-secondary">
                      {s.categoryName || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-admin-text-secondary">{s.baseDurationMin > 0 ? `${s.baseDurationMin} min` : 'Mensal'}</TableCell>
                  <TableCell className="text-sm font-medium text-admin-text-secondary">{formatPrice(s.basePrice, s.isStartingPrice)}</TableCell>
                  <TableCell className="text-sm text-admin-text-secondary">{SIZE_LABELS[s.petSizeApplicability] || s.petSizeApplicability}</TableCell>
                  <TableCell align="center">
                    <button
                      onClick={() => toggleActive(s.id, s.isActive)}
                      disabled={loadingId === s.id}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        s.isActive ? 'bg-admin-success' : 'bg-admin-text-muted'
                      }`}
                      title={s.isActive ? 'Desativar' : 'Ativar'}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-admin-bg shadow-sm transition-transform ${
                          s.isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/services/${s.id}`)}
                        className="p-2 text-admin-text-muted hover:text-admin-accent hover:bg-admin-accent-muted rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteService(s.id, s.name)}
                        disabled={loadingId === s.id}
                        className="p-2 text-admin-text-muted hover:text-admin-danger hover:bg-admin-danger-bg rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Excluir"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="md:hidden flex flex-col divide-y divide-admin-border/50">
        {services.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Nenhum serviço cadastrado" />
          </div>
        ) : (
          services.map((s, idx) => (
            <div key={s.id} className={`p-4 flex flex-col gap-4 ${loadingId === s.id ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Image */}
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-admin-border shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-admin-border/50 flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8 text-admin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5V19.5a1.5 1.5 0 001.5 1.5z" />
                    </svg>
                  </div>
                )}
                
                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-admin-text-primary text-base leading-tight mb-1 truncate">{s.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-admin-border/50 text-admin-text-secondary">
                      {s.categoryName || '—'}
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-admin-accent-muted text-admin-accent">
                      {SIZE_LABELS[s.petSizeApplicability] || s.petSizeApplicability}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-admin-text-secondary">
                    {formatPrice(s.basePrice, s.isStartingPrice)}
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => toggleActive(s.id, s.isActive)}
                  disabled={loadingId === s.id}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shrink-0 ${
                    s.isActive ? 'bg-admin-success' : 'bg-admin-text-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-admin-bg shadow-sm transition-transform ${
                      s.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Action Bar (Reorder + Edit/Delete) */}
              <div className="flex items-center justify-between pt-3 border-t border-admin-border/50">
                <div className="flex items-center gap-1 bg-admin-bg/50 rounded-lg p-1">
                  <button
                    onClick={() => moveService(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 text-admin-text-muted hover:text-admin-text-primary disabled:opacity-30 disabled:cursor-not-allowed bg-admin-bg rounded shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center border border-admin-border"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button
                    onClick={() => moveService(idx, 'down')}
                    disabled={idx === services.length - 1}
                    className="p-2 text-admin-text-muted hover:text-admin-text-primary disabled:opacity-30 disabled:cursor-not-allowed bg-admin-bg rounded shadow-sm min-h-[36px] min-w-[36px] flex items-center justify-center border border-admin-border"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteService(s.id, s.name)}
                    disabled={loadingId === s.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-admin-danger bg-admin-danger-bg hover:opacity-80 rounded-lg transition-colors min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                  <button
                    onClick={() => router.push(`/admin/services/${s.id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-admin-accent bg-admin-accent-muted hover:opacity-80 rounded-lg transition-colors min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </Card>
  );
}
