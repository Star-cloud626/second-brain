#!/usr/bin/env python3
"""
ChromaDB launcher that uses pysqlite3 instead of system sqlite3
This fixes the SQLite version compatibility issue
"""
import sys
import os

# Replace sqlite3 with pysqlite3 BEFORE importing chromadb
try:
    import pysqlite3
    sys.modules['sqlite3'] = pysqlite3
    print("Using pysqlite3-binary (newer SQLite version)")
except ImportError:
    print("WARNING: pysqlite3 not found, using system sqlite3")
    print("Install with: pip3 install --user pysqlite3-binary")

# Now import and run chroma CLI
from chromadb.cli.cli import app

if __name__ == "__main__":
    app()

