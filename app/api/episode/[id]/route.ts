/**
 * API Route: Get Episode by ID
 * GET /api/episode/[id]
 * Returns full episode details including all chunks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeById } from '@/lib/chroma-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    const episode = await getEpisodeById(id);

    if (!episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(episode);
  } catch (error: any) {
    console.error('Error fetching episode:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch episode' },
      { status: 500 }
    );
  }
}

