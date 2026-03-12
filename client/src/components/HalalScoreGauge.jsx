import React, { useEffect, useState } from 'react';
import { getScoreTier } from './HalalScoreBadge';

const breakdownLabels = {
  serviceOptions:    'Service Options',
  restaurantType:    'Cuisine Type',
  nameKeywords:      'Name Keywords',
  reviewAnalysis:    'Review Analysis',
  userReports:       'Community Reports',
  certificationBonus:'Certification',
};

const HalalScoreGauge = ({ score, breakdown }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { label, color } = getScoreTier(score);

  useEffect(() => {
    if (score === null || score === undefined) return;
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center p-6">
        <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <span className="text-gray-400 text-sm font-medium">Unrated</span>
        </div>
      </div>
    );
  }

  // SVG arc gauge
  const radius = 54;
  // circumference = Math.PI * radius (used in CSS arc calculation)
  

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Gauge */}
      <div className="relative">
        <svg width="160" height="90" viewBox="0 0 160 90">
          {/* Background track */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="14"
            strokeLinecap="round"
            className="dark:stroke-gray-700"
          />
          {/* Score arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(animatedScore / 100) * 220} 220`}
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white leading-none">
            {animatedScore}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>

      {/* Tier label */}
      <div className="text-center">
        <span
          className="inline-block text-sm font-semibold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      </div>

      {/* Breakdown */}
      {breakdown && Object.keys(breakdown).filter(k => k !== 'baseline').length > 0 && (
        <div className="w-full max-w-xs space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
            Score Breakdown
          </p>
          {Object.entries(breakdown)
            .filter(([key]) => key !== 'baseline')
            .map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300 text-xs">
                  {breakdownLabels[key] || key}
                </span>
                <span
                  className={`font-semibold text-xs ${
                    val > 0 ? 'text-green-600' : val < 0 ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </span>
              </div>
            ))}
          <div className="flex items-center justify-between gap-2 text-sm border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
            <span className="text-gray-700 dark:text-gray-200 text-xs font-semibold">Baseline</span>
            <span className="font-semibold text-xs text-gray-500">+{breakdown.baseline || 30}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalalScoreGauge;
