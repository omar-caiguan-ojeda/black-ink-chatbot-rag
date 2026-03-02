import { UnstructuredClient } from 'unstructured-client';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { Strategy } from 'unstructured-client/sdk/models/shared';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DocumentSource {
  type: 'faq' | 'services' | 'policies' | 'blog' | 'portfolio' | 'portfolio_images';
  title: string;
  content: string;
  metadata: {
    source: string;
    category?: string;
    priority?: number; // 1-5 (5 = highest)
    lastUpdated: Date;
    author?: string;
    tags?: string[];
  };
}

export interface Chunk {
  content: string;
  metadata: Record<string, any>;
}

/**
 * STEP 1: Ingest documents from multiple sources
 * This is a mock implementation. In a real scenario, you would fetch from DB/CMS.
 */
export async function ingestDocuments(): Promise<DocumentSource[]> {
  // Mock data for now
  const sources: DocumentSource[] = [
    {
      type: 'faq',
      title: 'PF Generales (FAQ)',
      content: '¿Cuánto cuesta un tatuaje? El precio mínimo es de $150. La tarifa por hora es de $150-200 dependiendo del artista.',
      metadata: { source: 'faq_system', category: 'pricing', priority: 5, lastUpdated: new Date() }
    },
    {
      type: 'services',
      title: 'Servicios de Tatuaje',
      content: 'Ofrecemos Diseño Personalizado, Realismo, Tradicional y Cover Ups. Las consultas son gratuitas.',
      metadata: { source: 'services_db', category: 'services', priority: 5, lastUpdated: new Date() }
    },
    {
      type: 'policies',
      title: 'Política de Depósitos',
      content: 'Se requiere un depósito no reembolsable para reservar. $50 para piezas pequeñas, $100 para las grandes.',
      metadata: { source: 'policy_doc', category: 'booking', priority: 5, lastUpdated: new Date() }
    },
    {
      type: 'care',
      title: 'Guía de Cuidados',
      content: 'Mantén el vendaje durante 2-4 horas. Lava con jabón sin aroma. Aplica una capa fina de Aquaphor o la loción recomendada.',
      metadata: { source: 'care_guide', category: 'care', priority: 5, lastUpdated: new Date() }
    }
  ] as DocumentSource[];

  return sources;
}

/**
 * STEP 2: Process documents with Unstructured.io
 * Note: This requires UNSTRUCTURED_API_KEY if using their SaaS, or local container.
 * Falling back to simple text processing if client fails or not configured, for demo purposes.
 */
/**
 * STEP 2: Process documents with Unstructured.io
 * Now supporting real file processing via Unstructured API.
 */
export async function processDocuments(documents: DocumentSource[]) {
  // If we have an API key, we could try to use Unstructured for text improvement, 
  // but for now, we'll keep the pass-through for existing text-based sources (mock data).
  // Real file processing happens in `processUploadedDocument`.
  return documents.map(doc => ({
      text: doc.content,
      metadata: doc.metadata
  }));
}

/**
 * Process a distinct file upload using Unstructured
 */
export async function processUploadedDocument(fileBuffer: Buffer, fileName: string) {
    const apiKey = process.env.UNSTRUCTURED_API_KEY;
    const apiUrl = process.env.UNSTRUCTURED_API_URL || 'https://api.unstructured.io/general/v0/general';

    if (!apiKey) {
        console.warn("⚠️ No UNSTRUCTURED_API_KEY found. Falling back to simple text extraction if possible or erroring.");
        // Fallback for text files if no key
        if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            return {
                text: fileBuffer.toString('utf-8'),
                metadata: { source: fileName, category: 'uploaded' }
            };
        }
        throw new Error("UNSTRUCTURED_API_KEY is missing. Cannot process PDF/Images.");
    }

    const client = new UnstructuredClient({
        serverURL: apiUrl,
        security: { apiKeyAuth: apiKey },
    });

    try {
        console.log(`Sending ${fileName} to Unstructured API...`);
        const response = await client.general.partition({
            partitionParameters: {
                files: {
                    content: fileBuffer,
                    fileName: fileName,
                },
                strategy: Strategy.Fast, // Use 'hi_res' for tables/images if needed
            },
        });

        if ((response as any).statusCode === 200 && (response as any).elements) {
            // Combine all elements into one text for now (simple RAG)
            const fullText = (response as any).elements.map((el: any) => el.text).join('\n\n');
            return {
                text: fullText,
                metadata: { 
                    source: fileName, 
                    category: 'uploaded',
                    lastUpdated: new Date()
                }
            };
        } else {
            throw new Error(`Unstructured API failed with status ${(response as any).statusCode}`);
        }

    } catch (error) {
        console.error("Unstructured processing error:", error);
        throw error;
    }
}

/**
 * STEP 3: Semantic Chunking
 */
export async function semanticChunking(
  processedDocs: any[],
  chunkSize: number = 800,
  overlapSize: number = 100
): Promise<Chunk[]> {
  const chunks: Chunk[] = [];

  for (const doc of processedDocs) {
    const paragraphs = doc.text.split(/\n\n+/);

    let currentChunk = '';
    for (const para of paragraphs) {
      const potential = currentChunk + (currentChunk ? '\n\n' : '') + para;

      if (potential.length > chunkSize && currentChunk) {
        chunks.push({
          content: currentChunk,
          metadata: {
            ...doc.metadata,
            tokens: Math.ceil(currentChunk.length / 4),
            originalLength: currentChunk.length,
          },
        });

        currentChunk = currentChunk.slice(-overlapSize) + para;
      } else {
        currentChunk = potential;
      }
    }

    if (currentChunk) {
      chunks.push({
        content: currentChunk,
        metadata: {
          ...doc.metadata,
          tokens: Math.ceil(currentChunk.length / 4),
        },
      });
    }
  }

  return chunks;
}

/**
 * Helper: Generate Embedding using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || !text.trim()) {
    return new Array(1536).fill(0); // Return zero vector or handle appropriately
  }
  try {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Array(1536).fill(0);
  }
}

/**
 * STEP 4: Store chunks in Pinecone
 */
export async function storeChunksInPinecone(chunks: Chunk[]) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const indexName = process.env.PINECONE_INDEX_NAME || 'black-ink';
  const index = pinecone.index(indexName);
  
  const vectors = [];

  console.log(`Generating embeddings for ${chunks.length} chunks...`);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i].content);

    vectors.push({
      id: `chunk-${Date.now()}-${i}`,
      values: embedding,
      metadata: {
        text: chunks[i].content.substring(0, 4000), // Limit metadata size
        ...chunks[i].metadata,
        chunkIndex: i,
      },
    });
  }

  // Batch upsert
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(`Upserted batch ${i / batchSize + 1}`);
  }

  console.log(`✅ ${vectors.length} chunks stored in Pinecone`);
}

/**
 * STEP 5: Intelligent Hybrid Search
 */
export async function hybridSearch(
  query: string,
  topK: number = 5,
  filters?: Record<string, any>
) {
  if (!query || !query.trim()) {
      return [];
  }

  const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
  });
  const indexName = process.env.PINECONE_INDEX_NAME || 'black-ink';
  const index = pinecone.index(indexName);

  // 1. Semantic Search
  const queryEmbedding = await generateEmbedding(query);

  const semanticResults = await index.query({
    vector: queryEmbedding,
    topK: Math.ceil(topK * 1.5), 
    includeMetadata: true,
    filter: filters,
  });

  // 2. Keyword Search (Simple Client-side scoring for demo)
  // In a real "Hybrid" search with Pinecone, you might use sparse-dense vectors (Splade) if supported,
  // or simple re-ranking like here.
  const keywords = query.toLowerCase().split(/\s+/).filter((k) => k.length > 3);
  const keywordScores = new Map<string, number>();

  semanticResults.matches.forEach((match) => {
    let score = 0;
    const text = (match.metadata?.text as string)?.toLowerCase() || '';

    keywords.forEach((keyword) => {
      if (text.includes(keyword)) score++;
    });

    if (score > 0) {
      keywordScores.set(match.id, score);
    }
  });

  // 3. Combine Scores (70% Semantic, 30% Keyword)
  const combined = semanticResults.matches
    .map((m) => ({
      ...m,
      combinedScore: (m.score || 0) * 0.7 + (keywordScores.get(m.id) || 0) * 0.3,
    }))
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, topK);

  console.log(`🔍 Hybrid Search found ${combined.length} relevant matches.`);
  if (combined.length > 0) {
      console.log(`🏆 Top Match Score: ${combined[0].combinedScore}`);
  }

  return combined.map((m) => ({
    id: m.id,
    content: (m.metadata?.text as string) || '',
    score: m.combinedScore,
    source: (m.metadata?.source as string) || '',
    category: (m.metadata?.category as string) || '',
  }));
}
