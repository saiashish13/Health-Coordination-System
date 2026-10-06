@echo off
title AI Care Coordination Platform Launcher

echo ========================================================
echo         AI CARE COORDINATION PLATFORM LAUNCHER
echo ========================================================
echo.
echo Starting Python FastAPI Backend (Port 8000)...
start "AI Care Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

echo Starting React Vite Frontend (Port 5173)...
start "AI Care Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  Both servers have been launched in separate windows!
echo  - Frontend Web App: http://localhost:5173
echo  - Backend API Docs: http://localhost:8000/docs
echo ========================================================
echo.
