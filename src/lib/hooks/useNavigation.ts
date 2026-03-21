"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if we can go back in history
    const checkCanGoBack = () => {
      setCanGoBack(window.history.length > 1);
    };

    checkCanGoBack();

    // Listen for popstate events to update canGoBack
    const handlePopState = () => {
      checkCanGoBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pathname]);

  const goBack = (fallback?: string) => {
    if (canGoBack && window.history.length > 1) {
      // Use the browser's native back functionality
      window.history.back();
    } else if (fallback) {
      // Navigate to fallback using relative path
      router.push(fallback);
    }
  };

  const navigate = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };

  return {
    goBack,
    navigate,
    canGoBack,
    currentPath: pathname
  };
}