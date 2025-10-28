@echo off
echo ================================
echo Smart Parking System - Dev Start
echo ================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd Server && node app.js"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd Client && npm run dev"

echo.
echo ================================
echo Both servers are starting!
echo ================================
echo Backend:  http://localhost:5000
echo Frontend: Check the Frontend Server window for the port
echo          (Usually http://localhost:5173)
echo.
echo Press any key to exit this window...
pause > nul
