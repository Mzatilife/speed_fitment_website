import { useState, useMemo } from 'react';
import { useParts } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatMWK } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { DataTableToolbar, SortableHeader, useTableSort } from '../../components/ui/DataTable';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { syncCatalogDefaultImages } from '../../lib/catalog-image-sync';
import { partImage } from '../../lib/site-images';
import type { Part } from '../../types';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';

interface FormState {
  name: string; description: string; category: string; price: number;
  stock_quantity: number; low_stock_threshold: number; sku: string; image_url: string;
  is_active: boolean; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean; is_on_sale: boolean;
  tags: string; sort_order: number;
}

const emptyForm: FormState = {
  name: '', description: '', category: 'General', price: 0, stock_quantity: 0, low_stock_threshold: 5,
  sku: '', image_url: '', is_active: true, is_featured: false, is_new_arrival: false,
  is_best_seller: false, is_on_sale: false, tags: '', sort_order: 0,
};

export function AdminParts() {
  const { parts, loading, refetch } = useParts();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [syncingImages, setSyncingImages] = useState(false);

  const categories = useMemo(() => Array.from(new Set(parts.map(p => p.category))), [parts]);

  const filtered = useMemo(() => {
    let result = [...parts];
    if (categoryFilter !== 'all') result = result.filter(p => p.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return result;
  }, [parts, search, categoryFilter]);
  const { sortedRows, sort, toggleSort } = useTableSort(filtered, (part, key) => {
    if (key === 'part') return part.name;
    if (key === 'category') return part.category;
    if (key === 'price') return Number(part.price);
    return part.stock_quantity;
  }, 'part', 'asc');

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Part) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, category: p.category, price: Number(p.price),
      stock_quantity: p.stock_quantity, low_stock_threshold: p.low_stock_threshold, sku: p.sku,
      image_url: p.image_url, is_active: p.is_active, is_featured: p.is_featured,
      is_new_arrival: p.is_new_arrival, is_best_seller: p.is_best_seller, is_on_sale: p.is_on_sale,
      tags: p.tags.join(', '), sort_order: p.sort_order,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { show('Part name is required', 'error'); return; }
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, category: form.category, price: form.price,
      stock_quantity: form.stock_quantity, low_stock_threshold: form.low_stock_threshold,
      sku: form.sku, image_url: form.image_url, is_active: form.is_active, is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival, is_best_seller: form.is_best_seller, is_on_sale: form.is_on_sale,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), sort_order: form.sort_order,
      updated_at: new Date().toISOString(),
    };
    const { error } = editing
      ? await supabase.from('parts').update(payload).eq('id', editing.id)
      : await supabase.from('parts').insert(payload);
    setSaving(false);
    if (error) { show('Failed to save part', 'error'); return; }
    show(editing ? 'Part updated' : 'Part created', 'success');
    setShowForm(false); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this part?')) return;
    const { error } = await supabase.from('parts').delete().eq('id', id);
    if (error) show('Failed to delete', 'error'); else { show('Part deleted', 'success'); refetch(); }
  };

  const adjustStock = async (p: Part, delta: number) => {
    const newQty = Math.max(0, p.stock_quantity + delta);
    const { error } = await supabase.from('parts').update({ stock_quantity: newQty }).eq('id', p.id);
    if (error) show('Failed to update stock', 'error'); else refetch();
  };

  const handleSyncImages = async () => {
    setSyncingImages(true);
    try {
      const { updated } = await syncCatalogDefaultImages([], parts);
      show(updated ? `${updated} part image${updated === 1 ? '' : 's'} saved to the database` : 'All part images are already set', 'success');
      refetch();
    } catch {
      show('Failed to upload the supplied part images', 'error');
    } finally {
      setSyncingImages(false);
    }
  };

  return (
    <AdminLayout title="Parts Inventory">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1"><DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by part name or SKU..." resultCount={sortedRows.length} onClear={() => { setSearch(''); setCategoryFilter('all'); }} filter={<Select aria-label="Filter parts by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full md:w-48">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>} /></div>
        <Button variant="outline" onClick={handleSyncImages} loading={syncingImages}>Upload supplied images</Button>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Part
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No parts found</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <SortableHeader label="Part" column="part" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Category" column="category" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Price" column="price" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Stock" column="stock" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRows.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={partImage(p.category, p.image_url)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatMWK(Number(p.price))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => adjustStock(p, -1)} className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center">−</button>
                        <span className={`text-sm font-semibold w-8 text-center ${p.stock_quantity <= p.low_stock_threshold ? 'text-red-600' : 'text-gray-900'}`}>
                          {p.stock_quantity}
                        </span>
                        <button onClick={() => adjustStock(p, 1)} className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center">+</button>
                      </div>
                      {p.stock_quantity <= p.low_stock_threshold && (
                        <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                          <AlertTriangle className="h-3 w-3" /> Low
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" iconOnly aria-label={`Edit ${p.name}`} title="Edit part" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" iconOnly aria-label={`Delete ${p.name}`} title="Delete part" onClick={() => handleDelete(p.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-100">
            {sortedRows.map(p => (
              <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <img src={partImage(p.category, p.image_url)} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku} · {p.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{formatMWK(Number(p.price))}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustStock(p, -1)} className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center">−</button>
                    <span className={`text-sm font-semibold w-8 text-center ${p.stock_quantity <= p.low_stock_threshold ? 'text-red-600' : 'text-gray-900'}`}>{p.stock_quantity}</span>
                    <button onClick={() => adjustStock(p, 1)} className="w-6 h-6 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center">+</button>
                  </div>
                </div>
                {p.stock_quantity <= p.low_stock_threshold && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mb-3">
                    <AlertTriangle className="h-3 w-3" /> Low stock
                  </div>
                )}
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" iconOnly aria-label={`Delete ${p.name}`} title="Delete part" onClick={() => handleDelete(p.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Part' : 'Add Part'} size="lg">
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price (MWK)" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Stock Qty" type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
            <Input label="Low Stock Alert" type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} />
          </div>
          <ImageUpload label="Part Image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="parts" />
          <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="brake, pads, safety" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'is_active', label: 'Active' },
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_new_arrival', label: 'New Arrival' },
              { key: 'is_best_seller', label: 'Best Seller' },
              { key: 'is_on_sale', label: 'On Sale' },
            ].map(check => (
              <label key={check.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[check.key as keyof FormState] as boolean}
                  onChange={e => setForm({ ...form, [check.key]: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{check.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Save Changes' : 'Create Part'}</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
