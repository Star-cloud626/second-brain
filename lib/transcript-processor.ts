/**
 * Transcript Processing Utilities
 * Handles parsing, cleaning, and chunking of transcript files
 */

export interface TranscriptChunk {
  text: string;
  episodeId: string;
  episodeTitle?: string;
  chunkIndex: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface EpisodeMetadata {
  episodeId: string;
  title?: string;
  date?: string;
  duration?: string;
}

/**
 * Parse transcript file content
 * Handles the format: Speaker names, timestamps [00:00:00], and dialogue with tildes
 * Format example:
 *   Ronsley Vaz: ~ Hello, everybody,~
 *   [00:00:00] Today's session is all around deep seek.
 */
export function parseTranscript(content: string, episodeId: string): {
  chunks: TranscriptChunk[];
  metadata: EpisodeMetadata;
} {
  const lines = content.split('\n');
  const chunks: TranscriptChunk[] = [];
  let currentChunk: string[] = [];
  let currentTimestamp: string | undefined;
  let episodeTitle: string | undefined;
  let episodeDate: string | undefined;
  
  // Extract episode title from filename (e.g., "125.txt" -> "Episode 125")
  episodeTitle = `Episode ${episodeId}`;
  
  // Try to extract title from content (look for patterns like "Episode X" or topic mentions)
  const titlePatterns = [
    /Today's session is all around (.+?)\./i,
    /Episode\s+(\d+)/i,
    /#\s*(.+)/,
  ];
  
  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match) {
      episodeTitle = match[1] || match[0] || episodeTitle;
      break;
    }
  }

  // Process lines and create chunks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, separators, and metadata lines
    if (!line || 
        line === '===' || 
        line === 'Sequence' ||
        line.startsWith('GMT') ||
        line.match(/^[A-Z0-9_]+:\s*$/)) { // Skip lines that are just speaker names
      continue;
    }

    // Extract timestamp if present (format: [00:00:00])
    const timestampMatch = line.match(/\[(\d{2}:\d{2}:\d{2})\]/);
    if (timestampMatch) {
      currentTimestamp = timestampMatch[1];
    }

    // Clean the line: remove speaker names, timestamps, tildes, and normalize
    let cleanLine = line
      // Remove speaker names (pattern: "Name: ~" or "Name:")
      .replace(/^[A-Za-z\s]+:\s*~?\s*/, '')
      // Remove timestamps
      .replace(/\[(\d{2}:\d{2}:\d{2})\]/g, '')
      // Remove all tildes (they're just formatting markers)
      .replace(/~/g, '')
      // Remove leading/trailing whitespace
      .trim();

    // Only add non-empty lines
    if (cleanLine && cleanLine.length > 0) {
      currentChunk.push(cleanLine);
    }

    // Create chunk when we reach ~300-500 words (optimal for embeddings)
    // or when we hit a significant timestamp change
    const currentText = currentChunk.join(' ');
    const wordCount = currentText.split(/\s+/).filter(w => w.length > 0).length;

    // Chunk size: 300-500 words is optimal for semantic search
    if (wordCount >= 300) {
      if (currentChunk.length > 0) {
        chunks.push({
          text: currentText,
          episodeId,
          episodeTitle,
          chunkIndex: chunks.length,
          timestamp: currentTimestamp,
          metadata: {
            wordCount,
            lineCount: currentChunk.length,
          },
        });
        
        // Keep last 50 words for overlap context
        const words = currentText.split(/\s+/).filter(w => w.length > 0);
        const overlapWords = words.slice(-50);
        currentChunk = overlapWords.length > 0 ? [overlapWords.join(' ')] : [];
      }
    }
  }

  // Add remaining content as final chunk
  if (currentChunk.length > 0) {
    const finalText = currentChunk.join(' ');
    const wordCount = finalText.split(/\s+/).filter(w => w.length > 0).length;
    
    if (wordCount > 10) { // Only add if meaningful content
      chunks.push({
        text: finalText,
        episodeId,
        episodeTitle,
        chunkIndex: chunks.length,
        timestamp: currentTimestamp,
        metadata: {
          wordCount,
          lineCount: currentChunk.length,
        },
      });
    }
  }

  return {
    chunks,
    metadata: {
      episodeId,
      title: episodeTitle,
      date: episodeDate,
    },
  };
}

/**
 * Split text into chunks with overlap for context preservation
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 100
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);
    start = end - overlap;
  }

  return chunks;
}

/**
 * Clean and normalize transcript text
 */
export function cleanTranscript(text: string): string {
  return text
    .replace(/~/g, '') // Remove tilde markers
    .replace(/\[(\d{2}:\d{2}:\d{2})\]/g, '') // Remove timestamps
    .replace(/^[^:]+:\s*/gm, '') // Remove speaker names
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
}

