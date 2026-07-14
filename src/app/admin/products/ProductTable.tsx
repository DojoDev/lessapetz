'use client';

import { useState } from 'react';
import { Product } from '../../../domain/entities/Product';
import Link from 'next/link';
import { PackageSearch, AlertTriangle, Plus, Minus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader } from '../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Stock Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAction, setStockAction] = useState<'entry' | 'loss'>('entry');
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockNotes, setStockNotes] = useState('');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      router.refresh();
    } catch (err) {
      alert('Erro ao excluir produto');
    } finally {
      setDeletingId(null);
    }
  };

  const openStockModal = (product: Product, action: 'entry' | 'loss') => {
    setSelectedProduct(product);
    setStockAction(action);
    setStockQuantity(1);
    setStockNotes('');
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmittingStock(true);

    try {
      const quantity = stockAction === 'entry' ? stockQuantity : -stockQuantity;
      
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: stockAction === 'entry' ? 'entry' : 'loss',
          quantity,
          notes: stockNotes,
        })
      });

      if (!res.ok) throw new Error('Erro ao atualizar estoque');
      
      setStockModalOpen(false);
      router.refresh();
    } catch (err) {
      alert('Erro ao atualizar estoque');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  return (
    <>
      <Card noPadding>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria/Marca</TableHead>
              <TableHead>Preços</TableHead>
              <TableHead align="center">Estoque Atual</TableHead>
              <TableHead align="right">Ações</TableHead>
            </tr>
          </TableHeader>
          <tbody className="divide-y divide-admin-border/50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6">
                  <EmptyState 
                    title="Nenhum produto cadastrado" 
                    description="Não há itens no inventário no momento." 
                    icon={PackageSearch} 
                  />
                </td>
              </tr>
            ) : (
              products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStockThreshold;
                  
                  return (
                    <TableRow key={p.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-admin-bg" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-admin-bg flex items-center justify-center text-admin-text-muted">
                              <PackageSearch size={24} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-admin-text-primary flex items-center gap-2">
                              {p.name}
                              {!p.isActive && <Badge variant="neutral">Inativo</Badge>}
                            </div>
                            <div className="text-xs text-admin-text-muted mt-1">
                              {p.sku || 'S/ SKU'} {p.isRetail && '• Varejo'} {p.isInternal && '• Uso Interno'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-admin-text-secondary">{p.category || '-'}</div>
                        <div className="text-xs text-admin-text-muted mt-1">{p.brand || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-admin-text-secondary">Venda: R$ {p.salePrice.toFixed(2)}</div>
                        <div className="text-xs text-admin-text-muted mt-1">Custo: R$ {p.costPrice.toFixed(2)}</div>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`text-lg font-bold ${isLowStock ? 'text-admin-danger' : 'text-admin-accent'}`}>
                            {p.currentStock} {p.unitOfMeasure}
                          </span>
                          {isLowStock && (
                            <Badge variant="danger" className="mt-1 flex items-center gap-1 px-1.5">
                              <AlertTriangle size={10} /> Estoque Baixo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openStockModal(p, 'loss')}
                            title="Baixa/Perda"
                            className="p-2 text-admin-text-muted hover:text-admin-danger hover:bg-admin-danger-bg rounded-lg transition-colors"
                          >
                            <Minus size={18} />
                          </button>
                          <button
                            onClick={() => openStockModal(p, 'entry')}
                            title="Entrada/Compra"
                            className="p-2 text-admin-text-muted hover:text-admin-success hover:bg-admin-success-bg rounded-lg transition-colors"
                          >
                            <Plus size={18} />
                          </button>
                          <Link 
                            href={`/admin/products/${p.id}`}
                            className="px-3 py-1.5 text-sm bg-admin-bg hover:bg-admin-border text-admin-text-primary rounded-lg transition-colors ml-2 border border-admin-border"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="p-2 text-admin-text-muted hover:text-admin-danger hover:bg-admin-danger-bg rounded-lg transition-colors ml-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </tbody>
        </Table>
      </Card>

      {/* Stock Movement Modal */}
      {stockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-bg/80 backdrop-blur-sm">
          <Card noPadding className="w-full max-w-md">
            <CardHeader>
              <div>
                <h3 className="text-lg font-bold text-admin-text-primary flex items-center gap-2">
                  {stockAction === 'entry' ? (
                    <><Plus size={20} className="text-admin-accent" /> Nova Entrada de Estoque</>
                  ) : (
                    <><Minus size={20} className="text-admin-danger" /> Registro de Perda/Baixa</>
                  )}
                </h3>
                <p className="text-sm text-admin-text-muted mt-1">Produto: <strong className="text-admin-text-primary">{selectedProduct.name}</strong></p>
              </div>
            </CardHeader>
            
            <form onSubmit={handleStockSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                  Quantidade ({selectedProduct.unitOfMeasure || 'unid'})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-4 py-2.5 text-admin-text-primary focus:ring-2 focus:ring-admin-accent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder={stockAction === 'entry' ? 'Ex: NF 12345, Fornecedor X' : 'Ex: Produto vencido, danificado'}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-4 py-2.5 text-admin-text-primary focus:ring-2 focus:ring-admin-accent outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-bg rounded-lg transition-colors border border-transparent hover:border-admin-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStock}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    stockAction === 'entry' 
                      ? 'bg-admin-success hover:bg-admin-success/80' 
                      : 'bg-admin-danger hover:bg-admin-danger/80'
                  }`}
                >
                  Confirmar {stockAction === 'entry' ? 'Entrada' : 'Baixa'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
