import { useState } from 'react';
import { useAllServices } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatMWK } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { syncCatalogDefaultImages } from '../../lib/catalog-image-sync';
import { serviceImage } from '../../lib/site-images';
import type { Service } from '../../types';
import { Plus, Pencil, Trash2, Wrench, Eye, EyeOff } from 'lucide-react';

interface FormState {
  name: string; description: string; price: number; price_label: string;
  category: string; features: string; image_url: string; is_active: boolean; sort_order: number;
}

const emptyForm: FormState = {
  name: '', description: '', price: 0, price_label: '', category: 'General', features: '', image_url: '', is_active: true, sort_order: 0,
};

export function AdminServices() {
  const { services, loading, refetch } = useAllServices();
  const { show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [syncingImages, setSyncingImages] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name, description: s.description, price: Number(s.price), price_label: s.price_label,
      category: s.category, features: s.features.join(', '), image_url: s.image_url, is_active: s.is_active, sort_order: s.sort_order,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { show('Service name is required', 'error'); return; }
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, price: form.price, price_label: form.price_label || `From MWK ${form.price.toLocaleString()}`,
      category: form.category, features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      image_url: form.image_url, is_active: form.is_active, sort_order: form.sort_order, updated_at: new Date().toISOString(),
    };
    const { error } = editing
      ? await supabase.from('services').update(payload).eq('id', editing.id)
      : await supabase.from('services').insert(payload);
    setSaving(false);
    if (error) { show('Failed to save service', 'error'); return; }
    show(editing ? 'Service updated' : 'Service created', 'success');
    setShowForm(false); refetch();
  };

  const handleToggle = async (s: Service) => {
    const { error } = await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
    if (error) show('Failed to toggle', 'error'); else refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) show('Failed to delete', 'error'); else { show('Service deleted', 'success'); refetch(); }
  };

  const handleSyncImages = async () => {
    setSyncingImages(true);
    try {
      const { updated } = await syncCatalogDefaultImages(services, []);
      show(updated ? `${updated} service image${updated === 1 ? '' : 's'} saved to the database` : 'All service images are already set', 'success');
      refetch();
    } catch {
      show('Failed to upload the supplied service images', 'error');
    } finally {
      setSyncingImages(false);
    }
  };

  return (
    <AdminLayout title="Services">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-gray-500">{services.length} service(s) total</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncImages} loading={syncingImages}>Upload supplied images</Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <Card key={s.id} className="overflow-hidden">
              <div className="relative h-32 bg-gray-100">
                <img src={serviceImage(s.category, s.image_url)} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Badge color={s.is_active ? 'green' : 'gray'}>{s.is_active ? 'Active' : 'Hidden'}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{s.name}</h3>
                <p className="text-xs text-amber-600 font-semibold mt-1">{s.price_label || formatMWK(Number(s.price))}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="flex-1">
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggle(s)}>
                    {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Service' : 'Add Service'} size="lg">
        <div className="space-y-4">
          <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (MWK)" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Price Label" value={form.price_label} onChange={e => setForm({ ...form, price_label: e.target.value })} placeholder="From MWK 55,000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <ImageUpload label="Service Image" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="services" />
          <Input label="Features (comma separated)" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Dent Repairs, Color Matching, Rust Treatment" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Active (visible to public)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Save Changes' : 'Create Service'}</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
