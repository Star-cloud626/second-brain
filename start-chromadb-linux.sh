#!/bin/bash

echo "========================================"
echo "Starting ChromaDB Server (Linux)"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed!"
    echo ""
    echo "Please install Python 3.8-3.11"
    echo ""
    exit 1
fi

echo "Python found!"
python3 --version
echo ""

# Check if chromadb is installed
if ! python3 -c "import chromadb" 2>/dev/null; then
    echo "ChromaDB not found. Installing..."
    echo ""
    pip3 install "chromadb[server]"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install ChromaDB"
        echo "Try running: ./setup-chromadb-linux.sh"
        exit 1
    fi
    echo "ChromaDB installed successfully!"
    echo ""
fi

# Stop any running ChromaDB processes
echo "Stopping any existing ChromaDB processes..."
pkill -f "chroma run" 2>/dev/null
sleep 1

# Create chroma_db directory if it doesn't exist
mkdir -p chroma_db

# Clean up any lock files (Linux doesn't have the same issues as Windows, but good practice)
echo "Cleaning up any lock files..."
rm -f chroma_db/.chroma_lock
rm -f chroma_db/chroma.sqlite3-journal
rm -f chroma_db/*.tmp
rm -f chroma_db/*.lock
rm -f chroma_db/*.pid

echo "Starting ChromaDB server on localhost:8000..."
echo "Data will be stored in: $(pwd)/chroma_db"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start ChromaDB server using chroma CLI
echo "Attempting to start ChromaDB server..."
chroma run --path ./chroma_db --host localhost --port 8000

if [ $? -ne 0 ]; then
    echo ""
    echo "========================================"
    echo "ChromaDB Failed to Start"
    echo "========================================"
    echo ""
    echo "If ChromaDB is not installed:"
    echo "  Run: ./setup-chromadb-linux.sh"
    echo ""
    echo "Or manually install:"
    echo "  pip3 install chromadb[server]"
    echo ""
    exit 1
fi

