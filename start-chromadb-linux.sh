#!/bin/bash

echo "========================================"
echo "Starting ChromaDB Server (Linux)"
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
        echo ""
        exit 1
    fi
    
    PYTHON_VERSION=$($PYTHON3_CMD --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
    PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
fi

echo "Using Python: $PYTHON3_CMD ($PYTHON_VERSION)"
if [ "$PYTHON_MAJOR" = "3" ] && [ "$PYTHON_MINOR" -lt 9 ]; then
    echo "⚠️  WARNING: Python 3.8 or earlier detected!"
    echo "   ChromaDB 0.5+ (required by JavaScript client v1.x) needs Python 3.9+"
    echo "   Consider upgrading: sudo apt update && sudo apt install python3.9 python3.9-pip"
fi
echo ""

# Check if pip is available (try multiple methods)
PIP3_CMD=""
if command -v pip3 &> /dev/null; then
    PIP3_CMD="pip3"
elif ${PYTHON3_CMD} -m pip --version &> /dev/null; then
    PIP3_CMD="${PYTHON3_CMD} -m pip"
fi

# Check if chromadb is installed
if ! ${PYTHON3_CMD} -c "import chromadb" 2>/dev/null; then
    echo "ChromaDB not found. Installing..."
    echo ""
    if [ -z "$PIP3_CMD" ]; then
        echo "ERROR: pip3 is not available!"
        echo "Please install pip: sudo apt-get install python3-pip"
        echo "Or run: ./setup-chromadb-linux.sh"
        exit 1
    fi
    # Upgrade protobuf first to avoid conflicts
    echo "Upgrading protobuf to avoid conflicts..."
    $PIP3_CMD install --upgrade --user protobuf 2>/dev/null || $PIP3_CMD install --upgrade protobuf
    
    # Install ChromaDB with user flag to avoid system package conflicts
    $PIP3_CMD install --user "chromadb[server]"
    if [ $? -ne 0 ]; then
        echo ""
        echo "Installation with --user failed, trying without --user..."
        $PIP3_CMD install "chromadb[server]"
        if [ $? -ne 0 ]; then
            echo "ERROR: Failed to install ChromaDB"
            echo "Try running: ./setup-chromadb-linux.sh"
            exit 1
        fi
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

# Check SQLite version and use pysqlite3 if needed
SQLITE_VERSION=$(${PYTHON3_CMD} -c "import sqlite3; print(sqlite3.sqlite_version)" 2>/dev/null)
USE_PYSQLITE="false"

if [ ! -z "$SQLITE_VERSION" ]; then
    echo "Detected SQLite version: $SQLITE_VERSION"
    # Extract major.minor version (e.g., "3.31" from "3.31.1")
    SQLITE_MAJOR_MINOR=$(echo "$SQLITE_VERSION" | cut -d. -f1,2)
    SQLITE_MAJOR=$(echo "$SQLITE_MAJOR_MINOR" | cut -d. -f1)
    SQLITE_MINOR=$(echo "$SQLITE_MAJOR_MINOR" | cut -d. -f2)
    
    # Check if version is 3.30-3.34 (too old) - using numeric comparison
    if [ "$SQLITE_MAJOR" = "3" ]; then
        if [ "$SQLITE_MINOR" -lt 35 ]; then
            echo "SQLite version $SQLITE_VERSION is too old (requires >= 3.35.0). Using pysqlite3-binary..."
            USE_PYSQLITE="true"
            
            # Check if pysqlite3 is installed
            if ! ${PYTHON3_CMD} -c "import pysqlite3" 2>/dev/null; then
                echo "Installing pysqlite3-binary..."
                $PIP3_CMD install --user pysqlite3-binary
                if [ $? -ne 0 ]; then
                    echo "ERROR: Failed to install pysqlite3-binary"
                    echo "Try running: pip3 install --user pysqlite3-binary"
                    exit 1
                fi
            else
                echo "pysqlite3-binary is already installed"
            fi
        else
            echo "SQLite version is OK"
        fi
    fi
else
    echo "WARNING: Could not detect SQLite version, will try regular chroma command"
fi
echo ""

# Start ChromaDB server using chroma CLI
echo "Attempting to start ChromaDB server..."

# Use pysqlite3 wrapper if SQLite is too old
if [ "$USE_PYSQLITE" = "true" ]; then
    # Use the Python wrapper script that uses pysqlite3
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    echo "Using pysqlite3 wrapper to start ChromaDB..."
    ${PYTHON3_CMD} "${SCRIPT_DIR}/run_chroma_pysqlite.py" run --path ./chroma_db --host localhost --port 8000
    CHROMA_EXIT_CODE=$?
else
    # Try regular chroma command first, but if it fails due to SQLite, use wrapper
    chroma run --path ./chroma_db --host localhost --port 8000 2>&1 | tee /tmp/chroma_output.log
    CHROMA_EXIT_CODE=${PIPESTATUS[0]}
    
    # Check if error was due to SQLite version
    if [ $CHROMA_EXIT_CODE -ne 0 ]; then
        if grep -q "unsupported version of sqlite3" /tmp/chroma_output.log 2>/dev/null; then
            echo ""
            echo "SQLite version error detected. Switching to pysqlite3 wrapper..."
            USE_PYSQLITE="true"
            # Install pysqlite3 if not already installed
            if ! ${PYTHON3_CMD} -c "import pysqlite3" 2>/dev/null; then
                echo "Installing pysqlite3-binary..."
                $PIP3_CMD install --user pysqlite3-binary
            fi
            SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
            ${PYTHON3_CMD} "${SCRIPT_DIR}/run_chroma_pysqlite.py" run --path ./chroma_db --host localhost --port 8000
            CHROMA_EXIT_CODE=$?
        fi
    fi
fi

if [ $CHROMA_EXIT_CODE -ne 0 ]; then
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

