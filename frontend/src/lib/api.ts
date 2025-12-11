// Centralized API layer matching OpenAPI spec

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: string; // OpenAPI date-time is string
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'pass-through' | 'walls';
  date: string; // OpenAPI date-time is string
  rank: number;
}

export interface ActivePlayer {
  id: string;
  username: string;
  currentScore: number;
  mode: 'pass-through' | 'walls';
  isLive: boolean;
  startedAt: string; // OpenAPI date-time is string
}

export interface GameScore {
  score: number;
  mode: 'pass-through' | 'walls';
  duration: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ErrorResponse {
  error: string;
}

const BASE_URL = '/api/v1';

// Helper to get token
const getToken = () => localStorage.getItem('snake_access_token');

// Helper to handle API requests
async function fetchWrapper<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.detail || 'An error occurred';
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const data = await fetchWrapper<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('snake_access_token', data.token);
      localStorage.setItem('snake_user', JSON.stringify(data.user));
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: (err as Error).message };
    }
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const data = await fetchWrapper<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      localStorage.setItem('snake_access_token', data.token);
      localStorage.setItem('snake_user', JSON.stringify(data.user));
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: (err as Error).message };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWrapper('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('snake_access_token');
      localStorage.removeItem('snake_user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;

    try {
      const data = await fetchWrapper<{ user: User }>('/auth/me');
      localStorage.setItem('snake_user', JSON.stringify(data.user)); // Update cache
      return data.user;
    } catch (err) {
      // If token is invalid, clear storage
      localStorage.removeItem('snake_access_token');
      localStorage.removeItem('snake_user');
      return null;
    }
  }
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'pass-through' | 'walls', limit = 10): Promise<LeaderboardEntry[]> {
    const query = new URLSearchParams();
    if (mode) query.append('mode', mode);
    query.append('limit', limit.toString());

    return fetchWrapper<LeaderboardEntry[]>(`/leaderboard?${query.toString()}`);
  },

  async submitScore(scoreData: GameScore): Promise<{ rank: number | null; isHighScore: boolean }> {
    return fetchWrapper<{ rank: number | null; isHighScore: boolean }>('/leaderboard/submit', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  }
};

// Live players API
export const liveApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    return fetchWrapper<ActivePlayer[]>('/live/players');
  },

  async watchPlayer(playerId: string): Promise<{ success: boolean }> {
    return fetchWrapper<{ success: boolean }>(`/live/watch/${playerId}`, {
      method: 'POST'
    });
  }
};
