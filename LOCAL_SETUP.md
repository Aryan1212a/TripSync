# TripSync - Local Development Setup

This project is configured to run **locally without Docker**.

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **MongoDB** (local installation)

## Quick Start

### Option 1: Automated Startup (Recommended)
```bash
cd /home/aryan/TripSync
./START_LOCAL.sh
```

This will:
1. Start MongoDB locally
2. Start Backend API (port 8000)
3. Start Frontend Dev Server (port 5173)

### Option 2: Manual Startup

#### Terminal 1 - MongoDB
```bash
mkdir -p /data/db
mongod --dbpath /data/db --bind_ip 127.0.0.1 --nounixsocket
```

#### Terminal 2 - Backend
```bash
cd /home/aryan/TripSync/backend
. myenv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 3 - Frontend
```bash
cd /home/aryan/TripSync/frontend
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Configuration

### Backend (.env)
```
MONGO_URI=mongodb://127.0.0.1:27017/tripsync
JWT_SECRET=super_secret_change_me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (config.js)
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Database Setup

### Seed Demo Data
```bash
cd /home/aryan/TripSync/backend
. myenv/bin/activate
python3 seed_packages.py
```

This seeds 29 travel packages into the database.

## Stopping Services

```bash
# Stop all services
pkill -f "uvicorn|npm|mongod"

# Or individually
pkill -f "mongod"        # Stop MongoDB
pkill -f "uvicorn"       # Stop Backend
pkill -f "npm run dev"   # Stop Frontend
```

## Troubleshooting

### MongoDB Won't Start
```bash
# Check if mongod is already running
pgrep -a mongod

# Kill any existing processes
pkill -9 mongod
sleep 2

# Start fresh
mongod --dbpath /data/db --bind_ip 127.0.0.1 --nounixsocket
```

### Backend Connection Issues
```bash
# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check backend logs
tail -f /tmp/backend.log
```

### Frontend Not Loading
```bash
# Clear browser cache
# Dev Tools > Application > Clear Storage

# Or hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## Project Structure

```
/home/aryan/TripSync/
├── backend/              # FastAPI backend
│   ├── app.py           # Main application
│   ├── routes/          # API endpoints
│   ├── models/          # Database models
│   ├── database/        # MongoDB connection
│   ├── seed_packages.py # Database seeding
│   └── .env             # Configuration
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── config.js    # API configuration
│   │   └── main.jsx     # Entry point
│   └── package.json
└── START_LOCAL.sh       # Startup script
```

## Features

- ✅ Travel package browsing
- ✅ User authentication & registration
- ✅ Package booking
- ✅ Agent dashboard (create/manage packages)
- ✅ Admin dashboard (approve/reject packages)
- ✅ Real-time package status updates

## API Endpoints

### Public
- `GET /api/packages/` - Get approved packages
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Agent (authenticated)
- `POST /api/packages/` - Create package
- `GET /api/bookings/my-packages` - View package bookings
- `DELETE /api/packages/{id}` - Delete own package

### Admin (authenticated)
- `GET /api/packages/pending/all` - View pending packages
- `PATCH /api/packages/{id}/approve` - Approve package
- `PATCH /api/packages/{id}/reject` - Reject package

## Development Notes

- Backend uses FastAPI with MongoDB
- Frontend uses React 18 + Vite + Material-UI
- Authentication via JWT tokens
- Packages default to "pending" status when created by agents
- Only "approved" packages show on homepage

---

**Happy coding!** 🚀
