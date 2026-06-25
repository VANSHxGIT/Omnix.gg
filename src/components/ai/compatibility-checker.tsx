"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, BrainCircuit, UserCheck, Shield, Lock, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { getTeammatesCompatibility, getUserProfile } from '@/lib/actions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CompatibilityChecker() {
  const router = useRouter();
  const [profile, setProfile] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleOpenProfile = async (name: string) => {
    setProfileData(null);
    setLoadingProfile(true);
    setIsProfileOpen(true);
    try {
      const data = await getUserProfile(name);
      setProfileData(data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAnalysis = async () => {
    if (!profile.trim()) return;
    setLoading(true);
    try {
      const res = await getTeammatesCompatibility(profile);
      setResults(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="bg-card border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="w-24 h-24 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            AI Compatibility Matcher
          </CardTitle>
          <CardDescription>
            Tell OMNIX AI about your gaming style, preferences, and what you look for in a teammate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: I enjoy competitive tactical shooters like Valorant. I prefer playing entry frag and value clear communication. Looking for chill people who can keep cool during clutch moments..."
            className="min-h-[120px] bg-background border-border/50 focus:border-primary/50 rounded-xl"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          />
          <Button
            onClick={handleAnalysis}
            disabled={loading || !profile.trim()}
            className="w-full bg-primary hover:bg-primary/80 h-12 text-lg font-bold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Compatibility...
              </span>
            ) : (
              'Find Compatible Teammates'
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          {results.recommendations.map((rec: any) => {
            const user = rec.user;
            if (!user) return null;
            return (
              <Card key={rec.playerId} className="bg-muted/20 border-secondary/20 hover:border-secondary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12 border border-secondary/50 cursor-pointer" onClick={() => handleOpenProfile(user.name)}>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => handleOpenProfile(user.name)}>{user.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-secondary font-medium">
                        <UserCheck className="w-3 h-3" /> Compatible Match
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-sm italic text-muted-foreground border-l-2 border-secondary">
                    "{rec.compatibilityReason}"
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenProfile(user.name)}>
                      <Shield className="w-4 h-4 text-primary" /> Identity Vault
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-secondary"
                      onClick={() => router.push(`/messages?user=${encodeURIComponent(user.name)}`)}
                    >
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
