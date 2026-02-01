#!/bin/bash
# TripSync Quick Commands

# ============================================
# START / STOP
# ============================================
# Start everything
./START_LOCAL.sh

# Stop everything
pkill -f "uvicorn|npm|mongod"

# ============================================
# INDIVIDUAL SERVICES
# ============================================
# Start MongoDB
mkdir -p /data/db && mongod --dbpath /data/db --bind_ip 127.0.0.1 --nounixsocket &

# Start Backend
cd backend && . myenv/bin/activate && uvicorn app:app --host 0.0.0.0 --port 8000 --reload &

# Start Frontend
cd frontend && npm run dev &

# ============================================
# DATABASE
# ============================================
# Connect to MongoDB
mongosh

# Seed demo data
cd backend && . myenv/bin/activate && python3 seed_packages.py

# Clear database
mongosh --eval "db.getSiblingDB('tripsync').packages.deleteMany({})"

# ============================================
# LOGS
# ============================================
tail -f /tmp/mongodb.log
tail -f /tmp/backend.log
tail -f /tmp/frontend.log

# ============================================
# TESTING
# ============================================
# Test API
curl http://localhost:8000/api/packages/

# Test MongoDB
mongosh --eval "db.adminCommand('ping')"

# List all packages
mongosh --eval "db.getSiblingDB('tripsync').packages.find().pretty()"

# ============================================
# PORTS
# ============================================
# MongoDB: 27017
# Backend: 8000
# Frontend: 5173

# ============================================
# URLS
# ============================================
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
# MongoDB Logs: /tmp/mongodb.log
