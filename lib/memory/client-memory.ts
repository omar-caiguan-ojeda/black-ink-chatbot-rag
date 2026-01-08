import { MemoryClient } from 'mem0ai';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Initialize Mem0
const mem0 = new MemoryClient({
  apiKey: process.env.MEM0_API_KEY || 'mock-key',
});

export interface ClientMemory {
  preferences: string[];
  history: string[];
  notes: string[];
  medical: string[];
}

/**
 * Save important client insight
 */
export async function saveClientMemory(
  clientId: string,
  insight: string,
  category: 'preference' | 'history' | 'note' | 'medical'
) {
  // In a real scenario, use mem0.memories.add
  // For now, if no API key or in dev, we might just log it or use the SDK if configured
  if (!process.env.MEM0_API_KEY) {
      console.warn("Mem0 API Key missing, skipping save");
      return;
  }

  // const importance = category === 'medical' ? 'high' : 'medium'; // SDK might not support importance in add if types differ
  
  try {
      await mem0.add([
          {
            role: 'user',
            content: insight,
            // category, // Mem0 SDK might handle metadata or specific fields differently in v1.0
            // We will pass category as metadata if supported or implicitly via retrieval
          }
      ], { user_id: clientId }); // Check SDK signature
  } catch (e) {
      console.error("Error saving to Mem0", e);
  }
}

/**
 * Retrieve client memory sections
 */
export async function retrieveClientMemory(clientId: string): Promise<ClientMemory> {
  const defaultMemory = { preferences: [], history: [], notes: [], medical: [] };
  
  if (!process.env.MEM0_API_KEY) return defaultMemory;

  try {
    const memories = await mem0.search("client preferences tattoo history medical notes", {
        user_id: clientId,
        limit: 10,
    });

    // Basic categorization based on content (since Mem0 stores text)
    // In a real app, we might use metadata filters if Mem0 supports structured metadata insertion
    const categorized: ClientMemory = {
        preferences: [],
        history: [],
        notes: [],
        medical: []
    };

    memories.forEach((m: any) => { // Type 'any' for safety against SDK version changes
        const text = m.memory?.toLowerCase() || "";
        if (text.includes('style') || text.includes('like') || text.includes('prefer')) {
            categorized.preferences.push(m.memory);
        } else if (text.includes('tattoo') && text.includes('ago')) {
             categorized.history.push(m.memory);
        } else if (text.includes('allergic') || text.includes('skin')) {
             categorized.medical.push(m.memory);
        } else {
             categorized.notes.push(m.memory);
        }
    });

    return categorized;
  } catch (e) {
      console.error("Error retrieving Mem0", e);
      return defaultMemory;
  }
}

/**
 * Auto-extract insights from conversation and save
 */
export async function extractAndSaveInsights(
  clientId: string,
  lastUserMessage: string
) {
  // Use LLM to extract insights
  const { text } = await generateText({
    // @ts-ignore - Temporary bypass for V3 model type mismatch in some environments
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'user',
        content: `Extract important insights from this client message:
"${lastUserMessage}"

Format JSON:
{
  "preferences": ["style preference", "artist preference"],
  "history": ["previous tattoo info"],
  "notes": ["important observation"],
  "medical": ["allergies", "healing issues"]
}
Return ONLY JSON.`,
      },
    ],
  });

  // Extract JSON from markdown if present
  const cleanedText = text.replace(/```json\n?|```/g, '').trim();

  try {
    const extracted = JSON.parse(cleanedText || '{}');

    // Save each insight
    for (const [category, items] of Object.entries(extracted)) {
      if (Array.isArray(items)) {
          for (const item of items) {
              await saveClientMemory(clientId, item as string, category as any);
          }
      }
    }
  } catch (e) {
    console.error("Error parsing insights JSON:", e);
  }
}
