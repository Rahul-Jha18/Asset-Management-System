@echo off
REM Quick start script for Windows development

echo 🚀 Project IMS - Development Setup
echo ==================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install it first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detected: %NODE_VERSION%

REM Backend setup
echo.
echo 📦 Setting up Backend...
cd backend
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ⚠️  Please update backend\.env with your database credentials
)

if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
) else (
    echo ✅ Backend dependencies already installed
)

echo ✅ Backend ready

REM Frontend setup
echo.
echo 🎨 Setting up Frontend...
cd ..\frontend
if not exist .env.local (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
)

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo ✅ Frontend dependencies already installed
)

echo ✅ Frontend ready

echo.
echo ==================================
echo ✅ Setup Complete!
echo.
echo To start development:
echo   Backend:  cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm start
echo.
pause
