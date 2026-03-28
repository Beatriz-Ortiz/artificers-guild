import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const BLINK_INTERVAL = 550;

export default function IntroSequence({ onComplete }: Props) {
  const [blink, setBlink] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), BLINK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Keyboard: Enter or Space to start
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (fadeOut) return;
    setFadeOut(true);
    setTimeout(onComplete, 500);
  };

  return (
    <div
      className="startmenu-root"
      style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s ease' }}
      onClick={start}
    >
      {/* Scanlines overlay */}
      <div className="startmenu-scanlines" />

      {/* Content */}
      <div className="startmenu-content">
        {/* Top eyebrow */}
        <div className="startmenu-eyebrow">✦ Interactive Portfolio ✦</div>

        {/* Main title */}
        <h1 className="startmenu-title">
          Artificer's<br />Guild
        </h1>

        {/* Subtitle */}
        <p className="startmenu-subtitle">
          A D&amp;D-themed CV awaits within these halls.<br />
          Explore, face challenges, and uncover the records.
        </p>

        {/* Divider */}
        <div className="startmenu-divider" />

        {/* Press Start */}
        <button
          className="startmenu-start-btn"
          style={{ opacity: blink ? 1 : 0 }}
          onClick={(e) => { e.stopPropagation(); start(); }}
        >
          ▶ &nbsp; START GAME
        </button>

        <div className="startmenu-hint">
          Press <kbd>Enter</kbd> or click to begin
        </div>

        {/* Footer */}
        <div className="startmenu-footer">
          © {new Date().getFullYear()} &nbsp;·&nbsp; WASD + Mouse to explore &nbsp;·&nbsp; E to interact
        </div>
      </div>
    </div>
  );
}
