import { Link } from '../../lib/router';
import { useServices } from '../../lib/hooks';
import { formatMWK } from '../../lib/supabase';
import { serviceImage, siteImages } from '../../lib/site-images';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, ArrowRight, Calendar, Wrench, Cog, Gauge, Car, Battery, Bell, Truck, ShieldCheck, Clock, DollarSign } from 'lucide-react';

const serviceIcons: Record<string, typeof Wrench> = {
  'Alignment': Gauge,
  'Diagnostics': Cog,
  'Bodywork': Car,
  'Electrical': Battery,
  'Security': Bell,
};

export function ServicesPage() {
  const { services, loading } = useServices();

  const guarantees = [
    { icon: ShieldCheck, title: 'Service Warranty', desc: 'Every service backed by our quality guarantee.' },
    { icon: Clock, title: 'On-Time Delivery', desc: 'We respect your schedule and deliver when promised.' },
    { icon: DollarSign, title: 'Transparent Pricing', desc: 'Upfront quotes with no hidden costs.' },
    { icon: Truck, title: 'Logistics Support', desc: 'Materials sourcing and delivery available.' },
  ];

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <section className="bg-gray-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src={siteImages.alignment} alt="" className="w-full h-full object-cover scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-brand-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-5 animate-fade-in-down">
            <Wrench className="h-3.5 w-3.5" />
            What We Offer
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white font-display animate-fade-in-up text-shadow-glow">Our Services</h1>
          <p className="mt-5 text-gray-300 max-w-2xl mx-auto text-lg animate-fade-in-up delay-200">Complete auto care solutions — professional automotive services backed by certified expertise.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28 bg-gray-50 min-h-[50vh] relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 animate-pulse h-[420px] shadow-soft" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {services.map((service, i) => {
                const Icon = serviceIcons[service.category] || Wrench;
                return (
                  <Card key={service.id} hover className="overflow-hidden group flex flex-col animate-fade-in-up">
                    <div style={{ animationDelay: `${i * 80}ms` }} className="relative h-56 overflow-hidden">
                      <img src={serviceImage(service.category, service.image_url)} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[800ms] ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-bold text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full group-hover:bg-black/60 transition-colors">{service.category}</span>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2.5 group-hover:bg-white/25 transition-all duration-500">
                          <Icon className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-sm font-bold text-white bg-brand-500 px-3.5 py-1.5 rounded-full shadow-lg group-hover:shadow-glow-brand transition-shadow duration-500">
                          {service.price_label || formatMWK(Number(service.price))}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-display group-hover:text-brand-700 transition-colors duration-300">{service.name}</h3>
                      <p className="text-sm text-gray-500 mb-5 leading-relaxed">{service.description}</p>
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {service.features.map((f, fi) => (
                          <li key={fi} className="flex items-center gap-2.5 text-sm text-gray-600 group/item">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link to={`/book?service=${service.id}`}>
                        <Button fullWidth className="sheen">
                          <Calendar className="h-4 w-4" />
                          Book This Service
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Guarantees strip */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guarantees.map((g, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-300">
                  <g.icon className="h-5 w-5 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-display group-hover:text-brand-700 transition-colors duration-300">{g.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-display text-shadow-glow">Can't find what you need?</h2>
          <p className="text-gray-400 mb-8 text-lg">Contact our team and we'll tailor a solution for your vehicle.</p>
          <Link to="/contact">
            <Button size="lg" className="shadow-glow-brand hover:shadow-glow-brand-lg">
              Get in Touch
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
