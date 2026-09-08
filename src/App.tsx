import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { RouterProvider, useRouter } from './lib/router';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/public/Navbar';
import { Footer } from './components/public/Footer';
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { PartsPage } from './pages/public/PartsPage';
import { ContactPage } from './pages/public/ContactPage';
import { BookingPage } from './pages/public/BookingPage';
import { AuthPage } from './pages/auth/AuthPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminParts } from './pages/admin/AdminParts';
import { AdminLogistics } from './pages/admin/AdminLogistics';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminTestimonials } from './pages/admin/AdminTestimonials';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function MotionSystem() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    const revealAll = () => document.querySelectorAll<HTMLElement>('.scroll-reveal').forEach(element => element.classList.add('is-revealed'));

    if (!('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 }
    );

    const observeReveals = () => {
      document.querySelectorAll<HTMLElement>('.scroll-reveal:not(.is-revealed)').forEach(element => observer.observe(element));
    };

    const frame = window.requestAnimationFrame(observeReveals);
    // Home-page content arrives after async Supabase requests. Watch for those newly-rendered
    // reveal elements so they cannot remain transparent after the first page render.
    const mutations = new MutationObserver(observeReveals);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="text-center">
        <img src="/logo.png" alt="SpeedFitment" className="w-14 h-14 rounded-xl object-contain mx-auto mb-4 animate-pulse" />
        <p className="text-gray-400 text-sm">Loading SpeedFitment...</p>
      </div>
    </div>
  );
}

function Routes() {
  const { path } = useRouter();
  const { profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (path === '/login') return <AuthPage mode="login" />;
  if (path === '/signup') return <AuthPage mode="signup" />;

  if (path.startsWith('/admin')) {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'cashier')) {
      return <AuthPage mode="login" />;
    }
    switch (path) {
      case '/admin': return <AdminDashboard />;
      case '/admin/bookings': return <AdminBookings />;
      case '/admin/orders': return <AdminOrders />;
      case '/admin/payments': return <AdminPayments />;
      case '/admin/services': return profile.role === 'admin' ? <AdminServices /> : <AdminDashboard />;
      case '/admin/parts': return profile.role === 'admin' ? <AdminParts /> : <AdminDashboard />;
      case '/admin/logistics': return profile.role === 'admin' ? <AdminLogistics /> : <AdminDashboard />;
      case '/admin/messages': return <AdminMessages />;
      case '/admin/testimonials': return profile.role === 'admin' ? <AdminTestimonials /> : <AdminDashboard />;
      case '/admin/users': return profile.role === 'admin' ? <AdminUsers /> : <AdminDashboard />;
      case '/admin/settings': return profile.role === 'admin' ? <AdminSettings /> : <AdminDashboard />;
      default: return <AdminDashboard />;
    }
  }

  if (path === '/dashboard') {
    if (!profile) return <AuthPage mode="login" />;
    return <CustomerDashboard />;
  }

  const cleanPath = path.split('?')[0];
  switch (cleanPath) {
    case '/': return <PublicLayout><HomePage /></PublicLayout>;
    case '/services': return <PublicLayout><ServicesPage /></PublicLayout>;
    case '/parts': return <PublicLayout><PartsPage /></PublicLayout>;
    case '/contact': return <PublicLayout><ContactPage /></PublicLayout>;
    case '/book': return <PublicLayout><BookingPage /></PublicLayout>;
    default: return <PublicLayout><HomePage /></PublicLayout>;
  }
}

function AppContent() {
  const { path } = useRouter();

  useEffect(() => {
    document.title = 'SpeedFitment — Premium Auto Services';
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <MotionSystem key={path} />
        <Routes key={path} />
      </ToastProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
