import { useEffect, useRef } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode(onSuccess: () => void) {
  const bufRef      = useRef<string[]>([]);
  const callbackRef = useRef(onSuccess);
  callbackRef.current = onSuccess;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      bufRef.current = [...bufRef.current.slice(-(KONAMI_SEQUENCE.length - 1)), e.key];

      if (bufRef.current.join('|') === KONAMI_SEQUENCE.join('|')) {
        bufRef.current = [];
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
