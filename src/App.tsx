import React, { useState, useEffect, useCallback } from 'react';
import DealForm from './components/DealForm';
import DealList from './components/DealList';
import './App.css';

interface Deal {
  id: number;
  storeName: string;
  product: string;
  originalPrice: number | null;
  salePrice: number;
  location: string;
  description: string;
  createdAt: string;
  upvotes: number;
}

function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    try {
      const response = await fetch('/api/deals');
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

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
      </header>
      <main className="app-main">
        <DealForm onDealSubmitted={fetchDeals} />
        <DealList deals={deals} loading={loading} onUpvote={handleUpvote} />
      </main>
      <footer className="app-footer">
        <p>Share deals responsibly. Must be 21+ to purchase nicotine products.</p>
      </footer>
    </div>
  );
}

export default App;
