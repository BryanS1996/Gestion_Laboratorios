import { useEffect, useState } from 'react';

/**
 * Keep a reactive flag of whether the tab is visible.
 * Useful to avoid polling when the user isn't looking at the page.
 */
export function useVisibilityState() {
  const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');

  useEffect(() => {
    const onChange = () => setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return isVisible;
}
