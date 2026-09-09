import { useState, useEffect } from 'react';
import { Link, useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatMWK, formatDateTime, formatDate } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { Booking, Order } from '../../types';
import { Calendar, ShoppingCart, Wrench, Package, Plus, ArrowRight, LogOut, User as UserIcon, Phone } from 'lucide-react';

export function CustomerDashboard() {
  const { navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const { show } = useToast();
  const [tab, setTab] = useState<'bookings' | 'orders'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: b }, { data: o }] = await Promise.all([
        supabase.from('bookings').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
      ]);
      setBookings((b as Booking[]) || []);
      setOrders((o as Order[]) || []);
      setLoading(false);
    })();
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    setUpdating(true);
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setUpdating(false);
    if (error) show('Failed to cancel', 'error');
    else {
      show('Booking cancelled', 'success');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      setEditingBooking(null);
    }
  };

  const stats = {
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length,
    totalOrders: orders.length,
    activeOrders: orders.filter(o => !['fulfilled', 'cancelled'].includes(o.status)).length,
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <header className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 sticky top-0 z-20 shadow-lg shadow-brand-950/15">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SpeedFitment" className="w-9 h-9 rounded-lg object-contain" />
            <span className="font-extrabold text-white">SpeedFitment</span>
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                {profile.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {profile.phone}</span>}
                <span className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" /> Customer</span>
              </div>
            </div>
            <Link to="/book"><Button><Plus className="h-4 w-4 mr-1" /> New Booking</Button></Link>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Calendar className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <p className="text-xl font-extrabold text-gray-900">{stats.totalBookings}</p>
            <p className="text-xs text-gray-500">Total Bookings</p>
          </Card>
          <Card className="p-4 text-center">
            <Wrench className="h-6 w-6 text-accent-600 mx-auto mb-2" />
            <p className="text-xl font-extrabold text-gray-900">{stats.activeBookings}</p>
            <p className="text-xs text-gray-500">Active Bookings</p>
          </Card>
          <Card className="p-4 text-center">
            <ShoppingCart className="h-6 w-6 text-brand-500 mx-auto mb-2" />
            <p className="text-xl font-extrabold text-gray-900">{stats.totalOrders}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </Card>
          <Card className="p-4 text-center">
            <Package className="h-6 w-6 text-brand-700 mx-auto mb-2" />
            <p className="text-xl font-extrabold text-gray-900">{stats.activeOrders}</p>
            <p className="text-xs text-gray-500">Active Orders</p>
          </Card>
        </div>

        <div className="flex gap-2 mb-4 p-1 bg-white rounded-xl border border-gray-200">
          <button onClick={() => setTab('bookings')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'bookings' ? 'bg-brand-700 text-white shadow-sm' : 'text-gray-600 hover:bg-brand-50'}`}>
            <Calendar className="h-4 w-4" /> My Bookings
          </button>
          <button onClick={() => setTab('orders')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'orders' ? 'bg-brand-700 text-white shadow-sm' : 'text-gray-600 hover:bg-brand-50'}`}>
            <ShoppingCart className="h-4 w-4" /> My Orders
          </button>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-gray-400">Loading...</Card>
        ) : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <Link to="/book"><Button>Book a Service <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <Card key={booking.id} className="p-5" hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900">{booking.service_name}</h3>
                      <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                        <p>{booking.customer_phone}</p>
                        {booking.vehicle_make && <p>{booking.vehicle_make} {booking.vehicle_model} {booking.vehicle_year}</p>}
                        {booking.preferred_date && <p>Preferred: {formatDate(booking.preferred_date)} at {booking.preferred_time}</p>}
                        <p className="text-xs text-gray-400">Submitted {formatDateTime(booking.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={booking.status} />
                      {!['completed', 'cancelled'].includes(booking.status) && (
                        <Button size="sm" variant="outline" onClick={() => setEditingBooking(booking)}>Manage</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          orders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No orders yet</p>
              <Link to="/book"><Button>Order Parts <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Card key={order.id} className="p-5" hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900">Order · {order.items.length} item(s)</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {order.items.map((item, i) => <p key={i}>{item.quantity}× {item.name}</p>)}
                        <p className="text-xs text-gray-400 mt-1">Placed {formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-extrabold text-brand-600">{formatMWK(Number(order.total))}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </main>

      <Modal open={!!editingBooking} onClose={() => setEditingBooking(null)} title="Manage Booking" size="sm">
        {editingBooking && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold text-gray-900">{editingBooking.service_name}</p>
              <p className="text-sm text-gray-500">{formatDateTime(editingBooking.created_at)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingBooking(null)} className="flex-1">Close</Button>
              <Button variant="danger" onClick={() => cancelBooking(editingBooking.id)} loading={updating} className="flex-1">Cancel Booking</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
