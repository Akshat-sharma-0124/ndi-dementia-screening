#!/usr/bin/env powershell

# Script to run all components of the Dementia Screening App concurrently
# It will open separate terminal windows for each service

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Starting Dementia Screening App Services" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot

# 1. Start Backend Server
Write-Host "[*] Starting Backend Server (Node.js) on port 5000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$baseDir\backend'; npm run dev"

# 2. Start Python AI Server
Write-Host "[*] Starting Python AI Server (FastAPI) on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$baseDir\ndi_project'; .\.venv\Scripts\Activate.ps1; uvicorn api_server:app --port 8000 --reload"

# 3. Start Frontend App
Write-Host "[*] Starting Frontend App (React) on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$baseDir\ndi-dementia-screening'; npm run dev"

Write-Host ""
Write-Host "[v] All services have been launched in separate windows!" -ForegroundColor Green
Write-Host "    - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "    - Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "    - AI API: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keep those new windows open to view the logs for each service." -ForegroundColor White
Write-Host "Close the windows or press Ctrl+C in each to stop the services." -ForegroundColor White
