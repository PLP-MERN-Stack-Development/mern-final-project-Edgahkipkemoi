@echo off
echo ========================================
echo    Starting FitTrack Application
echo ========================================
echo.
echo This will start both backend and frontend servers
echo Keep this window open while using the app
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

cd backend
start cmd /k "echo Backend Server && npm run dev"

timeout /t 5 /nobreak > nul

cd ../frontend
start cmd /k "echo Frontend Server && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Open your browser and go to:
echo http://localhost:5173
echo ========================================
echo.
pause
