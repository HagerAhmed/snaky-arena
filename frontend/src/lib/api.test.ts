import { describe, it, expect, beforeEach, vi, afterEach, MockInstance } from 'vitest';
import { authApi, leaderboardApi, liveApi, User } from './api';

// Access to mocked fetch
let fetchSpy: MockInstance;

describe('api', () => {
  beforeEach(() => {
    localStorage.clear();
    // Spy on fetch
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('authApi', () => {
    it('should login with valid credentials', async () => {
      const mockUser: User = {
        id: '1',
        username: 'SnakeMaster',
        email: 'snake@game.com',
        highScore: 2450,
        gamesPlayed: 156,
        createdAt: new Date().toISOString()
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, token: 'fake-token' })
      });

      const result = await authApi.login('snake@game.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
      expect(localStorage.getItem('snake_access_token')).toBe('fake-token');
      expect(localStorage.getItem('snake_user')).toContain('SnakeMaster');

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'snake@game.com', password: 'password123' })
      }));
    });

    it('should handle login error', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      });

      const result = await authApi.login('invalid@test.com', 'pwd');

      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeNull();
    });

    it('should signup correctly', async () => {
      const mockUser: User = {
        id: '1',
        username: 'NewUser',
        email: 'new@test.com',
        highScore: 0,
        gamesPlayed: 0,
        createdAt: new Date().toISOString()
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, token: 'new-token' })
      });

      const result = await authApi.signup('NewUser', 'new@test.com', 'pwd');

      expect(result.user).toEqual(mockUser);
      expect(localStorage.getItem('snake_access_token')).toBe('new-token');

      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/auth/signup', expect.anything());
    });
  });

  describe('leaderboardApi', () => {
    it('should get leaderboard entries', async () => {
      const mockEntries = [
        { id: '1', username: 'P1', score: 100, mode: 'walls', rank: 1, date: new Date().toISOString() }
      ];

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntries
      });

      const entries = await leaderboardApi.getLeaderboard('walls', 5);

      expect(entries).toEqual(mockEntries);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/leaderboard?mode=walls&limit=5'),
        expect.anything()
      );
    });

    it('should submit score', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rank: 5, isHighScore: true })
      });

      const result = await leaderboardApi.submitScore({
        score: 500,
        mode: 'pass-through',
        duration: 120
      });

      expect(result.rank).toBe(5);
      expect(result.isHighScore).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/leaderboard/submit', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  describe('liveApi', () => {
    it('should get active players', async () => {
      const mockPlayers = [{ id: 'p1', username: 'u1' }];
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers
      });

      const players = await liveApi.getActivePlayers();
      expect(players).toEqual(mockPlayers);
      expect(fetchSpy).toHaveBeenCalledWith('/api/v1/live/players', expect.anything());
    });
  });
});
