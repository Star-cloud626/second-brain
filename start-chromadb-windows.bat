@echo off
echo ========================================
echo Starting ChromaDB Server (Windows)
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo.
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo Python found!
python --version
echo.

REM Check if chromadb is installed
python -c "import chromadb" >nul 2>&1
if errorlevel 1 (
    echo ChromaDB not found. Installing...
    echo.
    pip install chromadb
    if errorlevel 1 (
        echo ERROR: Failed to install ChromaDB
        echo Try running: pip install chromadb
        pause
        exit /b 1
    )
    echo ChromaDB installed successfully!
    echo.
)

REM Stop any running ChromaDB processes first
echo Stopping any existing ChromaDB processes...
taskkill /F /IM chroma.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Create chroma_db directory if it doesn't exist
if not exist "chroma_db" mkdir chroma_db

REM Check for lock files and remove them (Windows file locking issue)
echo Cleaning up lock files...
if exist "chroma_db\.chroma_lock" (
    del /F /Q "chroma_db\.chroma_lock" >nul 2>&1
    echo   - Removed .chroma_lock
)
if exist "chroma_db\chroma.sqlite3-journal" (
    del /F /Q "chroma_db\chroma.sqlite3-journal" >nul 2>&1
    echo   - Removed journal file
)

REM Remove any other lock/temp files
for %%f in (chroma_db\*.tmp chroma_db\*.lock chroma_db\*.pid) do (
    if exist "%%f" del /F /Q "%%f" >nul 2>&1
)

REM Fix file permissions
attrib -R "chroma_db\*.*" /S /D >nul 2>&1

echo Starting ChromaDB server on localhost:8000...
echo Data will be stored in: %CD%\chroma_db
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start ChromaDB server using chroma CLI
echo Attempting to start ChromaDB server...
chroma run --path ./chroma_db --host localhost --port 8000

if errorlevel 1 (
    echo.
    echo ========================================
    echo ChromaDB Failed to Start
    echo ========================================
    echo.
    echo If you see "file already exists" or "Frontend Config" error:
    echo   1. Run: clean-chromadb.bat (removes lock files, keeps data)
    echo   2. Or run: reset-chromadb.bat (deletes everything, fresh start)
    echo   3. Then try starting again
    echo.
    echo If ChromaDB is not installed:
    echo   Run: setup-chromadb-windows.bat
    echo.
    echo Or manually install:
    echo   pip install chromadb[server]
    echo.
    pause
)

