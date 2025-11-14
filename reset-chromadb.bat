@echo off
echo ========================================
echo ChromaDB Complete Reset
echo ========================================
echo.
echo WARNING: This will DELETE ALL ChromaDB data!
echo All ingested transcripts will be lost.
echo.
echo This is useful if ChromaDB is corrupted and won't start.
echo.

set /p confirm="Are you sure you want to reset ChromaDB? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Stopping ChromaDB processes...
taskkill /F /IM chroma.exe >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *chroma*" >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Deleting chroma_db directory...
if exist "chroma_db" (
    REM Try to remove read-only attributes first
    attrib -R "chroma_db\*.*" /S /D >nul 2>&1
    
    REM Delete the directory
    rd /S /Q "chroma_db" >nul 2>&1
    
    if exist "chroma_db" (
        echo ERROR: Could not delete chroma_db directory.
        echo Please close any programs using it and try again.
        echo Or manually delete the folder: %CD%\chroma_db
        pause
        exit /b 1
    ) else (
        echo   - Directory deleted successfully
    )
) else (
    echo   - Directory doesn't exist (already clean)
)

echo.
echo Creating fresh chroma_db directory...
mkdir chroma_db
if exist "chroma_db" (
    echo   - Directory created successfully
) else (
    echo ERROR: Could not create chroma_db directory
    pause
    exit /b 1
)

echo.
echo ========================================
echo Reset Complete!
echo ========================================
echo.
echo ChromaDB has been completely reset.
echo You can now start ChromaDB:
echo   start-chromadb-windows.bat
echo.
echo Note: You will need to re-ingest all transcripts.
echo.
pause

