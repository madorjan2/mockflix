#!/bin/bash

echo ""
echo "========================================"
echo "  Starting MockFlix Application"
echo "========================================"
echo ""

echo "Starting Backend Server (Port 3000)..."
cd backend && npm run dev &

sleep 2

echo "Starting Frontend Server (Port 5173)..."
cd ../frontend && npm run dev &

echo ""
echo "========================================"
echo "  Both servers are starting!"
echo "========================================"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:5173"
echo "  API Docs: http://localhost:3000/api-docs"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
