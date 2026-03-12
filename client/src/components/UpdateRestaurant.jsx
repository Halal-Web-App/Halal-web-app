import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RestaurantFinder from '../apis/RestaurantFinder';
import toast from 'react-hot-toast';

const UpdateRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('2');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    RestaurantFinder.get(`/${id}`)
      .then(r => {
        const rest = r.data.data.restaurant;
        setName(rest.name || '');
        setLocation(rest.location || '');
        setPriceRange(String(rest.price_range || 2));
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load restaurant.');
        navigate('/');
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await RestaurantFinder.put(`/${id}`, {
        name,
        location,
        price_range: parseInt(priceRange),
      });
      toast.success('Restaurant updated!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to update restaurant.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Restaurant Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location *</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
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
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => navigate('/')} className="flex-1 btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UpdateRestaurant;
