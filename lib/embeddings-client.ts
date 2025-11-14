/**
 * Hugging Face Embeddings Client
 * Handles embedding generation using Hugging Face Transformers (local, free)
 * Uses @xenova/transformers for local inference - no API key needed!
 * 
 * Model: all-MiniLM-L6-v2 - Fast, lightweight, and good quality embeddings
 */

import { pipeline, Pipeline } from '@xenova/transformers';

// Using a lightweight, fast embedding model that runs locally
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;

let embeddingPipeline: Pipeline | null = null;

/**
 * Initialize the embedding pipeline (lazy loading)
 */
async function getEmbeddingPipeline(): Promise<Pipeline> {
  if (!embeddingPipeline) {
    console.log('Loading Hugging Face embedding model (first time may take a moment)...');
    embeddingPipeline = await pipeline(
      'feature-extraction',
      EMBEDDING_MODEL,
      {
        quantized: true, // Use quantized model for faster loading and smaller size
      }
    );
    console.log('Embedding model loaded successfully!');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipe = await getEmbeddingPipeline();
    
    // Generate embedding - the pipeline returns a tensor
    const output = await pipe(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    // Convert tensor to array - handle both tensor and array outputs
    let embedding: number[];
    if (output && typeof output.data !== 'undefined') {
      // Tensor with .data property
      embedding = Array.from(output.data);
    } else if (Array.isArray(output)) {
      // Already an array
      embedding = output;
    } else if (output && typeof output.tolist === 'function') {
      // Tensor with tolist method
      embedding = output.tolist();
    } else {
      // Try to convert directly
      embedding = Array.from(output as any);
    }
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * Processes texts in batches for better performance
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 10 // Smaller batches for local processing
): Promise<number[][]> {
  const embeddings: number[][] = [];
  const pipe = await getEmbeddingPipeline();
  
  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    try {
      // Process each text individually for now (batch processing may need different handling)
      for (const text of batch) {
        const output = await pipe(text, {
          pooling: 'mean',
          normalize: true,
        });
        
        // Convert tensor to array
        let embedding: number[];
        if (output && typeof output.data !== 'undefined') {
          embedding = Array.from(output.data);
        } else if (Array.isArray(output)) {
          embedding = output;
        } else if (output && typeof output.tolist === 'function') {
          embedding = output.tolist();
        } else {
          embedding = Array.from(output as any);
        }
        
        embeddings.push(embedding);
      }
      
      // Small delay to prevent overwhelming the system
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error(`Error generating embeddings for batch ${i}:`, error);
      throw error;
    }
  }

  return embeddings;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };

