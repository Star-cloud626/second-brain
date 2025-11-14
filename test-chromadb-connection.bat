@echo off
echo ========================================
echo ChromaDB Connection Test
echo ========================================
echo.

echo Testing connection to ChromaDB at localhost:8000...
echo.

REM Test using PowerShell
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/heartbeat' -UseBasicParsing -TimeoutSec 5; Write-Host 'SUCCESS: ChromaDB is running!'; Write-Host $response.Content } catch { Write-Host 'ERROR: Cannot connect to ChromaDB'; Write-Host $_.Exception.Message }"

echo.
echo ========================================
echo If you see ERROR above:
echo   1. Make sure ChromaDB is running (start-chromadb-windows.bat)
echo   2. Check if port 8000 is available
echo   3. Try restarting ChromaDB server
echo ========================================
echo.
pause

