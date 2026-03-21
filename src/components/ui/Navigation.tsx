"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

/**
 * Safe navigation link that validates routes and handles errors gracefully
 */
export function NavigationLink({ href, children, className = "", prefetch = true }: NavigationLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Validate internal routes
  const isValidInternalRoute = (path: string): boolean => {
    const validRoutes = [
      "/",
      "/login",
      "/dashboard",
      "/objectives",
      "/alignment",
      "/teams",
      "/periods",
      "/settings",
      "/onboarding",
      "/auth/callback",
      "/auth/confirm"
    ];
    
    return validRoutes.some(route => {
      if (route === "/") return path === route;
      return path.startsWith(route);
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation if already on the same page
    if (pathname === href) {
      e.preventDefault();
      return;
    }

    // Validate internal routes
    if (!href.startsWith("http") && !isValidInternalRoute(href)) {
      console.warn(`Invalid internal route: ${href}`);
      e.preventDefault();
      return;
    }

    // Set loading state for internal navigation
    if (!href.startsWith("http")) {
      setIsNavigating(true);
      // Reset loading state after navigation
      setTimeout(() => setIsNavigating(false), 2000);
    }
  };

  // For external links, use regular anchor tag
  if (href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a 
        href={href} 
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link 
      href={href} 
      className={`${className} ${isNavigating ? 'opacity-50 pointer-events-none' : ''}`}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

/**
 * Navigation utilities for programmatic navigation
 */
export function useNavigationUtils() {
  const router = useRouter();
  
  const safeNavigate = (path: string) => {
    try {
      // Use replace for redirects to prevent back button issues
      if (path === "/login" || path === "/dashboard") {
        router.replace(path);
      } else {
        router.push(path);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to window location for critical navigation
      window.location.href = path;
    }
  };

  const safeReload = () => {
    try {
      router.refresh();
    } catch (error) {
      console.error("Reload error:", error);
      window.location.reload();
    }
  };

  return { safeNavigate, safeReload };
}