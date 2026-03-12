import React, { useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { RestaurantsContext } from '../context/RestaurantsContext';
import { getScoreTier } from './HalalScoreBadge';

// Create custom colored markers based on halal score tier
function createMarkerIcon(tier) {
  const colors = {
    high:      '#02733E',
    likely:    '#5B9E3A',
    uncertain: '#D97706',
    low:       '#EA580C',
    poor:      '#DC2626',
    unknown:   '#9CA3AF',
  };
  const color = colors[tier] || colors.unknown;

  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;
      background:${color};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const MapView = () => {
  const { restaurants } = useContext(RestaurantsContext);
  const navigate = useNavigate();

  const restaurantsWithCoords = restaurants.filter(
    r => r.latitude && r.longitude
  );

  if (!restaurantsWithCoords.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No location data available.</p>
        <p className="text-gray-400 text-sm mt-1">Run the scraper to populate GPS coordinates.</p>
      </div>
    );
  }

  // Compute bounds center
  const avgLat = restaurantsWithCoords.reduce((s, r) => s + parseFloat(r.latitude), 0) / restaurantsWithCoords.length;
  const avgLng = restaurantsWithCoords.reduce((s, r) => s + parseFloat(r.longitude), 0) / restaurantsWithCoords.length;

  return (
    <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurantsWithCoords.map(r => {
          const { tier } = getScoreTier(r.halal_score);
          return (
            <Marker
              key={r.id}
              position={[parseFloat(r.latitude), parseFloat(r.longitude)]}
              icon={createMarkerIcon(tier)}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-bold text-gray-900 mb-1">{r.name}</p>
                  {r.type && <p className="text-gray-500 text-xs mb-1">{r.type}</p>}
                  {r.halal_score !== null && r.halal_score !== undefined && (
                    <p className="text-xs mb-2">
                      Halal Score: <strong style={{ color: getScoreTier(r.halal_score).color }}>{r.halal_score}%</strong>
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                    className="text-xs text-green-700 font-semibold hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
