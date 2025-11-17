# Second Brain - YouTube Transcript Search

A semantic search interface for YouTube episode transcripts using vector database technology. This application allows you to search through episode transcripts using natural language queries, powered by free local Hugging Face embeddings and ChromaDB.

## 🚀 Features

- **Semantic Search**: Search transcripts using natural language queries
- **Vector Database**: Efficient storage and retrieval using ChromaDB
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Batch Processing**: Process multiple transcript files at once
- **Episode Browsing**: Browse and view individual episodes
- **Highlighted Results**: Search results with highlighted matching content
- **100% Local**: No API keys needed - uses free local Hugging Face models

## 📋 Prerequisites

### System Requirements

- **Linux** (Ubuntu 20.04+, Debian 11+, Fedora 34+, Arch Linux, or similar)
- **Python 3.9+** (required for ChromaDB 0.5+ which supports v2 API)
- **Node.js 18+** and npm
- **SQLite 3.35+** (usually pre-installed, but may need pysqlite3-binary for older systems)

### Why Python 3.9+?

The JavaScript client (`chromadb` v1.x) requires ChromaDB server 0.5+ which only supports Python 3.9+. Older Python versions will install ChromaDB 0.4.x which is incompatible with the JavaScript client.

## 🛠️ Installation & Setup

### Step 1: Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3.9-dev nodejs npm
```

**Fedora:**
```bash
sudo dnf install python3.9 python3.9-pip nodejs npm
```

**Arch Linux:**
```bash
sudo pacman -S python python-pip nodejs npm
```

**Verify Python version:**
```bash
python3 --version  # Should show 3.9 or higher
```

If Python 3.9+ is not available, you may need to:
1. Install Python 3.9 from source or use `pyenv`
2. Or use `python3.9` explicitly if multiple versions are installed

### Step 2: Install Python Dependencies (ChromaDB)

Make the setup script executable and run it:
```bash
chmod +x setup-chromadb-linux.sh
./setup-chromadb-linux.sh
```

This script will:
- Detect Python 3.9+ installation
- Install ChromaDB 0.5+ with server support
- Handle SQLite compatibility (installs pysqlite3-binary if needed)
- Create the `chroma_db` data directory

**Manual installation (if script fails):**
```bash
# Ensure pip is available for Python 3.9
python3.9 -m ensurepip --upgrade
# Or: curl -sS https://bootstrap.pypa.io/get-pip.py | python3.9

# Install ChromaDB
python3.9 -m pip install --user chromadb[server]

# If SQLite is too old (< 3.35), install pysqlite3-binary
python3.9 -m pip install --user pysqlite3-binary
```

### Step 3: Install Node.js Dependencies

```bash
npm install
```

This installs:
- Next.js 16 (React framework)
- ChromaDB JavaScript client (v1.10.5)
- Hugging Face Transformers (@xenova/transformers)
- UI components and utilities

### Step 4: Start ChromaDB Server

**Important**: ChromaDB must be running before starting the app.

In a terminal (keep it running):
```bash
chmod +x start-chromadb-linux.sh
./start-chromadb-linux.sh
```

You should see:
```
Starting ChromaDB server on localhost:8000...
Saving data to: ./chroma_db
Connect to Chroma at: http://localhost:8000
```

**Verify it's running:**
```bash
# Test connection
./test-chromadb-connection-linux.sh

# Or manually check
curl http://localhost:8000/api/v2/heartbeat
# Should return: {"nanosecond heartbeat": ...}
```

**Manual start (if script fails):**
```bash
# If using pysqlite3 (for old SQLite)
python3.9 run_chroma_pysqlite.py run --path ./chroma_db --host localhost --port 8000

# Or regular chroma command
chroma run --path ./chroma_db --host localhost --port 8000
```

### Step 5: Start the Application

In a **new terminal** (keep ChromaDB running in the first terminal):
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📤 Ingesting Transcripts

### Option 1: Batch Processing (Recommended)

Process all transcript files at once:

```bash
# Place transcript files in ./transcripts/ directory
mkdir -p transcripts

# Run batch ingestion
npm run ingest
# Or: npx tsx scripts/batch-ingest.ts ./transcripts
```

This will:
- Process all `.txt` files in the `transcripts` directory
- Parse and chunk each transcript (~300-500 words per chunk)
- Generate embeddings using local Hugging Face models (free, no API needed!)
- Store everything in ChromaDB
- Show a summary of processed files

### Option 2: Web Interface

1. Navigate to [http://localhost:3000/ingest](http://localhost:3000/ingest)
2. Upload transcript files one at a time
3. The system will automatically process and store them

### Transcript File Format

Place `.txt` files in the `transcripts/` directory. Files should contain:
- Speaker names (e.g., `Ronsley Vaz: ~ Hello, everybody,~`)
- Timestamps in format `[00:00:00]`
- Dialogue text (may include tilde markers `~`)

Example:
```
Ronsley Vaz: ~ Hello, everybody,~
[00:00:00] Today's session is all around deep seek.
[00:00:15] We're going to talk about installation and setup.
```

## 🔍 Using the Search Interface

1. Go to the home page ([http://localhost:3000](http://localhost:3000))
2. Enter your search query in the search bar (e.g., "deep seek installation")
3. View semantic search results with:
   - Episode title and metadata
   - Relevant text excerpts
   - Highlighted matching content
   - Similarity scores

## 🏗️ Implementation Details

### Architecture Overview

```
┌─────────────────┐
│   Next.js App   │  (Frontend + API Routes)
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP API
         ▼
┌─────────────────┐
│  ChromaDB Server │  (Vector Database)
│   (Port 8000)   │
└─────────────────┘
```

### Core Components

#### 1. **ChromaDB Client** (`lib/chroma-client.ts`)
- Manages connection to ChromaDB server
- Handles collection creation and retrieval
- Implements version compatibility checks (ensures v2 API support)
- Uses `getOrCreateCollection` for automatic collection management

#### 2. **Embeddings Client** (`lib/embeddings-client.ts`)
- Uses Hugging Face `all-MiniLM-L6-v2` model (384 dimensions)
- Runs locally via `@xenova/transformers` (no API key needed)
- Generates embeddings for text chunks
- First run downloads model (~80MB), then cached locally

#### 3. **Transcript Processor** (`lib/transcript-processor.ts`)
- Parses transcript files with speaker names and timestamps
- Chunks transcripts into ~300-500 word segments
- Preserves context with 50-word overlap between chunks
- Extracts episode metadata (title, date, etc.)

#### 4. **API Routes** (`app/api/`)
- `/api/ingest` - Upload and process transcript files
- `/api/search` - Semantic search endpoint
- `/api/episodes` - List all episodes
- `/api/episode/[id]` - Get episode details

### Data Flow

1. **Ingestion**:
   ```
   Transcript File → Parse → Chunk → Generate Embeddings → Store in ChromaDB
   ```

2. **Search**:
   ```
   Query → Generate Embedding → Vector Search in ChromaDB → Return Results
   ```

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Vector Database**: ChromaDB 0.5+ (Python server)
- **Embeddings**: Hugging Face Transformers (local, free)
  - Model: `Xenova/all-MiniLM-L6-v2` (384 dimensions)
  - Runs entirely on your machine using `@xenova/transformers`
- **Icons**: Lucide React

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# ChromaDB Connection
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_SSL=false

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: Default values work for local development. No API keys needed!

### ChromaDB Configuration

ChromaDB data is stored in `./chroma_db/` directory. The server runs on `localhost:8000` by default.

## 📁 Project Structure

```
second-brain/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── ingest/        # Transcript ingestion endpoint
│   │   ├── search/        # Semantic search endpoint
│   │   ├── episodes/      # Episodes listing endpoint
│   │   └── episode/[id]/  # Episode details endpoint
│   ├── ingest/            # Upload page
│   ├── episode/[id]/      # Episode detail page
│   └── page.tsx           # Home/search page
├── components/             # React components
│   ├── search-bar.tsx     # Search input component
│   ├── search-results.tsx # Results display
│   ├── episode-card.tsx   # Episode card component
│   └── ui/                # shadcn/ui components
├── lib/                    # Core libraries
│   ├── transcript-processor.ts  # Transcript parsing & chunking
│   ├── embeddings-client.ts     # Hugging Face embeddings client (local, free)
│   ├── chroma-client.ts         # ChromaDB client
│   └── utils.ts                 # Utility functions
├── scripts/                # Utility scripts
│   └── batch-ingest.ts     # Batch processing script
├── store/                  # State management
│   └── search-store.ts     # Zustand store
├── transcripts/            # Transcript files directory (create this)
├── chroma_db/              # ChromaDB data directory (created automatically)
├── setup-chromadb-linux.sh # ChromaDB setup script
├── start-chromadb-linux.sh # ChromaDB start script
├── clean-chromadb-linux.sh # Clean lock files (keeps data)
├── reset-chromadb-linux.sh # Complete reset (deletes all data)
└── test-chromadb-connection-linux.sh # Test connection script
```

## 🐛 Troubleshooting

### ChromaDB Version Mismatch Error

**Error**: "ChromaDB Version Mismatch Detected - requires ChromaDB server 0.5+"

**Solution**:
1. Ensure Python 3.9+ is installed: `python3 --version`
2. Reinstall ChromaDB: `./setup-chromadb-linux.sh`
3. Restart ChromaDB server: `./start-chromadb-linux.sh`

The JavaScript client requires ChromaDB 0.5+ which only works with Python 3.9+.

### "Cannot connect to ChromaDB"

**Verify server is running**:
```bash
./test-chromadb-connection-linux.sh
# Or: curl http://localhost:8000/api/v2/heartbeat
```

**Check if server crashed**: Look at the ChromaDB terminal window for error messages

**Restart ChromaDB**:
1. Stop the server (Ctrl+C in the ChromaDB terminal)
2. Run `./clean-chromadb-linux.sh` to remove lock files
3. Run `./start-chromadb-linux.sh` again

**Port already in use**:
```bash
# Find process using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>
```

### SQLite Version Issues

**Error**: "unsupported version of sqlite3"

**Solution**: The start script automatically detects this and uses `pysqlite3-binary`. If it doesn't:
```bash
python3.9 -m pip install --user pysqlite3-binary
# Then use: python3.9 run_chroma_pysqlite.py run --path ./chroma_db --host localhost --port 8000
```

### Model Loading Errors

- First run downloads the model (~80MB). Ensure internet connection.
- If download fails, check your internet connection and try again
- The model is cached locally after first download in `~/.cache/huggingface/`

### "No episodes found"

- Make sure you've ingested at least one transcript file
- Check that ChromaDB server is running
- Verify data exists: Check `chroma_db/` directory

### Batch Processing Fails

- Check that all transcript files are valid `.txt` files
- Ensure the model downloaded successfully (check console for errors)
- First run may be slower as the model loads - subsequent runs are faster

### Permission Denied on Scripts

```bash
chmod +x *.sh
```

## 🚀 Daily Usage

### Starting the Application

**Terminal 1** - Start ChromaDB:
```bash
./start-chromadb-linux.sh
```

**Terminal 2** - Start Next.js:
```bash
npm run dev
```

**Browser**: Open http://localhost:3000

### Stopping the Application

1. Stop Next.js: Ctrl+C in Terminal 2
2. Stop ChromaDB: Ctrl+C in Terminal 1

### Utility Scripts

- **`setup-chromadb-linux.sh`**: Initial setup and installation
- **`start-chromadb-linux.sh`**: Start the ChromaDB server
- **`clean-chromadb-linux.sh`**: Clean up lock files (keeps data)
- **`reset-chromadb-linux.sh`**: Complete reset (deletes all data) ⚠️
- **`test-chromadb-connection-linux.sh`**: Test if ChromaDB is running

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js)
- [Xenova Transformers](https://github.com/xenova/transformers.js)
- [LINUX_SETUP.md](./LINUX_SETUP.md) - Detailed Linux setup guide
- [QUICKSTART_LINUX.md](./QUICKSTART_LINUX.md) - Quick start guide

## 🚢 Production Deployment

### Systemd Service (Recommended)

Create `/etc/systemd/system/chromadb.service`:

```ini
[Unit]
Description=ChromaDB Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/second-brain
ExecStart=/usr/bin/python3.9 /home/your-user/.local/bin/chroma run --path ./chroma_db --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable chromadb
sudo systemctl start chromadb
```

### Reverse Proxy (nginx)

Example nginx configuration for Next.js app:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Backups

Regularly backup the `chroma_db/` directory:
```bash
tar -czf chroma_db_backup_$(date +%Y%m%d).tar.gz chroma_db/
```

## 📝 Notes

- **Chunking Strategy**: Transcripts are split into ~300-500 word chunks with 50-word overlap for context preservation
- **Embedding Model**: Uses Hugging Face `all-MiniLM-L6-v2` (384 dimensions) - runs locally, completely free!
- **Storage**: ChromaDB stores embeddings locally in `./chroma_db` directory
- **First Run**: The first time you run the app, it will download the embedding model (~80MB). This only happens once.
- **Performance**: Local embeddings are fast and don't require internet after the initial model download
- **Linux Only**: This application is optimized for Linux. Windows support is not provided due to file locking issues with ChromaDB.

---

**Built with ❤️ for semantic search and knowledge retrieval**
