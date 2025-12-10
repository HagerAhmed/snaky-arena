import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { authApi } from '@/lib/api';

// Utility to wait for async state updates
const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  callback();
};

// Mock the API
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should start with no user and loading state', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should load existing user on mount', async () => {
    const mockUser = { id: '1', username: 'Test', email: 'test@test.com', highScore: 100, gamesPlayed: 5, createdAt: new Date() };
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('should handle login successfully', async () => {
    const mockUser = { id: '1', username: 'Test', email: 'test@test.com', highScore: 100, gamesPlayed: 5, createdAt: new Date() };
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authApi.login).mockResolvedValue({ user: mockUser, error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.login('test@test.com', 'password');
    });

    expect(success).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should handle login failure', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authApi.login).mockResolvedValue({ user: null, error: 'Invalid password' });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.login('test@test.com', 'wrong');
    });

    expect(success).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid password');
  });

  it('should handle signup successfully', async () => {
    const mockUser = { id: '1', username: 'NewUser', email: 'new@test.com', highScore: 0, gamesPlayed: 0, createdAt: new Date() };
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authApi.signup).mockResolvedValue({ user: mockUser, error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.signup('NewUser', 'new@test.com', 'password');
    });

    expect(success).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle logout', async () => {
    const mockUser = { id: '1', username: 'Test', email: 'test@test.com', highScore: 100, gamesPlayed: 5, createdAt: new Date() };
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(authApi.logout).mockResolvedValue();

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });

  it('should clear error', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authApi.login).mockResolvedValue({ user: null, error: 'Some error' });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test@test.com', 'wrong');
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
