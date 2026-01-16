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

// Deal expiration: 30 days in milliseconds
const DEAL_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;
// Number of reports needed to kill a deal
const REPORTS_TO_KILL = 2;

function isExpired(deal) {
  const createdAt = new Date(deal.createdAt).getTime();
  return Date.now() - createdAt > DEAL_EXPIRATION_MS;
}

function isKilled(deal) {
  return deal.reports >= REPORTS_TO_KILL;
}

function filterActiveDeals(dealsList) {
  return dealsList.filter(deal => !isExpired(deal) && !isKilled(deal));
}

// Haversine formula to calculate distance between two points in miles
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Geocode a zip code using free Zippopotam API
async function geocodeZipCode(zipCode) {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.places && data.places.length > 0) {
      return {
        latitude: parseFloat(data.places[0].latitude),
        longitude: parseFloat(data.places[0].longitude),
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation']
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// GET geocode a zip code
app.get('/api/geocode/:zipCode', async (req, res) => {
  const geoData = await geocodeZipCode(req.params.zipCode);
  if (!geoData) {
    return res.status(404).json({ error: 'Zip code not found' });
  }
  res.json(geoData);
});

// GET all deals (with optional location filtering and sorting)
app.get('/api/deals', (req, res) => {
  const { lat, lng, radius = 30, sort = 'distance' } = req.query;

  // Filter out expired and reported deals first
  let filteredDeals = filterActiveDeals(deals);

  // If user location provided, filter by distance
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    filteredDeals = filteredDeals
      .filter(deal => deal.latitude && deal.longitude)
      .map(deal => ({
        ...deal,
        distance: calculateDistance(userLat, userLng, deal.latitude, deal.longitude)
      }))
      .filter(deal => deal.distance <= maxRadius);
  }

  // Sort based on preference
  if (sort === 'popular') {
    filteredDeals = filteredDeals.sort((a, b) => b.upvotes - a.upvotes);
  } else if (lat && lng) {
    filteredDeals = filteredDeals.sort((a, b) => a.distance - b.distance);
  } else {
    filteredDeals = filteredDeals.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  res.json(filteredDeals);
});

// GET single deal by ID
app.get('/api/deals/:id', (req, res) => {
  const deal = deals.find(d => d.id === parseInt(req.params.id));
  if (!deal || isExpired(deal) || isKilled(deal)) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.json(deal);
});

// POST create new deal
app.post('/api/deals', async (req, res) => {
  const { storeName, product, originalPrice, salePrice, location, description, zipCode } = req.body;

  // Basic validation
  if (!storeName || !product || !salePrice || !zipCode) {
    return res.status(400).json({
      error: 'Missing required fields: storeName, product, salePrice, and zipCode are required'
    });
  }

  // Geocode the zip code to get coordinates
  const geoData = await geocodeZipCode(zipCode);
  if (!geoData) {
    return res.status(400).json({
      error: 'Invalid zip code. Please enter a valid US zip code.'
    });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEAL_EXPIRATION_MS);

  const newDeal = {
    id: nextId++,
    storeName,
    product,
    originalPrice: originalPrice ? parseFloat(originalPrice) : null,
    salePrice: parseFloat(salePrice),
    location: location || `${geoData.city}, ${geoData.state}`,
    zipCode,
    latitude: geoData.latitude,
    longitude: geoData.longitude,
    description: description || '',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    upvotes: 0,
    reports: 0
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

// PATCH report a deal as expired
app.patch('/api/deals/:id/report', (req, res) => {
  const deal = deals.find(d => d.id === parseInt(req.params.id));
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  deal.reports++;

  if (deal.reports >= REPORTS_TO_KILL) {
    res.json({ message: 'Deal has been removed due to reports', killed: true });
  } else {
    res.json({ message: 'Report submitted', reports: deal.reports, killed: false });
  }
});

app.listen(PORT, () => {
  console.log(`NicMap server running on port ${PORT}`);
});
