@echo off
echo.
echo ========================================
echo   Starting MockFlix Application
echo ========================================
echo.

echo Starting Backend Server (Port 3000)...
start "MockFlix Backend" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server (Port 5173)...
start "MockFlix Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:3000/api-docs
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
