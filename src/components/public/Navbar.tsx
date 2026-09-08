import { useState, useEffect } from 'react';
import { Link, useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { Menu, X, LayoutDashboard, LogOut, User, ArrowRight, Lock } from 'lucide-react';

export function Navbar() {
  const { path, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); navigate('/login'); }
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (profile?.role === 'admin' || profile?.role === 'cashier') navigate('/admin');
        else if (profile?.role === 'customer') navigate('/dashboard');
        else navigate('/login');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profile, navigate]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'Parts', to: '/parts' },
    { label: 'Contact', to: '/contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isHome = path === '/';
  const useDarkBg = scrolled || mobileOpen || !isHome;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${useDarkBg ? 'glass-premium shadow-2xl shadow-black/30 border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img src="/logo.png" alt="SpeedFitment" className="w-11 h-11 rounded-xl object-contain group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 ease-out" />
              <div className="absolute inset-0 bg-brand-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold text-white tracking-tight font-display">SpeedFitment</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${path === link.to ? 'text-brand-400' : 'text-gray-300 hover:text-white'}`}
              >
                {link.label}
                {path === link.to && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-6 bg-gradient-to-r from-transparent via-brand-400 to-transparent rounded-full" />
                )}
              </Link>
            ))}
            <Link to="/book" className="ml-2 relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 group">
              Book Now
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Desktop Actions — discreet access */}
          <div className="hidden md:flex items-center gap-2">
            {profile ? (
              <>
                {(profile.role === 'admin' || profile.role === 'cashier') && (
                  <Link to="/admin" className="p-2 text-gray-400 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-all active:scale-90" title="Dashboard (Alt+D)">
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}
                {profile.role === 'customer' && (
                  <Link to="/dashboard" className="p-2 text-gray-400 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-all active:scale-90" title="My Account (Alt+D)">
                    <User className="h-5 w-5" />
                  </Link>
                )}
                <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all active:scale-90" title="Sign out">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="p-2 text-gray-400 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-all active:scale-90" title="Sign In (Alt+L)">
                <Lock className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-premium border-t border-white/[0.06] animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${path === link.to ? 'text-brand-400 bg-white/5' : 'text-gray-200 hover:bg-white/10'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/book" className="block px-4 py-3 text-sm font-semibold text-gray-900 bg-brand-500 rounded-xl mt-2 text-center">
              Book Appointment
            </Link>
            <div className="pt-3 mt-2 border-t border-white/10">
              {profile ? (
                <>
                  {(profile.role === 'admin' || profile.role === 'cashier') && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  )}
                  {profile.role === 'customer' && (
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400">
                      <User className="h-4 w-4" /> My Account
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400 w-full text-left">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400">
                  <Lock className="h-4 w-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
