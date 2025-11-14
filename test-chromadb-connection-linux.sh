#!/bin/bash

echo "========================================"
echo "ChromaDB Connection Test (Linux)"
echo "========================================"
echo ""

echo "Testing connection to ChromaDB at localhost:8000..."
echo ""

# Test using curl
if command -v curl &> /dev/null; then
    response=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/v1/heartbeat 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "SUCCESS: ChromaDB is running!"
        echo "$body"
    else
        echo "ERROR: Cannot connect to ChromaDB"
        echo "HTTP Status: $http_code"
    fi
elif command -v wget &> /dev/null; then
    if wget -q --spider http://localhost:8000/api/v1/heartbeat 2>&1; then
        echo "SUCCESS: ChromaDB is running!"
        wget -q -O- http://localhost:8000/api/v1/heartbeat
    else
        echo "ERROR: Cannot connect to ChromaDB"
    fi
else
    echo "ERROR: Neither curl nor wget is installed."
    echo "Please install one of them to test the connection."
    exit 1
fi

echo ""
echo "========================================"
echo "If you see ERROR above:"
echo "  1. Make sure ChromaDB is running (./start-chromadb-linux.sh)"
echo "  2. Check if port 8000 is available"
echo "  3. Try restarting ChromaDB server"
echo "========================================"
echo ""

