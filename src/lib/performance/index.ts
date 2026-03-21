"use client";

// Performance monitoring utilities
export const performanceMonitor = function() {
  if (typeof window === 'undefined') return;
  
  // Monitor Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
        // Send to analytics if needed
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(entry.startTime),
            event_category: 'performance'
          });
        }
      }
      
      if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'FID',
            value: Math.round(entry.processingStart - entry.startTime),
            event_category: 'performance'
          });
        }
      }
      
      if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
        console.log('CLS:', entry.value);
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(entry.value * 1000) / 1000,
            event_category: 'performance'
          });
        }
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (e) {
    // Ignore errors in unsupported browsers
  }
  
  // Monitor page load time
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      console.log('Page Load Time:', loadTime);
    }
  });
};

// Intelligent lazy loading hook
export function useLazyLoad<T>(factory: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const load = useCallback(async () => {
    if (loading || data) return data;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await factory();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);
  
  return { data, loading, error, load };
}

// Intersection Observer for lazy loading components
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );
    
    observer.observe(ref);
    
    return () => observer.disconnect();
  }, [ref, callback, options]);
  
  return setRef;
}

// Preload critical resources
export function preloadResource(href: string, as: string = 'fetch') {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

// Image lazy loading with blur placeholder
export function useImageLazyLoad(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src =