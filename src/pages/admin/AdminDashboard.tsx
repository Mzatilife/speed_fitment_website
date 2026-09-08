import { useMemo, useState } from 'react';
import { Link } from '../../lib/router';
import { useBookings, useOrders, usePayments, useParts, useMessages } from '../../lib/hooks';
import { formatMWK, formatDateTime } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Activity, AlertTriangle, ArrowRight, Calendar, CheckCircle2, ClipboardList, DollarSign, Inbox, Package, Plus, RefreshCw, ShoppingCart } from 'lucide-react';

type ActivityItem = { id: string; title: string; detail: string; createdAt: string; status: string; href: string; icon: typeof Calendar; tone: string };

export function AdminDashboard() {
  const { bookings, loading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { payments, loading: paymentsLoading, refetch: refetchPayments } = usePayments();
  const { parts, loading: partsLoading, refetch: refetchParts } = useParts();
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const paid = payments.filter(payment => payment.status === 'paid');
    const todayRevenue = paid.filter(payment => new Date(payment.created_at) >= today).reduce((sum, payment) => sum + Number(payment.amount), 0);
    const revenueByDay = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
      const nextDate = new Date(date); nextDate.setDate(nextDate.getDate() + 1);
      const value = paid.filter(payment => { const createdAt = new Date(payment.created_at); return createdAt >= date && createdAt < nextDate; }).reduce((sum, payment) => sum + Number(payment.amount), 0);
      return { label: date.toLocaleDateString('en-US', { weekday: 'narrow' }), value };
    });
    const settled = bookings.filter(booking => !['pending', 'confirmed', 'in_progress'].includes(booking.status));
    return {
      todayRevenue,
      totalRevenue: paid.reduce((sum, payment) => sum + Number(payment.amount), 0),
      openBookings: bookings.filter(booking => ['pending', 'confirmed', 'in_progress'].includes(booking.status)),
      openOrders: orders.filter(order => ['pending', 'paid'].includes(order.status)),
      lowStockParts: parts.filter(part => part.stock_quantity <= part.low_stock_threshold),
      newMessages: messages.filter(message => message.status === 'new').length,
      completionRate: settled.length ? Math.round((settled.filter(booking => booking.status === 'completed').length / settled.length) * 100) : 0,
      revenueByDay,
    };
  }, [bookings, messages, orders, parts, payments]);

  const activity = useMemo<ActivityItem[]>(() => [
    ...bookings.map(booking => ({ id: `booking-${booking.id}`, title: booking.service_name, detail: `Booking · ${booking.customer_name}`, createdAt: booking.created_at, status: booking.status, href: '/admin/bookings', icon: Calendar, tone: 'bg-blue-50 text-blue-600' })),
    ...orders.map(order => ({ id: `order-${order.id}`, title: order.customer_name, detail: `Order · ${order.items.length} item${order.items.length === 1 ? '' : 's'} · ${formatMWK(Number(order.total))}`, createdAt: order.created_at, status: order.status, href: '/admin/orders', icon: ShoppingCart, tone: 'bg-violet-50 text-violet-600' })),
    ...payments.map(payment => ({ id: `payment-${payment.id}`, title: formatMWK(Number(payment.amount)), detail: `Payment · ${payment.customer_name}`, createdAt: payment.created_at, status: payment.status, href: '/admin/payments', icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 7), [bookings, orders, payments]);

  const isLoading = bookingsLoading || ordersLoading || paymentsLoading || partsLoading || messagesLoading;
  const maxRevenue = Math.max(...stats.revenueByDay.map(day => day.value), 1);
  const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const refreshDashboard = async () => { setRefreshing(true); await Promise.all([refetchBookings(), refetchOrders(), refetchPayments(), refetchParts(), refetchMessages()]); setRefreshing(false); };
  const metricCards = [
    { label: "Today's revenue", value: formatMWK(stats.todayRevenue), note: 'Paid transactions today', icon: DollarSign, href: '/admin/payments', tone: 'bg-emerald-500' },
    { label: 'Open bookings', value: stats.openBookings.length.toString(), note: 'Require scheduling or action', icon: Calendar, href: '/admin/bookings', tone: 'bg-blue-500' },
    { label: 'Open orders', value: stats.openOrders.length.toString(), note: 'Awaiting fulfilment', icon: ShoppingCart, href: '/admin/orders', tone: 'bg-violet-500' },
    { label: 'Customer messages', value: stats.newMessages.toString(), note: 'Unread enquiries', icon: Inbox, href: '/admin/messages', tone: 'bg-amber-500' },
  ];

  return <AdminLayout title="Operations dashboard">
    <section className="rounded-3xl bg-gray-950 p-6 md:p-8 text-white relative overflow-hidden mb-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" /><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Control centre</p><h2 className="mt-2 text-2xl md:text-3xl font-extrabold font-display">A clear view of today’s operations.</h2><p className="mt-2 text-sm text-gray-400">{todayLabel} · Monitor sales, bookings, inventory, and customer requests from one place.</p></div><div className="flex flex-wrap gap-2"><Link to="/admin/bookings"><Button size="sm"><Plus className="h-4 w-4" />New booking</Button></Link><Link to="/admin/payments"><Button size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/20">Record payment</Button></Link><Button size="sm" variant="ghost" onClick={refreshDashboard} loading={refreshing} className="text-gray-300 hover:bg-white/10 hover:text-white"><RefreshCw className="h-4 w-4" />Refresh</Button></div></div>
    </section>

    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">{metricCards.map(metric => <Link key={metric.label} to={metric.href} className="group"><Card hover className="p-5 h-full"><div className="flex items-start justify-between gap-3"><div className={`w-11 h-11 rounded-xl ${metric.tone} flex items-center justify-center shadow-lg shadow-gray-200/60`}><metric.icon className="h-5 w-5 text-white" /></div><ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" /></div><p className="mt-5 text-2xl font-extrabold text-gray-950 tracking-tight">{metric.value}</p><p className="mt-1 font-semibold text-sm text-gray-800">{metric.label}</p><p className="mt-1 text-xs text-gray-500">{metric.note}</p></Card></Link>)}</section>

    <section className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
      <Card className="p-6 xl:col-span-3"><div className="flex items-center justify-between gap-4 mb-7"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Revenue movement</p><h3 className="mt-1 text-lg font-bold text-gray-900">Last 7 days</h3></div><Link to="/admin/payments" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View payments</Link></div><div className="h-48 flex items-end gap-2 sm:gap-4">{stats.revenueByDay.map(day => <div key={day.label} className="h-full flex-1 min-w-0 flex flex-col justify-end gap-2 group"><div className="relative flex-1 flex items-end"><div title={`${day.label}: ${formatMWK(day.value)}`} style={{ height: `${Math.max((day.value / maxRevenue) * 100, day.value ? 8 : 2)}%` }} className="w-full min-h-[4px] rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 group-hover:from-brand-600 group-hover:to-brand-400 transition-all duration-300" /></div><p className="text-center text-[11px] font-semibold text-gray-400">{day.label}</p></div>)}</div><div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between"><span className="text-sm text-gray-500">Total collected</span><span className="text-lg font-extrabold text-gray-900">{formatMWK(stats.totalRevenue)}</span></div></Card>
      <Card className="p-6 xl:col-span-2"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Service delivery</p><h3 className="mt-1 text-lg font-bold text-gray-900">Booking completion</h3></div><div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div></div><div className="mt-8 flex items-end gap-5"><p className="text-5xl font-extrabold text-gray-950 tracking-tight">{stats.completionRate}%</p><p className="pb-1 text-sm text-gray-500">completed<br />closed bookings</p></div><div className="mt-6 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${stats.completionRate}%` }} /></div><Link to="/admin/bookings" className="mt-7 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"><span>{stats.openBookings.length} booking{stats.openBookings.length === 1 ? '' : 's'} in progress</span><ArrowRight className="h-4 w-4" /></Link></Card>
    </section>

    <section className="grid grid-cols-1 xl:grid-cols-5 gap-6"><Card className="p-6 xl:col-span-3"><div className="flex items-center justify-between mb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Live activity</p><h3 className="mt-1 text-lg font-bold text-gray-900">Latest business activity</h3></div><Activity className="h-5 w-5 text-gray-400" /></div>{isLoading ? <div className="py-12 text-center text-sm text-gray-400">Loading dashboard data…</div> : activity.length === 0 ? <div className="py-12 text-center"><ClipboardList className="h-8 w-8 text-gray-300 mx-auto mb-3" /><p className="text-sm font-medium text-gray-500">No activity yet</p><p className="mt-1 text-xs text-gray-400">New bookings, orders, and payments will appear here.</p></div> : <div className="divide-y divide-gray-100">{activity.map(item => <Link key={item.id} to={item.href} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 group"><div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${item.tone}`}><item.icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p><p className="text-xs text-gray-500 truncate">{item.detail} · {formatDateTime(item.createdAt)}</p></div><StatusBadge status={item.status} /><ArrowRight className="hidden sm:block h-4 w-4 text-gray-300 group-hover:translate-x-0.5 group-hover:text-gray-600 transition-all" /></Link>)}</div>}</Card>
      <div className="xl:col-span-2 space-y-6"><Card className={`p-6 ${stats.lowStockParts.length ? 'border-red-200 bg-red-50/50' : ''}`}><div className="flex items-start justify-between gap-4"><div><p className={`text-xs font-bold uppercase tracking-[0.16em] ${stats.lowStockParts.length ? 'text-red-500' : 'text-gray-400'}`}>Inventory attention</p><h3 className="mt-1 text-lg font-bold text-gray-900">Low stock items</h3></div><div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stats.lowStockParts.length ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{stats.lowStockParts.length ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</div></div>{stats.lowStockParts.length ? <><div className="mt-5 space-y-3">{stats.lowStockParts.slice(0, 3).map(part => <div key={part.id} className="flex items-center justify-between gap-3 text-sm"><span className="font-medium text-gray-700 truncate">{part.name}</span><span className="shrink-0 font-bold text-red-600">{part.stock_quantity} left</span></div>)}</div><Link to="/admin/parts" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800">Manage inventory <ArrowRight className="h-4 w-4" /></Link></> : <p className="mt-5 text-sm text-gray-500">All inventory is above its reorder level.</p>}</Card><Card className="p-5 bg-gradient-to-br from-brand-500 to-brand-400 border-0 text-gray-950"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center"><Package className="h-5 w-5" /></div><div><p className="font-bold">Keep the catalogue current</p><p className="mt-1 text-sm text-gray-800/80">Add stock, update prices, or feature your best-selling parts.</p></div></div><Link to="/admin/parts" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold hover:underline">Open parts inventory <ArrowRight className="h-4 w-4" /></Link></Card></div>
    </section>
  </AdminLayout>;
}
