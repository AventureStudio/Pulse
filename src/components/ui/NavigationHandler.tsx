"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNavigation } from "@/lib/hooks/useNavigation";

export default function NavigationHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { pushToHistory, canGoBack, safeGoBack } = useNavigation();

  // Track navigation changes
  useEffect(() => {
    pushToHistory(pathname);
  }, [pathname, pushToHistory]);

  // Override browser back button behavior
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      if (canGoBack()) {
        safeGoBack();
      } else {
        // Fallback to dashboard if no safe back route
        router.replace("/dashboard");
      }
    };

    // Add event listener for popstate
    window.addEventListener("popstate", handlePopState);

    // Override window.history.back for programmatic calls
    const originalBack = window.history.back;
    window.history.back = () => {
      if (canGoBack()) {
        safeGoBack();
      } else {
        router.replace("/dashboard");
      }
    };

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.history.back = originalBack;
    };
  }, [canGoBack, safeGoBack, router]);

  return null;
}