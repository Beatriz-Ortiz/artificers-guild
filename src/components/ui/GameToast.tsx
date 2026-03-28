import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  icon: string;
  message: string;
}

let _id = 0;

export default function GameToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const push = (icon: string, message: string) => {
      const id = ++_id;
      setToasts((prev) => [...prev.slice(-2), { id, icon, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    };

    const onGoblin = () => push('👺', 'Bug Squashed!  +10 XP');
    const onMimic  = () => push('📦', 'It was a MIMIC all along!');

    window.addEventListener('cv:goblinCaught',   onGoblin);
    window.addEventListener('cv:mimicRevealed', onMimic);
    return () => {
      window.removeEventListener('cv:goblinCaught',   onGoblin);
      window.removeEventListener('cv:mimicRevealed', onMimic);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position:      'fixed',
        bottom:        56,
        left:          '50%',
        transform:     'translateX(-50%)',
        zIndex:        25,
        display:       'flex',
        flexDirection: 'column',
        gap:           8,
        alignItems:    'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="game-toast">
          <span style={{ fontSize: '1.3rem' }}>{toast.icon}</span>
          <span
            style={{
              fontFamily:    'var(--font-pixel)',
              fontSize:      '0.34rem',
              color:         'var(--color-gold)',
              letterSpacing: '0.05em',
            }}
          >
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
