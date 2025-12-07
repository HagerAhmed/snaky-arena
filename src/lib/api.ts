// Centralized mock API layer - all backend calls go through here

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'pass-through' | 'walls';
  date: Date;
  rank: number;
}

export interface ActivePlayer {
  id: string;
  username: string;
  currentScore: number;
  mode: 'pass-through' | 'walls';
  isLive: boolean;
  startedAt: Date;
}

export interface GameScore {
  score: number;
  mode: 'pass-through' | 'walls';
  duration: number;
}

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let currentUser: User | null = null;
const mockUsers: Map<string, { user: User; password: string }> = new Map();

// Initialize some mock users
const initMockData = () => {
  const mockUsersList = [
    { id: '1', username: 'SnakeMaster', email: 'snake@game.com', highScore: 2450, gamesPlayed: 156 },
    { id: '2', username: 'PixelViper', email: 'pixel@game.com', highScore: 1890, gamesPlayed: 89 },
    { id: '3', username: 'RetroGamer', email: 'retro@game.com', highScore: 1650, gamesPlayed: 234 },
    { id: '4', username: 'ArcadeKing', email: 'arcade@game.com', highScore: 1420, gamesPlayed: 67 },
    { id: '5', username: 'NeonSnake', email: 'neon@game.com', highScore: 1200, gamesPlayed: 45 },
  ];

  mockUsersList.forEach(u => {
    mockUsers.set(u.email, {
      user: { ...u, createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) },
      password: 'password123'
    });
  });
};

initMockData();

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay(500);
    
    const userData = mockUsers.get(email);
    if (!userData) {
      return { user: null, error: 'User not found' };
    }
    if (userData.password !== password) {
      return { user: null, error: 'Invalid password' };
    }
    
    currentUser = userData.user;
    localStorage.setItem('snake_user', JSON.stringify(currentUser));
    return { user: currentUser, error: null };
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    await delay(500);
    
    if (mockUsers.has(email)) {
      return { user: null, error: 'Email already registered' };
    }
    
    const existingUsername = Array.from(mockUsers.values()).find(u => u.user.username === username);
    if (existingUsername) {
      return { user: null, error: 'Username already taken' };
    }
    
    const newUser: User = {
      id: String(mockUsers.size + 1),
      username,
      email,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date()
    };
    
    mockUsers.set(email, { user: newUser, password });
    currentUser = newUser;
    localStorage.setItem('snake_user', JSON.stringify(currentUser));
    return { user: newUser, error: null };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    if (currentUser) return currentUser;
    
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  }
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'pass-through' | 'walls', limit = 10): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    const entries: LeaderboardEntry[] = [
      { id: '1', username: 'SnakeMaster', score: 2450, mode: 'walls', date: new Date(), rank: 1 },
      { id: '2', username: 'PixelViper', score: 1890, mode: 'pass-through', date: new Date(), rank: 2 },
      { id: '3', username: 'RetroGamer', score: 1650, mode: 'walls', date: new Date(), rank: 3 },
      { id: '4', username: 'ArcadeKing', score: 1420, mode: 'pass-through', date: new Date(), rank: 4 },
      { id: '5', username: 'NeonSnake', score: 1200, mode: 'walls', date: new Date(), rank: 5 },
      { id: '6', username: 'GlowWorm', score: 980, mode: 'pass-through', date: new Date(), rank: 6 },
      { id: '7', username: 'ByteSlither', score: 850, mode: 'walls', date: new Date(), rank: 7 },
      { id: '8', username: 'DigitalDragon', score: 720, mode: 'pass-through', date: new Date(), rank: 8 },
      { id: '9', username: 'CyberSerpent', score: 650, mode: 'walls', date: new Date(), rank: 9 },
      { id: '10', username: 'QuantumSnake', score: 580, mode: 'pass-through', date: new Date(), rank: 10 },
    ];
    
    let filtered = mode ? entries.filter(e => e.mode === mode) : entries;
    return filtered.slice(0, limit);
  },

  async submitScore(score: GameScore): Promise<{ rank: number | null; isHighScore: boolean }> {
    await delay(400);
    // Simulate score submission
    const rank = Math.floor(Math.random() * 20) + 1;
    const isHighScore = currentUser ? score.score > currentUser.highScore : false;
    
    if (isHighScore && currentUser) {
      currentUser.highScore = score.score;
      localStorage.setItem('snake_user', JSON.stringify(currentUser));
    }
    
    return { rank, isHighScore };
  }
};

// Live players API (for spectating)
export const liveApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(200);
    
    return [
      { id: 'live1', username: 'SnakeHunter42', currentScore: 340, mode: 'walls', isLive: true, startedAt: new Date(Date.now() - 120000) },
      { id: 'live2', username: 'GreenMamba', currentScore: 580, mode: 'pass-through', isLive: true, startedAt: new Date(Date.now() - 300000) },
      { id: 'live3', username: 'SlitherKing', currentScore: 220, mode: 'walls', isLive: true, startedAt: new Date(Date.now() - 60000) },
      { id: 'live4', username: 'VenomStrike', currentScore: 890, mode: 'pass-through', isLive: true, startedAt: new Date(Date.now() - 450000) },
    ];
  },

  async watchPlayer(playerId: string): Promise<{ success: boolean }> {
    await delay(100);
    return { success: true };
  }
};
