import { Eye, Users, Radio, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameBoard } from './GameBoard';
import { useSpectator } from '@/hooks/useSpectator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const SpectatorView = () => {
  const {
    activePlayers,
    watchingPlayer,
    spectatorGameState,
    loading,
    watchPlayer,
    stopWatching,
    refreshPlayers,
  } = useSpectator();

  if (watchingPlayer && spectatorGameState) {
    return (
      <div className="flex flex-col items-center gap-6">
        {/* Watching header */}
        <div className="flex items-center gap-4 w-full max-w-md justify-between">
          <Button variant="ghost" size="sm" onClick={stopWatching}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm font-display text-destructive">LIVE</span>
          </div>
        </div>

        {/* Player info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-xl">🐍</span>
            </div>
            <h2 className="text-xl font-game neon-text">{watchingPlayer.username}</h2>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm font-display text-muted-foreground">
            <span>Score: <span className="text-foreground">{spectatorGameState.score}</span></span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              watchingPlayer.mode === 'pass-through'
                ? "bg-accent/20 text-accent"
                : "bg-destructive/20 text-destructive"
            )}>
              {watchingPlayer.mode}
            </span>
          </div>
        </div>

        {/* Game board */}
        <div className="relative">
          <GameBoard gameState={spectatorGameState} />
          
          {/* Spectator overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 px-2 py-1 rounded text-xs">
            <Eye className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Spectating</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-game text-accent">WATCH LIVE</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={refreshPlayers}
          disabled={loading}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Active players */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-game text-muted-foreground">
            {activePlayers.length} PLAYERS ONLINE
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : activePlayers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-display">
            No players online right now.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activePlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Live indicator */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <span className="text-xl">🐍</span>
                    </div>
                    {player.isLive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Player info */}
                  <div>
                    <h3 className="font-display text-foreground">{player.username}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Score: {player.currentScore}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full",
                        player.mode === 'pass-through'
                          ? "bg-accent/20 text-accent"
                          : "bg-destructive/20 text-destructive"
                      )}>
                        {player.mode}
                      </span>
                      <span>
                        Playing for {formatDistanceToNow(player.startedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Watch button */}
                <Button
                  variant="neon-blue"
                  size="sm"
                  onClick={() => watchPlayer(player)}
                  className="font-game text-xs"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  WATCH
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="mt-4 text-center text-xs text-muted-foreground font-display">
        Click on any player to watch their game in real-time
      </p>
    </div>
  );
};
