"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

interface CategoryManagerProps {
  categories: Category[];
}

export default function CategoryManager({ categories: initial }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createCategory = async () => {
    if (!newName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          displayOrder: categories.length + 1,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const category = await res.json();
      setCategories([...categories, category]);
      setNewName('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const updated = await res.json();
      setCategories(categories.map(c => c.id === id ? { ...c, name: updated.name } : c));
      setEditingId(null);
      setEditName('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Excluir a categoria "${name}"? Serviços desta categoria ficarão sem categoria.`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id));
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
      >
        Categorias
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Gerenciar Categorias</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            {/* Existing categories list */}
            <div className="space-y-2 mb-4">
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500 py-3 text-center">Nenhuma categoria cadastrada.</p>
              ) : (
                categories.map(c => (
                  <div key={c.id} className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg">
                    {editingId === c.id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && updateCategory(c.id)}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button
                          onClick={() => updateCategory(c.id)}
                          disabled={isLoading}
                          className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditName(''); }}
                          className="text-sm text-slate-500 hover:text-slate-700"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-slate-800">{c.name}</span>
                        <button
                          onClick={() => { setEditingId(c.id); setEditName(c.name); }}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteCategory(c.id, c.name)}
                          disabled={isLoading}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add new category */}
            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createCategory()}
                placeholder="Nova categoria..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={createCategory}
                disabled={isLoading || !newName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
