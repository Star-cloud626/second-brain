# Docker Deployment Guide

This guide explains how to run the Second Brain application using Docker on Ubuntu (or any Linux system).

## 🐳 Prerequisites

- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)
- At least 2GB of free disk space (for model cache and data)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone/Navigate to the project directory:**
   ```bash
   cd second-brain
   ```

2. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Access the application:**
   - Open your browser and go to: `http://localhost:3000`
   - Or if on a remote server: `http://your-server-ip:3000`

5. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t second-brain .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name second-brain \
     -p 3000:3000 \
     -v second-brain-chroma:/app/data/chroma_db \
     -v second-brain-hf:/app/.cache/huggingface \
     -v $(pwd)/transcripts:/app/transcripts:ro \
     second-brain
   ```

3. **View logs:**
   ```bash
   docker logs -f second-brain
   ```

4. **Stop the container:**
   ```bash
   docker stop second-brain
   docker rm second-brain
   ```

## 📦 Data Persistence

The Docker setup uses volumes to persist data:

- **ChromaDB data**: Stored in `chroma_data` volume
- **Hugging Face models**: Cached in `hf_cache` volume
- **Transcripts**: Mounted from `./transcripts` directory (read-only)

### Managing Volumes

**List volumes:**
```bash
docker volume ls
```

**Inspect a volume:**
```bash
docker volume inspect second-brain_chroma_data
```

**Remove volumes (⚠️ deletes all data):**
```bash
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` to customize environment variables:

```yaml
environment:
  - CHROMA_DB_PATH=/app/data/chroma_db
  - NEXT_PUBLIC_APP_URL=http://your-domain.com
```

### Port Configuration

To change the port, modify `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Host:Container
```

Then access at `http://localhost:8080`

## 📤 Ingesting Transcripts

### Method 1: Using the Web Interface

1. Access the app at `http://localhost:3000/ingest`
2. Upload transcript files through the web interface

### Method 2: Batch Processing (Inside Container)

1. **Copy transcripts to container:**
   ```bash
   docker cp ./transcripts/. second-brain:/app/transcripts/
   ```

2. **Run batch ingestion:**
   ```bash
   docker exec -it second-brain npm run ingest /app/transcripts
   ```

### Method 3: Mount Transcripts Directory

The `docker-compose.yml` already mounts the `./transcripts` directory. Just place your files there and they'll be accessible in the container.

## 🔍 Troubleshooting

### Container won't start

**Check logs:**
```bash
docker-compose logs second-brain
```

**Common issues:**
- Port 3000 already in use: Change port in `docker-compose.yml`
- Out of disk space: Check with `df -h`
- Memory issues: Ensure Docker has enough resources allocated

### Model download issues

**First run downloads the model (~80MB). Check logs:**
```bash
docker-compose logs -f second-brain
```

**If download fails:**
- Check internet connection
- Ensure Docker has network access
- Try rebuilding: `docker-compose build --no-cache`

### Data not persisting

**Verify volumes are created:**
```bash
docker volume ls | grep second-brain
```

**Check volume mounts:**
```bash
docker inspect second-brain | grep -A 10 Mounts
```

### Access issues

**Check if container is running:**
```bash
docker ps | grep second-brain
```

**Check container health:**
```bash
docker inspect second-brain | grep Health
```

**Restart container:**
```bash
docker-compose restart
```

## 🚀 Production Deployment

### On Ubuntu Server

1. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd second-brain
   docker-compose up -d
   ```

3. **Set up reverse proxy (Nginx):**
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

### Using Docker Swarm

```bash
docker stack deploy -c docker-compose.yml second-brain
```

## 📊 Monitoring

### View resource usage:
```bash
docker stats second-brain
```

### View container logs:
```bash
docker-compose logs -f --tail=100 second-brain
```

### Execute commands in container:
```bash
docker exec -it second-brain sh
```

## 🔄 Updating the Application

1. **Pull latest changes:**
   ```bash
   git pull
   ```

2. **Rebuild and restart:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## 🗑️ Cleanup

**Stop and remove containers:**
```bash
docker-compose down
```

**Remove everything including volumes (⚠️ deletes all data):**
```bash
docker-compose down -v
docker rmi second-brain
```

## 📝 Notes

- **First run**: The first time you start the container, it will download the Hugging Face model (~80MB). This only happens once.
- **Performance**: Local embeddings run entirely in the container - no external API calls needed.
- **Data**: All data (ChromaDB and model cache) persists in Docker volumes.
- **Port**: Default port is 3000. Change in `docker-compose.yml` if needed.

---

**Need help?** Check the main README.md or open an issue!

