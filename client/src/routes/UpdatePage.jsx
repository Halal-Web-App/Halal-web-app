import React from 'react';
import { useNavigate } from 'react-router-dom';
import UpdateRestaurant from '../components/UpdateRestaurant';

const UpdatePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-halal-700 dark:text-halal-400 font-medium mb-6 hover:underline text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to restaurants
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Update Restaurant</h1>
        <UpdateRestaurant />
      </div>
    </div>
  );
};

export default UpdatePage;