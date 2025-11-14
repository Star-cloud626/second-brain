/**
 * Batch Ingest Script
 * Processes multiple transcript files and ingests them into the vector database
 * 
 * Usage:
 *   npx tsx scripts/batch-ingest.ts <transcripts-directory>
 * 
 * Example:
 *   npx tsx scripts/batch-ingest.ts ./transcripts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseTranscript } from '../lib/transcript-processor';
import { generateEmbeddingsBatch } from '../lib/embeddings-client';
import { addDocuments, type EmbeddingDocument } from '../lib/chroma-client';

interface ProcessingResult {
  episodeId: string;
  success: boolean;
  chunksProcessed: number;
  title?: string;
  error?: string;
}

async function processTranscriptFile(
  filePath: string,
  episodeId: string
): Promise<ProcessingResult> {
  try {
    console.log(`\n📄 Processing: ${episodeId}...`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse transcript
    const { chunks, metadata } = parseTranscript(content, episodeId);
    
    if (chunks.length === 0) {
      return {
        episodeId,
        success: false,
        chunksProcessed: 0,
        error: 'No content found in transcript',
      };
    }
    
    console.log(`   ✓ Parsed ${chunks.length} chunks`);
    console.log(`   ✓ Title: ${metadata.title}`);
    
    // Generate embeddings in batches
    console.log(`   ⏳ Generating embeddings...`);
    const texts = chunks.map((chunk) => chunk.text);
    const embeddings = await generateEmbeddingsBatch(texts, 10); // Smaller batches for local processing
    
    console.log(`   ✓ Generated ${embeddings.length} embeddings`);
    
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
    
    // Store in vector database
    console.log(`   ⏳ Storing in vector database...`);
    await addDocuments(embeddings, documents);
    
    console.log(`   ✅ Successfully ingested ${chunks.length} chunks`);
    
    return {
      episodeId,
      success: true,
      chunksProcessed: chunks.length,
      title: metadata.title,
    };
  } catch (error: any) {
    console.error(`   ❌ Error processing ${episodeId}:`, error.message);
    return {
      episodeId,
      success: false,
      chunksProcessed: 0,
      error: error.message,
    };
  }
}

async function batchIngest(transcriptsDir: string) {
  console.log('🚀 Starting batch ingestion...\n');
  console.log(`📁 Transcripts directory: ${transcriptsDir}\n`);
  
  // Check if directory exists
  if (!fs.existsSync(transcriptsDir)) {
    console.error(`❌ Directory not found: ${transcriptsDir}`);
    process.exit(1);
  }
  
  // Find all .txt files
  const files = fs.readdirSync(transcriptsDir)
    .filter(file => file.endsWith('.txt'))
    .map(file => ({
      path: path.join(transcriptsDir, file),
      episodeId: file.replace('.txt', ''),
    }));
  
  if (files.length === 0) {
    console.error(`❌ No .txt files found in ${transcriptsDir}`);
    process.exit(1);
  }
  
  console.log(`📋 Found ${files.length} transcript files\n`);
  
  const results: ProcessingResult[] = [];
  let successCount = 0;
  let totalChunks = 0;
  
  // Process files sequentially to avoid rate limits
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`\n[${i + 1}/${files.length}] Processing ${file.episodeId}...`);
    
    const result = await processTranscriptFile(file.path, file.episodeId);
    results.push(result);
    
    if (result.success) {
      successCount++;
      totalChunks += result.chunksProcessed;
    }
    
    // Small delay between files to avoid overwhelming the API
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 BATCH INGESTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${files.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${files.length - successCount}`);
  console.log(`📦 Total chunks processed: ${totalChunks}`);
  console.log('='.repeat(60));
  
  // Print failed files
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed files:');
    failed.forEach(r => {
      console.log(`   - ${r.episodeId}: ${r.error}`);
    });
  }
  
  // Print successful files
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    console.log('\n✅ Successfully processed:');
    successful.forEach(r => {
      console.log(`   - ${r.episodeId}: ${r.chunksProcessed} chunks (${r.title})`);
    });
  }
  
  console.log('\n✨ Batch ingestion complete!\n');
}

// Main execution
const transcriptsDir = process.argv[2] || './transcripts';

// No API key needed - using local Hugging Face models!
console.log('✅ Using local Hugging Face embeddings (no API key required)');

batchIngest(transcriptsDir).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

