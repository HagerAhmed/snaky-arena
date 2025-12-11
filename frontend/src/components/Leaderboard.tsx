import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardApi, LeaderboardEntry } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterMode = 'all' | 'pass-through' | 'walls';

export const Leaderboard = () => {
  const [filter, setFilter] = useState<FilterMode>('all');

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: () => leaderboardApi.getLeaderboard(filter === 'all' ? undefined : filter),
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="w-5 text-center font-game text-xs">{rank}</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-neon-yellow" />
          <h1 className="text-2xl font-game neon-text">LEADERBOARD</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pass-through', 'walls'] as FilterMode[]).map((mode) => (
          <Button
            key={mode}
            variant={filter === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(mode)}
            className="font-game text-xs capitalize"
          >
            {mode === 'all' ? 'All Modes' : mode}
          </Button>
        ))}
      </div>

      {/* Leaderboard list */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px] gap-4 p-4 border-b border-border bg-muted/30">
          <span className="text-xs font-game text-muted-foreground">RANK</span>
          <span className="text-xs font-game text-muted-foreground">PLAYER</span>
          <span className="text-xs font-game text-muted-foreground text-right">SCORE</span>
          <span className="text-xs font-game text-muted-foreground text-right">MODE</span>
        </div>

        {/* Entries */}
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-display">
            No entries yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "grid grid-cols-[60px_1fr_100px_100px] gap-4 p-4 items-center transition-colors hover:bg-muted/20",
                  entry.rank <= 3 && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="text-sm">🐍</span>
                  </div>
                  <span className={cn(
                    "font-display",
                    entry.rank === 1 && "text-neon-yellow font-bold"
                  )}>
                    {entry.username}
                  </span>
                </div>
                <div className={cn(
                  "text-right font-game",
                  entry.rank === 1 ? "text-neon-yellow neon-text" : "text-foreground"
                )}>
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-game px-2 py-1 rounded-full",
                    entry.mode === 'pass-through'
                      ? "bg-accent/20 text-accent"
                      : "bg-destructive/20 text-destructive"
                  )}>
                    {entry.mode === 'pass-through' ? '∞' : '⚠'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
