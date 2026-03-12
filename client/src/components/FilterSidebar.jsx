import React, { useContext, useState, useEffect } from 'react';
import { RestaurantsContext } from '../context/RestaurantsContext';
import useDebounce from '../hooks/useDebounce';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1/restaurants';

const SORT_OPTIONS = [
  { value: 'halal_score_desc', label: 'Halal Score (Best First)' },
  { value: 'rating_desc',      label: 'Rating (Highest)' },
  { value: 'name_asc',         label: 'Name (A-Z)' },
  { value: 'price_asc',        label: 'Price (Low to High)' },
  { value: 'price_desc',       label: 'Price (High to Low)' },
  { value: 'newest',           label: 'Newest' },
];

const FilterSidebar = ({ isOpen, onClose }) => {
  const { filters, setFilters, setPagination } = useContext(RestaurantsContext);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [cities, setCities] = useState([]);
  const [types, setTypes] = useState([]);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    axios.get(`${API_BASE}/cities`).then(r => setCities(r.data.data.cities || [])).catch(() => {});
    axios.get(`${API_BASE}/types`).then(r => setTypes(r.data.data.types || [])).catch(() => {});
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const togglePrice = (val) => {
    const current = filters.priceRange || [];
    const next = current.includes(val)
      ? current.filter(v => v !== val)
      : [...current, val];
    updateFilter('priceRange', next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', city: '', type: '', priceRange: [], minRating: 0, minHalalScore: 0, sort: 'halal_score_desc' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.search || filters.city || filters.type ||
    (filters.priceRange && filters.priceRange.length) || filters.minRating > 0 || filters.minHalalScore > 0;

  const content = (
    <div className="space-y-6 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-halal-700 dark:text-halal-400 hover:underline font-medium">
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search</label>
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Restaurant name, cuisine..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">City</label>
        <select
          value={filters.city || ''}
          onChange={e => updateFilter('city', e.target.value)}
          className="input-field"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Cuisine Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuisine Type</label>
        <select
          value={filters.type || ''}
          onChange={e => updateFilter('type', e.target.value)}
          className="input-field"
        >
          <option value="">All Cuisines</option>
          {types.slice(0, 50).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(val => (
            <button
              key={val}
              onClick={() => togglePrice(val)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                (filters.priceRange || []).includes(val)
                  ? 'bg-halal-700 border-halal-700 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-halal-500'
              }`}
            >
              {'$'.repeat(val)}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Min Rating: <span className="text-halal-700 dark:text-halal-400">{filters.minRating > 0 ? `${filters.minRating}★` : 'Any'}</span>
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.minRating || 0}
          onChange={e => updateFilter('minRating', parseFloat(e.target.value))}
          className="w-full accent-halal-700"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Any</span><span>5★</span>
        </div>
      </div>

      {/* Min Halal Score */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Min Halal Score: <span className="text-halal-700 dark:text-halal-400">{filters.minHalalScore > 0 ? `${filters.minHalalScore}%` : 'Any'}</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minHalalScore || 0}
          onChange={e => updateFilter('minHalalScore', parseInt(e.target.value))}
          className="w-full accent-halal-700"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Any</span><span>100%</span>
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
        <select
          value={filters.sort || 'halal_score_desc'}
          onChange={e => updateFilter('sort', e.target.value)}
          className="input-field"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 bg-cream-50 dark:bg-gray-900 border-r border-cream-200 dark:border-gray-800 overflow-y-auto sticky top-0 h-screen">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative ml-auto w-80 bg-cream-50 dark:bg-gray-900 h-full overflow-y-auto shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
