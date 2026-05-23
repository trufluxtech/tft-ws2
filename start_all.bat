@echo off
start "Truflux Backend" cmd /k "%~dp0start_backend.bat"
start "Truflux Frontend" cmd /k "%~dp0start_frontend.bat"
echo Backend and Frontend are starting.
echo Website: http://localhost:5173
echo Backend: http://localhost:8000
pause
