import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../lib/router';
import { useServices, useParts, useLogistics } from '../../lib/hooks';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatMWK } from '../../lib/supabase';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Car, CheckCircle2, ArrowLeft, ArrowRight, ShoppingCart, Trash2, Plus, Wrench, Package, Truck } from 'lucide-react';
import type { OrderItem } from '../../types';
import { siteImages } from '../../lib/site-images';

type BookingType = 'service' | 'parts';

export function BookingPage() {
  const { path } = useRouter();
  const { profile } = useAuth();
  const { show } = useToast();
  const { services } = useServices();
  const { parts } = useParts();
  const { logistics } = useLogistics();

  const [type, setType] = useState<BookingType>('service');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '' });
  const [schedule, setSchedule] = useState({ date: '', time: '08:00' });
  const [customer, setCustomer] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.full_name ? '' : '',
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    const query = path.split('?')[1];
    if (!query) return;
    const params = new URLSearchParams(query);
    const serviceParam = params.get('service');
    const partParam = params.get('part');
    if (serviceParam) {
      setType('service');
      setSelectedServiceId(serviceParam);
    }
    if (partParam) {
      setType('parts');
      const part = parts.find(p => p.id === partParam);
      if (part) {
        setCart([{ id: part.id, type: 'part', name: part.name, price: Number(part.price), quantity: 1, image_url: part.image_url }]);
      }
    }
  }, [path, parts]);

  useEffect(() => {
    if (profile) {
      setCustomer(prev => ({ ...prev, name: prev.name || profile.full_name, phone: prev.phone || profile.phone }));
    }
  }, [profile]);

  const selectedService = useMemo(() => services.find(s => s.id === selectedServiceId), [services, selectedServiceId]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const addToCart = (item: OrderItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      show('Please fill in your name and phone number', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (type === 'service') {
        if (!selectedServiceId || !selectedService) {
          show('Please select a service', 'error');
          setSubmitting(false);
          return;
        }
        const { error } = await supabase.from('bookings').insert({
          user_id: profile?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email,
          service_id: selectedServiceId,
          service_name: selectedService.name,
          vehicle_make: vehicle.make,
          vehicle_model: vehicle.model,
          vehicle_year: vehicle.year,
          preferred_date: schedule.date || null,
          preferred_time: schedule.time,
          notes,
          status: 'pending',
        });
        if (error) throw error;
        show('Booking submitted successfully!', 'success');
        setSuccess(true);
      } else {
        if (cart.length === 0) {
          show('Please add items to your order', 'error');
          setSubmitting(false);
          return;
        }
        const { error } = await supabase.from('orders').insert({
          user_id: profile?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email,
          items: cart,
          subtotal: cartTotal,
          total: cartTotal,
          status: 'pending',
          notes,
        });
        if (error) throw error;
        show('Order placed successfully!', 'success');
        setSuccess(true);
      }
    } catch {
      show('Something went wrong. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-10 text-center animate-scale-in shadow-card">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 font-display">
            {type === 'service' ? 'Booking Confirmed!' : 'Order Placed!'}
          </h1>
          <p className="text-gray-500 mb-7 leading-relaxed">
            {type === 'service'
              ? 'We have received your booking request. Our team will contact you shortly to confirm your appointment.'
              : 'Your order has been received. We will contact you to arrange payment and pickup or delivery.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setSuccess(false); setCart([]); setSelectedServiceId(''); }}>
              <Plus className="h-4 w-4" />
              New {type === 'service' ? 'Booking' : 'Order'}
            </Button>
            <a href="/">
              <Button variant="outline">Back to Home</Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <section className="bg-gray-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src={siteImages.hero} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-brand-500/15 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-5">
            <Calendar className="h-3.5 w-3.5" />
            Get Started
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white font-display">Book an Appointment</h1>
          <p className="mt-3 text-gray-300">Schedule your service or order parts in a few easy steps.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Type Toggle */}
          <div className="flex gap-2 mb-7 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-soft">
            <button
              onClick={() => setType('service')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${type === 'service' ? 'bg-gray-900 text-white shadow-soft' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Wrench className="h-4 w-4" /> Book a Service
            </button>
            <button
              onClick={() => setType('parts')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${type === 'parts' ? 'bg-gray-900 text-white shadow-soft' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingCart className="h-4 w-4" /> Order Parts
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'service' ? (
              <Card className="p-6 md:p-8 space-y-7">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-4 font-display">Select a Service</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map(service => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${selectedServiceId === service.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-soft'}`}
                      >
                        {service.image_url ? (
                          <img src={service.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                            <Wrench className="h-6 w-6 text-brand-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900">{service.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{service.description}</p>
                          <p className="text-xs font-bold text-brand-600 mt-1.5">{service.price_label || formatMWK(Number(service.price))}</p>
                        </div>
                        {selectedServiceId === service.id && <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="section-divider" />

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 font-display">
                    <Car className="h-4 w-4 text-brand-600" /> Vehicle Information
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="Make" placeholder="Toyota" value={vehicle.make} onChange={e => setVehicle({ ...vehicle, make: e.target.value })} />
                    <Input label="Model" placeholder="Hilux" value={vehicle.model} onChange={e => setVehicle({ ...vehicle, model: e.target.value })} />
                    <Input label="Year" placeholder="2020" value={vehicle.year} onChange={e => setVehicle({ ...vehicle, year: e.target.value })} />
                  </div>
                </div>

                <div className="section-divider" />

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 font-display">
                    <Calendar className="h-4 w-4 text-brand-600" /> Preferred Schedule
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} />
                    <Select label="Time" value={schedule.time} onChange={e => setSchedule({ ...schedule, time: e.target.value })}>
                      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 md:p-8 space-y-7">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 font-display">
                    <Package className="h-4 w-4 text-brand-600" /> Browse Parts
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1 scrollbar-thin">
                    {parts.filter(p => p.is_active && p.stock_quantity > 0).map(part => (
                      <div key={part.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                        {part.image_url ? (
                          <img src={part.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{part.name}</h4>
                          <p className="text-xs font-bold text-brand-600 mt-0.5">{formatMWK(Number(part.price))}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{part.stock_quantity} in stock</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart({ id: part.id, type: 'part', name: part.name, price: Number(part.price), quantity: 1, image_url: part.image_url })}
                          className="flex-shrink-0 p-2 bg-brand-500 text-gray-900 rounded-lg hover:bg-brand-400 active:scale-90 transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {logistics.length > 0 && (
                  <>
                    <div className="section-divider" />
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 font-display">
                        <Truck className="h-4 w-4 text-brand-600" /> Logistics Materials
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {logistics.filter(l => l.is_active).map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => addToCart({ id: item.id, type: 'logistics', name: item.name, price: Number(item.price), quantity: 1 })}
                            className="p-4 rounded-xl border border-gray-200 bg-white text-left hover:border-brand-400 hover:shadow-soft transition-all"
                          >
                            <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                            <p className="text-xs text-brand-600 font-semibold mt-1">{item.price > 0 ? formatMWK(Number(item.price)) : 'Custom Quote'}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="section-divider" />

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4 font-display">
                    <ShoppingCart className="h-4 w-4 text-brand-600" /> Your Order
                    {cart.length > 0 && <Badge color="amber">{cart.reduce((s, i) => s + i.quantity, 0)} items</Badge>}
                  </label>
                  {cart.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                      <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No items added yet — browse above to add parts.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                            <Badge color={item.type === 'part' ? 'blue' : 'purple'}>{item.type}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 active:scale-90 transition-all">−</button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button type="button" onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 active:scale-90 transition-all">+</button>
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-24 text-right">{formatMWK(item.price * item.quantity)}</span>
                          <button type="button" onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                        <span className="text-base font-bold text-gray-900 font-display">Total</span>
                        <span className="text-2xl font-extrabold text-brand-600 font-display">{formatMWK(cartTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Customer Info */}
            <Card className="p-6 md:p-8 space-y-5">
              <h3 className="text-sm font-bold text-gray-900 font-display">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="John Doe" required />
                <Input label="Phone Number *" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="(+265) 000-0000" required />
              </div>
              <Input label="Email" type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} placeholder="john@example.com" />
              <Textarea label="Additional Notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests or details about your vehicle..." />
            </Card>

            <div className="flex gap-3">
              <a href="/">
                <Button type="button" variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Button>
              </a>
              <Button type="submit" loading={submitting} size="lg" className="flex-1">
                {type === 'service' ? 'Submit Booking' : 'Place Order'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
