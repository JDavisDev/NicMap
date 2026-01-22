import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Deal {
  id: number;
  storeName: string;
  product: string;
  originalPrice: number | null;
  salePrice: number;
  location: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  description: string;
  createdAt: string;
  upvotes: number;
}

interface MapViewProps {
  deals: Deal[];
  userLocation: { latitude: number; longitude: number } | null;
  onUpvote: (id: number) => void;
  onReport: (id: number) => void;
  upvotedDeals: Set<number>;
}

// Component to handle dynamic map view updates
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ deals, userLocation, onUpvote, onReport, upvotedDeals }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateSavings = (original: number | null, sale: number) => {
    if (!original || original <= sale) return null;
    return Math.round(((original - sale) / original) * 100);
  };

  // Default to US center if no location
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [39.8283, -98.5795];

  // Zoom 12 shows roughly a 5 mile radius - good for local deals
  const zoom = userLocation ? 12 : 4;

  const dealsWithCoords = deals.filter(d => d.latitude && d.longitude);

  if (dealsWithCoords.length === 0 && !userLocation) {
    return (
      <div className="map-container">
        <div className="map-empty">
          <p>No deals with location data to display on map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} className="deal-map">
        <MapController center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {dealsWithCoords.map(deal => (
          <Marker
            key={deal.id}
            position={[deal.latitude!, deal.longitude!]}
          >
            <Popup className="deal-popup">
              <div className="popup-content">
                <div className="popup-title-row">
                  <h3>{deal.product}</h3>
                  {deal.upvotes >= 3 && (
                    <span className="popup-verified">Verified</span>
                  )}
                </div>
                <div className="popup-store">{deal.storeName}</div>
                <div className="popup-location">
                  {deal.location}
                  {deal.distance !== undefined && ` (${deal.distance.toFixed(1)} mi)`}
                </div>
                <div className="popup-pricing">
                  {deal.originalPrice && (
                    <span className="popup-original">{formatPrice(deal.originalPrice)}</span>
                  )}
                  <span className="popup-sale">{formatPrice(deal.salePrice)}</span>
                  {calculateSavings(deal.originalPrice, deal.salePrice) && (
                    <span className="popup-savings">
                      {calculateSavings(deal.originalPrice, deal.salePrice)}% OFF
                    </span>
                  )}
                </div>
                <div className="popup-actions">
                  <button className="popup-report" onClick={() => onReport(deal.id)}>
                    Expired?
                  </button>
                  <button
                    className={`popup-upvote ${upvotedDeals.has(deal.id) ? 'upvoted' : ''}`}
                    onClick={() => onUpvote(deal.id)}
                    disabled={upvotedDeals.has(deal.id)}
                  >
                    &#9650; {deal.upvotes}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
