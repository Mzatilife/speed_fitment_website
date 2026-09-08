import { useState } from 'react';
import { useAllTestimonials } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import type { Testimonial } from '../../types';
import { Plus, Pencil, Trash2, Star, Quote, Eye, EyeOff } from 'lucide-react';

interface FormState {
  name: string; role: string; text: string; rating: number; is_active: boolean; sort_order: number;
}

const emptyForm: FormState = { name: '', role: 'Customer', text: '', rating: 5, is_active: true, sort_order: 0 };

export function AdminTestimonials() {
  const { testimonials, loading, refetch } = useAllTestimonials();
  const { show } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role, text: t.text, rating: t.rating, is_active: t.is_active, sort_order: t.sort_order });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.text) { show('Name and text are required', 'error'); return; }
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    const { error } = editing
      ? await supabase.from('testimonials').update(payload).eq('id', editing.id)
      : await supabase.from('testimonials').insert(payload);
    setSaving(false);
    if (error) { show('Failed to save testimonial', 'error'); return; }
    show(editing ? 'Testimonial updated' : 'Testimonial created', 'success');
    setShowForm(false); refetch();
  };

  const handleToggle = async (t: Testimonial) => {
    const { error } = await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    if (error) show('Failed to toggle', 'error'); else refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) show('Failed to delete', 'error'); else { show('Testimonial deleted', 'success'); refetch(); }
  };

  return (
    <AdminLayout title="Testimonials">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{testimonials.length} testimonial(s) total</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : testimonials.length === 0 ? (
        <Card className="p-12 text-center">
          <Quote className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No testimonials yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Quote className="h-8 w-8 text-brand-200" />
                <Badge color={t.is_active ? 'green' : 'gray'}>{t.is_active ? 'Active' : 'Hidden'}</Badge>
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-brand-500 fill-brand-500" />
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">{t.text}</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(t)} className="flex-1">
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleToggle(t)}>
                  {t.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)} className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="space-y-4">
          <Input label="Customer Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Role / Title" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Regular Customer" />
          <Textarea label="Testimonial Text *" rows={4} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Rating" value={String(form.rating)} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </Select>
            <Input label="Sort Order" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Active (visible on homepage)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
