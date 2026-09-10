import { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Wrench, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';
import { siteImages } from '../../lib/site-images';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { navigate } = useRouter();
  const { profile, loading, signIn, signUp } = useAuth();
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapMode, setBootstrapMode] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('is_bootstrap_mode');
      setBootstrapMode(!!data);
      setCheckingBootstrap(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'admin' || profile.role === 'cashier') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      show('Please fill in all fields', 'error');
      return;
    }
    if (mode === 'signup' && !fullName) {
      show('Please enter your full name', 'error');
      return;
    }

    setSubmitting(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        show(error, 'error');
      } else {
        show('Welcome back!', 'success');
      }
    } else {
      const { error } = await signUp(email, password, fullName, phone);
      if (error) {
        show(error, 'error');
      } else {
        show('Admin account created! You are now signed in.', 'success');
      }
    }
    setSubmitting(false);
  };

  const showSignup = mode === 'signup' && bootstrapMode && !checkingBootstrap;
  const showLogin = mode === 'login' || (!bootstrapMode && !checkingBootstrap);

  if (checkingBootstrap) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl mb-4 shadow-glow-brand">
            <Wrench className="h-9 w-9 text-gray-900" />
          </div>
          <div className="flex items-center gap-1.5 justify-center text-gray-500">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'signup' && !bootstrapMode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src={siteImages.hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-950/70" />
        </div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px]" />

        <div className="relative w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl mb-4 shadow-glow-brand">
              <Wrench className="h-9 w-9 text-gray-900" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">Speed Fitment</h1>
            <p className="text-xs text-gray-400 mt-1">and service center</p>
          </div>
          <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-elev p-8 text-center">
            <div className="w-16 h-16 bg-brand-500/15 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="h-8 w-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 font-display">Sign Up Unavailable</h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              New accounts are created by the administrator. Please contact your administrator to get an account, or sign in if you already have one.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/login')} fullWidth size="lg">
                Go to Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-sm text-gray-500 hover:text-white transition-colors">
                ← Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isBootstrapSignup = showSignup;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-25">
        <img src={siteImages.hero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gray-950/75" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl mb-4 shadow-glow-brand">
            <Wrench className="h-9 w-9 text-gray-900" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">Speed Fitment</h1>
          <p className="text-xs text-gray-400 mt-1">and service center</p>
          <p className="text-sm text-gray-400 mt-1.5">
            {isBootstrapSignup ? 'Create the admin account' : 'Sign in to your account'}
          </p>
          {isBootstrapSignup && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mt-4 bg-brand-500/10 border border-brand-500/30 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <p className="text-xs text-brand-400">First-run setup — this will be the system admin</p>
            </div>
          )}
        </div>

        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-elev p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isBootstrapSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(+265) 000-0000"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={submitting} className="mt-2">
              {isBootstrapSignup ? 'Create Admin Account' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {showLogin && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account? Contact your administrator.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
