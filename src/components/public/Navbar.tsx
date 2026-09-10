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
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

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
  const useSurface = scrolled || mobileOpen || !isHome;

  return (
    <header className={`fixed inset-x-0 top-0 z-[70] w-full max-w-full overflow-x-clip transition-all duration-500 ${useSurface ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.06),0_12px_36px_rgba(15,23,42,0.06)] border-b border-slate-200/70' : 'bg-transparent'}`}>
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-2.5 group">
            <div className="relative">
              <img src="/logo.png" alt="Speed Fitment and service center" className="w-11 h-11 rounded-xl object-contain group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 ease-out" />
              <div className="absolute inset-0 bg-brand-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
            <div className="min-w-0 flex flex-col leading-none">
              <span className={`truncate text-lg font-extrabold tracking-tight font-display transition-colors duration-500 ${isHome && !useSurface ? 'text-white' : 'text-slate-950'}`}>Speed Fitment</span>
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-500 ${isHome && !useSurface ? 'text-white/75' : 'text-slate-500'}`}>and service center</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${path === link.to
                  ? (isHome && !useSurface ? 'text-white bg-white/15' : 'text-red-700 bg-amber-50')
                  : (isHome && !useSurface ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-950 hover:bg-amber-50/70')}`}
              >
                {link.label}
                {path === link.to && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-5 bg-red-600 rounded-full" />
                )}
              </Link>
            ))}
            <Link to="/book" className={`ml-2 relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1 group ${isHome && !useSurface ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:text-red-700'}`}>
              Book Now
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Desktop Actions — discreet access */}
          <div className="hidden lg:flex items-center gap-2">
            {profile ? (
              <>
                {(profile.role === 'admin' || profile.role === 'cashier') && (
                  <Link to="/admin" className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="Dashboard (Alt+D)">
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}
                {profile.role === 'customer' && (
                  <Link to="/dashboard" className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="My Account (Alt+D)">
                    <User className="h-5 w-5" />
                  </Link>
                )}
                <button onClick={handleSignOut} className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all active:scale-90" title="Sign out">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="Sign In (Alt+L)">
                <Lock className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="lg:hidden relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 text-slate-900 shadow-sm backdrop-blur-md transition-all hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-95"
            onClick={() => setMobileOpen(open => !open)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl shadow-slate-900/10">
          <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${path === link.to ? 'text-red-700 bg-amber-50' : 'text-slate-700 hover:bg-amber-50'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/book" className="block px-4 py-3 text-sm font-semibold text-white bg-slate-950 rounded-xl mt-2 text-center">
              Book Appointment
            </Link>
            <div className="pt-3 mt-2 border-t border-slate-200">
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
