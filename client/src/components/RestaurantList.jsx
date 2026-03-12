import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantFinder from '../apis/RestaurantFinder';
import { RestaurantsContext } from '../context/RestaurantsContext';
import RestaurantCard from './RestaurantCard';
import SkeletonCard from './SkeletonCard';
import MapView from './MapView';
import ViewToggle from './ViewToggle';
import Pagination from './Pagination';
import toast from 'react-hot-toast';

const RestaurantList = () => {
  const navigate = useNavigate();
  const {
    restaurants, setRestaurants,
    filters, pagination, setPagination,
    isLoading, setIsLoading,
    viewMode,
  } = useContext(RestaurantsContext);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
        if (filters.search) params.set('search', filters.search);
        if (filters.city) params.set('city', filters.city);
        if (filters.type) params.set('type', filters.type);
        if (filters.priceRange && filters.priceRange.length) params.set('price_range', filters.priceRange.join(','));
        if (filters.minRating > 0) params.set('min_rating', filters.minRating);
        if (filters.minHalalScore > 0) params.set('min_halal_score', filters.minHalalScore);
        if (filters.sort) params.set('sort', filters.sort);

        const response = await RestaurantFinder.get(`/?${params}`);
        setRestaurants(response.data.data.restaurants);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages,
        }));
      } catch (err) {
        toast.error('Failed to load restaurants.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters, pagination.page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      await RestaurantFinder.delete(`/${id}`);
      setRestaurants(restaurants.filter(r => r.id !== id));
      toast.success('Restaurant deleted.');
    } catch (err) {
      toast.error('Failed to delete restaurant.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/restaurants/${id}/update`);
  };

  return (
    <div id="results" className="flex-1 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? (
              <span className="inline-block h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <span className="font-semibold text-gray-800 dark:text-white">{pagination.total}</span> halal restaurants found
              </>
            )}
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Map view */}
      {viewMode === 'map' && <MapView />}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No restaurants found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                Try adjusting your filters or searching for a different term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {restaurants.map(restaurant => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <Pagination />
        </>
      )}
    </div>
  );
};

export default RestaurantList;
