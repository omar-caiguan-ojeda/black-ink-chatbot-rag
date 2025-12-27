
import OpenAI from 'openai';
import { hybridSearch } from '@/lib/rag/pipeline';
import { retrieveClientMemory } from '@/lib/memory/client-memory';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export enum AgentRole {
  BOOKING = 'booking',           // Appointment management
  PRODUCT = 'product',           // Service info
  CUSTOMER_SERVICE = 'support',  // Support & questions
  SALES = 'sales',               // Upsell & recommendations
  CARE = 'care',                 // Aftercare
  ADMIN = 'admin',               // Admin queries
}

export type ToolDefinition = string; // Simplified for this implementation

interface AgentConfig {
  role: AgentRole;
  systemPrompt: string;
  tools: ToolDefinition[];
  model: 'gpt-4o' | 'gpt-4o-mini'; 
  temperature: number;
  maxTokens: number;
  retrieverSettings: {
    topK: number;
    filters?: Record<string, any>;
  };
}

const AGENT_CONFIGS: Record<AgentRole, AgentConfig> = {
  [AgentRole.BOOKING]: {
    role: AgentRole.BOOKING,
    model: 'gpt-4o-mini',
    temperature: 0.5,
    maxTokens: 1500,
    tools: [
      'search_availability',
      'check_artist_schedule',
      'create_appointment',
      'apply_coupon',
      'send_confirmation',
    ],
    systemPrompt: `
# Black Ink - Booking Assistant

Eres un asistente especializado en reservar tatuajes. Tu objetivo es:
1. Entender las necesidades del cliente
2. Buscar disponibilidad optima
3. Sugerir artistas apropiados
4. Confirmar detalles
5. Gestionar depósitos

## Flujo de Conversación
- Pregunta: "¿Qué tipo de tatuaje deseas?" (consultar KB sobre estilos)
- Sugerir: "Basado en tu preferencia, te recomiendo al artista X"
- Confirmar: Hora, artista, depósito requerido
- Finalizar: Enviar confirmación por email

## Restricciones
- NUNCA prometas disponibilidad sin verificar
- SIEMPRE confirma detalles antes de crear cita
- Si hay conflicto: Ofrece alternativas
- Depósito obligatorio: $50-150 según servicio
    `,
    retrieverSettings: {
      topK: 5,
      filters: { source: 'services' },
    },
  },

  [AgentRole.PRODUCT]: {
    role: AgentRole.PRODUCT,
    model: 'gpt-4o-mini',
    temperature: 0.6,
    maxTokens: 1200,
    tools: [
      'search_portfolio',
      'search_services',
      'get_artist_info',
      'get_pricing',
    ],
    systemPrompt: `
# Black Ink - Product Specialist

Eres experto en tatuajes. Tu misión es:
1. Describir nuestros servicios
2. Sugerir diseños según preferencia
3. Explicar procesos
4. Responder preguntas técnicas
5. Recomendar artistas

## Información Clave
- Tenemos 5 artistas especializados
- Estilos: Geométrico, Realista, Tribal, Color, B&N
- Precios: $150-500 (depende de tamaño/complejidad)
- Garantía: 100% satisfacción o reembolso

## Personalización
Si cliente menciona:
- "Quiero algo pequeño": Mostrar portfolio <3 pulgadas
- "Colores": Mostrar trabajo en color del mejor artista
- "Realista": Recomendaciones de artista top
    `,
    retrieverSettings: {
      topK: 8,
      filters: { source: 'portfolio' },
    },
  },

  [AgentRole.CUSTOMER_SERVICE]: {
    role: AgentRole.CUSTOMER_SERVICE,
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
    tools: [
      'search_faqs',
      'search_policies',
      'get_appointment_status',
      'escalate_to_human',
    ],
    systemPrompt: `
# Black Ink - Customer Support

Eres especialista en soporte. Respondes:
1. Preguntas frecuentes
2. Problemas de citas
3. Políticas de cancelación
4. Reembolsos
5. Quejas y sugerencias

## Flujo de Escalación
- Intenta resolver con KB
- Si no logras: "Necesitas hablar con nuestro equipo"
- Escala a admin con contexto completo

## Empatía Crítica
- Cliente frustrado: EMPATÍA primero
- Cliente nuevo: BIENVENIDA cálida
- Cliente VIP: RECONOCIMIENTO especial
    `,
    retrieverSettings: {
      topK: 10,
      filters: { source: 'policies' },
    },
  },

  [AgentRole.SALES]: {
    role: AgentRole.SALES,
    model: 'gpt-4o-mini',
    temperature: 0.6,
    maxTokens: 1000,
    tools: [
      'get_packages',
      'calculate_discount',
      'suggest_complementary_services',
      'track_client_history',
    ],
    systemPrompt: `
# Black Ink - Sales Assistant

Tu objetivo es VENDER sin presionar:
1. Identificar oportunidades
2. Recomendar upgrades
3. Aplicar descuentos estratégicos
4. Cross-sell servicios

## Psicología de Venta
- "Este cliente siempre elige B&N, ¿le muestro combo con color?"
- Social proof: "5/5 estrellas del artista para este estilo"
- Limited time: "Descuento 10% válido hoy"
    `,
    retrieverSettings: {
      topK: 5,
      filters: { priority: 4 }, // Alta prioridad
    },
  },

  [AgentRole.CARE]: {
    role: AgentRole.CARE,
    model: 'gpt-4o',
    temperature: 0.5,
    maxTokens: 1500,
    tools: ['search_care_guide', 'send_care_pdf', 'track_healing_stage'],
    systemPrompt: `
# Black Ink - Aftercare Expert

Especialista en cuidados post-tatuaje:
1. Instrucciones inmediatas (primeras 24h)
2. Guía semanal
3. Resolución de problemas
4. Complicaciones & cuándo ver doctor

## Educación Clave
- Días 1-3: Proceso de curación
- Semana 1-2: Posible picazón (normal)
- Semana 3-4: Completamente cicatrizado
    `,
    retrieverSettings: {
      topK: 7,
      filters: { source: 'care' },
    },
  },

  [AgentRole.ADMIN]: {
    role: AgentRole.ADMIN,
    model: 'gpt-4o',
    temperature: 0.4,
    maxTokens: 2000,
    tools: [
      'query_analytics',
      'get_artist_stats',
      'export_data',
      'manage_promotions',
    ],
    systemPrompt: `
# Black Ink - Admin Assistant

Panel de control para administradores:
1. Analytics en tiempo real
2. Gestión de artistas
3. Reportes financieros
4. Optimización de operaciones
    `,
    retrieverSettings: {
      topK: 5,
    },
  },
};

/**
 * STEP 1: Detect User Intent
 */
export async function detectIntentAndRoute(userMessage: string): Promise<AgentRole> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Clasifica el siguiente mensaje en UNA de estas categorías:
- booking: Quiere agendar una cita
- product: Pregunta sobre servicios/diseños/artistas
- support: Problema con cita, cancelación, reembolso
- sales: Quiere información de ofertas/paquetes
- care: Pregunta sobre cuidados post-tatuaje
- admin: Solo personal administrativo

Mensaje: "${userMessage}"

Responde SOLO con la categoría.`,
      },
    ],
    temperature: 0.3,
  });

  const category = (response.choices[0].message.content || 'product').toLowerCase().trim();
  
  // Validate if it matches an AgentRole
  if (Object.values(AgentRole).includes(category as AgentRole)) {
      return category as AgentRole;
  }
  return AgentRole.PRODUCT;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClientContext {
  userId: string;
  appointments: any[];
  preferences: any;
}

/**
 * STEP 2: Execute Appropriate Agent
 */
export async function executeAgent(
  role: AgentRole,
  messages: Message[],
  userId: string,
  clientContext?: ClientContext
) {
  const config = AGENT_CONFIGS[role];

  // Retrieve relevant documents (RAG)
  const lastMsg = messages[messages.length - 1].content;
  const context = await hybridSearch(
    lastMsg,
    config.retrieverSettings.topK,
    config.retrieverSettings.filters
  );

  // Retrieve Client Memory
  // const clientMemory = clientContext ? await retrieveClientMemory(userId) : null;
  // Doing this inside the function now to avoid circular deps if any, 
  // or we can pass it in. The prompt passed it in executeAgent args but then called it inside?
  // I'll assume clientContext passed in IS the memory or derived from it.
  
  // Construct System Prompt
  const systemPrompt = `
${config.systemPrompt}

## Contexto de Cliente
${clientContext ? JSON.stringify(clientContext, null, 2) : 'Cliente nuevo'}

## Documentos Base de Conocimiento (RAG Context)
${context.map((c) => `### [Fuente: ${c.source}]\n${c.content}`).join('\n\n')}

## Restricciones Generales
- SIEMPRE cita tus fuentes si usas la Base de Conocimiento
- No inventes información
- Si no sabes: "No encuentro esta información, déjame conectarte con nuestro equipo"
- Respuestas máximo 3 párrafos
- Sé conciso y profesional, tono Premium/Elegante
  `;

  // Call LLM with Streaming
  // Note: We need to convert 'system' role if not supported by types strictly, 
  // but OpenAI supports 'system'.
  const stream = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  });

  return stream;
}
