# Sports Player Auction Platform

Full-stack real-time auction platform with FastAPI backend and React frontend.

## Tech Stack

### Backend
- FastAPI
- asyncpg (PostgreSQL)
- Redis (pub/sub + timer)
- WebSockets
- Pydantic v2
- JWT Auth

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router v7
- Axios
- Lucide Icons

## Setup

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Setup PostgreSQL database
psql -U postgres -f migrations/init.sql

# Start Redis
redis-server

# Run server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

## Architecture

### Database (PostgreSQL)
- Pure SQL queries via asyncpg
- No ORM
- Repository pattern

### Real-time Features
- WebSocket connections per auction room
- Redis-based timer (1-second tick)
- Server-side countdown broadcast

### API Flow
1. Client calls `GET /auctions/{id}/snapshot`
2. Receives complete auction state
3. Connects to `WS /ws/auction/{id}`
4. Receives real-time updates

### WebSocket Events
- `BID_UPDATED` - New bid placed
- `TIMER_TICK` - Countdown update
- `PLAYER_ON_BLOCK` - New player
- `PLAYER_SOLD` - Player sold
- `PLAYER_UNSOLD` - No bids

## API Endpoints

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Tournaments
- `GET /api/v1/tournaments`
- `POST /api/v1/tournaments`

### Auctions
- `GET /api/v1/auctions/{id}/snapshot`
- `POST /api/v1/auctions/{id}/start`
- `POST /api/v1/auctions/{id}/pause`
- `POST /api/v1/auctions/{id}/next`

### WebSocket
- `WS /ws/auction/{id}?token={jwt}`

## Default Credentials

```
Email: admin@auction.com
Password: admin123
```
