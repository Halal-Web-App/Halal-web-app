import React from 'react';

export function getScoreTier(score) {
  if (score === null || score === undefined) return { label: 'Unrated', tier: 'unknown', color: '#9CA3AF' };
  if (score >= 85) return { label: 'Highly Halal', tier: 'high', color: '#02733E' };
  if (score >= 65) return { label: 'Likely Halal', tier: 'likely', color: '#5B9E3A' };
  if (score >= 45) return { label: 'Uncertain', tier: 'uncertain', color: '#D97706' };
  if (score >= 25) return { label: 'Low Confidence', tier: 'low', color: '#EA580C' };
  return { label: 'Not Recommended', tier: 'poor', color: '#DC2626' };
}

const tierClasses = {
  high:      'bg-green-700 text-white',
  likely:    'bg-green-600 text-white',
  uncertain: 'bg-amber-600 text-white',
  low:       'bg-orange-600 text-white',
  poor:      'bg-red-600 text-white',
  unknown:   'bg-gray-400 text-white',
};

const HalalScoreBadge = ({ score, size = 'md', showScore = true }) => {
  const { label, tier } = getScoreTier(score);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${sizeClasses[size]} ${tierClasses[tier]}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      {label}
      {showScore && score !== null && score !== undefined && (
        <span className="opacity-80 font-normal">({score}%)</span>
      )}
    </span>
  );
};

export default HalalScoreBadge;
