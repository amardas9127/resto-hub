import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Search,
  BookOpen,
  Grid,
  Sparkles,
  LogIn,
  LayoutDashboard,
  ChefHat,
  Coffee,
  Pizza,
  Cake,
  Flame,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const categoryIcons = {
  All: Sparkles,
  Starters: Pizza,
  'Main Course': Flame,
  Mains: Flame,
  Breads: UtensilsCrossed,
  Desserts: Cake,
  Beverages: Coffee,
};

export default function PublicMenuBook() {
  const { menuItems = [] } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Extract categories dynamically from menuItems matching Supabase DB
  const defaultCategories = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];
  const loadedCategories = Array.from(
    new Set((menuItems || []).map(item => item.category).filter(Boolean))
  );
  const categories = Array.from(new Set([...defaultCategories, ...loadedCategories]));

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('book'); // 'book' | 'grid'
  const [selectedItem, setSelectedItem] = useState(null);

  const availableItems = (menuItems || []).filter(item => item.available !== false);

  const filtered = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category for Book view
  const groupedByCategory = categories.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-900">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <UtensilsCrossed className="w-6 h-6 text-stone-950 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                RestroHub
              </h1>
              <p className="text-xs text-stone-400 font-medium tracking-wide">DIGITAL MENU BOOK</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search delicious dishes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700/80 rounded-full pl-10 pr-4 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode Toggle - Visible on all devices */}
          <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setViewMode('book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'book'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className='lg:block hidden'>Menu Book</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className='lg:block hidden'>Grid View</span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700/80 rounded-full pl-10 pr-4 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </header>

      {/* Hero Intro */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Gourmet Dining Experience
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-amber-100 leading-tight">
            Our Culinary Menu
          </h2>
          <p className="text-stone-400 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Crafted with fresh ingredients, rich spices, and authentic recipes. Flip through our digital menu book to discover your next favorite meal.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="max-w-5xl mx-auto mt-8 flex items-center justify-center gap-2 flex-wrap">
          {['All', ...categories].map(cat => {
            const IconComponent = categoryIcons[cat] || Sparkles;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/60'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-amber-400'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ChefHat className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-lg font-semibold text-stone-300">No items found</h3>
            <p className="text-sm text-stone-500">Try searching for a different dish name or category.</p>
          </div>
        ) : viewMode === 'book' ? (
          /* ============================================================ */
          /* MENU BOOK STYLE (Classic Two-Page / Section Layout)          */
          /* ============================================================ */
          <div className="space-y-12">
            {Object.entries(groupedByCategory).map(([categoryName, items]) => (
              <div
                key={categoryName}
                className="bg-stone-950/60 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Section Title */}
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-stone-800">
                  <div className="w-3 h-8 rounded-full bg-amber-500" />
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 tracking-wide">
                    {categoryName}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                    {items.length} items
                  </span>
                </div>

                {/* Items Grid for Book */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="group cursor-pointer flex gap-4 p-4 rounded-2xl bg-stone-900/50 hover:bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-sm"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-800 flex-shrink-0 relative">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif font-bold text-stone-100 text-base sm:text-lg group-hover:text-amber-300 transition-colors">
                              {item.name}
                            </h4>
                            <span className="text-base sm:text-lg font-bold text-amber-400 flex-shrink-0">
                              ₹{item.price}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                            Freshly prepared {item.name.toLowerCase()} with authentic spices and chef special seasoning.
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
                          <span className="inline-flex items-center gap-1 text-amber-500/80 font-medium group-hover:text-amber-400">
                            Tap to view dish details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ============================================================ */
          /* GRID CARD STYLE VIEW                                         */
          /* ============================================================ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
              >
                <div className="h-48 w-full bg-stone-800 relative overflow-hidden">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md text-amber-400 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/30">
                    ₹{item.price}
                  </div>
                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-stone-300 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-serif font-bold text-stone-100 text-lg group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      Chef special prepared fresh with quality ingredients.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-amber-500">
                    <span className="font-medium">View full photo & details</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Item Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 relative animate-scale-up">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-64 sm:h-72 w-full bg-stone-800 relative">
              <img
                src={selectedItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
            </div>

            <div className="p-6 space-y-4 relative -mt-6 bg-stone-900 rounded-t-3xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {selectedItem.category}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-stone-100 mt-0.5">
                    {selectedItem.name}
                  </h3>
                </div>
                <span className="text-2xl font-bold text-amber-400">
                  ₹{selectedItem.price}
                </span>
              </div>

              <p className="text-stone-300 text-sm leading-relaxed">
                Enjoy our delicious {selectedItem.name}. Expertly crafted with authentic flavors, premium ingredients, and served hot to your table.
              </p>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Freshly Prepared
                </span>
                <span>RestroHub Menu</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-8 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} RestroHub Restaurant & Cafe. All rights reserved.</p>
      </footer>
    </div>
  );
}
