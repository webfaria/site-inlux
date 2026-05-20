import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../services/api', () => ({
  authService: {
    logout: vi.fn(() => Promise.resolve()),
  },
}));

import { useAuth } from '../hooks/useAuth';

// Cast localStorage to any for testing
const localStorage = globalThis.localStorage as any;

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
    localStorage.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return isAuthenticated as false when no token exists', () => {
    localStorage.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return isAuthenticated as true when token exists', () => {
    localStorage.getItem.mockReturnValue('fake-token');
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should call logout and redirect to home page', async () => {
    const { result } = renderHook(() => useAuth());
    
    result.current.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('inlux_admin_token');
    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });
  });
});
