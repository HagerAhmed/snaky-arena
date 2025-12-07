import { GameBoard } from '@/components/GameBoard';
import { GameControls } from '@/components/GameControls';
import { useGame } from '@/hooks/useGame';

const Index = () => {
  const {
    gameState,
    highScore,
    start,
    pause,
    resume,
    reset,
    changeMode,
  } = useGame('pass-through');

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-8 px-4">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16">
        {/* Game board */}
        <div className="relative">
          <GameBoard gameState={gameState} />
        </div>

        {/* Controls */}
        <GameControls
          gameState={gameState}
          highScore={highScore}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onModeChange={changeMode}
        />
      </div>
    </div>
  );
};

export default Index;
