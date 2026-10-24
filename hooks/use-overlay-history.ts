'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const historyKey = '__huiyimengOverlay';

// A same-page entry lets mobile Back dismiss the overlay. Forward restores it.
// Preserve the router's own state and leave the section URL untouched.
export function useOverlayHistory<T>() {
  const [overlay, setOverlay] = useState<T | null>(null);
  const ownerRef = useRef<string | null>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    if (window.history.state?.[historyKey]) {
      const state = { ...window.history.state };
      delete state[historyKey];
      window.history.replaceState(state, '', window.location.href);
    }
    function restore() {
      closingRef.current = false;
      const entry = window.history.state?.[historyKey];
      setOverlay(entry?.owner === ownerRef.current ? entry.value : null);
    }
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const openOverlay = useCallback((value: T) => {
    if (closingRef.current) return;
    ownerRef.current ??= window.crypto.randomUUID();
    const state = {
      ...window.history.state,
      [historyKey]: { owner: ownerRef.current, value },
    };
    if (window.history.state?.[historyKey]?.owner === ownerRef.current) {
      window.history.replaceState(state, '', window.location.href);
    } else {
      window.history.pushState(state, '', window.location.href);
    }
    setOverlay(value);
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlay(null);
    if (
      !closingRef.current &&
      ownerRef.current !== null &&
      window.history.state?.[historyKey]?.owner === ownerRef.current
    ) {
      closingRef.current = true;
      window.history.back();
    }
  }, []);

  return { overlay, openOverlay, closeOverlay };
}
