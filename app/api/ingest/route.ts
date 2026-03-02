
import { ingestDocuments, processDocuments, processUploadedDocument, semanticChunking, storeChunksInPinecone } from '@/lib/rag/pipeline';

export const maxDuration = 300; // 5 minutes max for ingestion

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    
    // Simple protection recommended, but for now we'll allow it if in dev
    if (process.env.NODE_ENV !== 'development' && secret !== process.env.INGEST_SECRET) {
       // return new Response('Unauthorized', { status: 401 });
    }

    // Check Content-Type to distinguish between JSON (trigger mock) and Multipart (file upload)
    const contentType = req.headers.get('content-type') || '';
    
    let processedDocs = [];

    if (contentType.includes('multipart/form-data')) {
        // Handle File Upload
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`📂 Received file: ${file.name} (${file.size} bytes)`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await processUploadedDocument(buffer, file.name);
        processedDocs = [result];
        console.log(`⚙️ Processed file with Unstructured.`);
        
    } else {
        // Handle Default Mock Ingestion (JSON trigger)
        console.log("🚀 Starting Mock Ingestion Pipeline...");
        const rawDocs = await ingestDocuments();
        console.log(`📄 Ingested ${rawDocs.length} mock documents.`);
        processedDocs = await processDocuments(rawDocs);
        console.log(`⚙️ Processed mock documents.`);
    }

    // 3. Chunk
    const chunks = await semanticChunking(processedDocs);
    console.log(`🧩 Created ${chunks.length} chunks.`);

    // 4. Store
    await storeChunksInPinecone(chunks);
    console.log(`✅ Stored chunks in Pinecone.`);

    return Response.json({ 
        success: true, 
        stats: {
            chunks: chunks.length 
        } 
    });

  } catch (error) {
    console.error("Ingestion Error:", error);
    return Response.json({ error: 'Ingestion failed', details: error }, { status: 500 });
  }
}
