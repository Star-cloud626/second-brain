# Quick Start Guide - Linux

## 3-Step Setup

### Step 1: Install ChromaDB
```bash
chmod +x setup-chromadb-linux.sh
./setup-chromadb-linux.sh
```

### Step 2: Start ChromaDB Server
```bash
chmod +x start-chromadb-linux.sh
./start-chromadb-linux.sh
```
**Keep this terminal open!** ChromaDB must be running.

### Step 3: Start the App
```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## That's It! 🎉

You can now:
- Upload transcript files
- Search through episodes
- Browse episode content

## Troubleshooting

**ChromaDB won't start?**
- Check if Python 3.8-3.11 is installed: `python3 --version`
- Make sure scripts are executable: `chmod +x *.sh`

**Can't connect to ChromaDB?**
- Make sure ChromaDB is running (Step 2)
- Test connection: `./test-chromadb-connection-linux.sh`
- Or open: http://localhost:8000/api/v1/heartbeat

**Need more help?**
See [LINUX_SETUP.md](./LINUX_SETUP.md) for detailed instructions.

