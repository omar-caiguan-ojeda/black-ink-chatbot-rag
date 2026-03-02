'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2, Sparkles, Calendar, Heart, DollarSign, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const quickActions = [
  { icon: Palette, label: 'Estilos', prompt: '¿Qué estilos de tatuaje manejan?' },
  { icon: Calendar, label: 'Citas', prompt: '¿Cómo puedo agendar una cita?' },
  { icon: Heart, label: 'Cuidados', prompt: '¿Cuáles son los cuidados post-tattoo?' },
  { icon: DollarSign, label: 'Precios', prompt: '¿Cuál es el rango de precios?' },
];

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    headers: {
      'x-user-id': 'user_123_mock',
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowQuickActions(false);
    await sendMessage({ 
        role: 'user', 
        parts: [{ type: 'text', text: input }] 
    } as any);
    setInput('');
  };

  const handleQuickAction = async (prompt: string) => {
    setShowQuickActions(false);
    await sendMessage({ 
        role: 'user', 
        parts: [{ type: 'text', text: prompt }] 
    } as any);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Header with logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-600 rounded-xl blur-lg opacity-50" />
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-red-600/50 shadow-lg shadow-red-900/40">
              <Image 
                src="/icon/blackink.PNG" 
                alt="Black Ink" 
                fill 
                className="object-contain bg-black"
                priority
              />
            </div>
          </motion.div>
          <div className="leading-tight">
            <p className="font-semibold text-white">Black Ink Assistant</p>
            <p className="text-[11px] text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-red-400 animate-pulse" />
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.length === 0 && showQuickActions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-6 pt-8"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative inline-block"
                  >
                    <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-red-600/30 shadow-2xl shadow-red-900/50">
                      <Image 
                        src="/icon/blackink.PNG" 
                        alt="Black Ink" 
                        fill 
                        className="object-contain bg-black"
                      />
                    </div>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-white">¡Bienvenido a Black Ink!</p>
                    <p className="text-sm text-zinc-400">¿En qué puedo ayudarte hoy?</p>
                  </div>

                  {/* Quick action buttons */}
                  <div className="grid grid-cols-2 gap-3 px-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/20 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/30 transition-colors">
                          <action.icon className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-white/90">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {messages.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "flex gap-3 max-w-[90%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className={cn(
                  "w-9 h-9 border-2 shadow-lg",
                  m.role === 'user' ? "border-zinc-700 shadow-black/50" : "border-red-900/50 shadow-red-900/30"
                )}>
                  {m.role === 'user' ? (
                    <AvatarFallback className="bg-zinc-800 text-zinc-300">
                      <User size={16} />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-red-700 to-red-900 text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-xl",
                    m.role === 'user'
                      ? "bg-gradient-to-r from-white to-zinc-200 text-black rounded-tr-sm shadow-zinc-900/20"
                      : "bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/80 text-zinc-100 rounded-tl-sm shadow-black/40"
                  )}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    {Array.isArray(m.parts) && m.parts.length > 0 ? (
                      m.parts.map((part, i) => {
                        if (part.type === 'text') return <span key={i} className="whitespace-pre-wrap">{part.text}</span>;
                        if (part.type === 'reasoning') return <span key={i} className="block italic text-zinc-500 text-xs mb-1">{part.text}</span>;
                        return null;
                      })
                    ) : typeof (m as any).content === 'string' ? (
                      <span className="whitespace-pre-wrap">{(m as any).content}</span>
                    ) : Array.isArray((m as any).content) ? (
                      ((m as any).content as any[]).map((part, i) => {
                        if (part.type === 'text') return <span key={i} className="whitespace-pre-wrap">{part.text}</span>;
                        return null;
                      })
                    ) : (
                      <span>{String((m as any).content || '')}</span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
            
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3 mr-auto max-w-[85%]"
                >
                  <Avatar className="w-9 h-9 border-2 border-red-900/50 shadow-lg shadow-red-900/30">
                    <AvatarFallback className="bg-gradient-to-br from-red-700 to-red-900 text-white">
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-xl shadow-black/40">
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                      className="w-2 h-2 bg-red-500/70 rounded-full"
                    />
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                      className="w-2 h-2 bg-red-500/40 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-4 border-t border-white/10 bg-black/60 backdrop-blur-xl"
      >
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-zinc-950/80 border-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-red-600/50 focus-visible:border-red-600/50 pr-12 rounded-xl h-12"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/30 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
