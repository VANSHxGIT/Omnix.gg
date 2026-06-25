
'use client';

import { useState, use, useEffect } from 'react';
import { NexusSidebar } from '@/components/layout/sidebar';
import { MOCK_GAMES, ChatMessage } from '@/lib/mock-data';
import { getMessages, createMessage, getUserProfile, getSingleTeammateCompatibility, deleteMessage } from '@/lib/actions';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, Sparkles, Shield, Lock, Unlock, MessageSquare, Plus, Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function HubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const game = MOCK_GAMES.find((g) => g.id === id);
  const router = useRouter();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleDeleteMessage = async (msgId: string) => {
    const previousMessages = [...messages];
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await deleteMessage(msgId);
      toast({
        title: 'Success',
        description: 'Message deleted successfully.',
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
      setMessages(previousMessages);
      toast({
        title: 'Error',
        description: 'Failed to delete message.',
        variant: 'destructive',
      });
    }
  };

  // Interactive profile states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [compatReason, setCompatReason] = useState<string | null>(null);
  const [loadingCompat, setLoadingCompat] = useState(false);

  const handleOpenProfile = async (nameOrId: string) => {
    setProfileData(null);
    setCompatReason(null);
    setLoadingProfile(true);
    setIsProfileOpen(true);
    try {
      const data = await getUserProfile(nameOrId);
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCheckCompatibility = async () => {
    if (!profileData) return;
    setLoadingCompat(true);
    try {
      const reason = await getSingleTeammateCompatibility(profileData.id, profileData.preferences);
      setCompatReason(reason);
    } catch (err) {
      console.error('Failed to analyze compatibility:', err);
      setCompatReason('Could not calculate compatibility at this time.');
    } finally {
      setLoadingCompat(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchChatHistory = async () => {
      try {
        const chats = await getMessages(id);
        if (active) {
          setMessages(chats);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchChatHistory();
    return () => {
      active = false;
    };
  }, [id]);

  if (!game) notFound();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue('');

    const optimisticMessage: ChatMessage = {
      id: `opt-${Date.now()}`,
      userId: 'me',
      userName: 'Pilot_Alex',
      userAvatar: 'https://picsum.photos/seed/pilot/40/40',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await createMessage(id, text, 'me');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <NexusSidebar />
      <main className="flex-1 flex flex-col bg-background">
        <header className="relative h-48 w-full border-b border-border">
          <Image
            src={game.hero}
            alt={game.name}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 p-8 flex items-end justify-between">
            <div className="flex items-end gap-6">
              <div className="relative w-24 h-36 rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg">
                <Image src={game.poster} alt={game.name} fill className="object-cover" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-primary text-primary">{game.category}</Badge>
                <h2 className="text-4xl font-headline font-bold text-white neon-text">{game.name} World Chat</h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4" /> {game.playersOnline} gamers currently active
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-4 group animate-slide-up">
                    <div 
                      onClick={() => handleOpenProfile(msg.userName)}
                      className="cursor-pointer group/avatar relative"
                      title="View Profile"
                    >
                      <Avatar className="w-10 h-10 border border-primary/20 group-hover/avatar:border-primary transition-all duration-300 group-hover/avatar:shadow-[0_0_8px_rgba(149,84,232,0.5)]">
                        <AvatarImage src={msg.userAvatar} />
                        <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          onClick={() => handleOpenProfile(msg.userName)}
                          className="font-bold text-sm text-foreground hover:text-primary hover:underline cursor-pointer transition-all duration-200"
                          title="View Profile"
                        >
                          {msg.userName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`rounded-2xl rounded-tl-none px-4 py-2 text-sm border max-w-[80%] ${
                          msg.userId === 'me' ? 'bg-primary/20 border-primary/30' : 'bg-muted/40 border-border/50'
                        }`}>
                          {msg.content}
                        </div>
                        {msg.userId === 'me' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="relative mt-auto">
              <Input
                placeholder={`Send a message to ${game.name} hub...`}
                className="pr-12 py-6 bg-card border-border/50 focus:border-primary/50 rounded-xl"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
                onClick={handleSendMessage}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <aside className="hidden lg:block w-72 border-l border-border bg-card/20 p-6">
            <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" /> Active Teammates
            </h3>
            <div className="space-y-4">
              {['Starlight_99', 'GamerPro_X', 'CyberCat', 'ShadowBlade'].map((user) => (
                <div 
                  key={user} 
                  onClick={() => handleOpenProfile(user)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-all group/teammate border border-transparent hover:border-primary/20 animate-slide-up"
                  title="View Profile"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 group-hover/teammate:shadow-[0_0_6px_rgba(149,84,232,0.4)] transition-all">
                      <AvatarImage src={`https://picsum.photos/seed/${user}/32/32`} />
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <span className="text-sm font-medium group-hover/teammate:text-primary transition-colors">{user}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#15111B] border-primary/30 text-white shadow-[0_0_24px_rgba(149,84,232,0.25)] p-0 overflow-hidden rounded-2xl">
          {loadingProfile ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse font-headline">Syncing gaming profile...</p>
            </div>
          ) : profileData ? (
            <div className="flex flex-col">
              {/* Header card with background seed gradient */}
              <div className="relative h-28 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/10 p-6 flex items-end">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Online
                </div>
              </div>

              {/* User Identity Info */}
              <div className="px-6 pb-6 relative">
                {/* Overlap Avatar */}
                <div className="absolute -top-12 left-6">
                  <Avatar className="w-20 h-20 border-4 border-[#15111B] shadow-xl">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">{profileData.name[0]}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="pt-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-headline font-bold text-white flex items-center gap-2">
                        {profileData.name}
                      </h3>
                      <p className="text-xs text-primary font-medium tracking-wide">@{profileData.name.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                  </div>

                  {/* Bio Panel */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-widest">About Gamer</h4>
                    <p className="text-sm text-gray-300 bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                      {profileData.bio}
                    </p>
                  </div>

                  {/* Gaming Preferences Panel */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Gaming Philosophy</h4>
                    <p className="text-sm text-gray-300 bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl italic">
                      "{profileData.preferences}"
                    </p>
                  </div>

                  {/* Credentials / Vault Panel */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-widest flex items-center justify-between">
                      <span>Identity Vault Handles</span>
                      <span className="text-[10px] text-primary lowercase font-normal flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> managed securely
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profileData.credentials && profileData.credentials.length > 0 ? (
                        profileData.credentials.map((cred: any, idx: number) => {
                          const isPublic = cred.status === 'Public';
                          const isMutual = cred.status === 'Mutuals Only';
                          return (
                            <div 
                              key={idx} 
                              className="bg-card/40 border border-border/40 p-2.5 rounded-xl flex flex-col justify-between"
                            >
                              <span className="text-[10px] text-muted-foreground font-bold uppercase">{cred.platform}</span>
                              <div className="flex items-center justify-between mt-1 gap-1">
                                {isPublic ? (
                                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">{cred.handle}</span>
                                ) : (
                                  <span className="text-xs font-medium text-muted-foreground italic flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-primary/70" />
                                    {isMutual ? 'Mutuals' : 'Private'}
                                  </span>
                                )}
                                <span className={`text-[8px] px-1 py-0.5 rounded font-medium border ${
                                  isPublic ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                  isMutual ? 'bg-primary/10 border-primary/20 text-primary' :
                                  'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                  {isPublic ? 'Public' : isMutual ? 'Mutuals' : 'Private'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground italic p-2 col-span-2">No credentials added to vault yet.</p>
                      )}
                    </div>
                  </div>

                  {/* AI Compatibility Panel */}
                  {profileData.name !== 'Pilot_Alex' && profileData.name !== 'BlockMaster' && (
                    <div className="mt-6 border-t border-border/40 pt-4">
                      {compatReason ? (
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 animate-slide-up space-y-2">
                          <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            OMNIX AI Compatibility Verdict
                          </h5>
                          <p className="text-xs text-gray-300 leading-relaxed italic">
                            "{compatReason}"
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleCheckCompatibility}
                          disabled={loadingCompat}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold h-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(149,84,232,0.2)]"
                        >
                          {loadingCompat ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Calculating Squad Chemistry...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Analyze AI Compatibility
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Direct Actions */}
                  <div className="mt-6 flex gap-3">
                    <Button 
                      className="flex-1 bg-secondary hover:bg-secondary/80 text-white rounded-xl gap-2 h-10"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push(`/messages?user=${encodeURIComponent(profileData.name)}`);
                      }}
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-border hover:bg-white/5 rounded-xl gap-2 h-10 text-white hover:text-white"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push(`/messages?user=${encodeURIComponent(profileData.name)}&invite=true`);
                      }}
                    >
                      <Plus className="w-4 h-4 text-primary" /> Squad Invite
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Profile could not be loaded.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
