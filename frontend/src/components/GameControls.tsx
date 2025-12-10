import { GameState, GameMode } from '@/lib/gameLogic';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  gameState: GameState;
  highScore: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

export const GameControls = ({
  gameState,
  highScore,
  onStart,
  onPause,
  onResume,
  onReset,
  onModeChange,
}: GameControlsProps) => {
  const { status, score, mode } = gameState;

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Score display */}
      <div className="flex gap-8 text-center">
        <div>
          <p className="text-xs text-muted-foreground mb-1">SCORE</p>
          <p className="text-3xl font-game neon-text">{score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">HIGH SCORE</p>
          <p className="text-3xl font-game text-neon-yellow">{highScore}</p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'pass-through' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('pass-through')}
          disabled={status === 'playing'}
          className="font-game text-xs"
        >
          Pass-Through
        </Button>
        <Button
          variant={mode === 'walls' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          disabled={status === 'playing'}
          className="font-game text-xs"
        >
          Walls
        </Button>
      </div>

      {/* Game controls */}
      <div className="flex gap-3">
        {status === 'idle' && (
          <Button variant="arcade" size="lg" onClick={onStart}>
            <Play className="w-4 h-4 mr-2" />
            START
          </Button>
        )}
        
        {status === 'playing' && (
          <Button variant="neon" size="lg" onClick={onPause}>
            <Pause className="w-4 h-4 mr-2" />
            PAUSE
          </Button>
        )}
        
        {status === 'paused' && (
          <>
            <Button variant="arcade" size="lg" onClick={onResume}>
              <Play className="w-4 h-4 mr-2" />
              RESUME
            </Button>
            <Button variant="outline" size="lg" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              RESTART
            </Button>
          </>
        )}
        
        {status === 'game-over' && (
          <Button variant="arcade" size="lg" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            PLAY AGAIN
          </Button>
        )}
      </div>

      {/* Game over message */}
      {status === 'game-over' && (
        <div className="text-center animate-pulse-neon">
          <p className="text-2xl font-game text-destructive mb-2">GAME OVER</p>
          {score > highScore && (
            <p className="text-sm font-game text-neon-yellow">NEW HIGH SCORE!</p>
          )}
        </div>
      )}

      {/* Instructions */}
      {status === 'idle' && (
        <div className="text-center text-xs text-muted-foreground font-display">
          <p>Use ARROW KEYS or WASD to move</p>
          <p>Press SPACE to pause</p>
        </div>
      )}
    </div>
  );
};
