@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo       TalentOS HR System Installer
echo ========================================
echo.

:: Check if Docker is installed
docker --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

echo [OK] Docker is installed

:: Check if Docker is running
docker ps >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running

:: Check if .env file exists
if not exist ".env" (
    echo [INFO] Creating configuration file...
    if exist "docker\.env.example" (
        copy "docker\.env.example" ".env" >nul 2>&1
    ) else (
        echo # TalentOS Configuration> .env
        echo POSTGRES_PASSWORD=TalentOS2024SecurePassword>> .env
        echo JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long>> .env
        echo ANON_KEY=your-anon-key>> .env
        echo SERVICE_ROLE_KEY=your-service-role-key>> .env
        echo API_EXTERNAL_URL=http://localhost:8000>> .env
        echo SITE_URL=http://localhost:3000>> .env
        echo SUPABASE_URL=http://localhost:8000>> .env
    )
    echo [OK] Configuration file created: .env
    echo [WARNING] Please update .env file with your settings before continuing!
    pause
)

:: Create directories
echo [INFO] Creating directories...
if not exist "docker" mkdir docker

:: Pull images
echo [INFO] Pulling Docker images...
docker-compose pull

:: Build application
echo [INFO] Building application...
docker-compose build

:: Start services
echo [INFO] Starting services...
docker-compose up -d

:: Wait for services
echo [INFO] Waiting for services to start...
timeout /t 10 /nobreak >nul

:: Check if services are running
docker-compose ps | findstr "Up" >nul
if !errorlevel! equ 0 (
    echo.
    echo ========================================
    echo   Installation completed successfully!
    echo ========================================
    echo.
    echo   Application:   http://localhost:3000
    echo   API:           http://localhost:8000
    echo   Database:      localhost:5432
    echo.
    echo Useful commands:
    echo   docker-compose logs -f    - View logs
    echo   docker-compose stop       - Stop services
    echo   docker-compose start      - Start services
    echo   docker-compose down       - Remove services
    echo.
    echo To create first admin, go to: http://localhost:3000/auth
) else (
    echo [ERROR] Some services failed to start
    echo Run 'docker-compose logs' for details
)

pause
