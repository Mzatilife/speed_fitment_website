import { Link } from '../../lib/router';
import { useServices, useLogistics, useSettings, useTestimonials } from '../../lib/hooks';
import { formatMWK } from '../../lib/supabase';
import { serviceImage, siteImages } from '../../lib/site-images';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Calendar, Search, Wrench, ShieldCheck, Clock, DollarSign,
  CheckCircle2, ArrowRight, Cog, Car, Battery, Bell, Truck,
  Sparkles, Gauge, Users, Award, Zap, Star, Phone, Quote,
} from 'lucide-react';

const serviceIcons: Record<string, typeof Wrench> = {
  'Alignment': Gauge,
  'Diagnostics': Cog,
  'Bodywork': Car,
  'Electrical': Battery,
  'Security': Bell,
};

export function HomePage() {
  const { services } = useServices();
  const { logistics } = useLogistics();
  const { settings } = useSettings();
  const { testimonials } = useTestimonials();

  const workflow = [
    { num: '01', title: 'Book Appointment', desc: 'Schedule your service online or call us — available 24/7.', tags: ['Online Booking', '24/7 Phone Support', 'Flexible Scheduling'], icon: Calendar },
    { num: '02', title: 'Vehicle Inspection', desc: 'A thorough diagnostic check by our expert team.', tags: ['Multi-Point Inspection', 'Digital Reports', 'Detailed Assessment'], icon: Search },
    { num: '03', title: 'Service Execution', desc: 'Expert repairs and maintenance by certified technicians.', tags: ['Skilled Technicians', 'Quality Parts', 'Progress Updates'], icon: Wrench },
    { num: '04', title: 'Quality Check', desc: 'Final inspection and testing before delivery.', tags: ['Comprehensive Testing', 'Quality Assurance', 'Service Warranty'], icon: ShieldCheck },
  ];

  const whyChooseUs = [
    { icon: Users, title: 'Expert Technicians', desc: 'Our certified technicians bring years of experience to every service.', tags: ['Certified Professionals', 'Continuous Training', 'Specialized Expertise'] },
    { icon: ShieldCheck, title: 'Quality Guarantee', desc: 'We stand behind our work with comprehensive service guarantees.', tags: ['Service Warranty', 'Quality Parts', 'Satisfaction Guaranteed'] },
    { icon: Zap, title: 'Quick Service', desc: 'Efficient service delivery without compromising on quality.', tags: ['Same-Day Service', 'Express Options', 'Timely Completion'] },
    { icon: DollarSign, title: 'Competitive Pricing', desc: 'Transparent pricing with no hidden costs or surprises.', tags: ['Upfront Quotes', 'Price Match', 'Flexible Options'] },
  ];

  const stats = [
    { icon: Award, label: 'Certified Experts', value: '15+' },
    { icon: Car, label: 'Vehicles Served', value: '5,000+' },
    { icon: Clock, label: 'Years Experience', value: '12' },
  ];

  const trustItems = [
    { icon: ShieldCheck, text: 'Service Warranty' },
    { icon: Zap, text: 'Same-Day Service' },
    { icon: Users, text: 'Certified Technicians' },
    { icon: DollarSign, text: 'Transparent Pricing' },
    { icon: Award, text: '5,000+ Vehicles Served' },
  ];

  return (
    <div className="speed-home bg-white">
      {/* Hero */}
      <section className="speed-hero relative min-h-[42rem] md:min-h-[46rem] flex items-center bg-gray-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings?.hero_image || siteImages.hero}
            alt="Auto workshop"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/88 to-gray-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" />
        </div>

        {/* Ambient glows */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-brand-600/10 rounded-full blur-[100px]" />

        {/* Animated workshop telemetry */}
        <div className="hero-orb w-[560px] h-[560px] -right-40 top-1/2 -translate-y-1/2" />
        <div className="hero-orb w-[370px] h-[370px] -right-16 top-1/2 -translate-y-1/2" style={{ animationDirection: 'reverse', animationDuration: '11s' }} />
        <div className="speed-line top-[22%] w-72" />
        <div className="speed-line top-[63%] w-96" style={{ animationDelay: '-2.4s', animationDuration: '6.5s' }} />
        <div className="speed-line top-[79%] w-52" style={{ animationDelay: '-4.1s', animationDuration: '4.8s' }} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.02] animate-fade-in-up font-display text-shadow-glow">
              Expert Auto Care<br />
              <span className="animate-shimmer-text">Done Right</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed animate-fade-in-up delay-200">
              {settings?.about || 'Experience excellence in automotive care with our comprehensive services — from precision alignment to expert bodywork.'}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <Link to="/book">
                <Button size="lg" className="shadow-glow-brand hover:shadow-glow-brand-lg sheen">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm sheen">
                  View Services
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 animate-fade-in delay-500">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-500">
                    <stat.icon className="h-5 w-5 text-brand-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-white font-display">{stat.value}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md animate-fade-in delay-700">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(item => <span key={item} className="h-7 w-7 rounded-full border-2 border-gray-950 bg-gradient-to-br from-brand-300 to-brand-600" />)}
              </div>
              <p className="text-xs text-gray-300"><span className="font-bold text-white">Trusted by 5,000+</span> drivers across Malawi</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-7 h-12 border-2 border-white/20 rounded-full flex items-start justify-center pt-2.5">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="speed-trust-bar bg-gray-900 border-y border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
        <div className="relative max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 md:gap-14">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-gray-300 group cursor-default">
                <item.icon className="h-5 w-5 text-brand-500 group-hover:scale-110 group-hover:text-brand-400 transition-all duration-300" />
                <span className="text-sm font-medium group-hover:text-white transition-colors">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="speed-section speed-surface py-16 md:py-20 bg-gray-50 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-50 rounded-full blur-3xl opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="speed-section-intro text-center mb-10 md:mb-12 scroll-reveal">
            <div className="eyebrow bg-brand-100 text-brand-700 mb-4">
              <Wrench className="h-3.5 w-3.5" />
              Our Services
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">Complete Auto Care Solutions</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">Professional automotive services for your vehicle, backed by certified expertise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map((service, i) => {
              const Icon = serviceIcons[service.category] || Wrench;
              return (
              <Card key={service.id} hover className="speed-service-card overflow-hidden group scroll-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                  <div style={{ animationDelay: `${i * 80}ms` }} className="relative h-56 overflow-hidden">
                    <img src={serviceImage(service.category, service.image_url)} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[800ms] ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="text-sm font-bold text-gray-900 bg-gradient-to-br from-brand-300 to-brand-500 px-3.5 py-1.5 rounded-full shadow-lg group-hover:shadow-glow-brand transition-shadow duration-500">
                        {service.price_label || formatMWK(Number(service.price))}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2.5 group-hover:bg-white/25 transition-all duration-500">
                        <Icon className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white font-display">{service.name}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    <ul className="space-y-2.5 mb-5">
                      {service.features.slice(0, 4).map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2.5 text-sm text-gray-600 group/item">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/book" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 group/btn">
                      Book Now
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="speed-section speed-workflow py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-50 rounded-full blur-3xl opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="speed-section-intro text-center mb-10 md:mb-12 scroll-reveal">
            <div className="eyebrow bg-brand-100 text-brand-700 mb-4">
              <Cog className="h-3.5 w-3.5" />
              Our Workflow
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">The Service Journey</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">Experience our streamlined service process from start to finish.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {workflow.map((step, i) => (
              <div key={i} className="relative scroll-reveal group" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="absolute -top-3 -left-3 w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-glow-brand z-10 font-display group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {step.num}
                </div>
                <Card hover className="speed-workflow-card p-6 pt-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors duration-500">
                    <step.icon className="h-6 w-6 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">{step.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{step.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.tags.map((tag, ti) => (
                      <span key={ti} className="text-xs font-medium text-gray-600 bg-gray-100 group-hover:bg-brand-50 group-hover:text-brand-700 px-2.5 py-1 rounded-md transition-colors duration-300">{tag}</span>
                    ))}
                  </div>
                </Card>
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3.5 w-7 h-0.5 bg-gradient-to-r from-brand-300 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics Section */}
      <section className="speed-section speed-logistics py-16 md:py-20 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent-500/5 rounded-full blur-[100px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="speed-section-intro text-center mb-10 md:mb-12 scroll-reveal">
              <div className="eyebrow bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-4">
                <Truck className="h-3.5 w-3.5" />
                Logistics
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white font-display">Construction Materials &amp; Logistics</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">Quality construction materials and reliable logistics services.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {logistics.map((item, i) => (
                <div
                  key={item.id}
                  className="speed-logistics-card bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-brand-500/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow-brand scroll-reveal group"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-400/20 to-brand-600/20 border border-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-brand-500/40 transition-all duration-500">
                    <Truck className="h-7 w-7 text-brand-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 font-display">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                  <p className="text-sm font-bold text-brand-400">{item.price > 0 ? formatMWK(Number(item.price)) : 'Custom Quote'}</p>
                </div>
              ))}
              {logistics.length === 0 && (
                <div className="col-span-full rounded-2xl border border-white/15 bg-white/5 px-6 py-8 text-center text-sm text-white/75">
                  Material sourcing and delivery options are available on request. Contact our team for a custom quote.
                </div>
              )}
            </div>
          </div>
      </section>

      {/* Why Choose Us */}
      <section className="speed-section speed-surface py-16 md:py-20 bg-gray-50 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="speed-section-intro text-center mb-10 md:mb-12 scroll-reveal">
            <div className="eyebrow bg-brand-100 text-brand-700 mb-4">
              <Award className="h-3.5 w-3.5" />
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">The Speed Fitment Difference</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">Experience premium auto care with our expert team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {whyChooseUs.map((item, i) => (
              <Card key={i} hover className="speed-benefit-card p-8 text-center group scroll-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div style={{ animationDelay: `${i * 100}ms` }} className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
                    <item.icon className="h-8 w-8 text-brand-600" />
                  </div>
                  <div className="absolute inset-0 bg-brand-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {item.tags.map((tag, ti) => (
                    <span key={ti} className="text-xs font-medium text-gray-600 bg-gray-100 group-hover:bg-brand-50 group-hover:text-brand-700 px-2.5 py-1 rounded-md transition-colors duration-300">{tag}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — only shown when there are published customer reviews */}
      {testimonials.length > 0 && (
      <section className="speed-section speed-testimonials py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-accent-50 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="speed-section-intro text-center mb-10 md:mb-12">
            <div className="eyebrow bg-brand-100 text-brand-700 mb-4">
              <Star className="h-3.5 w-3.5" />
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-display">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => (
                <Card key={t.id} hover className="speed-testimonial-card p-8 relative animate-fade-in-up group">
                  <div style={{ animationDelay: `${i * 120}ms` }}>
                    <Quote className="h-10 w-10 text-brand-200 mb-4 group-hover:text-brand-300 transition-colors duration-500" />
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, ri) => (
                        <Star key={ri} className="h-4 w-4 text-brand-500 fill-brand-500 group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${ri * 50}ms` }} />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="speed-cta py-16 md:py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-transparent to-accent-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-500/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 font-display text-shadow-glow">
            Ready to Experience<br /><span className="animate-shimmer-text">Premium Auto Care?</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
            Book your appointment today and let our expert team take care of your vehicle.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/book">
              <Button size="lg" className="shadow-glow-brand hover:shadow-glow-brand-lg sheen">
                <Calendar className="h-5 w-5" />
                Schedule Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/15 backdrop-blur-sm sheen">
                <Phone className="h-5 w-5" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
