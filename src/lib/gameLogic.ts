// Snake game core logic - pure functions for testability

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'pass-through' | 'walls';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  mode: GameMode;
  status: GameStatus;
  gridSize: number;
  speed: number;
}

export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

export const createInitialState = (mode: GameMode, gridSize = 20): GameState => {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  
  return {
    snake: [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ],
    food: generateFood([{ x: centerX, y: centerY }, { x: centerX - 1, y: centerY }, { x: centerX - 2, y: centerY }], gridSize),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    mode,
    status: 'idle',
    gridSize,
    speed: INITIAL_SPEED,
  };
};

export const generateFood = (snake: Position[], gridSize: number): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT',
  };
  return opposites[dir];
};

export const isValidDirectionChange = (current: Direction, next: Direction): boolean => {
  return next !== getOppositeDirection(current);
};

export const moveSnake = (state: GameState): GameState => {
  if (state.status !== 'playing') return state;

  const { snake, food, nextDirection, mode, gridSize } = state;
  const head = snake[0];
  
  // Calculate new head position
  let newHead: Position;
  switch (nextDirection) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (mode === 'pass-through') {
    // Wrap around
    if (newHead.x < 0) newHead.x = gridSize - 1;
    if (newHead.x >= gridSize) newHead.x = 0;
    if (newHead.y < 0) newHead.y = gridSize - 1;
    if (newHead.y >= gridSize) newHead.y = 0;
  } else {
    // Walls mode - check for collision
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
      return { ...state, status: 'game-over' };
    }
  }

  // Check self collision (exclude last segment as it will move)
  const bodyWithoutTail = snake.slice(0, -1);
  if (bodyWithoutTail.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...state, status: 'game-over' };
  }

  // Check if food is eaten
  const ateFood = newHead.x === food.x && newHead.y === food.y;
  
  const newSnake = ateFood 
    ? [newHead, ...snake]  // Grow
    : [newHead, ...snake.slice(0, -1)];  // Move

  const newScore = ateFood ? state.score + 10 : state.score;
  const newSpeed = ateFood 
    ? Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT)
    : state.speed;

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? generateFood(newSnake, gridSize) : food,
    direction: nextDirection,
    score: newScore,
    speed: newSpeed,
  };
};

export const setDirection = (state: GameState, direction: Direction): GameState => {
  if (state.status !== 'playing') return state;
  if (!isValidDirectionChange(state.direction, direction)) return state;
  
  return { ...state, nextDirection: direction };
};

export const startGame = (state: GameState): GameState => {
  return { ...state, status: 'playing' };
};

export const pauseGame = (state: GameState): GameState => {
  if (state.status !== 'playing') return state;
  return { ...state, status: 'paused' };
};

export const resumeGame = (state: GameState): GameState => {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'playing' };
};

export const resetGame = (mode: GameMode, gridSize = 20): GameState => {
  return createInitialState(mode, gridSize);
};

// AI player simulation for spectator mode
export const simulateAIMove = (state: GameState): GameState => {
  if (state.status !== 'playing') return state;

  const { snake, food, direction, gridSize } = state;
  const head = snake[0];
  
  // Simple AI: try to move towards food, avoid walls and self
  const allDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const possibleDirections = allDirections.filter(d => isValidDirectionChange(direction, d));

  // Calculate which direction gets us closer to food
  const getNewHeadPosition = (dir: Direction): Position => {
    switch (dir) {
      case 'UP': return { x: head.x, y: head.y - 1 };
      case 'DOWN': return { x: head.x, y: head.y + 1 };
      case 'LEFT': return { x: head.x - 1, y: head.y };
      case 'RIGHT': return { x: head.x + 1, y: head.y };
    }
  };

  const isSafe = (pos: Position): boolean => {
    // Check walls in walls mode
    if (state.mode === 'walls') {
      if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
        return false;
      }
    }
    // Check self collision
    return !snake.some(s => s.x === pos.x && s.y === pos.y);
  };

  const getDistance = (pos: Position): number => {
    return Math.abs(pos.x - food.x) + Math.abs(pos.y - food.y);
  };

  // Sort directions by distance to food, filter out unsafe moves
  const safeDirections = possibleDirections
    .map(d => ({ dir: d as Direction, pos: getNewHeadPosition(d as Direction) }))
    .filter(({ pos }) => isSafe(pos))
    .sort((a, b) => getDistance(a.pos) - getDistance(b.pos));

  const chosenDirection: Direction = safeDirections.length > 0
    ? safeDirections[0].dir 
    : direction; // Keep current direction if no safe moves

  // Add some randomness to make it more interesting (10% chance of random safe move)
  const finalDirection = Math.random() < 0.1 && safeDirections.length > 1
    ? safeDirections[Math.floor(Math.random() * safeDirections.length)].dir
    : chosenDirection;

  return setDirection(state, finalDirection);
};
