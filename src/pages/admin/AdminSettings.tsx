import { useState, useEffect } from 'react';
import { useSettings } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { Save, Store, Phone, MapPin, Clock, Image } from 'lucide-react';

export function AdminSettings() {
  const { settings, refetch } = useSettings();
  const { show } = useToast();
  const [form, setForm] = useState({
    business_name: '', tagline: '', phone: '', email: '', address: '',
    about: '', hero_image: '', map_lat: 0, map_lng: 0,
    mon_fri: '', sat: '', sun: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name,
        tagline: settings.tagline,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        about: settings.about,
        hero_image: settings.hero_image,
        map_lat: settings.map_lat,
        map_lng: settings.map_lng,
        mon_fri: settings.hours?.mon_fri || '8:00 AM - 6:00 PM',
        sat: settings.hours?.sat || '9:00 AM - 4:00 PM',
        sun: settings.hours?.sun || 'Closed',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      business_name: form.business_name,
      tagline: form.tagline,
      phone: form.phone,
      email: form.email,
      address: form.address,
      about: form.about,
      hero_image: form.hero_image,
      map_lat: form.map_lat,
      map_lng: form.map_lng,
      hours: { mon_fri: form.mon_fri, sat: form.sat, sun: form.sun },
    }).eq('id', 1);
    setSaving(false);
    if (error) { show('Failed to save settings', 'error'); return; }
    show('Settings saved successfully', 'success');
    refetch();
  };

  return (
    <AdminLayout title="Settings">
      <div className="max-w-3xl space-y-6">
        {/* Business Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Business Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Business Name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
              <Input label="Tagline" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
            </div>
            <Textarea label="About / Description" rows={2} value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} />
            <ImageUpload label="Hero Image" value={form.hero_image} onChange={(url) => setForm({ ...form, hero_image: url })} folder="hero" />
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Contact Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </Card>

        {/* Hours */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Business Hours</h3>
          </div>
          <div className="space-y-3">
            <Input label="Monday - Friday" value={form.mon_fri} onChange={e => setForm({ ...form, mon_fri: e.target.value })} />
            <Input label="Saturday" value={form.sat} onChange={e => setForm({ ...form, sat: e.target.value })} />
            <Input label="Sunday" value={form.sun} onChange={e => setForm({ ...form, sun: e.target.value })} />
          </div>
        </Card>

        {/* Map */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Map Location</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude" type="number" step="any" value={form.map_lat} onChange={e => setForm({ ...form, map_lat: Number(e.target.value) })} />
            <Input label="Longitude" type="number" step="any" value={form.map_lng} onChange={e => setForm({ ...form, map_lng: Number(e.target.value) })} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
