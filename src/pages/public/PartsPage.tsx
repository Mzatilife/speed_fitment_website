import { useState, useMemo } from 'react';
import { Link } from '../../lib/router';
import { useParts } from '../../lib/hooks';
import { formatMWK } from '../../lib/supabase';
import { partImage, siteImages } from '../../lib/site-images';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { ShoppingCart, Search, Star, Flame, Tag, Sparkles, Package, Wrench, ArrowRight, X } from 'lucide-react';

type SortOption = 'featured' | 'price_low' | 'price_high' | 'newest';
type FilterOption = 'all' | 'new_arrivals' | 'best_sellers' | 'on_sale' | 'popular';

export function PartsPage() {
  const { parts, loading } = useParts();
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState<SortOption>('featured');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(parts.map(p => p.category)));
    return ['All Categories', ...cats];
  }, [parts]);

  const filteredParts = useMemo(() => {
    let result = [...parts].filter(p => p.is_active);

    if (category !== 'All Categories') {
      result = result.filter(p => p.category === category);
    }

    if (filter === 'new_arrivals') result = result.filter(p => p.is_new_arrival);
    else if (filter === 'best_sellers') result = result.filter(p => p.is_best_seller);
    else if (filter === 'on_sale') result = result.filter(p => p.is_on_sale);
    else if (filter === 'popular') result = result.filter(p => p.is_featured);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'price_low': result.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_high': result.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: result.sort((a, b) => a.sort_order - b.sort_order);
    }

    return result;
  }, [parts, category, sort, filter, search]);

  const filterTabs: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All Parts' },
    { key: 'new_arrivals', label: 'New Arrivals' },
    { key: 'best_sellers', label: 'Best Sellers' },
    { key: 'on_sale', label: 'On Sale' },
    { key: 'popular', label: 'Popular' },
  ];

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <section className="bg-gray-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src={siteImages.tyreStock} alt="" className="w-full h-full object-cover scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-brand-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow bg-brand-500/10 border border-brand-500/30 text-brand-400 mb-5 animate-fade-in-down">
            <Package className="h-3.5 w-3.5" />
            Parts Catalog
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white font-display animate-fade-in-up text-shadow-glow">Quality Parts, Built to Last</h1>
          <p className="mt-5 text-gray-300 max-w-2xl mx-auto text-lg animate-fade-in-up delay-200">Discover premium parts for your vehicle — sourced from trusted manufacturers and backed by our quality guarantee.</p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-12 md:py-16 bg-gray-50 min-h-[60vh] relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${filter === tab.key ? 'bg-gray-900 text-white shadow-soft' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category + Sort + Search */}
          <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search parts by name, description, or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-gray-300 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="md:w-auto">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Select value={category} onChange={e => setCategory(e.target.value)} className="md:w-56">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={sort} onChange={e => setSort(e.target.value as SortOption)} className="md:w-56">
              <option value="featured">Sort by: Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </Select>
          </form>

          {/* Results count */}
          <div className="mb-6 text-sm text-gray-500">
            {loading ? 'Loading…' : `${filteredParts.length} part${filteredParts.length !== 1 ? 's' : ''} found`}
          </div>

          {/* Parts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 animate-pulse h-96 shadow-soft" />)}
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No parts found matching your filters.</p>
              <button onClick={() => { setSearch(''); setFilter('all'); setCategory('All Categories'); }} className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-semibold">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredParts.map((part, i) => (
                <Card key={part.id} hover className="overflow-hidden group flex flex-col animate-fade-in-up">
                  <div style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }} className="relative h-48 overflow-hidden bg-gray-100">
                    <img src={partImage(part.category, part.image_url)} alt={part.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[700ms] ease-out" />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {part.is_new_arrival && <Badge color="blue"><Sparkles className="h-3 w-3 mr-1" />New</Badge>}
                      {part.is_best_seller && <Badge color="amber"><Flame className="h-3 w-3 mr-1" />Best Seller</Badge>}
                      {part.is_on_sale && <Badge color="red"><Tag className="h-3 w-3 mr-1" />Sale</Badge>}
                    </div>
                    {part.stock_quantity <= 0 ? (
                      <div className="absolute top-2.5 right-2.5">
                        <Badge color="red">Out of Stock</Badge>
                      </div>
                    ) : part.stock_quantity <= part.low_stock_threshold ? (
                      <div className="absolute top-2.5 right-2.5">
                        <Badge color="amber">Low Stock</Badge>
                      </div>
                    ) : null}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-[0.15em] mb-1.5 group-hover:text-brand-700 transition-colors">{part.category}</span>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 font-display group-hover:text-brand-700 transition-colors duration-300">{part.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1 leading-relaxed">{part.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-extrabold text-gray-900 font-display">{formatMWK(Number(part.price))}</span>
                      {part.is_featured && <Star className="h-4 w-4 text-brand-500 fill-brand-500" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>SKU: {part.sku || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" />{part.stock_quantity} in stock</span>
                    </div>
                    <Link to={`/book?part=${part.id}`}>
                      <Button fullWidth size="sm" disabled={part.stock_quantity <= 0} className="sheen">
                        <ShoppingCart className="h-4 w-4" />
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-500/10 border border-brand-500/30 rounded-full mb-5">
            <Wrench className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-medium text-brand-400">Need help choosing?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-display text-shadow-glow">Not sure which part fits?</h2>
          <p className="text-gray-400 mb-8 text-lg">Our experts will help you find the right part for your vehicle.</p>
          <Link to="/contact">
            <Button size="lg" className="shadow-glow-brand hover:shadow-glow-brand-lg">
              Ask Our Team
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
