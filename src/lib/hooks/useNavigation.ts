"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigationState {
  history: string[];
  currentIndex: number;
}

const MAX_HISTORY_SIZE = 50;

export function useNavigation() {
  const router = useRouter();
  const [state, setState] = useState<NavigationState>({
    history: [],
    currentIndex: -1,
  });
  const stateRef = useRef(state);

  // Keep ref in sync with state for event handlers
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const pushToHistory = useCallback((path: string) => {
    setState((prev) => {
      // Don't add duplicate consecutive entries
      if (prev.history[prev.currentIndex] === path) {
        return prev;
      }

      const newHistory = [
        ...prev.history.slice(0, prev.currentIndex + 1),
        path,
      ];

      // Trim history if it gets too large
      const trimmedHistory = newHistory.length > MAX_HISTORY_SIZE
        ? newHistory.slice(-MAX_HISTORY_SIZE)
        : newHistory;

      return {
        history: trimmedHistory,
        currentIndex: trimmedHistory.length - 1,
      };
    });
  }, []);

  const canGoBack = useCallback(() => {
    return stateRef.current.currentIndex > 0 && stateRef.current.history.length > 1;
  }, []);

  const safeGoBack = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.currentIndex > 0) {
      const previousPath = currentState.history[currentState.currentIndex - 1];
      
      // Validate that the previous path is safe and accessible
      if (previousPath && previousPath !== window.location.pathname) {
        setState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex - 1,
        }));
        
        // Use replace to avoid creating new history entries
        router.replace(previousPath);
        return true;
      }
    }
    return false;
  }, [router]);

  const navigateToWithHistory = useCallback((path: string) => {
    pushToHistory(path);
    router.push(path);
  }, [pushToHistory, router]);

  const replaceWithHistory = useCallback((path: string) => {
    setState((prev) => {
      const newHistory = [...prev.history];
      if (prev.currentIndex >= 0) {
        newHistory[prev.currentIndex] = path;
      }
      return {
        ...prev,
        history: newHistory,
      };
    });
    router.replace(path);
  }, [router]);

  return {
    history: state.history,
    currentIndex: state.currentIndex,
    pushToHistory,
    canGoBack,
    safeGoBack,
    navigateToWithHistory,
    replaceWithHistory,
  };
}