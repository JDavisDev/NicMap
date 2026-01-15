import React from 'react';
import './DealList.css';

interface Deal {
  id: number;
  storeName: string;
  product: string;
  originalPrice: number | null;
  salePrice: number;
  location: string;
  zipCode?: string;
  distance?: number;
  description: string;
  createdAt: string;
  upvotes: number;
}

interface DealListProps {
  deals: Deal[];
  loading: boolean;
  onUpvote: (id: number) => void;
}

const DealList: React.FC<DealListProps> = ({ deals, loading, onUpvote }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const calculateSavings = (original: number | null, sale: number) => {
    if (!original || original <= sale) return null;
    const savings = ((original - sale) / original) * 100;
    return Math.round(savings);
  };

  if (loading) {
    return (
      <div className="deal-list-container">
        <h2>Recent Deals</h2>
        <div className="loading">Loading deals...</div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="deal-list-container">
        <h2>Nearby Deals</h2>
        <div className="no-deals">
          <p>No deals found in your area. Be the first to share one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deal-list-container">
      <h2>Nearby Deals ({deals.length})</h2>
      <div className="deals-grid">
        {deals.map(deal => {
          const savings = calculateSavings(deal.originalPrice, deal.salePrice);
          return (
            <div key={deal.id} className="deal-card">
              <div className="deal-header">
                <h3 className="deal-product">{deal.product}</h3>
                {savings && (
                  <span className="deal-savings">{savings}% OFF</span>
                )}
              </div>

              <div className="deal-store">{deal.storeName}</div>
              <div className="deal-location">
                {deal.location}
                {deal.distance !== undefined && (
                  <span className="deal-distance"> ({deal.distance.toFixed(1)} mi)</span>
                )}
              </div>

              <div className="deal-pricing">
                {deal.originalPrice && (
                  <span className="original-price">
                    {formatPrice(deal.originalPrice)}
                  </span>
                )}
                <span className="sale-price">{formatPrice(deal.salePrice)}</span>
              </div>

              {deal.description && (
                <p className="deal-description">{deal.description}</p>
              )}

              <div className="deal-footer">
                <span className="deal-date">{formatDate(deal.createdAt)}</span>
                <button
                  className="upvote-btn"
                  onClick={() => onUpvote(deal.id)}
                >
                  <span className="upvote-icon">&#9650;</span>
                  <span className="upvote-count">{deal.upvotes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealList;
