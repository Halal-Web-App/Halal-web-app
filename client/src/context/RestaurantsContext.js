import React, { useState, createContext, useEffect } from 'react';

export const RestaurantsContext = createContext();

export const RestaurantsContextProvider = (props) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    type: '',
    priceRange: [],
    minRating: 0,
    minHalalScore: 0,
    sort: 'halal_score_desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const addRestaurants = (restaurant) => {
    setRestaurants(prev => [...prev, restaurant]);
  };

  return (
    <RestaurantsContext.Provider
      value={{
        restaurants, setRestaurants, addRestaurants,
        selectedRestaurant, setSelectedRestaurant,
        filters, setFilters,
        pagination, setPagination,
        isLoading, setIsLoading,
        viewMode, setViewMode,
        darkMode, setDarkMode,
      }}
    >
      {props.children}
    </RestaurantsContext.Provider>
  );
};
