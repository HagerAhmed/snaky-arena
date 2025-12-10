import { memo } from 'react';
import { GameState } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  cellSize?: number;
  className?: string;
}

export const GameBoard = memo(({ gameState, cellSize = 20, className }: GameBoardProps) => {
  const { snake, food, gridSize, status, mode } = gameState;
  const boardSize = gridSize * cellSize;

  return (
    <div className={cn("relative", className)}>
      {/* Game board container */}
      <div 
        className={cn(
          "relative game-grid neon-border rounded-lg overflow-hidden",
          status === 'game-over' && "opacity-50"
        )}
        style={{ 
          width: boardSize, 
          height: boardSize,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none z-10" />
        
        {/* Food */}
        <div
          className="absolute rounded-full bg-food animate-pulse-neon"
          style={{
            width: cellSize - 4,
            height: cellSize - 4,
            left: food.x * cellSize + 2,
            top: food.y * cellSize + 2,
            boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food-glow))',
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={index}
              className={cn(
                "absolute rounded-sm transition-all duration-75",
                isHead ? "bg-snake z-5" : "bg-snake/80"
              )}
              style={{
                width: cellSize - 2,
                height: cellSize - 2,
                left: segment.x * cellSize + 1,
                top: segment.y * cellSize + 1,
                boxShadow: isHead 
                  ? '0 0 10px hsl(var(--snake)), 0 0 20px hsl(var(--snake-glow))'
                  : '0 0 5px hsl(var(--snake)/0.5)',
              }}
            />
          );
        })}

        {/* Wall indicators for walls mode */}
        {mode === 'walls' && (
          <div className="absolute inset-0 border-4 border-destructive/50 pointer-events-none" 
            style={{ boxShadow: 'inset 0 0 20px hsl(var(--destructive)/0.3)' }}
          />
        )}
      </div>

      {/* Mode indicator */}
      <div className="absolute -top-8 left-0 right-0 flex justify-center">
        <span className={cn(
          "text-xs font-game px-3 py-1 rounded-full",
          mode === 'pass-through' 
            ? "bg-accent/20 text-accent border border-accent/50" 
            : "bg-destructive/20 text-destructive border border-destructive/50"
        )}>
          {mode === 'pass-through' ? '∞ PASS-THROUGH' : '⚠ WALLS'}
        </span>
      </div>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';
