import { useState, useMemo } from 'react';
import { usePayments } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../lib/auth';
import { supabase, formatMWK, formatDateTime } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { DataTableToolbar, SortableHeader, useTableSort } from '../../components/ui/DataTable';
import type { PaymentMethod } from '../../types';
import { DollarSign, Plus, TrendingUp, Trash2 } from 'lucide-react';

export function AdminPayments() {
  const { payments, loading, refetch } = usePayments();
  const { profile } = useAuth();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customer_name: '', amount: 0, method: 'cash' as PaymentMethod, reference: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let result = [...payments];
    if (methodFilter !== 'all') result = result.filter(p => p.method === methodFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.customer_name.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [payments, methodFilter, search]);
  const { sortedRows, sort, toggleSort } = useTableSort(filtered, (payment, key) => {
    if (key === 'customer') return payment.customer_name;
    if (key === 'amount') return Number(payment.amount);
    if (key === 'method') return payment.method;
    if (key === 'reference') return payment.reference ?? '';
    if (key === 'date') return payment.created_at;
    return payment.status;
  }, 'date');

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const todayPaid = payments
    .filter(p => p.status === 'paid' && new Date(p.created_at).setHours(0,0,0,0) === new Date().setHours(0,0,0,0))
    .reduce((s, p) => s + Number(p.amount), 0);

  const handleAdd = async () => {
    if (!form.customer_name || form.amount <= 0) {
      show('Enter customer name and amount', 'error');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('payments').insert({
      cashier_id: profile?.id || null,
      customer_name: form.customer_name,
      amount: form.amount,
      method: form.method,
      status: 'paid',
      reference: form.reference,
      notes: form.notes,
    });
    setSaving(false);
    if (error) {
      show('Failed to record payment', 'error');
    } else {
      show('Payment recorded', 'success');
      setShowAdd(false);
      setForm({ customer_name: '', amount: 0, method: 'cash', reference: '', notes: '' });
      refetch();
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm('Mark this payment as refunded?')) return;
    const { error } = await supabase.from('payments').update({ status: 'refunded' }).eq('id', id);
    if (error) {
      show('Failed to refund payment', 'error');
    } else {
      show('Payment refunded', 'success');
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment record?')) return;
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) {
      show('Failed to delete', 'error');
    } else {
      show('Payment deleted', 'success');
      refetch();
    }
  };

  return (
    <AdminLayout title="Payments">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{formatMWK(todayPaid)}</p>
              <p className="text-xs text-gray-500">Today's Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{formatMWK(totalPaid)}</p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{payments.length}</p>
              <p className="text-xs text-gray-500">Total Transactions</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex-1"><DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by customer or reference..." resultCount={sortedRows.length} onClear={() => { setSearch(''); setMethodFilter('all'); }} filter={<Select aria-label="Filter payments by method" value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="w-full md:w-48">
          <option value="all">All Methods</option>
          <option value="cash">Cash</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </Select>} /></div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Record Payment
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <SortableHeader label="Customer" column="customer" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Amount" column="amount" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Method" column="method" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Reference" column="reference" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden md:table-cell" />
                  <SortableHeader label="Date" column="date" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Status" column="status" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRows.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{payment.customer_name}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatMWK(Number(payment.amount))}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{payment.method.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{payment.reference || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDateTime(payment.created_at)}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {payment.status === 'paid' && (
                          <Button size="sm" variant="ghost" onClick={() => handleRefund(payment.id)} className="text-amber-600">
                            Refund
                          </Button>
                        )}
                          <Button size="sm" variant="ghost" iconOnly aria-label={`Delete payment from ${payment.customer_name}`} title="Delete payment" onClick={() => handleDelete(payment.id)} className="text-red-500">
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
            {sortedRows.map(payment => (
              <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{payment.customer_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{payment.method.replace('_', ' ')}</p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
                <p className="font-bold text-gray-900">{formatMWK(Number(payment.amount))}</p>
                {payment.reference && <p className="text-xs text-gray-400 mt-1">Ref: {payment.reference}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(payment.created_at)}</p>
                <div className="flex gap-2 mt-3">
                  {payment.status === 'paid' && (
                    <Button size="sm" variant="ghost" onClick={() => handleRefund(payment.id)} className="text-amber-600">
                      Refund
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" iconOnly aria-label={`Delete payment from ${payment.customer_name}`} title="Delete payment" onClick={() => handleDelete(payment.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record Payment" size="sm">
        <div className="space-y-4">
          <Input label="Customer Name *" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
          <Input label="Amount (MWK) *" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
          <Select label="Payment Method" value={form.method} onChange={e => setForm({ ...form, method: e.target.value as PaymentMethod })}>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </Select>
          <Input label="Reference (optional)" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAdd} loading={saving} className="flex-1">Save Payment</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
