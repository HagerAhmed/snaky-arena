import { useState, useCallback, useEffect, useRef } from 'react';
import {
  GameState,
  createInitialState,
  moveSnake,
  simulateAIMove,
  startGame,
  GameMode,
} from '@/lib/gameLogic';
import { ActivePlayer, liveApi } from '@/lib/api';

export const useSpectator = () => {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [watchingPlayer, setWatchingPlayer] = useState<ActivePlayer | null>(null);
  const [spectatorGameState, setSpectatorGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const scoreUpdateRef = useRef<number>(0);

  // Fetch active players
  const fetchActivePlayers = useCallback(async () => {
    setLoading(true);
    try {
      const players = await liveApi.getActivePlayers();
      setActivePlayers(players);
    } catch (err) {
      console.error('Failed to fetch active players:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePlayers();
    
    // Refresh player list every 10 seconds
    const interval = setInterval(fetchActivePlayers, 10000);
    return () => clearInterval(interval);
  }, [fetchActivePlayers]);

  // Simulate AI gameplay for spectator mode
  const spectatorGameLoop = useCallback((timestamp: number) => {
    if (!spectatorGameState || spectatorGameState.status !== 'playing') return;

    const speed = spectatorGameState.speed;
    
    if (timestamp - lastUpdateRef.current >= speed) {
      setSpectatorGameState(state => {
        if (!state || state.status !== 'playing') return state;
        
        // First apply AI decision, then move
        const withAI = simulateAIMove(state);
        const newState = moveSnake(withAI);
        
        // Update watching player score
        if (watchingPlayer && newState.score !== state.score) {
          setWatchingPlayer(prev => prev ? { ...prev, currentScore: newState.score } : null);
        }
        
        // If game over, restart after a delay
        if (newState.status === 'game-over') {
          setTimeout(() => {
            if (watchingPlayer) {
              const freshState = createInitialState(watchingPlayer.mode as GameMode);
              setSpectatorGameState(startGame(freshState));
            }
          }, 2000);
        }
        
        return newState;
      });
      lastUpdateRef.current = timestamp;
    }
    
    gameLoopRef.current = requestAnimationFrame(spectatorGameLoop);
  }, [spectatorGameState, watchingPlayer]);

  useEffect(() => {
    if (spectatorGameState?.status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(spectatorGameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [spectatorGameState?.status, spectatorGameLoop]);

  const watchPlayer = useCallback(async (player: ActivePlayer) => {
    await liveApi.watchPlayer(player.id);
    setWatchingPlayer(player);
    
    // Create a game state based on player's current game
    const initialState = createInitialState(player.mode as GameMode);
    const playingState = {
      ...startGame(initialState),
      score: player.currentScore,
    };
    setSpectatorGameState(playingState);
  }, []);

  const stopWatching = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setWatchingPlayer(null);
    setSpectatorGameState(null);
  }, []);

  return {
    activePlayers,
    watchingPlayer,
    spectatorGameState,
    loading,
    watchPlayer,
    stopWatching,
    refreshPlayers: fetchActivePlayers,
  };
};
