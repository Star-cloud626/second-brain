#!/bin/bash

echo "========================================"
echo "Starting ChromaDB Server (Linux with pysqlite3)"
echo "========================================"
echo ""

# Check if Python is installed (try multiple methods)
PYTHON3_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON3_CMD="python3"
elif [ -f /usr/bin/python3 ]; then
    PYTHON3_CMD="/usr/bin/python3"
elif [ -f /usr/local/bin/python3 ]; then
    PYTHON3_CMD="/usr/local/bin/python3"
else
    echo "ERROR: Python 3 is not installed!"
    exit 1
fi

# Create a Python wrapper script that uses pysqlite3
cat > /tmp/start_chromadb_pysqlite.py << 'PYEOF'
import sys
# Replace sqlite3 with pysqlite3 before any imports
import pysqlite3
sys.modules['sqlite3'] = pysqlite3

# Now import and run chroma
from chromadb.cli.cli import app
if __name__ == "__main__":
    app()
PYEOF

# Check if pysqlite3 is installed
if ! ${PYTHON3_CMD} -c "import pysqlite3" 2>/dev/null; then
    echo "Installing pysqlite3-binary..."
    pip3 install --user pysqlite3-binary
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install pysqlite3-binary"
        exit 1
    fi
fi

# Stop any running ChromaDB processes
echo "Stopping any existing ChromaDB processes..."
pkill -f "chroma run" 2>/dev/null
sleep 1

# Create chroma_db directory if it doesn't exist
mkdir -p chroma_db

echo "Starting ChromaDB server with pysqlite3..."
echo "Data will be stored in: $(pwd)/chroma_db"
echo "Press Ctrl+C to stop the server"
echo ""

# Run chroma with pysqlite3
${PYTHON3_CMD} /tmp/start_chromadb_pysqlite.py run --path ./chroma_db --host localhost --port 8000

