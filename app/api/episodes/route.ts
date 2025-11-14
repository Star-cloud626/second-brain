/**
 * API Route: Get All Episodes
 * GET /api/episodes
 * Returns list of all ingested episodes
 */

import { NextResponse } from 'next/server';
import { getAllEpisodes } from '@/lib/chroma-client';

export async function GET() {
  try {
    const episodes = await getAllEpisodes();
    
    return NextResponse.json({
      episodes,
      count: episodes.length,
    });
  } catch (error: any) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}

