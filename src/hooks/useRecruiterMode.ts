import { useEffect, useState } from 'react';

export function useRecruiterMode() {
  const [recruiterMode, setRecruiterMode] = useState(() => {
    return new URLSearchParams(window.location.search).get('mode') === 'recruiter';
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;
      if (document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') {
        setRecruiterMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return {
    recruiterMode,
    enterRecruiterMode: () => setRecruiterMode(true),
    exitRecruiterMode: () => setRecruiterMode(false),
  };
}
