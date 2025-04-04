
import { useEffect, useState } from 'react';

// Type-safe window event listener hook
export function useWindowEvent<K extends keyof WindowEventMap>(
  eventType: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  useEffect(() => {
    window.addEventListener(eventType, listener, options);
    return () => {
      window.removeEventListener(eventType, listener, options);
    };
  }, [eventType, listener, options]);
}

// Custom hook for modelDesignerAPI
export function useModelDesignerAPI() {
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  useEffect(() => {
    // Check if API is available
    setIsApiAvailable(!!window.modelDesignerAPI);

    // Re-check whenever the API might be initialized
    const checkAPI = () => setIsApiAvailable(!!window.modelDesignerAPI);
    window.addEventListener('modelDesignerAPIReady', checkAPI);
    
    return () => {
      window.removeEventListener('modelDesignerAPIReady', checkAPI);
    };
  }, []);

  return {
    isAvailable: isApiAvailable,
    api: window.modelDesignerAPI
  };
}
