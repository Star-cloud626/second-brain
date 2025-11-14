# Second Brain - YouTube Transcript Search

A semantic search interface for YouTube episode transcripts using vector database technology. This application allows you to search through episode transcripts using natural language queries, powered by free local Hugging Face embeddings and ChromaDB.

## 🚀 Features

- **Semantic Search**: Search transcripts using natural language queries
- **Vector Database**: Efficient storage and retrieval using ChromaDB
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Batch Processing**: Process multiple transcript files at once
- **Episode Browsing**: Browse and view individual episodes
- **Highlighted Results**: Search results with highlighted matching content

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Transcript files in `.txt` format
- **No API keys needed!** Uses free local Hugging Face models

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration (Optional)

Create a `.env` file in the root directory (optional - only if you want to customize):

```env
CHROMA_DB_PATH=./chroma_db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: No API keys needed! The app uses free local Hugging Face models that run entirely on your machine.

### 3. Prepare Transcript Files

1. Create a `transcripts` directory in the project root
2. Place your transcript `.txt` files in this directory
3. Name files with episode IDs (e.g., `125.txt`, `126.txt`, etc.)

**Transcript Format**: The parser expects transcripts with:
- Speaker names (e.g., `Ronsley Vaz: ~ Hello, everybody,~`)
- Timestamps in format `[00:00:00]`
- Dialogue text (may include tilde markers `~`)

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📤 Ingesting Transcripts

### Option 1: Batch Processing (Recommended for Multiple Files)

Use the batch ingest script to process all transcript files at once:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run batch ingestion
npx tsx scripts/batch-ingest.ts ./transcripts
```

This will:
- Process all `.txt` files in the `transcripts` directory
- Parse and chunk each transcript
- Generate embeddings using local Hugging Face models (free, no API needed!)
- Store everything in ChromaDB
- Show a summary of processed files

### Option 2: Web Interface

1. Navigate to [http://localhost:3000/ingest](http://localhost:3000/ingest)
2. Upload transcript files one at a time
3. The system will automatically process and store them

## 🔍 Using the Search Interface

1. Go to the home page ([http://localhost:3000](http://localhost:3000))
2. Enter your search query in the search bar
3. View semantic search results with:
   - Episode title and metadata
   - Relevant text excerpts
   - Highlighted matching content
   - Similarity scores

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
└── transcripts/            # Transcript files directory (create this)
```

## 🔧 API Endpoints

### `POST /api/ingest`
Upload and process a transcript file.

**Request**: FormData with `file` and optional `episodeId`

**Response**:
```json
{
  "success": true,
  "episodeId": "125",
  "title": "Episode 125",
  "chunksProcessed": 45,
  "message": "Transcript ingested successfully"
}
```

### `GET /api/search?q=query&limit=10&episodeId=optional`
Perform semantic search.

**Response**:
```json
{
  "query": "deep seek installation",
  "results": [
    {
      "id": "125_chunk_0",
      "text": "...",
      "episodeId": "125",
      "episodeTitle": "Episode 125",
      "similarity": 0.85
    }
  ],
  "count": 10
}
```

### `GET /api/episodes`
List all episodes.

### `GET /api/episode/[id]`
Get specific episode details.

## 🎨 Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Vector Database**: ChromaDB
- **Embeddings**: Hugging Face Transformers (local, free - no API key needed!)
  - Model: `all-MiniLM-L6-v2` (384 dimensions)
  - Runs entirely on your machine using `@xenova/transformers`
- **Icons**: Lucide React

## 📝 Notes

- **Chunking Strategy**: Transcripts are split into ~300-500 word chunks with 50-word overlap for context preservation
- **Embedding Model**: Uses Hugging Face `all-MiniLM-L6-v2` (384 dimensions) - runs locally, completely free!
- **Storage**: ChromaDB stores embeddings locally in `./chroma_db` directory
- **First Run**: The first time you run the app, it will download the embedding model (~80MB). This only happens once.
- **Performance**: Local embeddings are fast and don't require internet after the initial model download

## 🐛 Troubleshooting

### "Model loading errors"
- The first run downloads the model (~80MB). Make sure you have internet connection.
- If download fails, check your internet connection and try again
- The model is cached locally after first download

### "No episodes found"
- Make sure you've ingested at least one transcript file
- Check that ChromaDB is running and the database path is correct

### Batch processing fails
- Check that all transcript files are valid `.txt` files
- Ensure the model downloaded successfully (check console for errors)
- First run may be slower as the model loads - subsequent runs are faster

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js)
- [Xenova Transformers](https://github.com/xenova/transformers.js)

## 🚢 Deployment

### Docker Deployment (Recommended for Ubuntu/Linux)

The easiest way to deploy on Ubuntu is using Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

See [DOCKER.md](./DOCKER.md) for detailed Docker deployment instructions.

### Other Deployment Options

This application can also be deployed to:
- **Vercel**: Next.js platform (note: ChromaDB data persistence may require external storage)
- **Netlify**: Similar considerations as Vercel
- **Any Node.js hosting**: Ensure Node.js 18+ and proper data persistence

**Important for production:**
1. Set environment variables in your hosting platform
2. Ensure ChromaDB data persistence (use volumes in Docker, or cloud storage)
3. The Hugging Face model cache should persist between restarts

---

**Built with ❤️ for semantic search and knowledge retrieval**
