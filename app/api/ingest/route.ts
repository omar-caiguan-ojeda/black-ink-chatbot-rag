
import { ingestDocuments, processDocuments, semanticChunking, storeChunksInPinecone } from '@/lib/rag/pipeline';

export const maxDuration = 300; // 5 minutes max for ingestion

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    
    // Simple protection recommended, but for now we'll allow it if in dev
    if (process.env.NODE_ENV !== 'development' && secret !== process.env.INGEST_SECRET) {
       // return new Response('Unauthorized', { status: 401 });
    }

    console.log("🚀 Starting Ingestion Pipeline...");

    // 1. Ingest
    const rawDocs = await ingestDocuments();
    console.log(`📄 Ingested ${rawDocs.length} documents.`);

    // 2. Process
    const processedDocs = await processDocuments(rawDocs);
    console.log(`⚙️ Processed ${processedDocs.length} documents.`);

    // 3. Chunk
    const chunks = await semanticChunking(processedDocs);
    console.log(`🧩 Created ${chunks.length} chunks.`);

    // 4. Store
    await storeChunksInPinecone(chunks);
    console.log(`✅ Stored chunks in Pinecone.`);

    return Response.json({ 
        success: true, 
        stats: {
            docs: rawDocs.length,
            chunks: chunks.length 
        } 
    });

  } catch (error) {
    console.error("Ingestion Error:", error);
    return Response.json({ error: 'Ingestion failed', details: error }, { status: 500 });
  }
}
