# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NicMap is a React + Node.js web application for finding and sharing nicotine product deals by geographic location. Users can post deals, view them on a map or list, vote on deals, and report expired ones.

## Development Commands

### Frontend (root directory)
```bash
npm start          # Development server on http://localhost:3000
npm run build      # Production build to /build
npm test           # Run tests in watch mode
```

### Backend (server directory)
```bash
cd server
npm start          # Server on port 5001
npm run dev        # Development with nodemon auto-reload
```

The frontend proxies API requests to `localhost:5001` during development.

## Architecture

### Frontend (src/)
- **App.tsx**: Main component handling routing, location state, deal fetching, and view mode switching
- **components/**: React components
  - `AgeVerification.tsx`: 21+ age gate modal (shown on first visit)
  - `DealForm.tsx`: Deal submission form with product/zip validation
  - `DealList.tsx`: Grid view of deal cards with voting/reporting
  - `MapView.tsx`: Leaflet map with deal markers and popups

### Backend (server/)
- **index.js**: Express server with all API routes (in-memory data store, no database)

### API Endpoints
- `GET/POST /api/deals` - List/create deals (filters by location, 30-mile radius)
- `GET/DELETE /api/deals/:id` - Get/delete specific deal
- `PATCH /api/deals/:id/upvote` - Increment upvotes
- `PATCH /api/deals/:id/report` - Report deal (2 reports = auto-removal)
- `GET /api/geocode/:zipCode` - Convert zip to coordinates (uses Zippopotam API)

### Deal Logic
- Deals expire after 30 days
- 2 community reports remove a deal
- Distance calculated via Haversine formula (miles)

## Tech Stack
- Frontend: React 18, TypeScript, Leaflet/React-Leaflet
- Backend: Express, CORS
- Build: Create React App
