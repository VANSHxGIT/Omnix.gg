"use client"

import { useState, useEffect } from 'react';
import { NexusSidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Review } from '@/lib/mock-data';
import { getReviews, createReview, likeReview } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface FeedComment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
}

const INITIAL_COMMENTS: Record<string, FeedComment[]> = {
  r1: [
    {
      id: 'c1',
      user: 'Sarah Craft',
      avatar: 'https://picsum.photos/seed/102/150/150',
      content: 'Ooh! What are the coords? I\'d love to join you and explore!',
      time: '30m ago',
    },
    {
      id: 'c2',
      user: 'JettMain99',
      avatar: 'https://picsum.photos/seed/103/150/150',
      content: 'Nice find, does it have a village or ocean nearby?',
      time: '15m ago',
    },
  ],
  r2: [
    {
      id: 'c3',
      user: 'GamerPro_X',
      avatar: 'https://picsum.photos/seed/101/150/150',
      content: 'Agreed, the rotations on Haven feel much smoother now. A site feels holdable.',
      time: '1h ago',
    },
    {
      id: 'c4',
      user: 'CyberCat',
      avatar: 'https://picsum.photos/seed/cat/150/150',
      content: 'I still get flanked at A sewers though haha, need to watch that closely.',
      time: '45m ago',
    },
  ],
};

const EXTRA_COMMENTS: Record<string, FeedComment[]> = {
  r3: [
    {
      id: 'c5',
      user: 'TarnishedOne',
      avatar: 'https://picsum.photos/seed/105/150/150',
      content: 'Congrats! Radahn is a tough hurdle. I can help with Nokron or Altus, add me!',
      time: '12h ago',
    },
    {
      id: 'c6',
      user: 'GraceSeeker',
      avatar: 'https://picsum.photos/seed/106/150/150',
      content: 'Awesome job! Bleed build works wonders on the next bosses too.',
      time: '8h ago',
    },
  ],
  r5: [
    {
      id: 'c7',
      user: 'BlockMaster',
      avatar: 'https://picsum.photos/seed/101/150/150',
      content: 'Spruce and copper is such a classy block palette. Post some pictures!',
      time: '2d ago',
    },
  ],
};

const EXTRA_REVIEWS: Review[] = [
  {
    id: 'r3',
    user: 'Starlight_99',
    avatar: 'https://picsum.photos/seed/star/150/150',
    game: 'Elden Ring',
    rating: 5,
    content: 'Just beat Starscourge Radahn! What an absolute spectacle of a boss fight. The festival atmosphere was incredible. OMNIX community, who is down to help me with the next legacy dungeon?',
    likes: 42,
    comments: 2,
    time: '1d ago',
  },
  {
    id: 'r4',
    user: 'GamerPro_X',
    avatar: 'https://picsum.photos/seed/101/150/150',
    game: 'Valorant',
    rating: 4,
    content: 'Unpopular opinion: the current weapon meta is perfect. The Vandal vs Phantom balance has never felt better. Precise gunplay actually wins rounds now.',
    likes: 18,
    comments: 0,
    time: '2d ago',
  },
  {
    id: 'r5',
    user: 'Sarah Craft',
    avatar: 'https://picsum.photos/seed/102/150/150',
    game: 'Minecraft',
    rating: 5,
    content: 'Built a cozy mountain cottage today with a panoramic view of the spruce forest. Adding details like copper lanterns and a warm fireplace. Minecraft builder mode is so therapeutic.',
    likes: 35,
    comments: 1,
    time: '3d ago',
  },
];

export default function ActivityFeedPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [expandedReviewIds, setExpandedReviewIds] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnix_feed_comments');
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        const merged = { ...INITIAL_COMMENTS, ...EXTRA_COMMENTS };
        setComments(merged);
        localStorage.setItem('omnix_feed_comments', JSON.stringify(merged));
      }
    } catch (e) {
      console.error('Failed to load comments:', e);
      setComments({ ...INITIAL_COMMENTS, ...EXTRA_COMMENTS });
    }
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data.map(r => ({
          id: r.id,
          user: r.user,
          avatar: r.avatar,
          game: r.game,
          rating: r.rating,
          content: r.content,
          likes: r.likes,
          comments: r.comments,
          time: new Date(r.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
    };
    loadReviews();
  }, []);

  const [gameName, setGameName] = useState('Minecraft');
  const [rating, setRating] = useState(5);
  const [opinionText, setOpinionText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleShareOpinion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!opinionText.trim()) {
      toast({
        title: 'Error',
        description: 'Please write your review details.',
        variant: 'destructive',
      });
      return;
    }

    const newReview: Review = {
      id: `opt-${Date.now()}`,
      user: 'Pilot_Alex',
      avatar: 'https://picsum.photos/seed/pilot/40/40',
      game: gameName,
      rating: rating,
      content: opinionText.trim(),
      likes: 0,
      comments: 0,
      time: 'Just now',
    };

    setReviews([newReview, ...reviews]);
    setOpinionText('');
    setGameName('Minecraft');
    setRating(5);
    setIsOpen(false);

    try {
      await createReview(newReview.game, newReview.rating, newReview.content);
      toast({
        title: 'Success',
        description: 'Your opinion has been shared to the feed!',
      });
      
      const data = await getReviews();
      const formatted = data.map(r => ({
        id: r.id,
        user: r.user,
        avatar: r.avatar,
        game: r.game,
        rating: r.rating,
        content: r.content,
        likes: r.likes,
        comments: r.comments,
        time: new Date(r.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }));

      if (hasLoadedMore) {
        setReviews([...formatted, ...EXTRA_REVIEWS]);
      } else {
        setReviews(formatted);
      }
    } catch (err) {
      console.error('Failed to save review:', err);
    }
  };

  const handleLike = async (id: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
    toast({
      title: 'Liked',
      description: 'You liked this opinion.',
    });
    try {
      await likeReview(id);
    } catch (err) {
      console.error('Failed to like review:', err);
    }
  };

  const toggleComments = (reviewId: string) => {
    setExpandedReviewIds(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handlePostComment = (reviewId: string, text: string) => {
    if (!text.trim()) return;

    const newComment: FeedComment = {
      id: `c-${Date.now()}`,
      user: 'Pilot_Alex',
      avatar: 'https://picsum.photos/seed/pilot/40/40',
      content: text.trim(),
      time: 'Just now',
    };

    const updatedComments = {
      ...comments,
      [reviewId]: [...(comments[reviewId] || []), newComment],
    };

    setComments(updatedComments);
    localStorage.setItem('omnix_feed_comments', JSON.stringify(updatedComments));

    setCommentInputs(prev => ({
      ...prev,
      [reviewId]: '',
    }));

    toast({
      title: 'Comment posted',
      description: 'Your reply has been added to the review.',
    });
  };

  const handleLoadMore = () => {
    setReviews(prev => [...prev, ...EXTRA_REVIEWS]);
    setHasLoadedMore(true);
    toast({
      title: 'Loaded more activity',
      description: 'Showing more community reviews.',
    });
  };

  return (
    <div className="flex min-h-screen">
      <NexusSidebar />
      <main className="flex-1 bg-background p-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-headline font-bold mb-2">Activity <span className="text-primary neon-text">Feed</span></h2>
            <p className="text-muted-foreground">What the OMNIX community is playing and saying.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/80">
                <Plus className="w-4 h-4 mr-2" /> Share Opinion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleShareOpinion}>
                <DialogHeader>
                  <DialogTitle>Share Your Opinion</DialogTitle>
                  <DialogDescription>
                    Post a mini-review or thoughts on a game you've been playing recently.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="game" className="text-right">
                      Game
                    </Label>
                    <select
                      id="game"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      className="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Minecraft">Minecraft</option>
                      <option value="Valorant">Valorant</option>
                      <option value="Elden Ring">Elden Ring</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rating" className="text-right">
                      Rating
                    </Label>
                    <select
                      id="rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="col-span-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ (4/5)</option>
                      <option value="3">⭐⭐⭐ (3/5)</option>
                      <option value="2">⭐⭐ (2/5)</option>
                      <option value="1">⭐ (1/5)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right pt-2">
                      Review
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts on gameplay, performance, map changes, or coordinates..."
                      value={opinionText}
                      onChange={(e) => setOpinionText(e.target.value)}
                      className="col-span-3 min-h-[100px]"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Post Review</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="max-w-3xl mx-auto space-y-8">
          {reviews.map((post) => (
            <Card key={post.id} className="bg-card border-border/50 overflow-hidden hover:border-primary/20 transition-all animate-slide-up">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold">{post.user}</h4>
                      <p className="text-xs text-muted-foreground">{post.time} • Posted in <span className="text-secondary font-medium">{post.game}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < post.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2 pb-0">
                <p className="text-foreground leading-relaxed mb-6 whitespace-pre-line">
                  {post.content}
                </p>
                <div className="flex items-center gap-6 py-4 border-t border-border">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 animate-in heart-bounce" /> {post.likes}
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={cn(
                      "flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors",
                      expandedReviewIds.includes(post.id) ? "text-primary" : ""
                    )}
                  >
                    <MessageSquare className="w-4 h-4" /> {(comments[post.id] || []).length}
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>

              {/* Collapsible Comments Section */}
              {expandedReviewIds.includes(post.id) && (
                <div className="bg-muted/10 border-t border-border/40 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
                  <h5 className="font-semibold text-xs text-muted-foreground mb-3 uppercase tracking-wider">Comments</h5>
                  
                  {/* Comments List */}
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {(!comments[post.id] || comments[post.id].length === 0) ? (
                      <p className="text-xs text-muted-foreground italic py-2">No comments yet. Be the first to reply!</p>
                    ) : (
                      comments[post.id].map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start text-sm group/comment animate-in fade-in duration-100">
                          <Avatar className="w-7 h-7 border border-primary/10">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-3 py-2">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-bold text-xs text-foreground">{comment.user}</span>
                              <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-3 items-center pt-2 border-t border-border/20">
                    <Avatar className="w-7 h-7 border border-primary/10">
                      <AvatarImage src="https://picsum.photos/seed/pilot/40/40" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePostComment(post.id, commentInputs[post.id] || '');
                          }
                        }}
                        className="bg-muted/30 border-border/50 text-xs h-9 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handlePostComment(post.id, commentInputs[post.id] || '')}
                        className="h-9 px-4 text-xs shadow-lg shadow-primary/10"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No activity opinions shared yet. Be the first to share one!
            </div>
          )}
          
          {!hasLoadedMore && reviews.length > 0 && (
            <div className="text-center py-6">
              <Badge 
                onClick={handleLoadMore}
                variant="outline" 
                className="border-border text-muted-foreground cursor-pointer hover:bg-muted/50 hover:text-foreground transition-all px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              >
                 Load More Activity
              </Badge>
            </div>
          )}

          {hasLoadedMore && (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              All community activity loaded
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
