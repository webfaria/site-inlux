import { useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/api';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const TOKEN_KEY = 'inlux_admin_token';

export const useAuth = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    authService.logout().catch(() => undefined).finally(() => {
      window.location.assign('/');
    });
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set timeout if user is authenticated
    if (localStorage.getItem(TOKEN_KEY)) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [logout]);

  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Reset timeout on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    // Initial timeout set
    resetTimeout();

    // Handle browser/tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Clear the token when leaving
      localStorage.removeItem(TOKEN_KEY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, resetTimeout]);

  return {
    isAuthenticated,
    logout,
  };
};
