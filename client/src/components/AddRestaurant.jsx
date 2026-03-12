import React, { useState, useContext } from 'react';
import RestaurantFinder from '../apis/RestaurantFinder';
import { RestaurantsContext } from '../context/RestaurantsContext';
import toast from 'react-hot-toast';

const AddRestaurant = () => {
  const { addRestaurants } = useContext(RestaurantsContext);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      toast.error('Name and location are required.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await RestaurantFinder.post('/', {
        name,
        location,
        price_range: parseInt(priceRange),
      });
      addRestaurants(response.data.data.restaurant);
      setName('');
      setLocation('');
      setPriceRange('2');
      setIsOpen(false);
      toast.success('Restaurant added!');
    } catch (err) {
      toast.error('Failed to add restaurant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-cream-200 dark:border-gray-800 bg-cream-50 dark:bg-gray-900 px-6 py-4">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 text-halal-700 dark:text-halal-400 font-semibold hover:text-halal-800 transition-colors text-sm"
      >
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add a Restaurant
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-3 items-end animate-fade-in">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Restaurant name"
              className="input-field"
              required
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Location *</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Address or city"
              className="input-field"
              required
            />
          </div>
          <div className="w-36">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Price Range</label>
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
              className="input-field"
            >
              <option value="1">$ Budget</option>
              <option value="2">$$ Moderate</option>
              <option value="3">$$$ Pricey</option>
              <option value="4">$$$$ Expensive</option>
              <option value="5">$$$$$ Luxury</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add'}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddRestaurant;
