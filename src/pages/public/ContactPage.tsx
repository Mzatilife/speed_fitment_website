import { useState } from 'react';
import { useSettings } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { siteImages } from '../../lib/site-images';

export function ContactPage() {
  const { settings } = useSettings();
  const { show } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      show('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('messages').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    });
    setSubmitting(false);
    if (error) {
      show('Failed to send message. Please try again.', 'error');
    } else {
      show('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    }
  };

  const contactCards = [
    { icon: Phone, title: 'Call Us', value: settings?.phone || '(+265) 456-7890', action: 'Call Now', href: `tel:${settings?.phone || '+2654567890'}` },
    { icon: Mail, title: 'Email Us', value: settings?.email || 'support@speedfitment.com', action: 'Send Email', href: `mailto:${settings?.email || 'support@speedfitment.com'}` },
    { icon: MapPin, title: 'Visit Us', value: settings?.address || '123 AutoCare St, Car City', action: 'Get Directions', href: '#map' },
  ];

  return (
    <div className="bg-white min-h-screen pt-20">
      <section className="bg-gray-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src={siteImages.workshop} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-brand-500/15 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-5">
            <Clock className="h-3.5 w-3.5" />
            24/7 Support
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white font-display">How Can We Help You?</h1>
          <p className="mt-5 text-gray-300 max-w-2xl mx-auto text-lg">Get in touch with our expert team for all your automotive needs.</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {contactCards.map((card, i) => (
              <Card key={i} hover className="p-7 text-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <card.icon className="h-7 w-7 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 font-display">{card.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{card.value}</p>
                <a href={card.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 group/link">
                  {card.action}
                  <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact form */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">Send Us a Message</h2>
              </div>
              <p className="text-sm text-gray-500 mb-7">We'll get back to you as soon as possible.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
                  <Input label="Your Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
                </div>
                <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(+265) 000-0000" />
                <Select label="Topic" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                  <option>General Inquiry</option>
                  <option>Service Question</option>
                  <option>Parts Inquiry</option>
                  <option>Other Topic</option>
                </Select>
                <Textarea label="Your Message *" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." required />
                <Button type="submit" loading={submitting} fullWidth size="lg">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Map + Hours */}
            <div id="map" className="space-y-6">
              <Card className="overflow-hidden">
                <div className="h-64 bg-gray-200 relative">
                  <iframe
                    title="Business Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(settings?.map_lng || 33.7745) - 0.01}%2C${(settings?.map_lat || -13.9626) - 0.01}%2C${(settings?.map_lng || 33.7745) + 0.01}%2C${(settings?.map_lat || -13.9626) + 0.01}&layer=mapnik&marker=${settings?.map_lat || -13.9626}%2C${settings?.map_lng || 33.7745}`}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 font-display">{settings?.business_name || 'SpeedFitment'}</h3>
                      <p className="text-sm text-gray-500">{settings?.address || '123 AutoCare St, Car City'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display">Business Hours</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Monday – Friday</span>
                    <span className="text-sm text-gray-500">{settings?.hours?.mon_fri || '8:00 AM – 6:00 PM'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Saturday</span>
                    <span className="text-sm text-gray-500">{settings?.hours?.sat || '9:00 AM – 4:00 PM'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm font-medium text-gray-700">Sunday</span>
                    <span className="text-sm text-red-500 font-medium">{settings?.hours?.sun || 'Closed'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
