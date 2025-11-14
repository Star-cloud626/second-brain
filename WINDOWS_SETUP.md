# Windows Setup Guide (No Docker)

This guide will help you set up and run the Second Brain app on Windows without Docker.

## Prerequisites

1. **Python 3.9+** - [Download here](https://www.python.org/downloads/)
   - ⚠️ **Important**: During installation, check "Add Python to PATH"
   - Verify installation: Open Command Prompt and run `python --version`

2. **Node.js 18+** - Already installed (you're using npm)

## Quick Setup (3 Steps)

### Step 1: Install ChromaDB

Run the setup script:
```bash
setup-chromadb-windows.bat
```

Or manually:
```bash
pip install chromadb
```

### Step 2: Start ChromaDB Server

**Option A: Use the script**
```bash
start-chromadb-windows.bat
```

**Option B: Manual start**
```bash
chroma run --path ./chroma_db --host localhost --port 8000
```

**Keep this terminal window open** - ChromaDB server must keep running!

### Step 3: Start Your App

Open a **new terminal window** and run:
```bash
npm run dev
```

## How It Works

- **ChromaDB Server**: Runs on `localhost:8000` (Terminal 1)
- **Next.js App**: Runs on `localhost:3000` (Terminal 2)
- **Data Storage**: Stored in `./chroma_db` folder

## Troubleshooting

### "Python is not recognized"
- Python is not installed or not in PATH
- Reinstall Python and check "Add Python to PATH"
- Or add Python manually to PATH

### "chroma: command not found"
- ChromaDB not installed: Run `pip install chromadb`
- Or use: `python -m chromadb run --path ./chroma_db --host localhost --port 8000`

### "Port 8000 already in use"
- Another ChromaDB instance is running
- Stop it first, or use a different port:
  ```bash
  chroma run --path ./chroma_db --host localhost --port 8001
  ```
- Then update `.env`: `CHROMA_PORT=8001`

### "Cannot connect to ChromaDB"
- Make sure ChromaDB server is running (check Terminal 1)
- Verify it's accessible: Open http://localhost:8000/api/v1/heartbeat in browser
- Should return: `{"nanosecond heartbeat": ...}`

### "Cannot create a file when that file already exists" or "Error creating Frontend Config"
- This is a Windows file locking issue - ChromaDB can't create its config files
- **Solution 1** (keeps your data): Run `clean-chromadb.bat` to remove lock files
- **Solution 2** (fresh start): Run `reset-chromadb.bat` to completely reset ChromaDB
  - ⚠️ WARNING: This deletes ALL data - you'll need to re-ingest transcripts
- Then try starting ChromaDB again with `start-chromadb-windows.bat`

### "Cannot connect to ChromaDB" (even though server is running)
- **First**: Run `test-chromadb-connection.bat` to verify the server is actually running
- **Check if server crashed**: Look at the ChromaDB terminal window for error messages
- **Restart ChromaDB**: 
  1. Stop the server (Ctrl+C in the ChromaDB terminal)
  2. Run `clean-chromadb.bat` to remove lock files
  3. Run `start-chromadb-windows.bat` again
- **Verify server is accessible**: 
  - Open http://localhost:8000/api/v1/heartbeat in browser
  - Should return JSON with "nanosecond heartbeat"
- **Firewall**: Make sure Windows Firewall isn't blocking port 8000

## Daily Usage

1. **Start ChromaDB** (Terminal 1):
   ```bash
   start-chromadb-windows.bat
   ```

2. **Start App** (Terminal 2):
   ```bash
   npm run dev
   ```

3. **Access**: http://localhost:3000

## Stopping

- **ChromaDB**: Press `Ctrl+C` in Terminal 1
- **App**: Press `Ctrl+C` in Terminal 2

## Data Location

All your data is stored in: `C:\Users\Feras Jeffer\second-brain\chroma_db`

This folder persists even after stopping the server.

---

**Need help?** Check the main README.md or open an issue!

