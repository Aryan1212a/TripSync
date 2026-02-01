#!/bin/bash
# TripSync Local Development Startup Script

echo "🚀 Starting TripSync (Local Development)..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "${BLUE}[1/4]${NC} Checking MongoDB..."
if ! mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "Starting MongoDB..."
    mkdir -p /data/db
    mongod --dbpath /data/db --bind_ip 127.0.0.1 --nounixsocket > /tmp/mongodb.log 2>&1 &
    sleep 3
    if mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        echo -e "${GREEN}✓ MongoDB started${NC}"
    else
        echo "❌ Failed to start MongoDB"
        exit 1
    fi
else
    echo -e "${GREEN}✓ MongoDB already running${NC}"
fi

# Start Backend
echo -e "${BLUE}[2/4]${NC} Starting Backend..."
cd /home/aryan/TripSync/backend
. myenv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Verify backend
if curl -s http://localhost:8000/api/packages/ &>/dev/null; then
    echo -e "${GREEN}✓ Backend running on port 8000${NC}"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID
    exit 1
fi

# Start Frontend
echo -e "${BLUE}[3/4]${NC} Starting Frontend..."
cd /home/aryan/TripSync/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 5

if curl -s http://localhost:5173 &>/dev/null; then
    echo -e "${GREEN}✓ Frontend running on port 5173${NC}"
else
    echo "❌ Frontend failed to start"
    kill $FRONTEND_PID
    exit 1
fi

echo -e "${BLUE}[4/4]${NC} System Status"
echo -e "${GREEN}✓ MongoDB${NC}  - mongodb://127.0.0.1:27017"
echo -e "${GREEN}✓ Backend${NC}  - http://localhost:8000"
echo -e "${GREEN}✓ Frontend${NC} - http://localhost:5173"
echo ""
echo "================================"
echo "🎉 TripSync is ready!"
echo "================================"
echo ""
echo "To stop all services, run: pkill -f 'uvicorn|npm|mongod'"
echo ""
echo "Logs:"
echo "  MongoDB: tail -f /tmp/mongodb.log"
echo "  Backend: tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
