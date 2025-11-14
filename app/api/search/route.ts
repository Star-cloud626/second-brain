/**
 * API Route: Semantic Search
 * GET /api/search?q=query&limit=10&episodeId=optional
 * Performs semantic search across all transcripts
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings-client';
import { searchSimilar } from '@/lib/chroma-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const episodeId = searchParams.get('episodeId') || undefined;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents
    const filter = episodeId ? { episodeId } : undefined;
    const results = await searchSimilar(queryEmbedding, limit, filter);

    // Format results
    const formattedResults = (results.documents?.[0] || []).map((doc: string, index: number) => {
      const metadata = results.metadatas?.[0]?.[index];
      const distance = results.distances?.[0]?.[index];
      const id = results.ids?.[0]?.[index];

      return {
        id,
        text: doc,
        episodeId: metadata?.episodeId,
        episodeTitle: metadata?.episodeTitle || `Episode ${metadata?.episodeId}`,
        chunkIndex: metadata?.chunkIndex ? parseInt(metadata.chunkIndex) : index,
        timestamp: metadata?.timestamp,
        similarity: distance !== undefined ? 1 - distance : undefined, // Convert distance to similarity
        metadata: metadata,
      };
    });

    return NextResponse.json({
      query,
      results: formattedResults,
      count: formattedResults.length,
    });
  } catch (error: any) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform search' },
      { status: 500 }
    );
  }
}

