#!/bin/bash

echo "========================================"
echo "ChromaDB Cleanup Tool (Linux)"
echo "========================================"
echo ""
echo "This will clean up ChromaDB lock files and corrupted data."
echo "Your actual data (embeddings) will be preserved if possible."
echo ""

read -p "Are you sure you want to clean ChromaDB? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Cleaning ChromaDB directory..."

# Stop any running ChromaDB processes
echo "Stopping any running ChromaDB processes..."
pkill -f "chroma run" 2>/dev/null
sleep 2

# Create directory if it doesn't exist
mkdir -p chroma_db

# Remove all lock and temporary files
echo "Removing lock files..."
rm -f chroma_db/.chroma_lock
rm -f chroma_db/chroma.sqlite3-journal
rm -f chroma_db/*.tmp
rm -f chroma_db/*.lock
rm -f chroma_db/*.pid

# Ask about database file
if [ -f "chroma_db/chroma.sqlite3" ]; then
    echo ""
    echo "WARNING: Found database file."
    read -p "Delete database file? This will remove ALL data! (y/N): " delete_db
    if [[ "$delete_db" =~ ^[Yy]$ ]]; then
        rm -f chroma_db/chroma.sqlite3
        echo "  - Removed chroma.sqlite3"
    else
        echo "  - Database file kept"
    fi
fi

echo ""
echo "Cleanup complete!"
echo ""
echo "You can now try starting ChromaDB again:"
echo "  ./start-chromadb-linux.sh"
echo ""

