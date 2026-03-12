import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RestaurantsContext } from '../context/RestaurantsContext';
import RestaurantFinder from '../apis/RestaurantFinder';
import StarRating from '../components/StarRating';
import Reviews from '../components/Reviews';
import HalalScoreGauge from '../components/HalalScoreGauge';
import HalalScoreBadge from '../components/HalalScoreBadge';
import HalalReportModal from '../components/HalalReportModal';
import toast, { Toaster } from 'react-hot-toast';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedRestaurant } = useContext(RestaurantsContext);

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Review form state
  const [name, setName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = async () => {
    try {
      const response = await RestaurantFinder.get(`/${id}`);
      const data = response.data.data;
      setRestaurant(data.restaurant);
      setReviews(data.reviews || []);
      setSelectedRestaurant(data);
    } catch (err) {
      toast.error('Could not load restaurant.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!name || !reviewText || !rating) {
      toast.error('Please fill in all review fields.');
      return;
    }
    setSubmittingReview(true);
    try {
      await RestaurantFinder.post(`/${id}/addReview`, { name, review: reviewText, rating });
      toast.success('Review submitted!');
      setName('');
      setReviewText('');
      setRating('');
      // Refetch to get updated score and reviews
      await fetchData();
    } catch (err) {
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-gray-950 animate-pulse">
        <div className="h-72 bg-gray-300 dark:bg-gray-800" />
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const hours = restaurant.operating_hours || {};
  const serviceOpts = restaurant.service_options || {};

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Toaster position="top-right" />

      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-halal-900">
        {restaurant.thumbnail && (
          <img
            src={restaurant.thumbnail}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-5xl mx-auto">
            {restaurant.type && (
              <span className="inline-block text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full mb-3">
                {restaurant.type}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4">
              {restaurant.average_rating && (
                <div className="flex items-center gap-2">
                  <StarRating rating={restaurant.average_rating} />
                  <span className="text-white/80 text-sm">
                    {restaurant.average_rating} ({restaurant.review_count || 0} reviews)
                  </span>
                </div>
              )}
              <HalalScoreBadge score={restaurant.halal_score} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info card */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Restaurant Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restaurant.address && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-halal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">Address</p>
                      <p className="text-sm">{restaurant.address}</p>
                    </div>
                  </div>
                )}
                {restaurant.phone_number && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-halal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">Phone</p>
                      <p className="text-sm">{restaurant.phone_number}</p>
                    </div>
                  </div>
                )}
                {restaurant.website && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-halal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">Website</p>
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-halal-600 dark:text-halal-400 hover:underline truncate block max-w-[200px]">
                        {restaurant.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
                {restaurant.price_range && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-halal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">Price</p>
                      <p className="text-sm font-semibold text-halal-700 dark:text-halal-400">
                        {'$'.repeat(restaurant.price_range)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service options */}
              {Object.keys(serviceOpts).length > 0 && (
                <div className="mt-4 pt-4 border-t border-cream-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-2">Service Options</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(serviceOpts).map(([k, v]) => (
                      v !== null && v !== undefined && (
                        <span key={k} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          v === true ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : v === false ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {k.replace(/_/g, ' ')}{typeof v === 'boolean' ? (v ? ' ✓' : ' ✗') : `: ${v}`}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operating Hours */}
            {Object.keys(hours).length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-lg mb-4">Hours</h2>
                <div className="space-y-1.5">
                  {Object.entries(hours).map(([day, time]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{day}</span>
                      <span className="text-gray-500 dark:text-gray-400">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-bold text-xl mb-4">Reviews</h2>
              <Reviews reviews={reviews} />
            </div>

            {/* Add Review Form */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Leave a Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Rating *</label>
                    <select
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select rating</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Review *</label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Share your experience... mention if it's zabiha, no alcohol served, etc."
                    className="input-field resize-none"
                    required
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full sm:w-auto disabled:opacity-50">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right column: Halal Score */}
          <div className="space-y-4">
            {/* Halal Score card */}
            <div className="card p-6 text-center">
              <h2 className="font-bold text-lg mb-4">Halal Score</h2>
              <HalalScoreGauge
                score={restaurant.halal_score}
                breakdown={restaurant.halal_score_breakdown}
              />
              <div className="mt-4 pt-4 border-t border-cream-200 dark:border-gray-700">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report Halal Status
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Help the community by reporting your experience.
                </p>
              </div>
            </div>

            {/* Score disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Halal scores are community-estimated based on available signals. Always verify with the restaurant directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Halal Report Modal */}
      <HalalReportModal
        restaurantId={id}
        restaurantName={restaurant.name}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
};

export default RestaurantDetailPage;
