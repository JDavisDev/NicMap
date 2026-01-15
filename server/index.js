const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (replace with database later)
let deals = [];
let nextId = 1;

// GET all deals
app.get('/api/deals', (req, res) => {
  // Return deals sorted by most recent first
  const sortedDeals = [...deals].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sortedDeals);
});

// GET single deal by ID
app.get('/api/deals/:id', (req, res) => {
  const deal = deals.find(d => d.id === parseInt(req.params.id));
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.json(deal);
});

// POST create new deal
app.post('/api/deals', (req, res) => {
  const { storeName, product, originalPrice, salePrice, location, description } = req.body;

  // Basic validation
  if (!storeName || !product || !salePrice || !location) {
    return res.status(400).json({
      error: 'Missing required fields: storeName, product, salePrice, and location are required'
    });
  }

  const newDeal = {
    id: nextId++,
    storeName,
    product,
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    salePrice: parseFloat(salePrice),
    location,
    description: description || '',
    createdAt: new Date().toISOString(),
    upvotes: 0
  };

  deals.push(newDeal);
  res.status(201).json(newDeal);
});

// DELETE a deal
app.delete('/api/deals/:id', (req, res) => {
  const index = deals.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  deals.splice(index, 1);
  res.status(204).send();
});

// PATCH upvote a deal
app.patch('/api/deals/:id/upvote', (req, res) => {
  const deal = deals.find(d => d.id === parseInt(req.params.id));
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  deal.upvotes++;
  res.json(deal);
});

app.listen(PORT, () => {
  console.log(`NicMap server running on port ${PORT}`);
});
