import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import HalalScoreBadge from './HalalScoreBadge';

const RestaurantCard = ({ restaurant, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const priceDisplay = restaurant.price_range
    ? '$'.repeat(restaurant.price_range)
    : null;

  const reviewCount = restaurant.review_count || restaurant.count || 0;
  const avgRating = restaurant.average_rating;

  return (
    <div
      className="group bg-cream-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-cream-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {restaurant.thumbnail && !imgError ? (
          <img
            src={restaurant.thumbnail}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-halal-700 to-halal-900">
            <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        {/* Halal score badge overlay */}
        <div className="absolute top-2 right-2">
          <HalalScoreBadge score={restaurant.halal_score} size="sm" showScore={false} />
        </div>
        {/* Score number overlay */}
        {restaurant.halal_score !== null && restaurant.halal_score !== undefined && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-white text-xs font-bold">{restaurant.halal_score}%</span>
            <span className="text-white/60 text-xs"> Halal</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1 line-clamp-1">
          {restaurant.name}
        </h3>

        {/* Cuisine type pill */}
        {restaurant.type && (
          <span className="inline-block text-xs bg-halal-50 dark:bg-halal-950 text-halal-700 dark:text-halal-300 px-2 py-0.5 rounded-full mb-2">
            {restaurant.type}
          </span>
        )}

        {/* Location */}
        <div className="flex items-start gap-1 text-gray-500 dark:text-gray-400 text-sm mb-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{restaurant.city || restaurant.location || 'Unknown location'}</span>
        </div>

        {/* Rating + price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {avgRating ? (
              <>
                <StarRating rating={avgRating} />
                <span className="text-gray-500 dark:text-gray-400 text-xs">({reviewCount})</span>
              </>
            ) : (
              <span className="text-gray-400 text-xs">No reviews yet</span>
            )}
          </div>
          {priceDisplay && (
            <span className="text-halal-700 dark:text-halal-400 font-semibold text-sm">{priceDisplay}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-cream-200 dark:border-gray-700">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(restaurant.id); }}
            className="flex-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-halal-700 dark:hover:text-halal-400 bg-gray-100 dark:bg-gray-700 hover:bg-halal-50 dark:hover:bg-halal-950 py-1.5 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete && onDelete(restaurant.id); }}
            className="flex-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-950 py-1.5 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
