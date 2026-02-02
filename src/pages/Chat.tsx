import { useRef, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickReplies } from '@/components/chat/QuickReplies';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useChat } from '@/hooks/useChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function Chat() {
  const { messages, isTyping, sendMessage, startNewChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Chat with MindEase</h1>
                <p className="text-xs text-muted-foreground">Empathetic CBT companion</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={startNewChat} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Chat
            </Button>
          </header>

          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 bg-muted/30">
            <div className="max-w-3xl mx-auto">
              <QuickReplies onSelect={sendMessage} disabled={isTyping} />
            </div>
          </div>

          <div className="bg-card">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSend={sendMessage} disabled={isTyping} />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}