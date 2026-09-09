import { useState, ReactNode } from 'react';
import { Link, useRouter } from '../../lib/router';
import { useAuth, roleLabel } from '../../lib/auth';
import { LayoutDashboard, Package, Calendar, ShoppingCart, DollarSign, MessageSquare, Users, Settings, LogOut, Menu, X, Truck, Cog, Home, Quote } from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', to: '/admin/bookings', icon: Calendar },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Payments', to: '/admin/payments', icon: DollarSign },
  { label: 'Services', to: '/admin/services', icon: Cog },
  { label: 'Parts Inventory', to: '/admin/parts', icon: Package },
  { label: 'Logistics', to: '/admin/logistics', icon: Truck },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
  { label: 'Testimonials', to: '/admin/testimonials', icon: Quote, adminOnly: true },
  { label: 'Staff & Users', to: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Settings', to: '/admin/settings', icon: Settings, adminOnly: true },
];

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { path, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems.filter(item => !item.adminOnly || profile?.role === 'admin');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fff7ed] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-[#3f0d0d] text-gray-300 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-20 right-0 w-48 h-48 bg-accent-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative p-5 border-b border-white/5 flex items-center justify-between gap-3">
          <Link to="/admin" className="flex items-center gap-3 min-w-0" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.png" alt="SpeedFitment" className="w-11 h-11 rounded-xl object-contain" />
            <div>
              <span className="text-base font-extrabold text-white block leading-none font-display">SpeedFitment</span>
              <span className="text-[10px] text-brand-400 font-medium tracking-widest uppercase mt-1 block">Admin Panel</span>
            </div>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden w-10 h-10 shrink-0 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white flex items-center justify-center" aria-label="Close admin navigation">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {items.map(item => {
            const isActive = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                {item.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 bg-accent-300 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="relative p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-300 to-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-brand-400">{profile ? roleLabel(profile.role) : ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Home className="h-4 w-4" /> Site
            </Link>
            <button onClick={handleSignOut} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
          <a href="https://mahala.graduatemw.com" target="_blank" rel="noreferrer" className="mt-4 block text-center text-[10px] text-gray-600 hover:text-brand-400 transition-colors">
            Developed by Mahala Mkwepu
          </a>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-brand-950/70 backdrop-blur-sm lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 border-b border-brand-100 sticky top-0 z-30 glass">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden inline-flex w-11 h-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-95 transition-all" aria-label="Open admin navigation" aria-expanded={sidebarOpen}>
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-900 font-display">{title}</h1>
            </div>
            <Link to="/" className="text-sm text-gray-500 hover:text-brand-600 font-medium flex items-center gap-1.5 group transition-colors">
              <Home className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export { X };
