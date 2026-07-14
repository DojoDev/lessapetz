'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../../domain/entities/Product';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, Save, Loader2, PackageSearch } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    category: initialData?.category || '',
    brand: initialData?.brand || '',
    unitOfMeasure: initialData?.unitOfMeasure || '',
    costPrice: initialData?.costPrice || 0,
    salePrice: initialData?.salePrice || 0,
    minStockThreshold: initialData?.minStockThreshold || 0,
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    isRetail: initialData?.isRetail ?? true,
    isInternal: initialData?.isInternal ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = initialData 
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';
      
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar produto');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/admin/products"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {initialData ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <p className="text-slate-400 mt-1">
            {initialData ? 'Atualize as informações do produto.' : 'Cadastre um novo produto físico no estoque.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 space-y-6">
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Imagem do Produto
                </label>
                <div className="w-48 h-48">
                  <ImageUpload 
                    onImageUploaded={handleImageUploaded} 
                    currentImageUrl={formData.imageUrl} 
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="Ex: Shampoo Hidratante"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    SKU (Código Interno)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="Ex: SHAMP-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  placeholder="Ex: Higiene, Ração, Acessório"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Marca/Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Unidade de Medida
                </label>
                <input
                  type="text"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                  placeholder="Ex: Unidade, ml, kg, L"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estoque Mínimo (Alerta)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minStockThreshold}
                  onChange={(e) => setFormData({ ...formData, minStockThreshold: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preço de Custo (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preço de Venda (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="col-span-1 md:col-span-2 bg-slate-950 rounded-xl p-6 border border-slate-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <PackageSearch size={18} className="text-teal-400" />
                  Configurações do Produto
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRetail}
                      onChange={(e) => setFormData({ ...formData, isRetail: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 bg-slate-900"
                    />
                    <div>
                      <div className="text-white font-medium">Produto para Venda (Varejo)</div>
                      <div className="text-sm text-slate-400">Pode ser vendido diretamente para clientes no caixa.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isInternal}
                      onChange={(e) => setFormData({ ...formData, isInternal: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 bg-slate-900"
                    />
                    <div>
                      <div className="text-white font-medium">Uso Interno</div>
                      <div className="text-sm text-slate-400">Produto consumido internamente durante os serviços (ex: Shampoo).</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-4 mt-4 border-t border-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 bg-slate-900"
                    />
                    <span className="text-white font-medium">Produto Ativo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
            <Link 
              href="/admin/products"
              className="px-6 py-2.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Produto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
