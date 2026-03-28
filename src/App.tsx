import { useEffect, useState } from 'react';
import Play from './ui/pages/Play';
import PanelManager from './components/ui/PanelManager';
import HubOverlay from './components/ui/HubOverlay';
import IntroSequence from './components/ui/IntroSequence';
import SendingStone from './components/ui/SendingStone';
import RecruiterModeView from './components/ui/RecruiterModeView';
import { usePanelEvents } from './hooks/usePanelEvents';
import { useRecruiterMode } from './hooks/useRecruiterMode';
import cv from './data/cv';
import type { PanelId } from './types/cv';
import './styles/globals.css';

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [visitedPanels, setVisitedPanels] = useState<Set<PanelId>>(new Set());

  const { activePanel, closePanel } = usePanelEvents();
  const { recruiterMode, enterRecruiterMode, exitRecruiterMode } = useRecruiterMode();

  // Track visited panels
  useEffect(() => {
    if (activePanel) {
      setVisitedPanels((prev) => new Set([...prev, activePanel]));
    }
  }, [activePanel]);

  return (
    <div className="app-root">
      {/* ── Layer 0: Phaser world ── */}
      <div
        className="phaser-layer"
        style={{ display: recruiterMode ? 'none' : undefined }}
      >
        <Play />
      </div>

      {/* ── Game UI layers (hidden in recruiter mode) ── */}
      {!recruiterMode && (
        <>
          {/* Layer 5: Hub overlay (bottom bar + recruiter button) */}
          <HubOverlay
            name={cv.contact.name}
            title={cv.contact.title}
            onRecruiterMode={enterRecruiterMode}
          />

          {/* Layer 10: Content panels */}
          <PanelManager activePanel={activePanel} onClose={closePanel} />

          {/* Layer 20: Sending Stone */}
          <SendingStone
            activePanel={activePanel}
            visitedPanels={visitedPanels}
            introComplete={introComplete}
          />
        </>
      )}

      {/* ── Recruiter Mode: replaces everything ── */}
      {recruiterMode && (
        <RecruiterModeView data={cv} onExit={exitRecruiterMode} />
      )}

      {/* ── Intro sequence (shown until dismissed) ── */}
      {!introComplete && (
        <IntroSequence onComplete={() => setIntroComplete(true)} />
      )}
    </div>
  );
}
