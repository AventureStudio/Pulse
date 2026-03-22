"use client";

import { useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { useI18n } from "@/lib/i18n";

interface NavigationHandlerProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backButtonClassName?: string;
}

export default function NavigationHandler({
  children,
  showBackButton = false,
  backButtonClassName = "btn-ghost btn-sm",
}: NavigationHandlerProps) {
  const { goBack, canGoBack } = useNavigation();
  const { t } = useI18n();

  // Global error handler for navigation failures
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('net::ERR_ABORTED') || 
          event.reason?.message?.includes('frame was detached')) {
        event.preventDefault();
        console.warn('Navigation error caught and handled:', event.reason);
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('net::ERR_ABORTED') || 
          event.message?.includes('frame was detached')) {
        event.preventDefault();
        console.warn('Navigation error caught and handled:', event.error);
      }
    };

    // Handle navigation errors globally
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Prevent navigation during page transitions
    const handleBeforeUnload = () => {
      // This helps prevent frame detachment issues
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add a small delay to ensure DOM is stable
    setTimeout(() => {
      goBack();
    }, 10);
  }, [goBack]);

  return (
    <>
      {showBackButton && canGoBack && (
        <button
          onClick={handleBackClick}
          className={backButtonClassName}
          type="button"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </button>
      )}
      {children}
    </>
  );
}