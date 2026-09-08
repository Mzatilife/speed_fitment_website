import { useState } from 'react';
import { useLogistics } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatMWK } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import type { Logistics } from '../../types';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';

interface FormState {
  name: string; description: string; price: number; unit: string; image_url: string; is_active: boolean; sort_order: number;
}

const emptyForm: FormState = { name: '', description: '', price: 0, unit: 'per load', image_url: '', is_active: true, sort_order: 0 };

export function AdminLogistics() {
  const { logistics, loading, refetch } = useLogistics();
  const { show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Logistics | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (l: Logistics) => {
    setEditing(l);
    setForm({ name: l.name, description: l.description, price: Number(l.price), unit: l.unit, image_url: l.image_url, is_active: l.is_active, sort_order: l.sort_order });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { show('Name is required', 'error'); return; }
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    const { error } = editing
      ? await supabase.from('logistics').update(payload).eq('id', editing.id)
      : await supabase.from('logistics').insert(payload);
    setSaving(false);
    if (error) { show('Failed to save', 'error'); return; }
    show(editing ? 'Updated' : 'Created', 'success');
    setShowForm(false); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    const { error } = await supabase.from('logistics').delete().eq('id', id);
    if (error) show('Failed to delete', 'error'); else { show('Deleted', 'success'); refetch(); }
  };

  return (
    <AdminLayout title="Logistics">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{logistics.length} item(s)</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {logistics.map(item => (
            <Card key={item.id} className="p-5">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">{item.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
              <p className="text-sm font-bold text-amber-600 mt-2">{item.price > 0 ? formatMWK(Number(item.price)) : 'Custom Quote'}</p>
              <p className="text-xs text-gray-400">{item.unit}</p>
              <div className="flex items-center justify-between mt-3">
                <Badge color={item.is_active ? 'green' : 'gray'}>{item.is_active ? 'Active' : 'Hidden'}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Item' : 'Add Item'}>
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (MWK)" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>
          <ImageUpload label="Logistics Image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="logistics" />
          <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
