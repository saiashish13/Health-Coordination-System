@echo off
title AI Care Coordination Platform Launcher

echo ========================================================
echo         AI CARE COORDINATION PLATFORM LAUNCHER
echo ========================================================
echo.

echo Cleaning up any previously open port 8000 and 5173 processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Starting Python FastAPI Backend (Port 8000)...
start "AI Care Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend API to initialize...
timeout /t 3 /nobreak >nul

echo Starting React Vite Frontend (Port 5173)...
start "AI Care Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  Both servers have been launched in separate windows!
echo  - Frontend Web App: http://127.0.0.1:5173
echo  - Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.

