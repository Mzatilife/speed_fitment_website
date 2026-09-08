import { useMemo } from 'react';
import { Link } from '../../lib/router';
import { useBookings, useOrders, usePayments, useParts, useMessages } from '../../lib/hooks';
import { formatMWK, formatDateTime } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Calendar, ShoppingCart, DollarSign, Package, MessageSquare, TrendingUp, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

export function AdminDashboard() {
  const { bookings } = useBookings();
  const { orders } = useOrders();
  const { payments } = usePayments();
  const { parts } = useParts();
  const { messages } = useMessages();

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => new Date(p.created_at).setHours(0,0,0,0) === today);
    const todayRevenue = todayPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const lowStockParts = parts.filter(p => p.stock_quantity <= p.low_stock_threshold);
    const newMessages = messages.filter(m => m.status === 'new').length;

    return { todayRevenue, totalRevenue, pendingBookings, pendingOrders, lowStockParts, newMessages, todayPaymentsCount: todayPayments.length };
  }, [payments, bookings, orders, parts, messages]);

  const recentBookings = bookings.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { label: "Today's Revenue", value: formatMWK(stats.todayRevenue), icon: DollarSign, color: 'bg-emerald-500', link: '/admin/payments' },
    { label: 'Total Revenue', value: formatMWK(stats.totalRevenue), icon: TrendingUp, color: 'bg-blue-500', link: '/admin/payments' },
    { label: 'Pending Bookings', value: stats.pendingBookings.toString(), icon: Calendar, color: 'bg-amber-500', link: '/admin/bookings' },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: ShoppingCart, color: 'bg-purple-500', link: '/admin/orders' },
    { label: 'Low Stock Items', value: stats.lowStockParts.length.toString(), icon: AlertTriangle, color: 'bg-red-500', link: '/admin/parts' },
    { label: 'New Messages', value: stats.newMessages.toString(), icon: MessageSquare, color: 'bg-cyan-500', link: '/admin/messages' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Link key={i} to={stat.link}>
            <Card hover className="p-5">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockParts.length > 0 && (
        <Card className="p-5 mb-8 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-red-900">Low Stock Alert</h3>
          </div>
          <div className="space-y-2">
            {stats.lowStockParts.slice(0, 5).map(part => (
              <div key={part.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{part.name}</span>
                <span className="text-red-600 font-semibold">{part.stock_quantity} left (min: {part.low_stock_threshold})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:text-amber-700">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{booking.service_name}</p>
                    <p className="text-xs text-gray-500">{booking.customer_name} · {booking.customer_phone}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:text-amber-700">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.items.length} item(s) · {formatMWK(Number(order.total))}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Payments</h3>
          <Link to="/admin/payments" className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:text-amber-700">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 6).map(payment => (
                  <tr key={payment.id} className="border-t border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{payment.customer_name}</td>
                    <td className="py-3 font-semibold text-gray-900">{formatMWK(Number(payment.amount))}</td>
                    <td className="py-3 text-gray-600 capitalize">{payment.method.replace('_', ' ')}</td>
                    <td className="py-3 text-gray-500">{formatDateTime(payment.created_at)}</td>
                    <td className="py-3"><StatusBadge status={payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
