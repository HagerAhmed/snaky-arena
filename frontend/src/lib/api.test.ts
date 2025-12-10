import { describe, it, expect, beforeEach } from 'vitest';
import { authApi, leaderboardApi, liveApi } from './api';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should login with valid credentials', async () => {
    const result = await authApi.login('snake@game.com', 'password123');
    
    expect(result.error).toBeNull();
    expect(result.user).not.toBeNull();
    expect(result.user?.username).toBe('SnakeMaster');
  });

  it('should fail login with invalid email', async () => {
    const result = await authApi.login('invalid@test.com', 'password123');
    
    expect(result.error).toBe('User not found');
    expect(result.user).toBeNull();
  });

  it('should fail login with wrong password', async () => {
    const result = await authApi.login('snake@game.com', 'wrongpassword');
    
    expect(result.error).toBe('Invalid password');
    expect(result.user).toBeNull();
  });

  it('should signup with new credentials', async () => {
    const result = await authApi.signup('TestPlayer', 'testplayer@test.com', 'password123');
    
    expect(result.error).toBeNull();
    expect(result.user).not.toBeNull();
    expect(result.user?.username).toBe('TestPlayer');
    expect(result.user?.email).toBe('testplayer@test.com');
    expect(result.user?.highScore).toBe(0);
  });

  it('should fail signup with existing email', async () => {
    const result = await authApi.signup('NewUser', 'snake@game.com', 'password123');
    
    expect(result.error).toBe('Email already registered');
    expect(result.user).toBeNull();
  });

  it('should fail signup with existing username', async () => {
    const result = await authApi.signup('SnakeMaster', 'newuser@test.com', 'password123');
    
    expect(result.error).toBe('Username already taken');
    expect(result.user).toBeNull();
  });

  it('should persist user to localStorage on login', async () => {
    await authApi.login('snake@game.com', 'password123');
    
    const stored = localStorage.getItem('snake_user');
    expect(stored).not.toBeNull();
    
    const user = JSON.parse(stored!);
    expect(user.username).toBe('SnakeMaster');
  });

  it('should get current user from localStorage', async () => {
    await authApi.login('snake@game.com', 'password123');
    
    // Clear in-memory state by calling getCurrentUser fresh
    const user = await authApi.getCurrentUser();
    expect(user?.username).toBe('SnakeMaster');
  });

  it('should logout and clear localStorage', async () => {
    await authApi.login('snake@game.com', 'password123');
    await authApi.logout();
    
    const stored = localStorage.getItem('snake_user');
    expect(stored).toBeNull();
    
    const user = await authApi.getCurrentUser();
    expect(user).toBeNull();
  });
});

describe('leaderboardApi', () => {
  it('should get leaderboard entries', async () => {
    const entries = await leaderboardApi.getLeaderboard();
    
    expect(entries).toBeInstanceOf(Array);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty('username');
    expect(entries[0]).toHaveProperty('score');
    expect(entries[0]).toHaveProperty('mode');
    expect(entries[0]).toHaveProperty('rank');
  });

  it('should filter by mode', async () => {
    const wallsEntries = await leaderboardApi.getLeaderboard('walls');
    
    wallsEntries.forEach(entry => {
      expect(entry.mode).toBe('walls');
    });
  });

  it('should respect limit parameter', async () => {
    const entries = await leaderboardApi.getLeaderboard(undefined, 5);
    
    expect(entries.length).toBeLessThanOrEqual(5);
  });

  it('should submit score and return rank', async () => {
    const result = await leaderboardApi.submitScore({
      score: 500,
      mode: 'pass-through',
      duration: 120,
    });
    
    expect(result).toHaveProperty('rank');
    expect(result).toHaveProperty('isHighScore');
    expect(typeof result.rank).toBe('number');
  });
});

describe('liveApi', () => {
  it('should get active players', async () => {
    const players = await liveApi.getActivePlayers();
    
    expect(players).toBeInstanceOf(Array);
    expect(players.length).toBeGreaterThan(0);
    expect(players[0]).toHaveProperty('username');
    expect(players[0]).toHaveProperty('currentScore');
    expect(players[0]).toHaveProperty('mode');
    expect(players[0]).toHaveProperty('isLive');
  });

  it('should watch player successfully', async () => {
    const result = await liveApi.watchPlayer('live1');
    
    expect(result.success).toBe(true);
  });
});
