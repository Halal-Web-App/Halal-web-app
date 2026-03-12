import React, { useState } from 'react';
import Header from '../components/Header';
import AddRestaurant from '../components/AddRestaurant';
import RestaurantList from '../components/RestaurantList';
import FilterSidebar from '../components/FilterSidebar';
import { Toaster } from 'react-hot-toast';

const Home = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Toaster position="top-right" />
      <Header />
      <AddRestaurant />

      {/* Mobile filter button */}
      <div className="lg:hidden px-4 pt-4">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 btn-secondary text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex">
        <FilterSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
        <RestaurantList />
      </div>
    </div>
  );
};

export default Home;
