# 🤖 Black Ink AI - Professional RAG Chatbot

![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-3.0-black) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green) ![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-blue)

**Black Ink AI** is an advanced, enterprise-grade AI assistant designed to automate client interactions for the Black Ink Tattoo Studio. It leverages **RAG (Retrieval-Augmented Generation)** to provide accurate, context-aware responses about services, pricing, aftercare, and availability, acting as a 24/7 intelligent concierge.

---

## 🧠 Core Capabilities

*   **📚 RAG Pipeline**: Ingests and processes studio documents (FAQs, Policies, Services) using **Unstructured.io** and stores semantic embeddings in **Pinecone** for precise information retrieval.
*   **🕵️ Multi-Agent Architecture**: Specialized agents for different needs:
    *   **Booking Agent**: Handles availability checks and appointment scheduling.
    *   **Product Specialist**: Advises on tattoo styles, artists, and designs.
    *   **Customer Support**: Resolves issues and answers policy questions.
    *   **Sales Assistant**: Identifies opportunities for upsells and promotions.
*   **💾 Smart Memory (Mem0)**: Remembers client details (preferences, previous tattoos, medical info) to provide a personalized experience across sessions.
*   **🛡️ Enterprise Security**: PII detection, rate limiting, and secure authentication via Clerk.

---

## 🛠️ Tech Stack

### AI & Data
*   **Orchestration**: Vercel AI SDK, LangChain.js
*   **Models**: OpenAI GPT-4 Turbo (Reasoning), GPT-4o Mini (Speed)
*   **Vector DB**: Pinecone (Hybrid Search: Semantic + Keyword)
*   **Embeddings**: text-embedding-3-small
*   **ETL**: Unstructured.io, RAGFlow

### Infrastructure
*   **Framework**: Next.js 15
*   **Database**: Supabase (PostgreSQL)
*   **Caching**: Redis / Vercel KV
*   **Monitoring**: RAGAS (Evaluation), Datadog, Sentry

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    A[User Query] --> B{Intent Classifier}
    B -->|Booking| C[Booking Agent]
    B -->|Info| D[Product Agent]
    B -->|Support| E[Support Agent]
    
    C & D & E --> F[Hybrid Retrieval]
    F --> G[(Pinecone Vector DB)]
    F --> H[(Supabase Knowledge Base)]
    
    C & D & E --> I[Client Memory (Mem0)]
    
    C & D & E --> J[LLM Generation (GPT-4)]
    J --> K[Response]
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   OpenAI API Key
*   Pinecone API Key
*   Supabase Project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/black-ink.git
    cd black-ink/chatbot-rag
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file:
    ```bash
    cp env.example .env
    ```
    *Configure `OPENAI_API_KEY`, `PINECONE_API_KEY`, `SUPABASE_URL`, etc.*

4.  **Ingest Knowledge Base**
    Run the ingestion script to populate the vector database:
    ```bash
    pnpm run ingest
    ```

5.  **Run Development Server**
    ```bash
    pnpm dev
    ```

---

## 📈 Evaluation

This project uses **RAGAS** to continuously evaluate the quality of the chatbot:
*   **Faithfulness**: Does the answer come from the context?
*   **Answer Relevancy**: Is the answer useful to the user?
*   **Context Recall**: Did we retrieve the right documents?

---

## 🤝 Contributing

We welcome contributions to improve the agent's capabilities. Please read `CONTRIBUTING.md` for guidelines on how to add new tools or improve prompts.
