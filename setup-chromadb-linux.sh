#!/bin/bash

echo "========================================"
echo "ChromaDB Setup for Linux"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed!"
    echo ""
    echo "Please install Python 3.8-3.11:"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "  Fedora: sudo dnf install python3 python3-pip"
    echo "  Arch: sudo pacman -S python python-pip"
    echo ""
    exit 1
fi

echo "[1/3] Python is installed"
python3 --version
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "ERROR: pip3 is not installed!"
    echo ""
    echo "Please install pip:"
    echo "  Ubuntu/Debian: sudo apt-get install python3-pip"
    echo "  Fedora: sudo dnf install python3-pip"
    echo ""
    exit 1
fi

echo "[2/3] Installing ChromaDB (with server support)..."
pip3 install "chromadb[server]"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install ChromaDB"
    echo ""
    echo "Try installing with: pip3 install --user chromadb[server]"
    exit 1
fi
echo "ChromaDB installed successfully!"
echo ""

echo "[3/3] Creating data directory..."
mkdir -p chroma_db
echo "Directory created: $(pwd)/chroma_db"
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start ChromaDB server, run:"
echo "  ./start-chromadb-linux.sh"
echo ""
echo "Or manually:"
echo "  chroma run --path ./chroma_db --host localhost --port 8000"
echo ""

