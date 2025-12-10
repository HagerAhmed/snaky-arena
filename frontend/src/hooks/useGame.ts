import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  GameMode,
  Direction,
  createInitialState,
  moveSnake,
  setDirection,
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
} from '@/lib/gameLogic';
import { leaderboardApi } from '@/lib/api';

export const useGame = (initialMode: GameMode = 'pass-through') => {
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(initialMode)
  );
  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem(`snake_highscore_${initialMode}`);
    return stored ? parseInt(stored, 10) : 0;
  });
  
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keyToDirection: Record<string, Direction> = {
      'ArrowUp': 'UP',
      'ArrowDown': 'DOWN',
      'ArrowLeft': 'LEFT',
      'ArrowRight': 'RIGHT',
      'w': 'UP',
      'W': 'UP',
      's': 'DOWN',
      'S': 'DOWN',
      'a': 'LEFT',
      'A': 'LEFT',
      'd': 'RIGHT',
      'D': 'RIGHT',
    };

    if (keyToDirection[e.key]) {
      e.preventDefault();
      setGameState(state => setDirection(state, keyToDirection[e.key]));
    }

    if (e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      setGameState(state => {
        if (state.status === 'playing') return pauseGame(state);
        if (state.status === 'paused') return resumeGame(state);
        return state;
      });
    }
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    if (timestamp - lastUpdateRef.current >= gameState.speed) {
      setGameState(state => {
        const newState = moveSnake(state);
        
        // Check for game over and update high score
        if (newState.status === 'game-over' && newState.score > highScore) {
          setHighScore(newState.score);
          localStorage.setItem(`snake_highscore_${newState.mode}`, String(newState.score));
          
          // Submit score to leaderboard
          leaderboardApi.submitScore({
            score: newState.score,
            mode: newState.mode,
            duration: 0, // Could track this
          });
        }
        
        return newState;
      });
      lastUpdateRef.current = timestamp;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.speed, highScore]);

  useEffect(() => {
    if (gameState.status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const start = useCallback(() => {
    setGameState(state => startGame(state));
  }, []);

  const pause = useCallback(() => {
    setGameState(state => pauseGame(state));
  }, []);

  const resume = useCallback(() => {
    setGameState(state => resumeGame(state));
  }, []);

  const reset = useCallback(() => {
    setGameState(resetGame(gameState.mode, gameState.gridSize));
  }, [gameState.mode, gameState.gridSize]);

  const changeMode = useCallback((mode: GameMode) => {
    setGameState(resetGame(mode, gameState.gridSize));
    const stored = localStorage.getItem(`snake_highscore_${mode}`);
    setHighScore(stored ? parseInt(stored, 10) : 0);
  }, [gameState.gridSize]);

  return {
    gameState,
    highScore,
    start,
    pause,
    resume,
    reset,
    changeMode,
  };
};
