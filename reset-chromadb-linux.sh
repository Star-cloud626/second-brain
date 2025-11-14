#!/bin/bash

echo "========================================"
echo "ChromaDB Complete Reset (Linux)"
echo "========================================"
echo ""
echo "WARNING: This will DELETE ALL ChromaDB data!"
echo "All ingested transcripts will be lost."
echo ""
echo "This is useful if ChromaDB is corrupted and won't start."
echo ""

read -p "Are you sure you want to reset ChromaDB? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Stopping ChromaDB processes..."
pkill -f "chroma run" 2>/dev/null
sleep 2

echo ""
echo "Deleting chroma_db directory..."
if [ -d "chroma_db" ]; then
    rm -rf chroma_db
    if [ -d "chroma_db" ]; then
        echo "ERROR: Could not delete chroma_db directory."
        echo "Please close any programs using it and try again."
        echo "Or manually delete the folder: $(pwd)/chroma_db"
        exit 1
    else
        echo "  - Directory deleted successfully"
    fi
else
    echo "  - Directory doesn't exist (already clean)"
fi

echo ""
echo "Creating fresh chroma_db directory..."
mkdir -p chroma_db
if [ -d "chroma_db" ]; then
    echo "  - Directory created successfully"
else
    echo "ERROR: Could not create chroma_db directory"
    exit 1
fi

echo ""
echo "========================================"
echo "Reset Complete!"
echo "========================================"
echo ""
echo "ChromaDB has been completely reset."
echo "You can now start ChromaDB:"
echo "  ./start-chromadb-linux.sh"
echo ""
echo "Note: You will need to re-ingest all transcripts."
echo ""

