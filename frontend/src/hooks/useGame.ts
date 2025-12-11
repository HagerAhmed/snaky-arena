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
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useGame = (initialMode: GameMode = 'pass-through') => {
  const { isAuthenticated } = useAuth();
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(initialMode)
  );

  // Local high score for immediate feedback
  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem(`snake_highscore_${initialMode}`);
    return stored ? parseInt(stored, 10) : 0;
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const gameActiveRef = useRef(false);

  // Handle Game Over Side Effects
  useEffect(() => {
    if (gameState.status === 'game-over' && gameActiveRef.current) {
      gameActiveRef.current = false;
      const endTime = Date.now();
      const duration = startTimeRef.current ? Math.floor((endTime - startTimeRef.current) / 1000) : 0;

      handleGameOver(gameState.score, gameState.mode, duration);
    } else if (gameState.status === 'playing' && !gameActiveRef.current) {
      gameActiveRef.current = true;
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
    }
  }, [gameState.status, gameState.score, gameState.mode]);

  const handleGameOver = async (score: number, mode: GameMode, duration: number) => {
    // Update local high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(`snake_highscore_${mode}`, String(score));
    }

    if (isAuthenticated) {
      try {
        const { rank, isHighScore } = await leaderboardApi.submitScore({
          score,
          mode,
          duration,
        });

        if (isHighScore) {
          toast.success(`New High Score! Rank #${rank}`);
        } else {
          toast.info(`Score submitted! Rank #${rank}`);
        }
      } catch (error) {
        console.error('Failed to submit score:', error);
        toast.error('Failed to submit score to leaderboard');
      }
    } else {
      // Optional: Prompt user to login to save score
      toast('Login to save your score next time!', {
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/auth'
        }
      });
    }
  };

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
      setGameState(state => moveSnake(state));
      lastUpdateRef.current = timestamp;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.speed]);

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
    startTimeRef.current = Date.now();
    setGameState(state => startGame(state));
  }, []);

  const pause = useCallback(() => {
    setGameState(state => pauseGame(state));
  }, []);

  const resume = useCallback(() => {
    setGameState(state => resumeGame(state));
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = null;
    gameActiveRef.current = false;
    setGameState(resetGame(gameState.mode, gameState.gridSize));
  }, [gameState.mode, gameState.gridSize]);

  const changeMode = useCallback((mode: GameMode) => {
    startTimeRef.current = null;
    gameActiveRef.current = false;
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
