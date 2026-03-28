import { useEffect, useRef, useState } from 'react';
import type { PanelId } from '../../types/cv';

interface TriggerCondition {
  id:         string;
  check:      (state: StoneState) => boolean;
  message:    string;
  cooldownMs: number;
}

interface StoneState {
  idleSecs:       number;
  visitedPanels:  Set<PanelId>;
  lastPanel:      PanelId | null;
  introComplete:  boolean;
  hp:             number;
  konamiActive:   boolean;
  panelVisitCount: number;
}

const TRIGGERS: TriggerCondition[] = [
  // ── Original triggers ────────────────────────────────────
  {
    id:         'idle-start',
    check:      (s) => s.introComplete && s.idleSecs >= 10 && s.visitedPanels.size === 0,
    message:    'The guild records await, traveller. Perhaps begin with the Hall?',
    cooldownMs: 30_000,
  },
  {
    id:         'after-quests',
    check:      (s) => s.lastPanel === 'quests',
    message:    'Every deed recorded, every patron remembered.',
    cooldownMs: 60_000,
  },
  {
    id:         'after-skills',
    check:      (s) => s.lastPanel === 'skills',
    message:    'The schools of magic run deep in this one.',
    cooldownMs: 60_000,
  },
  {
    id:         'after-projects',
    check:      (s) => s.lastPanel === 'projects',
    message:    'Those artifacts were hard-won.',
    cooldownMs: 60_000,
  },
  {
    id:         'after-contact',
    check:      (s) => s.lastPanel === 'contact',
    message:    'A raven has been prepared, should you choose to send it.',
    cooldownMs: 60_000,
  },
  {
    id:         'all-visited',
    check:      (s) => s.visitedPanels.size === 4,
    message:    "You've seen all I have to offer. Shall we speak directly?",
    cooldownMs: 120_000,
  },
  {
    id:         'long-idle',
    check:      (s) => s.introComplete && s.idleSecs >= 45 && s.visitedPanels.size > 0,
    message:    'Is there something else you seek, traveller?',
    cooldownMs: 90_000,
  },

  // ── New gameplay triggers ─────────────────────────────────
  {
    id:    'night-owl',
    check: (s) => {
      if (!s.introComplete) return false;
      const h = new Date().getHours();
      return h >= 22 || h <= 4;
    },
    message:    'The guild never truly sleeps. A kindred spirit.',
    cooldownMs: 300_000, // once per 5 min max
  },
  {
    id:         'konami',
    check:      (s) => s.konamiActive,
    message:    "The old codes still work. The guild's security is… a work in progress.",
    cooldownMs: 60_000,
  },
  {
    id:         'hp-critical',
    check:      (s) => s.introComplete && s.hp < 25 && s.hp > 0,
    message:    'Your adventurer grows weary. The contact portal is just south-east…',
    cooldownMs: 120_000,
  },
  {
    id:         'procrastinating',
    check:      (s) => s.introComplete && s.idleSecs >= 120 && s.visitedPanels.size === 4,
    message:    "You've reviewed everything twice. Are you procrastinating, or deliberating?",
    cooldownMs: 180_000,
  },
  {
    id:    'back-again',
    // panelVisitCount > unique panels visited + 2 means they've revisited at least 3 times
    check: (s) => s.panelVisitCount > s.visitedPanels.size + 2,
    message:    'A thorough inspection. The guild appreciates the diligence.',
    cooldownMs: 90_000,
  },
];

interface Props {
  activePanel:     PanelId | null;
  visitedPanels:   Set<PanelId>;
  introComplete:   boolean;
  hp:              number;
  konamiActive:    boolean;
  panelVisitCount: number;
}

export default function SendingStone({
  activePanel,
  visitedPanels,
  introComplete,
  hp,
  konamiActive,
  panelVisitCount,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const idleSecsRef   = useRef(0);
  const lastPanelRef  = useRef<PanelId | null>(null);
  const cooldownMapRef = useRef<Map<string, number>>(new Map());

  // Track last visited panel
  useEffect(() => {
    if (activePanel) {
      lastPanelRef.current = activePanel;
    }
  }, [activePanel]);

  // Reset idle counter on any interaction
  useEffect(() => {
    const resetIdle = () => { idleSecsRef.current = 0; };
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('click',     resetIdle);
    window.addEventListener('keydown',   resetIdle);
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('click',     resetIdle);
      window.removeEventListener('keydown',   resetIdle);
    };
  }, []);

  // Tick idle counter
  useEffect(() => {
    const id = setInterval(() => { idleSecsRef.current += 1; }, 1000);
    return () => clearInterval(id);
  }, []);

  // Check triggers every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const state: StoneState = {
        idleSecs:       idleSecsRef.current,
        visitedPanels,
        lastPanel:      lastPanelRef.current,
        introComplete,
        hp,
        konamiActive,
        panelVisitCount,
      };

      for (const trigger of TRIGGERS) {
        const lastFired = cooldownMapRef.current.get(trigger.id) ?? 0;
        if (now - lastFired < trigger.cooldownMs) continue;
        if (trigger.check(state)) {
          cooldownMapRef.current.set(trigger.id, now);
          if (trigger.id.startsWith('after-')) {
            lastPanelRef.current = null;
          }
          setMessage(trigger.message);
          setTimeout(() => setMessage(null), 6000);
          break;
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [visitedPanels, introComplete, hp, konamiActive, panelVisitCount]);

  return (
    <div className="sending-stone">
      {message && (
        <div className="stone-bubble" key={message}>
          "{message}"
        </div>
      )}
      <div
        className={`stone-gem${message ? ' has-message' : ''}`}
        title="Sending Stone"
      />
    </div>
  );
}
