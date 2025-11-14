@echo off
echo ========================================
echo ChromaDB Setup for Windows
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo.
    echo Please install Python 3.9+ from: https://www.python.org/downloads/
    echo.
    echo IMPORTANT: During installation, check "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [1/3] Python is installed
python --version
echo.

echo [2/3] Installing ChromaDB (with server support)...
pip install "chromadb[server]"
if errorlevel 1 (
    echo ERROR: Failed to install ChromaDB
    pause
    exit /b 1
)
echo ChromaDB installed successfully!
echo.

echo [3/3] Creating data directory...
if not exist "chroma_db" mkdir chroma_db
echo Directory created: %CD%\chroma_db
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start ChromaDB server, run:
echo   start-chromadb-windows.bat
echo.
echo Or manually:
echo   chroma run --path ./chroma_db --host localhost --port 8000
echo.
pause

