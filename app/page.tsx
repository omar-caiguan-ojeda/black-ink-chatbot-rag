
import { ChatInterface } from '@/components/chat/chat-interface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black selection:bg-red-900/30">
      
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="z-10 w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
            Black Ink<span className="text-red-600">.</span>AI
            </h1>
            <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
            Experience the future of tattoo consultation. Ask about styles, booking, or aftercare.
            </p>
        </div>
        
        <ChatInterface />
        
        <p className="text-xs text-zinc-600">
            Powered by RAG & Multi-Agent Architecture
        </p>
      </div>
    </main>
  );
}
