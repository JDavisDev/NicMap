import React, { useState } from 'react';
import './DealForm.css';

// On! product catalog
const ON_FLAVORS = ['Wintergreen', 'Mint', 'Coffee', 'Cinnamon', 'Citrus', 'Berry', 'Original'];
const ON_STRENGTHS = ['2mg', '4mg', '8mg'];

const PRODUCTS = ON_FLAVORS.flatMap(flavor =>
  ON_STRENGTHS.map(strength => `On! ${flavor} ${strength}`)
);

interface DealFormProps {
  onDealSubmitted: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ onDealSubmitted }) => {
  const [formData, setFormData] = useState({
    storeName: '',
    product: '',
    originalPrice: '',
    salePrice: '',
    location: '',
    zipCode: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit deal');
      }

      // Reset form on success
      setFormData({
        storeName: '',
        product: '',
        originalPrice: '',
        salePrice: '',
        location: '',
        zipCode: '',
        description: ''
      });
      setSuccess(true);
      onDealSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="deal-form-container">
      <h2>Submit a Deal</h2>
      <form onSubmit={handleSubmit} className="deal-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="storeName">Store Name *</label>
            <input
              type="text"
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="e.g., Corner Smoke Shop"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="zipCode">Zip Code *</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="e.g., 78701"
              maxLength={5}
              pattern="\d{5}"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Address (optional)</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., 123 Main St"
          />
        </div>

        <div className="form-group">
          <label htmlFor="product">Product *</label>
          <input
            type="text"
            id="product"
            name="product"
            list="product-list"
            value={formData.product}
            onChange={handleChange}
            placeholder="Start typing to see suggestions..."
            required
          />
          <datalist id="product-list">
            {PRODUCTS.map(product => (
              <option key={product} value={product} />
            ))}
          </datalist>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="originalPrice">Original Price</label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="salePrice">Sale Price *</label>
            <input
              type="number"
              id="salePrice"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Any additional details about the deal..."
            rows={3}
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">Deal submitted successfully!</div>}

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Submitting...' : 'Submit Deal'}
        </button>
      </form>
    </div>
  );
};

export default DealForm;
