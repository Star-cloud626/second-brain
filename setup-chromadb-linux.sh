#!/bin/bash

echo "========================================"
echo "ChromaDB Setup for Linux"
echo "========================================"
echo ""

# Check if Python 3.9+ is installed (preferred for ChromaDB 0.5+)
PYTHON3_CMD=""
PYTHON_VERSION=""
PYTHON_MAJOR=""
PYTHON_MINOR=""

# Try Python 3.9+ first (in order of preference)
for py_version in python3.12 python3.11 python3.10 python3.9; do
    if command -v $py_version &> /dev/null; then
        PYTHON3_CMD="$py_version"
        PYTHON_VERSION=$($PYTHON3_CMD --version 2>&1 | awk '{print $2}')
        PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
        PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
        if [ "$PYTHON_MAJOR" = "3" ] && [ "$PYTHON_MINOR" -ge 9 ]; then
            break
        fi
    fi
done

# If no Python 3.9+ found, try any python3
if [ -z "$PYTHON3_CMD" ] || [ "$PYTHON_MAJOR" != "3" ] || [ "$PYTHON_MINOR" -lt 9 ]; then
    if command -v python3 &> /dev/null; then
        PYTHON3_CMD="python3"
    elif [ -f /usr/bin/python3 ]; then
        PYTHON3_CMD="/usr/bin/python3"
    elif [ -f /usr/local/bin/python3 ]; then
        PYTHON3_CMD="/usr/local/bin/python3"
    else
        echo "ERROR: Python 3 is not installed!"
        echo ""
        echo "Please install Python 3.9 or later:"
        echo "  Ubuntu/Debian: sudo apt update && sudo apt install python3.9 python3.9-pip"
        echo "  Fedora: sudo dnf install python3.9 python3.9-pip"
        echo "  Arch: sudo pacman -S python python-pip"
        echo ""
        exit 1
    fi
    
    PYTHON_VERSION=$($PYTHON3_CMD --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
    PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
fi

echo "[1/3] Python is installed"
echo "Python version: $PYTHON_VERSION"
echo "Python command: $PYTHON3_CMD"

# Check Python version and determine ChromaDB version
CHROMADB_VERSION=""
if [ "$PYTHON_MAJOR" = "3" ] && [ "$PYTHON_MINOR" -lt 9 ]; then
    echo ""
    echo "⚠️  WARNING: Python 3.8 or earlier detected!"
    echo "   ChromaDB 0.5+ (required by JavaScript client v1.x) needs Python 3.9+"
    echo ""
    echo "   You have two options:"
    echo "   1. Upgrade Python to 3.9+ (RECOMMENDED):"
    echo "      sudo apt update"
    echo "      sudo apt install python3.9 python3.9-pip"
    echo "      Then run this script again."
    echo ""
    echo "   2. Install ChromaDB 0.4.22 (compatible with Python 3.8):"
    echo "      This version is incompatible with the JavaScript client v1.x"
    echo "      You'll need to downgrade the JavaScript client to an older version."
    echo ""
    read -p "Continue with ChromaDB 0.4.22? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting. Please upgrade Python to 3.9+ and run this script again."
        exit 1
    fi
    echo "Installing ChromaDB 0.4.22 (compatible with Python 3.8)"
    CHROMADB_VERSION="==0.4.22"
elif [ "$PYTHON_MAJOR" = "3" ] && [ "$PYTHON_MINOR" -ge 9 ]; then
    echo "✓ Python version is compatible with ChromaDB 0.5+"
    CHROMADB_VERSION=""
else
    echo "WARNING: Unsupported Python version. Attempting to install latest ChromaDB..."
    CHROMADB_VERSION=""
fi
echo ""

# Check if pip is installed (try multiple methods)
PIP3_CMD=""
if command -v pip3 &> /dev/null; then
    PIP3_CMD="pip3"
elif ${PYTHON3_CMD} -m pip --version &> /dev/null; then
    PIP3_CMD="${PYTHON3_CMD} -m pip"
else
    echo "ERROR: pip3 is not installed!"
    echo ""
    echo "Please install pip:"
    echo "  Ubuntu/Debian: sudo apt-get install python3-pip"
    echo "  Fedora: sudo dnf install python3-pip"
    echo ""
    exit 1
fi

echo "[2/3] Installing ChromaDB (with server support)..."
echo "Note: This may take a few minutes and will install dependencies..."
echo ""

# Check SQLite version
SQLITE_VERSION=$(${PYTHON3_CMD} -c "import sqlite3; print(sqlite3.sqlite_version)" 2>/dev/null)
echo "Detected SQLite version: $SQLITE_VERSION"
if [ ! -z "$SQLITE_VERSION" ]; then
    # Compare versions (basic check - if version starts with 3.3[0-4], it's too old)
    if [[ "$SQLITE_VERSION" =~ ^3\.3[0-4]\. ]]; then
        echo ""
        echo "WARNING: Your SQLite version ($SQLITE_VERSION) is too old for ChromaDB server mode."
        echo "ChromaDB requires SQLite >= 3.35.0"
        echo ""
        echo "Installing pysqlite3-binary (bundles newer SQLite)..."
        $PIP3_CMD install --user pysqlite3-binary
        if [ $? -eq 0 ]; then
            echo "pysqlite3-binary installed. You may need to use embedded mode instead of server mode."
            echo "See: https://docs.trychroma.com/troubleshooting#sqlite"
        fi
        echo ""
    fi
fi

# First, upgrade protobuf to avoid conflicts with system packages
echo "Upgrading protobuf to avoid conflicts..."
$PIP3_CMD install --upgrade --user protobuf 2>/dev/null || $PIP3_CMD install --upgrade protobuf

# For Python 3.8, also downgrade posthog to compatible version
if [ "$PYTHON_MAJOR" = "3" ] && [ "$PYTHON_MINOR" -lt 9 ]; then
    echo "Installing Python 3.8 compatible posthog version..."
    $PIP3_CMD install --user 'posthog<3.0.0'
fi

# Install ChromaDB with user flag to avoid system package conflicts
# Note: Server mode may not work with old SQLite, but we'll try
if [ -z "$CHROMADB_VERSION" ]; then
    $PIP3_CMD install --user "chromadb[server]"
else
    echo "Installing ChromaDB $CHROMADB_VERSION (Python 3.8 compatible)..."
    $PIP3_CMD install --user "chromadb[server]$CHROMADB_VERSION"
fi
if [ $? -ne 0 ]; then
    echo ""
    echo "Installation with --user failed, trying without --user..."
    $PIP3_CMD install "chromadb[server]"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install ChromaDB"
        echo ""
        echo "Try manually: pip3 install --upgrade protobuf && pip3 install --user chromadb[server]"
        exit 1
    fi
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

