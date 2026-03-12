import React from 'react';

const SkeletonCard = () => (
  <div className="bg-cream-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-cream-200 dark:border-gray-700 animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="flex gap-2 mt-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
