import { useState, useMemo } from 'react';
import { useBookings } from '../../lib/hooks';
import { useToast } from '../../components/ui/Toast';
import { supabase, formatDateTime, formatDate } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select, Input, Textarea } from '../../components/ui/Input';
import { DataTableToolbar, SortableHeader, useTableSort } from '../../components/ui/DataTable';
import type { Booking, BookingStatus } from '../../types';
import { Eye, Calendar, Phone, Mail, Car, Clock, Trash2 } from 'lucide-react';

const statusOptions: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export function AdminBookings() {
  const { bookings, loading, refetch } = useBookings();
  const { show } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus>('pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [updating, setUpdating] = useState(false);

  const filtered = useMemo(() => {
    let result = [...bookings];
    if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_phone.includes(search) ||
        b.service_name.toLowerCase().includes(q) ||
        b.vehicle_make?.toLowerCase().includes(q) ||
        b.vehicle_model?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [bookings, statusFilter, search]);
  const { sortedRows, sort, toggleSort } = useTableSort(filtered, (booking, key) => {
    if (key === 'customer') return booking.customer_name;
    if (key === 'service') return booking.service_name;
    if (key === 'vehicle') return `${booking.vehicle_make ?? ''} ${booking.vehicle_model ?? ''}`;
    if (key === 'date') return booking.preferred_date ?? booking.created_at;
    return booking.status;
  }, 'date');

  const openDetail = (booking: Booking) => {
    setSelected(booking);
    setNewStatus(booking.status);
    setAssignedTo(booking.assigned_to || '');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, assigned_to: assignedTo, updated_at: new Date().toISOString() })
      .eq('id', selected.id);
    setUpdating(false);
    if (error) {
      show('Failed to update booking', 'error');
    } else {
      show('Booking updated successfully', 'success');
      setSelected(null);
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking permanently?')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      show('Failed to delete booking', 'error');
    } else {
      show('Booking deleted', 'success');
      setSelected(null);
      refetch();
    }
  };

  return (
    <AdminLayout title="Bookings">
      <DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by name, phone, service, or vehicle..." resultCount={sortedRows.length} onClear={() => { setSearch(''); setStatusFilter('all'); }} filter={<Select aria-label="Filter bookings by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full md:w-48">
          <option value="all">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
        </Select>} />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <SortableHeader label="Customer" column="customer" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Service" column="service" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <SortableHeader label="Vehicle" column="vehicle" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Date" column="date" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} className="hidden lg:table-cell" />
                  <SortableHeader label="Status" column="status" sortKey={String(sort.key)} direction={sort.direction} onSort={toggleSort} />
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRows.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                      <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{booking.service_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {booking.vehicle_make ? `${booking.vehicle_make} ${booking.vehicle_model} ${booking.vehicle_year}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {booking.preferred_date ? formatDate(booking.preferred_date) : '—'}
                      {booking.preferred_time && <span className="text-xs text-gray-400 ml-1">{booking.preferred_time}</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" iconOnly aria-label={`View booking for ${booking.customer_name}`} title="View booking" onClick={() => openDetail(booking)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-100">
            {sortedRows.map(booking => (
              <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors" onClick={() => openDetail(booking)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-gray-700 mb-1">{booking.service_name}</p>
                {booking.vehicle_make && <p className="text-xs text-gray-500">{booking.vehicle_make} {booking.vehicle_model} {booking.vehicle_year}</p>}
                {booking.preferred_date && <p className="text-xs text-gray-500 mt-1">{formatDate(booking.preferred_date)} at {booking.preferred_time}</p>}
              </div>
            ))}
          </div>
          </>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" /> {selected.customer_phone}
                </div>
                {selected.customer_email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" /> {selected.customer_email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <Car className="h-4 w-4 text-gray-400" />
                  {selected.vehicle_make ? `${selected.vehicle_make} ${selected.vehicle_model} ${selected.vehicle_year}` : 'No vehicle info'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {selected.preferred_date ? formatDate(selected.preferred_date) : 'No date'} at {selected.preferred_time}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Service</p>
                <p className="font-bold text-gray-900 mb-3">{selected.service_name}</p>
                <p className="text-xs text-gray-400 uppercase mb-1">Submitted</p>
                <p className="text-sm text-gray-600">{formatDateTime(selected.created_at)}</p>
                {selected.notes && (
                  <>
                    <p className="text-xs text-gray-400 uppercase mb-1 mt-3">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selected.notes}</p>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select label="Update Status" value={newStatus} onChange={e => setNewStatus(e.target.value as BookingStatus)}>
                  {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                </Select>
                <Input label="Assigned To" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Technician name" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleUpdate} loading={updating} className="flex-1">Save Changes</Button>
                <Button variant="danger" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
