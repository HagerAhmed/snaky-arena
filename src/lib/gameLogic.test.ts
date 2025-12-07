import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  getOppositeDirection,
  isValidDirectionChange,
  moveSnake,
  setDirection,
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
  simulateAIMove,
  GameState,
  Position,
} from './gameLogic';

describe('createInitialState', () => {
  it('should create initial state with correct default values', () => {
    const state = createInitialState('pass-through');
    
    expect(state.snake).toHaveLength(3);
    expect(state.direction).toBe('RIGHT');
    expect(state.nextDirection).toBe('RIGHT');
    expect(state.score).toBe(0);
    expect(state.mode).toBe('pass-through');
    expect(state.status).toBe('idle');
    expect(state.gridSize).toBe(20);
  });

  it('should create state with custom grid size', () => {
    const state = createInitialState('walls', 30);
    expect(state.gridSize).toBe(30);
  });

  it('should place snake in center of grid', () => {
    const state = createInitialState('pass-through', 20);
    const head = state.snake[0];
    expect(head.x).toBe(10);
    expect(head.y).toBe(10);
  });
});

describe('generateFood', () => {
  it('should generate food not on snake body', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    
    for (let i = 0; i < 100; i++) {
      const food = generateFood(snake, 20);
      const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
      expect(isOnSnake).toBe(false);
    }
  });

  it('should generate food within grid bounds', () => {
    const snake: Position[] = [{ x: 5, y: 5 }];
    const gridSize = 15;
    
    for (let i = 0; i < 100; i++) {
      const food = generateFood(snake, gridSize);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(gridSize);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(gridSize);
    }
  });
});

describe('getOppositeDirection', () => {
  it('should return correct opposite directions', () => {
    expect(getOppositeDirection('UP')).toBe('DOWN');
    expect(getOppositeDirection('DOWN')).toBe('UP');
    expect(getOppositeDirection('LEFT')).toBe('RIGHT');
    expect(getOppositeDirection('RIGHT')).toBe('LEFT');
  });
});

describe('isValidDirectionChange', () => {
  it('should return true for valid direction changes', () => {
    expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
  });

  it('should return false for opposite directions', () => {
    expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
    expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
  });
});

describe('moveSnake', () => {
  it('should not move if game is not playing', () => {
    const state = createInitialState('pass-through');
    const newState = moveSnake(state);
    expect(newState).toEqual(state);
  });

  it('should move snake in current direction', () => {
    const state = { ...createInitialState('pass-through'), status: 'playing' as const };
    const oldHead = state.snake[0];
    const newState = moveSnake(state);
    
    expect(newState.snake[0].x).toBe(oldHead.x + 1); // Moving RIGHT
    expect(newState.snake[0].y).toBe(oldHead.y);
  });

  it('should wrap around in pass-through mode', () => {
    const state: GameState = {
      ...createInitialState('pass-through'),
      status: 'playing',
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
    };
    
    const newState = moveSnake(state);
    expect(newState.snake[0].x).toBe(0);
    expect(newState.status).toBe('playing');
  });

  it('should end game on wall collision in walls mode', () => {
    const state: GameState = {
      ...createInitialState('walls'),
      status: 'playing',
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
    };
    
    const newState = moveSnake(state);
    expect(newState.status).toBe('game-over');
  });

  it('should end game on self collision', () => {
    const state: GameState = {
      ...createInitialState('pass-through'),
      status: 'playing',
      snake: [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 11, y: 11 },
        { x: 10, y: 11 },
        { x: 9, y: 11 },
      ],
      direction: 'DOWN',
      nextDirection: 'DOWN',
    };
    
    // Move down, then the next move would be into itself
    const afterDown = moveSnake(state);
    const afterLeft = moveSnake({ ...afterDown, nextDirection: 'LEFT' });
    const afterUp = moveSnake({ ...afterLeft, nextDirection: 'UP' });
    
    expect(afterUp.status).toBe('game-over');
  });

  it('should grow snake when eating food', () => {
    const state: GameState = {
      ...createInitialState('pass-through'),
      status: 'playing',
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      food: { x: 11, y: 10 },
    };
    
    const newState = moveSnake(state);
    expect(newState.snake).toHaveLength(4);
    expect(newState.score).toBe(10);
  });

  it('should generate new food when eaten', () => {
    const state: GameState = {
      ...createInitialState('pass-through'),
      status: 'playing',
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      food: { x: 11, y: 10 },
    };
    
    const newState = moveSnake(state);
    expect(newState.food).not.toEqual({ x: 11, y: 10 });
  });
});

describe('setDirection', () => {
  it('should set valid direction', () => {
    const state = { ...createInitialState('pass-through'), status: 'playing' as const };
    const newState = setDirection(state, 'UP');
    expect(newState.nextDirection).toBe('UP');
  });

  it('should not set opposite direction', () => {
    const state = { ...createInitialState('pass-through'), status: 'playing' as const };
    const newState = setDirection(state, 'LEFT');
    expect(newState.nextDirection).toBe('RIGHT'); // Should stay RIGHT
  });

  it('should not change direction if game is not playing', () => {
    const state = createInitialState('pass-through');
    const newState = setDirection(state, 'UP');
    expect(newState.nextDirection).toBe('RIGHT');
  });
});

describe('startGame', () => {
  it('should set status to playing', () => {
    const state = createInitialState('pass-through');
    const newState = startGame(state);
    expect(newState.status).toBe('playing');
  });
});

describe('pauseGame', () => {
  it('should pause a playing game', () => {
    const state = { ...createInitialState('pass-through'), status: 'playing' as const };
    const newState = pauseGame(state);
    expect(newState.status).toBe('paused');
  });

  it('should not pause a non-playing game', () => {
    const state = createInitialState('pass-through');
    const newState = pauseGame(state);
    expect(newState.status).toBe('idle');
  });
});

describe('resumeGame', () => {
  it('should resume a paused game', () => {
    const state = { ...createInitialState('pass-through'), status: 'paused' as const };
    const newState = resumeGame(state);
    expect(newState.status).toBe('playing');
  });

  it('should not resume a non-paused game', () => {
    const state = createInitialState('pass-through');
    const newState = resumeGame(state);
    expect(newState.status).toBe('idle');
  });
});

describe('resetGame', () => {
  it('should create a fresh game state', () => {
    const state = resetGame('walls', 25);
    expect(state.mode).toBe('walls');
    expect(state.gridSize).toBe(25);
    expect(state.status).toBe('idle');
    expect(state.score).toBe(0);
  });
});

describe('simulateAIMove', () => {
  it('should not change state if not playing', () => {
    const state = createInitialState('pass-through');
    const newState = simulateAIMove(state);
    expect(newState).toEqual(state);
  });

  it('should return a valid direction change', () => {
    const state = { ...createInitialState('pass-through'), status: 'playing' as const };
    const newState = simulateAIMove(state);
    
    const validDirections = ['UP', 'DOWN', 'RIGHT']; // Not LEFT (opposite of RIGHT)
    expect(validDirections).toContain(newState.nextDirection);
  });

  it('should try to avoid walls in walls mode', () => {
    const state: GameState = {
      ...createInitialState('walls'),
      status: 'playing',
      snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
      food: { x: 5, y: 5 },
    };
    
    // Run multiple times to check AI avoids wall
    for (let i = 0; i < 10; i++) {
      const newState = simulateAIMove(state);
      // Should not continue RIGHT into wall, should turn UP or DOWN
      expect(['UP', 'DOWN']).toContain(newState.nextDirection);
    }
  });
});
