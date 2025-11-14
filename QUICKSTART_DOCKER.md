# Quick Start - Docker on Ubuntu

Get the Second Brain app running on Ubuntu in 3 simple steps!

## 🚀 Quick Start (3 Steps)

### Step 1: Install Docker (if not already installed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker  # or log out and back in
```

### Step 2: Navigate to project and start

```bash
cd second-brain
docker-compose up -d
```

### Step 3: Access the app

Open your browser: `http://localhost:3000`

That's it! 🎉

## 📤 Adding Transcripts

### Option 1: Web Interface (Easiest)

1. Go to `http://localhost:3000/ingest`
2. Upload your transcript files one by one

### Option 2: Batch Processing

1. Place transcript files in `./transcripts` folder
2. Run batch ingestion:
   ```bash
   docker exec -it second-brain tsx scripts/batch-ingest.ts /app/transcripts
   ```

## 🔍 View Logs

```bash
docker-compose logs -f
```

## 🛑 Stop the App

```bash
docker-compose down
```

## 📊 Check Status

```bash
docker-compose ps
```

## 🔄 Restart

```bash
docker-compose restart
```

## 💾 Data Persistence

All your data (episodes, embeddings) is stored in Docker volumes and persists even if you stop the container.

**View volumes:**
```bash
docker volume ls
```

**Backup data:**
```bash
docker run --rm -v second-brain_chroma_data:/data -v $(pwd):/backup alpine tar czf /backup/chroma_backup.tar.gz /data
```

---

**Need more details?** See [DOCKER.md](./DOCKER.md) for comprehensive documentation.

