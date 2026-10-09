import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight, Loader2, Scale, Clock } from 'lucide-react';
import { Product } from '../types';
import { searchShopifyProducts, getShopifyConfig } from '../services/shopify';

const RECENT_SEARCHES_KEY = 'lifei_recent_searches';
const MAX_RECENT_SEARCHES = 8;

const getSavedRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
  } catch (err) {
    console.warn('Error reading recent searches:', err);
    return [];
  }
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products,
  comparisonIds = [],
  onToggleComparison,
}) => {
  const [query, setQuery] = useState('');
  const [isSearchingShopify, setIsSearchingShopify] = useState(false);
  const [shopifyResults, setShopifyResults] = useState<Product[] | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getSavedRecentSearches());

  const activeCatalog = products || [];
  const config = getShopifyConfig();

  const trendingTags = ['PDRN Pink', 'EGF NAD', 'Kojic Acid', 'Bio-Collagen', 'Pore Pads', 'Ceramides'];

  // Refresh recent searches when opening modal
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getSavedRecentSearches());
    }
  }, [isOpen]);

  const saveRecentSearch = (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean || clean.length < 2) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent search:', e);
      }
      return updated;
    });
  };

  const handleRemoveRecent = (termToRemove: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update recent searches:', e);
      }
      return updated;
    });
  };

  const handleClearAllRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  };

  // Local filter over active catalog
  const localResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return activeCatalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.keyIngredients.some((ing) => ing.toLowerCase().includes(q)) ||
        p.clinicalClaim.toLowerCase().includes(q)
    );
  }, [query, activeCatalog]);

  // Live Shopify Storefront API search when connected
  useEffect(() => {
    setShopifyResults(null);
    setIsSearchingShopify(false);
    if (!isOpen || !config.isConnected || !query.trim() || query.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchingShopify(true);
      try {
        const res = await searchShopifyProducts(query.trim(), 8);
        if (!cancelled) setShopifyResults(res || []);
      } catch (err) {
        console.warn('Shopify live search error:', err);
      } finally {
        if (!cancelled) setIsSearchingShopify(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, config.isConnected, isOpen]);

  const results = shopifyResults ?? localResults;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-8 animate-in fade-in duration-150 font-inter"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative mt-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-3">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                saveRecentSearch(query);
              }
            }}
            placeholder="Search by ingredient (PDRN, NAD+), formula, or skin concern..."
            className="flex-1 text-sm sm:text-base outline-none placeholder:text-slate-400 text-slate-900 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* Recent Searches & Trending Suggestions when query is empty */}
          {!query && (
            <div>
              {/* Recent Searches Section */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} className="text-[#EC3460]" />
                      RECENT SEARCHES
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllRecents}
                      className="text-[11px] text-slate-400 hover:text-[#EC3460] font-medium transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="group inline-flex items-center gap-1.5 bg-slate-50 hover:bg-[#FFF0F9] border border-slate-200/80 hover:border-[#FFCDF2] px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-[#B31940] transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            saveRecentSearch(term);
                          }}
                          className="cursor-pointer flex items-center gap-1.5"
                        >
                          <Clock size={11} className="text-slate-400 group-hover:text-[#EC3460] transition-colors" />
                          <span>{term}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRecent(term);
                          }}
                          className="text-slate-400 hover:text-[#EC3460] p-0.5 rounded-full hover:bg-slate-200/60 cursor-pointer ml-0.5 transition-colors"
                          aria-label={`Remove recent search ${term}`}
                          title="Remove from history"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#EC3460]" />
                TRENDING K-BEAUTY SEARCHES
              </span>
              <div className="flex flex-wrap gap-2 mb-8">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      saveRecentSearch(tag);
                    }}
                    className="text-xs bg-[#FFF0F9] border border-[#FFCDF2] hover:bg-[#EC3460] hover:text-white text-[#B31940] px-3.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                POPULAR FORMULAS
              </span>
              <div className="space-y-3">
                {activeCatalog.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/50 flex items-center justify-center" style={{ backgroundColor: prod.panel }}>
                        <img src={prod.src} alt={prod.name} className="w-full h-full object-cover object-center" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase text-slate-900">{prod.name}</h4>
                        <span className="text-[11px] text-slate-500">{prod.subtitle}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-900">{prod.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {query && isSearchingShopify && (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-[#EC3460] font-medium">
              <Loader2 size={16} className="animate-spin" />
              <span>Searching Shopify Storefront catalog...</span>
            </div>
          )}

          {query && !isSearchingShopify && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  FOUND {results.length} RESULTS FOR "{query}"
                </span>
                {config.isConnected && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    Shopify Live
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {results.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (query.trim()) saveRecentSearch(query);
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-rose-50/50 border border-slate-200/60 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200/50 flex items-center justify-center" style={{ backgroundColor: prod.panel }}>
                        <img src={prod.src} alt={prod.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase text-slate-900 group-hover:text-rose-600 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{prod.subtitle}</p>
                        <div className="flex gap-1 mt-1">
                          {prod.keyIngredients.slice(0, 2).map((ing, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-slate-900">{prod.price}</span>
                      {onToggleComparison && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComparison(prod.id);
                          }}
                          className={`p-2 rounded-xl transition-all cursor-pointer border ${
                            comparisonIds.includes(prod.id)
                              ? 'bg-[#EC3460] text-white border-[#EC3460]'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-[#EC3460]'
                          }`}
                          title="Add to comparison"
                        >
                          <Scale size={14} />
                        </button>
                      )}
                      <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">
                No matching Korean skincare formulas found for "{query}".
              </p>
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-xs font-semibold text-rose-600 underline cursor-pointer"
              >
                Clear search and view all formulas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
