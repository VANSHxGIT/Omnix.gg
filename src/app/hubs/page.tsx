
import { NexusSidebar } from '@/components/layout/sidebar';
import { MOCK_GAMES } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

export default function HubsListPage() {
  return (
    <div className="flex min-h-screen">
      <NexusSidebar />
      <main className="flex-1 bg-background p-8">
        <header className="mb-10">
          <h2 className="text-4xl font-headline font-bold mb-2">Game <span className="text-primary neon-text">Hubs</span></h2>
          <p className="text-muted-foreground">Select a world to enter the community chat and find teammates.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_GAMES.map((game) => (
            <Link href={`/hubs/${game.id}`} key={game.id} className="group">
              <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all hover:translate-y-[-4px]">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={game.poster}
                    alt={game.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint="game poster"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="secondary" className="mb-2 bg-primary/80 backdrop-blur-sm text-[10px]">{game.category}</Badge>
                    <h4 className="text-xl font-headline font-bold text-white mb-1">{game.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                       <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {game.playersOnline} Online
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
