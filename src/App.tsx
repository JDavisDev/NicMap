import React, { useState, useEffect, useCallback } from 'react';
import DealForm from './components/DealForm';
import DealList from './components/DealList';
import MapView from './components/MapView';
import AgeVerification from './components/AgeVerification';
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
  const [sortMode, setSortMode] = useState<'distance' | 'popular'>('distance');
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('nicmap_age_verified') === 'true';
  });

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
      const params = new URLSearchParams();
      if (userLocation) {
        params.set('lat', userLocation.latitude.toString());
        params.set('lng', userLocation.longitude.toString());
        params.set('radius', '30');
      }
      params.set('sort', sortMode);
      const url = `/api/deals?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, sortMode]);

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

  const handleReport = async (id: number) => {
    if (!window.confirm('Report this deal as expired or no longer available?')) {
      return;
    }
    try {
      const response = await fetch(`/api/deals/${id}/report`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to report');
      const result = await response.json();
      if (result.killed) {
        // Remove the deal from the list
        setDeals(prev => prev.filter(deal => deal.id !== id));
        alert('Deal has been removed. Thanks for the report!');
      } else {
        alert('Report submitted. Thanks for helping keep deals accurate!');
      }
    } catch (error) {
      console.error('Error reporting deal:', error);
    }
  };

  if (!ageVerified) {
    return <AgeVerification onVerified={() => setAgeVerified(true)} />;
  }

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

        <div className="controls-row">
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
          <div className="sort-toggle">
            <span className="sort-label">Sort:</span>
            <button
              className={`sort-btn ${sortMode === 'distance' ? 'active' : ''}`}
              onClick={() => setSortMode('distance')}
            >
              Nearest
            </button>
            <button
              className={`sort-btn ${sortMode === 'popular' ? 'active' : ''}`}
              onClick={() => setSortMode('popular')}
            >
              Popular
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <DealList deals={deals} loading={loading} onUpvote={handleUpvote} onReport={handleReport} />
        ) : (
          <MapView deals={deals} userLocation={userLocation} onUpvote={handleUpvote} onReport={handleReport} />
        )}
      </main>
      <footer className="app-footer">
        <p>Share deals responsibly. Must be 21+ to purchase nicotine products.</p>
        <div className="footer-resources">
          <p><strong>Need help quitting?</strong></p>
          <div className="footer-links">
            <a href="https://smokefree.gov" target="_blank" rel="noopener noreferrer">Smokefree.gov</a>
            <span className="divider">|</span>
            <a href="tel:1-800-784-8669">1-800-QUIT-NOW</a>
            <span className="divider">|</span>
            <a href="https://www.thetruth.com/quit-vaping" target="_blank" rel="noopener noreferrer">This Is Quitting</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
