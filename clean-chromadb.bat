@echo off
echo ========================================
echo ChromaDB Cleanup Tool
echo ========================================
echo.
echo This will clean up ChromaDB lock files and corrupted data.
echo Your actual data (embeddings) will be preserved if possible.
echo.

set /p confirm="Are you sure you want to clean ChromaDB? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Cleaning ChromaDB directory...

REM Stop any running ChromaDB processes
echo Stopping any running ChromaDB processes...
taskkill /F /IM chroma.exe >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *chroma*" >nul 2>&1
timeout /t 2 /nobreak >nul

REM Create directory if it doesn't exist
if not exist "chroma_db" (
    mkdir chroma_db
    echo Created chroma_db directory
)

REM Remove all lock and temporary files
echo Removing lock files...
if exist "chroma_db\.chroma_lock" (
    del /F /Q "chroma_db\.chroma_lock" >nul 2>&1
    echo   - Removed .chroma_lock
)

if exist "chroma_db\chroma.sqlite3-journal" (
    del /F /Q "chroma_db\chroma.sqlite3-journal" >nul 2>&1
    echo   - Removed chroma.sqlite3-journal
)

REM Remove config files that might cause conflicts
if exist "chroma_db\chroma.sqlite3" (
    echo WARNING: Found database file. 
    echo.
    set /p delete_db="Delete database file? This will remove ALL data! (y/N): "
    if /i "%delete_db%"=="y" (
        del /F /Q "chroma_db\chroma.sqlite3" >nul 2>&1
        echo   - Removed chroma.sqlite3
    ) else (
        echo   - Database file kept
    )
)

REM Remove any other temporary files
for %%f in (chroma_db\*.tmp chroma_db\*.lock chroma_db\*.pid) do (
    if exist "%%f" (
        del /F /Q "%%f" >nul 2>&1
        echo   - Removed %%f
    )
)

REM Try to remove the entire directory and recreate it if it's corrupted
if exist "chroma_db" (
    echo.
    echo Attempting to fix directory permissions...
    attrib -R "chroma_db\*.*" /S /D >nul 2>&1
)

echo.
echo Cleanup complete!
echo.
echo You can now try starting ChromaDB again:
echo   start-chromadb-windows.bat
echo.
pause

