"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface NavigationEntry {
  path: string;
  timestamp: number;
}

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationHistory, setNavigationHistory] = useState<NavigationEntry[]>([]);
  const isNavigatingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track navigation history
  useEffect(() => {
    const entry: NavigationEntry = {
      path: pathname,
      timestamp: Date.now(),
    };

    setNavigationHistory(prev => {
      // Avoid duplicating the same path consecutively
      const lastEntry = prev[prev.length - 1];
      if (lastEntry?.path === pathname) {
        return prev;
      }
      
      // Keep only last 10 entries to prevent memory issues
      const newHistory = [...prev, entry].slice(-10);
      return newHistory;
    });
  }, [pathname]);

  const safeGoBack = useCallback(() => {
    if (isNavigatingRef.current) return;
    
    isNavigatingRef.current = true;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset navigation lock after a delay
    timeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);

    try {
      // Try native browser back first
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        
        // Set a fallback timeout in case native back fails
        setTimeout(() => {
          if (isNavigatingRef.current) {
            // If we're still on the same page after 500ms, use fallback
            const previousEntry = navigationHistory[navigationHistory.length - 2];
            if (previousEntry) {
              router.push(previousEntry.path);
            } else {
              // Ultimate fallback - go to dashboard
              router.push('/dashboard');
            }
            isNavigatingRef.current = false;
          }
        }, 500);
      } else {
        // No history available, use internal history or fallback
        const previousEntry = navigationHistory[navigationHistory.length - 2];
        if (previousEntry) {
          router.push(previousEntry.path);
        } else {
          router.push('/dashboard');
        }
        isNavigatingRef.current = false;
      }
    } catch (error) {
      console.warn('Navigation error:', error);
      // Fallback to internal history or dashboard
      const previousEntry = navigationHistory[navigationHistory.length - 2];
      if (previousEntry) {
        router.push(previousEntry.path);
      } else {
        router.push('/dashboard');
      }
      isNavigatingRef.current = false;
    }
  }, [router, navigationHistory]);

  const safePush = useCallback((path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error('Push navigation error:', error);
      // Retry once
      setTimeout(() => {
        try {
          router.push(path);
        } catch (retryError) {
          console.error('Retry push navigation failed:', retryError);
        }
      }, 100);
    }
  }, [router]);

  const safeReplace = useCallback((path: string) => {
    try {
      router.replace(path);
    } catch (error) {
      console.error('Replace navigation error:', error);
      // Fallback to push
      setTimeout(() => {
        try {
          router.push(path);
        } catch (retryError) {
          console.error('Fallback push navigation failed:', retryError);
        }
      }, 100);
    }
  }, [router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    goBack: safeGoBack,
    push: safePush,
    replace: safeReplace,
    canGoBack: navigationHistory.length > 1,
    navigationHistory: navigationHistory.map(entry => entry.path),
  };
}