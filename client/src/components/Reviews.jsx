import React from 'react';
import StarRating from './StarRating';

const Reviews = ({ reviews = [] }) => {
  if (!reviews.length) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500">
        <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p className="font-medium">No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-cream-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-halal-100 dark:bg-halal-900 flex items-center justify-center">
                <span className="text-halal-700 dark:text-halal-400 text-sm font-bold">
                  {(review.name || 'A')[0].toUpperCase()}
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{review.name}</span>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.review}</p>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
