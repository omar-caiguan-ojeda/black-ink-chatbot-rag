'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userId: 'user_123_mock', // Hardcoded for demo
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-md md:max-w-2xl mx-auto h-[600px] flex flex-col border-zinc-800 bg-zinc-950 shadow-2xl">
      <CardHeader className="border-b border-zinc-800 bg-black/40 backdrop-blur-sm">
        <CardTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
            </div>
            Black Ink Assistant
            <span className="text-xs font-normal text-zinc-500 ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online
            </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
                <div className="text-center text-zinc-500 mt-20 space-y-2">
                    <Bot className="w-12 h-12 mx-auto opacity-20" />
                    <p>Welcome to Black Ink.</p>
                    <p className="text-sm">Ask about bookings, artists, or aftercare.</p>
                </div>
            )}
            
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <Avatar className="w-8 h-8 border border-white/10">
                  {m.role === 'user' ? (
                    <AvatarFallback className="bg-zinc-800 text-zinc-300"><User size={14} /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-red-900 text-white"><Bot size={14} /></AvatarFallback>
                  )}
                </Avatar>
                
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 text-sm shadow-sm",
                    m.role === 'user'
                      ? "bg-white text-black rounded-tr-sm"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-sm"
                  )}
                >
                  <div className="prose prose-invert prose-sm">
                      {m.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
               <div className="flex gap-3 mr-auto max-w-[85%]">
                 <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarFallback className="bg-red-900 text-white"><Bot size={14} /></AvatarFallback>
                 </Avatar>
                 <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                 </div>
               </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t border-zinc-800 bg-black/40 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-950 border-zinc-800 text-white focus-visible:ring-red-600"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
