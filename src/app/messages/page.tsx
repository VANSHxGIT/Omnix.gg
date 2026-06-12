
import { NexusSidebar } from '@/components/layout/sidebar';
import { MOCK_THREADS } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, MoreVertical, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <NexusSidebar />
      <main className="flex-1 flex flex-col bg-background">
        <div className="flex h-full">
          {/* Threads Sidebar */}
          <aside className="w-80 border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-headline font-bold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10 bg-muted/30" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/50">
                {MOCK_THREADS.map((thread) => (
                  <div 
                    key={thread.id} 
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-all ${thread.unread ? 'bg-primary/5' : ''}`}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={thread.user.avatar} />
                        <AvatarFallback>{thread.user.name[0]}</AvatarFallback>
                      </Avatar>
                      {thread.user.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-sm truncate">{thread.user.name}</h4>
                        <span className="text-[10px] text-muted-foreground">{thread.time}</span>
                      </div>
                      <p className={`text-xs truncate ${thread.unread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {thread.lastMessage}
                      </p>
                    </div>
                    {thread.unread && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>

          {/* Chat Window */}
          <section className="flex-1 flex flex-col bg-card/20">
            {/* Chat Header */}
            <header className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={MOCK_THREADS[0].user.avatar} />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm">{MOCK_THREADS[0].user.name}</h4>
                  <span className="text-[10px] text-green-500 font-medium">Online</span>
                </div>
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
            </header>

            {/* Empty State / Messages */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                 <MessageSquare className="w-8 h-8 text-primary" />
               </div>
               <h3 className="text-xl font-headline font-bold">Your conversation with {MOCK_THREADS[0].user.name}</h3>
               <p className="text-muted-foreground max-w-sm mt-2">
                 Send a message to coordinate your next game or share some tips.
               </p>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
              <div className="relative max-w-4xl mx-auto">
                <Input placeholder="Write a message..." className="pr-12 py-6 bg-muted/20" />
                <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
