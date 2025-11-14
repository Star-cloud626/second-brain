/**
 * ChromaDB Client Setup
 * Manages vector database connection and operations
 */

import { ChromaClient } from 'chromadb';

const client = new ChromaClient({
  path: process.env.CHROMA_DB_PATH || './chroma_db',
});

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
 */
export async function getCollection() {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: {
        description: 'YouTube episode transcripts with embeddings',
      },
    });
    return collection;
  } catch (error) {
    console.error('Error getting collection:', error);
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

  const chunks = results.documents.map((doc: string, index: number) => ({
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

export { client };

