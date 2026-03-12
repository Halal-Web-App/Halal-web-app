import React, { useState, useContext } from 'react';
import { RestaurantsContext } from '../context/RestaurantsContext';
import DarkModeToggle from './DarkModeToggle';


const Header = () => {
  const { setFilters, setPagination } = useContext(RestaurantsContext);
  const [searchInput, setSearchInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, city: cityInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
    // Scroll to results
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="relative min-h-[480px] flex items-center overflow-hidden bg-halal-900">
      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/restaurant.mp4" type="video/mp4" />
      </video>

      {/* Geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0l7.5 7.5L45 0l7.5 7.5L60 0v7.5L52.5 15 60 22.5V30l-7.5 7.5L60 45v7.5L52.5 60H45l-7.5-7.5L30 60l-7.5-7.5L15 60H7.5L0 52.5V45l7.5-7.5L0 30v-7.5L7.5 15 0 7.5V0h7.5L15 7.5 22.5 0H30zm0 15l-7.5 7.5L15 15l-7.5 7.5V30l7.5 7.5L15 45l7.5 7.5L30 45l7.5 7.5L45 45l7.5-7.5L45 30l7.5-7.5L45 15l-7.5-7.5L30 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-halal-950/60 via-halal-900/70 to-halal-950/80" />

      {/* Dark mode toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Logo / Title */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-3">
            <span className="text-3xl font-bold text-white/90" style={{ fontFamily: 'serif' }}>حلال</span>
            <span className="w-px h-8 bg-white/30" />
            <span className="text-white/60 text-sm font-medium uppercase tracking-widest">Restaurant Finder</span>
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
          Find Halal Restaurants<br />
          <span className="text-halal-300">You Can Trust</span>
        </h1>
        <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
          Discover restaurants with verified halal confidence scores, community reports, and honest reviews.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Shawarma, biryani, halal food..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-halal-400 shadow-lg text-base"
            />
          </div>
          <div className="relative sm:w-52">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              placeholder="City"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-halal-400 shadow-lg text-base"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-halal-500 hover:bg-halal-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-halal-900/30 text-base"
          >
            Search
          </button>
        </form>

        {/* Score tier legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            { label: 'Highly Halal', color: '#02733E' },
            { label: 'Likely Halal', color: '#5B9E3A' },
            { label: 'Uncertain', color: '#D97706' },
            { label: 'Not Recommended', color: '#DC2626' },
          ].map(t => (
            <span key={t.label} className="flex items-center gap-1.5 text-white/70 text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
