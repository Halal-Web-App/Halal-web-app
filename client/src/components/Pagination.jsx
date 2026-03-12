import React, { useContext } from 'react';
import { RestaurantsContext } from '../context/RestaurantsContext';

const Pagination = () => {
  const { pagination, setPagination } = useContext(RestaurantsContext);
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const goTo = (p) => {
    if (p < 1 || p > totalPages) return;
    setPagination(prev => ({ ...prev, page: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page numbers to show
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{startItem}–{endItem}</span> of{' '}
        <span className="font-medium text-gray-700 dark:text-gray-200">{total}</span> restaurants
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-gray-500 hover:text-halal-700 hover:bg-halal-50 dark:hover:bg-halal-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((p, i) => (
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                p === page
                  ? 'bg-halal-700 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-halal-50 dark:hover:bg-halal-950 hover:text-halal-700'
              }`}
            >
              {p}
            </button>
          )
        ))}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg text-gray-500 hover:text-halal-700 hover:bg-halal-50 dark:hover:bg-halal-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
