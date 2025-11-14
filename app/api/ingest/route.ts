/**
 * API Route: Ingest Transcripts
 * POST /api/ingest
 * Processes transcript files and stores them in the vector database
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseTranscript } from '@/lib/transcript-processor';
import { generateEmbeddingsBatch } from '@/lib/embeddings-client';
import { addDocuments, type EmbeddingDocument } from '@/lib/chroma-client';

// Ensure Node.js runtime for transformers library
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const episodeId = formData.get('episodeId') as string || 
                     file.name.replace('.txt', '').replace('.json', '');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }


    // Read file content
    const content = await file.text();

    // Parse transcript
    const { chunks, metadata } = parseTranscript(content, episodeId);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content found in transcript' },
        { status: 400 }
      );
    }

    // Generate embeddings
    const texts = chunks.map((chunk) => chunk.text);

    const embeddings = await generateEmbeddingsBatch(texts);

    // Prepare documents for ChromaDB
    const documents: EmbeddingDocument[] = chunks.map((chunk, index) => ({
      id: `${episodeId}_chunk_${chunk.chunkIndex}`,
      text: chunk.text,
      episodeId: chunk.episodeId,
      episodeTitle: chunk.episodeTitle || metadata.title,
      chunkIndex: chunk.chunkIndex,
      timestamp: chunk.timestamp,
      metadata: chunk.metadata,
    }));

    console.log("documents", documents);
    // Store in vector database
    await addDocuments(embeddings, documents);

    return NextResponse.json({
      success: true,
      episodeId,
      title: metadata.title,
      chunksProcessed: chunks.length,
      message: 'Transcript ingested successfully',
    });
  } catch (error: any) {
    console.error('Error ingesting transcript:', error);
    
    // Provide more detailed error information
    const errorMessage = error?.message || 'Failed to ingest transcript';
    const errorStack = process.env.NODE_ENV === 'development' ? error?.stack : undefined;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorStack,
        type: error?.name || 'UnknownError'
      },
      { status: 500 }
    );
  }
}

