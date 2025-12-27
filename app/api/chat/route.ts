
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { detectIntentAndRoute, executeAgent, AgentRole } from '@/lib/ai/agents';
import { retrieveClientMemory, extractAndSaveInsights } from '@/lib/memory/client-memory';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Missing 'messages' array", { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const visitorId = userId || 'anonymous_visitor';

    // 1. Detect Intent
    const intent = await detectIntentAndRoute(lastMessage.content);
    console.log(`Detected Intent: ${intent}`);

    // 2. Retrieve Client Memory
    const memory = await retrieveClientMemory(visitorId);

    // 3. Construct Context
    const clientContext = {
      userId: visitorId,
      appointments: [], // Mock appointments
      preferences: memory,
    };

    // 4. Execute Agent (Returns OpenAI Stream)
    const streamResponse = await executeAgent(intent, messages, visitorId, clientContext);

    // 5. Convert to Vercel AI SDK Stream
    // The executeAgent returns a raw OpenAI stream. We wrap it.
    const stream = OpenAIStream(streamResponse as any, {
        onCompletion: async (completion) => {
            // 6. Save insights after completion
            await extractAndSaveInsights(visitorId, lastMessage.content);
        }
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
