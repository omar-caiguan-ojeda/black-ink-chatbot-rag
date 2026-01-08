
import { detectIntentAndRoute, executeAgent } from '@/lib/ai/agents';
import { retrieveClientMemory } from '@/lib/memory/client-memory';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Missing 'messages' array", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    
    // Extract text safely from Vercel AI SDK v6 message structure (parts or content)
    let lastMessageContent = '';
    if (typeof lastMessage.content === 'string') {
        lastMessageContent = lastMessage.content;
    } else if (Array.isArray(lastMessage.parts)) {
        lastMessageContent = lastMessage.parts
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join(' ');
    } else if (Array.isArray((lastMessage as any).content)) {
        // Fallback for some intermediate formats
         lastMessageContent = (lastMessage as any).content
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join(' ');
    }
    
    console.log(`📥 Incoming message content: "${lastMessageContent}"`);
    
    // Get userId from headers (preferred) or body (fallback/legacy)
    const headerUserId = req.headers.get('x-user-id');
    const visitorId = headerUserId || 'anonymous_visitor';

    // 1. Detect Intent
    const intent = await detectIntentAndRoute(lastMessageContent);
    console.log(`Detected Intent: ${intent}`);

    // 2. Retrieve Client Memory
    const memory = await retrieveClientMemory(visitorId);

    // 3. Construct Context
    const clientContext = {
      userId: visitorId,
      appointments: [], // Mock appointments
      preferences: memory,
    };

    // 4. Execute Agent (Returns StreamTextResult)
    const result = await executeAgent(intent, messages, visitorId, clientContext);

    // 5. Return UI Message Stream Response
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
