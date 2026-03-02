import { ChatInterface } from '@/components/chat/chat-interface';

export const metadata = {
  title: 'Black Ink Assistant | Embed',
  description: 'Embedded assistant for Black Ink.',
};

export default function EmbedPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="min-h-screen flex items-center justify-center p-2">
        <div className="w-full max-w-3xl">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
