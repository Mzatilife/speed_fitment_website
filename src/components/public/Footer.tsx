import { Link } from '../../lib/router';
import { useSettings } from '../../lib/hooks';
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, ArrowRight, ChevronRight } from 'lucide-react';

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-950 text-gray-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 invert" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA strip */}
        <div className="py-10 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white font-display">Ready to get started?</h3>
              <p className="text-sm text-gray-400 mt-1.5">Book your appointment today — our expert team is standing by.</p>
            </div>
            <Link to="/book" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap">
              Book Appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Main footer */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo.png" alt="Speed Fitment and service center" className="w-11 h-11 rounded-xl object-contain" />
              <div>
                <span className="text-lg font-extrabold text-white tracking-tight block leading-none font-display">Speed Fitment</span>
                <span className="text-[10px] font-semibold text-gray-400 tracking-wide block mt-1">and service center</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {settings?.about || 'Experience excellence in automotive care with our comprehensive services — from precision alignment to expert bodywork.'}
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.18em] mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Services', to: '/services' },
                { label: 'Parts', to: '/parts' },
                { label: 'Book', to: '/book' },
                { label: 'Contact', to: '/contact' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-brand-400 transition-colors inline-flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.18em] mb-5">Our Services</h3>
            <ul className="space-y-3">
              {['3D Computer Alignment', 'Car Diagnostics', 'Panel Beating & Painting', 'Car Batteries', 'Car Alarms & Security'].map(s => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-gray-400 hover:text-brand-400 transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.18em] mb-5">Get In Touch</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{settings?.phone || '(+265) 456-7890'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{settings?.email || 'support@speedfitment.com'}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">{settings?.address || '123 AutoCare St, Car City'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400 space-y-0.5">
                  <p>Mon–Fri: {settings?.hours?.mon_fri || '8:00 AM – 6:00 PM'}</p>
                  <p>Sat: {settings?.hours?.sat || '9:00 AM – 4:00 PM'}</p>
                  <p>Sun: {settings?.hours?.sun || 'Closed'}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} SpeedFitment. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs text-gray-500">Premium Auto Services &amp; Logistics</p>
            <a href="https://mahala.graduatemw.com" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-brand-400 transition-colors">Developed by Mahala Mkwepu</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
