# Implementation Guide - Second Brain Project

## Quick Start Guide

This guide will help you implement and run the Second Brain project step by step.

## ✅ What's Already Implemented

Your project already has:
- ✅ Next.js frontend with beautiful UI
- ✅ API routes for ingestion and search
- ✅ ChromaDB integration for vector storage
- ✅ Hugging Face embeddings integration (local, free)
- ✅ Transcript parser (improved for your format)
- ✅ Batch processing script
- ✅ Search interface with highlighting

## 🚀 Step-by-Step Implementation

### Step 1: Install Dependencies

```bash
cd second-brain
npm install
```

This will install all required packages including the newly added `tsx` for running TypeScript scripts.

### Step 2: Set Up Environment Variables (Optional)

Create a `.env` file in the `second-brain` directory (optional):

```env
CHROMA_DB_PATH=./chroma_db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**No API keys needed!** The app uses free local Hugging Face models that run on your machine.

### Step 3: Prepare Transcript Files

1. Create a `transcripts` folder in the `second-brain` directory:
   ```bash
   mkdir transcripts
   ```

2. Download your 20 episode transcripts and place them in the `transcripts` folder
   - Name them as episode IDs: `125.txt`, `126.txt`, etc.
   - The format should match the sample you provided (with speaker names, timestamps, tildes)

### Step 4: Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Step 5: Ingest Transcripts

You have two options:

#### Option A: Batch Processing (Recommended for 20 files)

```bash
npm run ingest ./transcripts
```

This will:
- Process all `.txt` files in the `transcripts` directory
- Show progress for each file
- Display a summary at the end
- Handle errors gracefully

#### Option B: Web Interface

1. Go to http://localhost:3000/ingest
2. Upload files one by one
3. Wait for processing to complete

**Note**: Batch processing is faster and more efficient for multiple files.

### Step 6: Test the Search

1. Go to http://localhost:3000
2. Try searching for topics from your episodes
3. Example queries:
   - "deep seek installation"
   - "how to use ollama"
   - "vector database setup"

## 📝 Understanding the Transcript Format

Your transcripts have this format:
```
Sequence
===
Ronsley Vaz: ~ Hello, everybody,~
[00:00:00] Today's session is all around deep seek.
```

The improved parser handles:
- ✅ Speaker names (removed during processing)
- ✅ Tilde markers `~` (removed)
- ✅ Timestamps `[00:00:00]` (extracted and stored as metadata)
- ✅ Dialogue text (cleaned and chunked)

## 🔧 How It Works

### Data Flow

1. **Ingestion**:
   ```
   Transcript File → Parse → Chunk (300 words) → Generate Embeddings → Store in ChromaDB
   ```

2. **Search**:
   ```
   User Query → Generate Embedding → Similarity Search in ChromaDB → Return Results
   ```

### Chunking Strategy

- **Chunk Size**: ~300-500 words per chunk
- **Overlap**: 50 words between chunks (for context)
- **Metadata**: Episode ID, title, timestamp, chunk index

### Embeddings

- **Model**: `all-MiniLM-L6-v2` (Hugging Face)
- **Dimensions**: 384
- **Cost**: **FREE!** Runs locally on your machine
- **First Run**: Downloads model (~80MB) - only happens once

## 🎯 Testing Checklist

Before submitting to your client, test:

- [ ] All 20 episodes can be ingested successfully
- [ ] Search returns relevant results
- [ ] Episode listing shows all episodes
- [ ] Episode detail pages work
- [ ] UI is responsive (mobile, tablet, desktop)
- [ ] Error handling works (try invalid files, empty search, etc.)

## 🐛 Common Issues & Solutions

### Issue: Model loading errors
**Solution**: 
- First run downloads the model - ensure you have internet connection
- Check console for download progress
- Model is cached after first download

### Issue: ChromaDB connection errors
**Solution**: 
- Make sure ChromaDB is installed: `npm install chromadb`
- Check that `CHROMA_DB_PATH` is set correctly
- The database will be created automatically on first use

### Issue: Batch processing fails on some files
**Solution**: 
- Check that all files are valid `.txt` files
- Ensure the model downloaded successfully
- First run may be slower - subsequent runs are faster
- Check file encoding (should be UTF-8)

### Issue: Search returns no results
**Solution**:
- Make sure at least one episode has been ingested
- Check ChromaDB is storing data (check `./chroma_db` directory)
- Try a different search query

## 📊 Expected Processing Times

For 20 episodes:
- **Model Download** (first run only): ~2-5 minutes (~80MB download)
- **Parsing**: ~1-2 minutes
- **Embedding Generation**: ~10-20 minutes (runs locally on your machine)
- **Storage**: ~1 minute
- **Total First Run**: ~15-30 minutes (includes model download)
- **Total Subsequent Runs**: ~12-25 minutes (no download needed)

## 🎨 Customization

### Change Chunk Size

Edit `lib/transcript-processor.ts`:
```typescript
if (wordCount >= 300) { // Change this number
```

### Change Search Results Count

Edit `app/api/search/route.ts`:
```typescript
const limit = parseInt(searchParams.get('limit') || '10', 10); // Change default
```

### Change UI Colors

Edit `app/globals.css` or component files to customize Tailwind colors.

## 📦 Project Structure Overview

```
second-brain/
├── app/                      # Next.js pages and API routes
│   ├── api/                  # Backend API endpoints
│   ├── ingest/               # Upload page
│   ├── episode/[id]/         # Episode detail page
│   └── page.tsx              # Home/search page
├── components/                # React components
├── lib/                       # Core business logic
│   ├── transcript-processor.ts  # Parses your transcript format
│   ├── embeddings-client.ts     # Handles embeddings (Hugging Face, local)
│   └── chroma-client.ts          # Vector database operations
├── scripts/                    # Utility scripts
│   └── batch-ingest.ts          # Batch processing
├── transcripts/                # Your transcript files (create this)
└── .env                        # Environment variables (create this)
```

## 🚀 Next Steps

1. **Install dependencies**: `npm install`
2. **Set up environment**: Create `.env` file
3. **Prepare transcripts**: Download and place in `transcripts/` folder
4. **Run batch ingestion**: `npm run ingest ./transcripts`
5. **Test search**: Go to http://localhost:3000 and search
6. **Polish UI**: Customize colors, add features if needed
7. **Deploy**: Follow deployment instructions in README.md

## 💡 Tips

- Start with 1-2 test files before processing all 20
- Monitor processing time - first run downloads the model
- Keep the `chroma_db` folder (don't delete it - it contains your data)
- The batch script shows progress, so you can see what's happening

## 📞 Need Help?

- Check the README.md for detailed documentation
- Review the code comments in `lib/transcript-processor.ts`
- Test with a single file first to debug issues

---

**You're all set! Follow these steps and you'll have a working Second Brain application.** 🎉

