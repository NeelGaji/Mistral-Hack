import { createContext, useContext, useRef, useCallback } from 'react';
import type { InteractiveWebsiteHandle } from '../components/InteractiveWebsite';

interface WebsiteContextValue {
  /** Register the website handle when HtmlSurface mounts */
  registerHandle: (handle: InteractiveWebsiteHandle) => void;
  /** Get the current handle (may be null if not mounted) */
  getHandle: () => InteractiveWebsiteHandle | null;
  /** Convenience: dispatch a click to the website */
  dispatchClick: (hotspotId: string) => void;
  /** Convenience: dispatch hover state */
  dispatchHover: (hotspotId: string, active: boolean) => void;
  /** Convenience: dispatch scroll */
  dispatchScroll: (deltaY: number) => void;
}

const WebsiteContext = createContext<WebsiteContextValue | null>(null);

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const handleRef = useRef<InteractiveWebsiteHandle | null>(null);

  const registerHandle = useCallback((handle: InteractiveWebsiteHandle) => {
    handleRef.current = handle;
  }, []);

  const getHandle = useCallback(() => handleRef.current, []);

  const dispatchClick = useCallback((hotspotId: string) => {
    handleRef.current?.simulateClick(hotspotId);
  }, []);

  const dispatchHover = useCallback((hotspotId: string, active: boolean) => {
    handleRef.current?.simulateHover(hotspotId, active);
  }, []);

  const dispatchScroll = useCallback((deltaY: number) => {
    handleRef.current?.simulateScroll(deltaY);
  }, []);

  return (
    <WebsiteContext.Provider value={{ registerHandle, getHandle, dispatchClick, dispatchHover, dispatchScroll }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite(): WebsiteContextValue {
  const ctx = useContext(WebsiteContext);
  if (!ctx) {
    // Return no-ops if outside provider (e.g. particles-only mode)
    return {
      registerHandle: () => {},
      getHandle: () => null,
      dispatchClick: () => {},
      dispatchHover: () => {},
      dispatchScroll: () => {},
    };
  }
  return ctx;
}
