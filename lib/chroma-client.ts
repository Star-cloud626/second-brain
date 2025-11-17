/**
 * ChromaDB Client Setup
 * Manages vector database connection and operations
 */

import { 
  ChromaClient, 
  Collection, 
  DefaultEmbeddingFunction,
  ChromaNotFoundError,
} from 'chromadb';

// ChromaDB requires a running server - it doesn't support embedded/local file storage
// For local development, we'll connect to localhost:8000
// You need to run: ./start-chromadb-linux.sh (or set CHROMA_PATH)
const CHROMA_PATH = process.env.CHROMA_PATH || process.env.CHROMA_HOST 
  ? `${process.env.CHROMA_SSL === 'true' ? 'https' : 'http'}://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || 8000}`
  : 'http://localhost:8000';

const VERSION_MISMATCH_MESSAGE = 
  `ChromaDB Version Mismatch Detected\n\n` +
  `The JavaScript client (chromadb v1.x) requires ChromaDB server 0.5+ which supports the v2 API.\n` +
  `Your server is running ChromaDB 0.4.22 which only supports the v1 API.\n\n` +
  `To fix this, you need to upgrade Python to 3.9+ and reinstall ChromaDB:\n\n` +
  `  1. Install Python 3.9 or later:\n` +
  `     sudo apt update\n` +
  `     sudo apt install python3.9 python3.9-pip\n\n` +
  `  2. Update setup script to use Python 3.9, then run:\n` +
  `     ./setup-chromadb-linux.sh\n` +
  `     (The script will detect Python 3.9+ and install ChromaDB 0.5+)\n\n` +
  `  3. Restart ChromaDB server:\n` +
  `     ./start-chromadb-linux.sh\n\n` +
  `Note: ChromaDB 0.4.x and the JavaScript client v1.x are incompatible.\n` +
  `You must upgrade to ChromaDB 0.5+ for the client to work.`;

// Lazy initialization - only create client when needed
let client: ChromaClient | null = null;

/**
 * Get or create the ChromaDB client
 * This ensures the client is only created when actually needed
 */
function getClient(): ChromaClient {
  if (!client) {
    console.log(`Initializing ChromaDB client: ${CHROMA_PATH}`);
    try {
      client = new ChromaClient({
        path: CHROMA_PATH,
      });
    } catch (error: any) {
      console.error('Failed to create ChromaDB client:', error);
      throw new Error(
        `Failed to initialize ChromaDB client: ${error.message || 'Unknown error'}\n` +
        `Make sure ChromaDB server is running at ${CHROMA_PATH}`
      );
    }
  }
  return client;
}

/**
 * Test connection to ChromaDB server
 */
async function testConnection(): Promise<boolean> {
  try {
    const clientInstance = getClient();
    // Try to list collections as a connection test
    await clientInstance.listCollections();
    return true;
  } catch (error: any) {
    console.error('ChromaDB connection test failed:', error.message);
    return false;
  }
}

const COLLECTION_NAME = 'episode_transcripts';

export interface EmbeddingDocument {
  id: string;
  text: string;
  episodeId: string;
  episodeTitle?: string;
  chunkIndex: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Get or create the collection for episode transcripts
 * We provide embeddings manually, so we don't need an embedding function
 */
export async function getCollection() {
  try {
    const clientInstance = getClient();
    await ensureServerSupportsV2(clientInstance);

    const collection = await clientInstance.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: new DefaultEmbeddingFunction(),
      metadata: {
        description: 'YouTube episode transcripts with embeddings',
      },
    });

    return collection;
  } catch (error: any) {
    console.error('Error getting collection:', error);
    
    // If it's already our custom error message, just re-throw it
    if (error.message && error.message.includes('Cannot connect to ChromaDB')) {
      throw error;
    }
    
    // Provide helpful error message if connection fails
    if (
      error?.message?.includes('ECONNREFUSED') || 
      error?.message?.includes('fetch failed') ||
      error?.name === 'ChromaConnectionError' ||
      error?.message?.includes('Failed to connect') ||
      error?.message?.includes('NetworkError')
    ) {
      throw new Error(
        `Cannot connect to ChromaDB server at ${CHROMA_PATH}.\n\n` +
        `Please make sure ChromaDB server is running:\n` +
        `  1. Run: ./start-chromadb-linux.sh\n` +
        `  2. Or manually: python3 run_chroma_pysqlite.py run --path ./chroma_db --host localhost --port 8000\n\n` +
        `Verify the server is running by opening: ${CHROMA_PATH}/api/v1/heartbeat\n` +
        `You should see a JSON response with "nanosecond heartbeat".`
      );
    }
    
    throw error;
  }
}

function createVersionMismatchError() {
  return new Error(VERSION_MISMATCH_MESSAGE);
}

function isV2UnsupportedError(error: any) {
  if (!error) {
    return false;
  }
  const message = error.message || '';
  return (
    error instanceof ChromaNotFoundError ||
    message.includes('/api/v2/') ||
    message.includes('api/v2')
  );
}

async function ensureServerSupportsV2(clientInstance: ChromaClient) {
  try {
    await clientInstance.heartbeat();
  } catch (error: any) {
    if (isV2UnsupportedError(error)) {
      throw createVersionMismatchError();
    }
    throw error;
  }
}

/**
 * Add documents to the collection
 */
export async function addDocuments(
  embeddings: number[][],
  documents: EmbeddingDocument[]
) {
  const collection = await getCollection();
  console.log("collection", collection);
  const ids = documents.map((doc) => doc.id);
  const texts = documents.map((doc) => doc.text);
  const metadatas = documents.map((doc) => ({
    episodeId: doc.episodeId,
    episodeTitle: doc.episodeTitle || '',
    chunkIndex: doc.chunkIndex.toString(),
    timestamp: doc.timestamp || '',
    ...doc.metadata,
  }));

  await collection.add({
    ids,
    embeddings,
    documents: texts,
    metadatas,
  });

  return { success: true, count: documents.length };
}

/**
 * Search for similar documents
 */
export async function searchSimilar(
  queryEmbedding: number[],
  nResults: number = 10,
  filter?: { episodeId?: string }
) {
  const collection = await getCollection();
  
  const where: any = {};
  if (filter?.episodeId) {
    where.episodeId = filter.episodeId;
  }

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults,
    where: Object.keys(where).length > 0 ? where : undefined,
  });

  return results;
}

/**
 * Get all episodes
 */
export async function getAllEpisodes() {
  const collection = await getCollection();
  
  // Get all documents to extract unique episodes
  const results = await collection.get();
  
  const episodesMap = new Map<string, any>();
  
  if (results.metadatas) {
    results.metadatas.forEach((metadata: any, index: number) => {
      const episodeId = metadata?.episodeId;
      if (episodeId && !episodesMap.has(episodeId)) {
        episodesMap.set(episodeId, {
          episodeId,
          title: metadata?.episodeTitle || `Episode ${episodeId}`,
          chunkCount: 0,
        });
      }
      if (episodeId) {
        const episode = episodesMap.get(episodeId);
        if (episode) {
          episode.chunkCount++;
        }
      }
    });
  }

  return Array.from(episodesMap.values());
}

/**
 * Get episode by ID
 */
export async function getEpisodeById(episodeId: string) {
  const collection = await getCollection();
  
  const results = await collection.get({
    where: { episodeId },
  });

  if (!results.documents || results.documents.length === 0) {
    return null;
  }

  const chunks = results.documents
    .filter((doc): doc is string => doc !== null)
    .map((doc: string, index: number) => ({
      text: doc,
      chunkIndex: results.metadatas?.[index]?.chunkIndex || index,
      timestamp: results.metadatas?.[index]?.timestamp,
    }));

  return {
    episodeId,
    title: results.metadatas?.[0]?.episodeTitle || `Episode ${episodeId}`,
    chunks,
    chunkCount: chunks.length,
  };
}

// Export getClient function for external use if needed
export { getClient };

