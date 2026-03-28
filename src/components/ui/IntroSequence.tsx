import { useEffect, useState } from 'react';
import TypewriterText from '../shared/TypewriterText';

interface Props {
  onComplete: () => void;
}

const INTRO_MESSAGE = `A traveller arrives at the Artificer's Guild. The year is ${new Date().getFullYear()}. Seek knowledge within these halls.`;

export default function IntroSequence({ onComplete }: Props) {
  const [d20Value, setD20Value] = useState<number>(1);
  const [d20Settled, setD20Settled] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // d20 roll animation
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      if (frame < 24) {
        setD20Value(Math.floor(Math.random() * 20) + 1);
      } else {
        setD20Value(20);
        setD20Settled(true);
        clearInterval(id);
      }
    }, 75);
    return () => clearInterval(id);
  }, []);

  // Show button after text finishes OR after 5s (whichever comes first)
  useEffect(() => {
    const id = setTimeout(() => setShowButton(true), 5000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (textComplete) setShowButton(true);
  }, [textComplete]);

  return (
    <div
      className="intro-overlay"
      onClick={() => {
        if (showButton) onComplete();
      }}
    >
      <div className="parchment intro-parchment">
        {/* d20 in top-right corner */}
        <div className="intro-d20">
          <div className={`intro-d20-face${d20Settled ? ' nat20' : ''}`}>{d20Value}</div>
          {d20Settled && <span>NAT 20</span>}
        </div>

        <div className="intro-eyebrow">✦ Artificer's Guild ✦</div>

        <div className="intro-message">
          <TypewriterText
            text={INTRO_MESSAGE}
            speed={32}
            onComplete={() => setTextComplete(true)}
          />
        </div>

        {d20Settled && (
          <div className="intro-nat20-label">Natural 20 — Access Granted</div>
        )}

        {showButton && (
          <div>
            <button
              className="intro-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              Enter the Guild
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
