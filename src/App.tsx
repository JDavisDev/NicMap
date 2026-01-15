import React, { useState, useEffect, useCallback } from 'react';
import DealForm from './components/DealForm';
import DealList from './components/DealList';
import MapView from './components/MapView';
import './App.css';

interface Deal {
  id: number;
  storeName: string;
  product: string;
  originalPrice: number | null;
  salePrice: number;
  location: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  description: string;
  createdAt: string;
  upvotes: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied' | 'zip'>('pending');
  const [zipInput, setZipInput] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Get user location from browser or zip code
  const getUserLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationStatus('granted');
        },
        () => {
          // User denied or error - prompt for zip code
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  // Geocode zip code to get coordinates
  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipInput.match(/^\d{5}$/)) return;

    try {
      const response = await fetch(`/api/geocode/${zipInput}`);
      if (response.ok) {
        const data = await response.json();
        setUserLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          state: data.state
        });
        setLocationStatus('zip');
      }
    } catch (error) {
      console.error('Error geocoding zip:', error);
    }
  };

  const fetchDeals = useCallback(async () => {
    try {
      let url = '/api/deals';
      if (userLocation) {
        url += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=30`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    if (locationStatus !== 'pending') {
      fetchDeals();
    }
  }, [fetchDeals, locationStatus, userLocation]);

  const handleUpvote = async (id: number) => {
    try {
      const response = await fetch(`/api/deals/${id}/upvote`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to upvote');
      const updatedDeal = await response.json();
      setDeals(prev =>
        prev.map(deal => (deal.id === id ? updatedDeal : deal))
      );
    } catch (error) {
      console.error('Error upvoting deal:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>NicMap</h1>
        <p>Find and share nicotine deals in your area</p>
        {locationStatus === 'pending' && (
          <div className="location-status">Checking your location...</div>
        )}
        {locationStatus === 'denied' && !userLocation && (
          <form onSubmit={handleZipSubmit} className="zip-form">
            <label>Enter your zip code to see nearby deals:</label>
            <div className="zip-input-group">
              <input
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                placeholder="e.g., 78701"
                maxLength={5}
                pattern="\d{5}"
              />
              <button type="submit">Find Deals</button>
            </div>
          </form>
        )}
        {userLocation && (
          <div className="location-status location-active">
            Showing deals within 30 miles
            {userLocation.city && ` of ${userLocation.city}, ${userLocation.state}`}
          </div>
        )}
      </header>
      <main className="app-main">
        <DealForm onDealSubmitted={fetchDeals} />

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
        </div>

        {viewMode === 'list' ? (
          <DealList deals={deals} loading={loading} onUpvote={handleUpvote} />
        ) : (
          <MapView deals={deals} userLocation={userLocation} onUpvote={handleUpvote} />
        )}
      </main>
      <footer className="app-footer">
        <p>Share deals responsibly. Must be 21+ to purchase nicotine products.</p>
      </footer>
    </div>
  );
}

export default App;
