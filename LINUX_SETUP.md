# ChromaDB Setup Guide for Linux

This guide will help you set up ChromaDB on Linux for the Second Brain project.

## Prerequisites

- **Linux** (Ubuntu, Debian, Fedora, Arch, etc.)
- **Python 3.8-3.11** (Python 3.12+ may have compatibility issues)
- **pip3** (Python package manager)

## Quick Start

### 1. Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip
```

**Fedora:**
```bash
sudo dnf install python3 python3-pip
```

**Arch Linux:**
```bash
sudo pacman -S python python-pip
```

### 2. Setup ChromaDB

Run the setup script:
```bash
chmod +x setup-chromadb-linux.sh
./setup-chromadb-linux.sh
```

This will:
- Check Python installation
- Install ChromaDB with server support
- Create the data directory

### 3. Start ChromaDB Server

In a terminal (keep it running):
```bash
chmod +x start-chromadb-linux.sh
./start-chromadb-linux.sh
```

You should see:
```
Saving data to: ./chroma_db
Connect to Chroma at: http://localhost:8000
```

### 4. Start the Next.js App

In another terminal:
```bash
npm install
npm run dev
```

The app will be available at http://localhost:3000

## Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# Install ChromaDB
pip3 install chromadb[server]

# Create data directory
mkdir -p chroma_db

# Start ChromaDB server
chroma run --path ./chroma_db --host localhost --port 8000
```

## Daily Usage

1. **Start ChromaDB** (Terminal 1):
   ```bash
   ./start-chromadb-linux.sh
   ```

2. **Start Next.js App** (Terminal 2):
   ```bash
   npm run dev
   ```

3. **Access the app**: Open http://localhost:3000

## Troubleshooting

### "Cannot connect to ChromaDB"
- Make sure ChromaDB server is running (check Terminal 1)
- Verify it's accessible: Open http://localhost:8000/api/v1/heartbeat in browser
- Should return: `{"nanosecond heartbeat": ...}`

### "ChromaDB not found"
- Run: `./setup-chromadb-linux.sh`
- Or manually: `pip3 install chromadb[server]`

### "Permission denied" when running scripts
- Make scripts executable: `chmod +x *.sh`

### Port 8000 already in use
- Find the process: `lsof -i :8000` or `netstat -tulpn | grep 8000`
- Kill it: `kill -9 <PID>`
- Or use a different port: `chroma run --path ./chroma_db --host localhost --port 8001`
- Then update `.env`: `CHROMA_PORT=8001`

### Python version issues
- ChromaDB works best with Python 3.8-3.11
- Check your version: `python3 --version`
- If you have Python 3.12+, consider using `pyenv` to install Python 3.11

## Utility Scripts

- **`setup-chromadb-linux.sh`**: Initial setup and installation
- **`start-chromadb-linux.sh`**: Start the ChromaDB server
- **`clean-chromadb-linux.sh`**: Clean up lock files (keeps data)
- **`reset-chromadb-linux.sh`**: Complete reset (deletes all data)
- **`test-chromadb-connection-linux.sh`**: Test if ChromaDB is running

## Production Deployment

For production on Linux, consider:

1. **Use systemd service** to keep ChromaDB running:
   ```bash
   # Create service file: /etc/systemd/system/chromadb.service
   [Unit]
   Description=ChromaDB Server
   After=network.target

   [Service]
   Type=simple
   User=your-user
   WorkingDirectory=/path/to/second-brain
   ExecStart=/usr/bin/chroma run --path ./chroma_db --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

2. **Use a reverse proxy** (nginx) for the Next.js app

3. **Set up proper backups** for the `chroma_db` directory

## Notes

- ChromaDB works much better on Linux than Windows (no file locking issues)
- The server must be running before using the app
- Data is stored in the `chroma_db` directory
- First run will download the embedding model (~80MB)

