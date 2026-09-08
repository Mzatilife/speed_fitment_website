import { useState, useMemo } from 'react';
import { useOrders, usePayments } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../lib/auth';
import { supabase, formatMWK, formatDateTime } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select, Input, Textarea } from '../../components/ui/Input';
import type { Order, OrderStatus, PaymentMethod } from '../../types';
import { Search, Eye, ShoppingCart, Package, DollarSign, Trash2 } from 'lucide-react';

const orderStatuses: OrderStatus[] = ['pending', 'paid', 'fulfilled', 'cancelled'];

export function AdminOrders() {
  const { orders, loading, refetch } = useOrders();
  const { payments, refetch: refetchPayments } = usePayments();
  const { profile } = useAuth();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [updating, setUpdating] = useState(false);

  // Payment form
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payRef, setPayRef] = useState('');
  const [paying, setPaying] = useState(false);

  const filtered = useMemo(() => {
    let result = [...orders];
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(search) ||
        o.customer_email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, search]);

  const orderPayments = (orderId: string) => payments.filter(p => p.order_id === orderId);

  const openDetail = (order: Order) => {
    setSelected(order);
    setNewStatus(order.status);
    setPayAmount(Number(order.total));
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', selected.id);
    setUpdating(false);
    if (error) {
      show('Failed to update order', 'error');
    } else {
      show('Order updated successfully', 'success');
      setSelected(null);
      refetch();
    }
  };

  const handlePayment = async () => {
    if (!selected || payAmount <= 0) return;
    setPaying(true);
    const { error } = await supabase.from('payments').insert({
      order_id: selected.id,
      user_id: selected.user_id,
      cashier_id: profile?.id || null,
      customer_name: selected.customer_name,
      amount: payAmount,
      method: payMethod,
      status: 'paid',
      reference: payRef,
    });
    if (error) {
      show('Failed to record payment', 'error');
    } else {
      if (selected.status === 'pending') {
        await supabase.from('orders').update({ status: 'paid' }).eq('id', selected.id);
      }
      show('Payment recorded successfully', 'success');
      setShowPayment(false);
      setPayRef('');
      refetch();
      refetchPayments();
    }
    setPaying(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order permanently?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      show('Failed to delete order', 'error');
    } else {
      show('Order deleted', 'success');
      setSelected(null);
      refetch();
    }
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="md:w-48">
          <option value="all">All Statuses</option>
          {orderStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(order => {
                  const pays = orderPayments(order.id);
                  const paid = pays.reduce((s, p) => s + Number(p.amount), 0);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{order.items.length} item(s)</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatMWK(Number(order.total))}
                        {paid > 0 && <span className="block text-xs text-emerald-600">Paid: {formatMWK(paid)}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDateTime(order.created_at)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => openDetail(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map(order => {
              const pays = orderPayments(order.id);
              const paid = pays.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors" onClick={() => openDetail(order)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_phone}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{order.items.length} item(s)</span>
                    <span className="font-semibold text-gray-900">{formatMWK(Number(order.total))}</span>
                  </div>
                  {paid > 0 && <p className="text-xs text-emerald-600 mt-1">Paid: {formatMWK(paid)}</p>}
                </div>
              );
            })}
          </div>
          </>
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal open={!!selected && !showPayment} onClose={() => setSelected(null)} title="Order Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Customer</p>
                <p className="font-semibold text-gray-900">{selected.customer_name}</p>
                <p className="text-gray-600">{selected.customer_phone}</p>
                {selected.customer_email && <p className="text-gray-600">{selected.customer_email}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Date</p>
                <p className="text-gray-600">{formatDateTime(selected.created_at)}</p>
                <p className="text-xs text-gray-400 uppercase mb-1 mt-2">Status</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">Order Items</p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} × {formatMWK(item.price)}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatMWK(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-lg font-extrabold text-amber-600">{formatMWK(Number(selected.total))}</span>
              </div>
            </div>

            {/* Existing Payments */}
            {orderPayments(selected.id).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">Payments Received</p>
                <div className="space-y-1.5">
                  {orderPayments(selected.id).map(pay => (
                    <div key={pay.id} className="flex items-center justify-between text-sm p-2 bg-emerald-50 rounded-lg">
                      <span className="text-gray-700 capitalize">{pay.method.replace('_', ' ')} {pay.reference && `· ${pay.reference}`}</span>
                      <span className="font-semibold text-emerald-700">{formatMWK(Number(pay.amount))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selected.notes}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <Select label="Update Status" value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)}>
                {orderStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </Select>
              <div className="flex gap-3">
                <Button onClick={() => setShowPayment(true)} className="flex-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Record Payment
                </Button>
                <Button variant="secondary" onClick={handleUpdate} loading={updating}>Save Status</Button>
                <Button variant="danger" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Record Payment" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Order Total</span>
                <span className="font-bold text-gray-900">{formatMWK(Number(selected.total))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="text-gray-600 font-mono text-xs">{selected.id.slice(0, 8)}</span>
              </div>
            </div>
            <Input label="Amount (MWK)" type="number" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} />
            <Select label="Payment Method" value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)}>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </Select>
            <Input label="Reference (optional)" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Transaction ref" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPayment(false)} className="flex-1">Cancel</Button>
              <Button onClick={handlePayment} loading={paying} className="flex-1">Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
