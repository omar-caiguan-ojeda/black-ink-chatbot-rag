# 🤖 Black Ink AI - Professional RAG Chatbot

![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.0-black) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-green) ![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-blue) ![Mem0](https://img.shields.io/badge/Mem0-Memory-purple)

**Black Ink AI** es un asistente avanzado de nivel empresarial diseñado para automatizar las interacciones con los clientes del estudio Black Ink. Utiliza **RAG (Retrieval-Augmented Generation)** para proporcionar respuestas precisas y conscientes del contexto sobre servicios, precios, cuidados posteriores y disponibilidad, actuando como un conserje inteligente 24/7.

---

## 🧠 Estado Actual

* **UI/UX renovada (Mar 2026)**: Interfaz del chat rediseñada con **Framer Motion** (animaciones), gradientes, glow, quick actions (Estilos, Citas, Cuidados, Precios) y branding con `blackink.PNG`.
* **📚 Pipeline RAG Robusto**: Ingesta y procesamiento de documentos del estudio. Base de conocimientos en español (FAQ, Servicios, Políticas) optimizada para búsquedas semánticas.
* **🕵️ Arquitectura Multi-Agente**:
  * **Booking Agent**: Maneja la verificación de disponibilidad y agenda.
  * **Product Specialist**: Aconseja sobre estilos de tatuaje (Realismo, Tradicional, etc.) y artistas.
  * **Customer Support**: Resuelve dudas sobre cuidados post-tatuaje y políticas de depósito.
* **⚡ Streaming**: Respuestas en tiempo real con Vercel AI SDK v6.
* **🇪🇸 Español Nativo**: Optimizado para consultas locales.
* **💾 Memoria base (Mem0)**: Contexto de sesión inicial.

> Embed: la landing usa el iframe `/embed` de este proyecto para mostrar el asistente en `app-web`.

---

## 🚀 Roadmap hacia Producto Premium

Para convertir este MVP en un SaaS de clase mundial para estudios de tatuajes, estamos implementando las siguientes características:

### 1. Ingesta Profesional (Unstructured.io)
- **Objetivo**: Permitir al estudio subir sus propios PDFs ("Catálogo 2025.pdf", "Guía_Cuidados.pdf") sin tocar código.
- **Tecnología**: Integración con `Unstructured` para procesar tablas, imágenes y maquetación compleja en documentos reales.

### 2. CRM & Memoria a Largo Plazo (Mem0 Avanzado)
- **Objetivo**: Que el bot recuerde al cliente entre sesiones ("Hola Juan, ¿qué tal sanó tu tribal de la semana pasada?").
- **Tecnología**: Mem0 para almacenar preferencias de estilo, historial de tatuajes y datos médicos relevantes (alergias) de forma segura.

### 3. Visual RAG (Catálogos Visuales)
- **Objetivo**: "Mostrar, no solo contar". Si el usuario pide "Realismo" o "Tribal", el bot debe responder con miniaturas y links de trabajos reales.
- **Tecnología (plan)**: Catálogo en **Cloudinary** (o Supabase Storage) con tags por estilo y metadata; el bot devolverá payload `images[]` para render en UI.

### 4. Evaluación y Auditoría (RAGAS)
- **Objetivo**: Garantizar la calidad de las respuestas para clientes empresariales.
- **Tecnología**: Pipeline de evaluación continua midiendo *Faithfulness* (fidelidad al contexto) y *Answer Relevancy*.

---

## 🛠️ Tech Stack

### AI & Data
*   **Orquestación**: Vercel AI SDK (versión 6.0+)
*   **Modelos**: OpenAI GPT-4o / GPT-4o-mini
*   **Vector DB**: Pinecone (Búsqueda Híbrida: Semántica + Palabras Clave)
*   **Memoria**: Mem0
*   **Embeddings**: text-embedding-3-small

### Infraestructura
*   **Framework**: Next.js 15 (App Router)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS + Shadcn/UI
*   **Base de Datos**: Supabase (PostgreSQL)

---

## 🚀 Getting Started

### Prerrequisitos
*   Node.js 20+
*   Claves API: OpenAI, Pinecone, Mem0.

### Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/your-username/black-ink.git
    cd black-ink/chatbot-rag
    ```

2.  **Instalar dependencias**
    ```bash
    pnpm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` basado en `env.example`:
    ```bash
    cp env.example .env
    ```
    *Configura `OPENAI_API_KEY`, `PINECONE_API_KEY`, etc.*

4.  **Ingesta de Datos (Setup Inicial)**
    Carga la base de conocimientos básica en Pinecone:
    ```bash
    curl -X POST http://localhost:3000/api/ingest -H "Content-Type: application/json" -d '{}'
    ```

5.  **Correr Servidor de Desarrollo**
    ```bash
    pnpm dev
    ```

---

## 🤝 Contribuir
¡Bienvenido al equipo! Por favor lee `CONTRIBUTING.md` para guías sobre cómo añadir nuevos agentes o mejorar los prompts.
