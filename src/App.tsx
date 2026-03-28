import { useCallback, useEffect, useState } from 'react';
import Play from './ui/pages/Play';
import PanelManager from './components/ui/PanelManager';
import HubOverlay from './components/ui/HubOverlay';
import IntroSequence from './components/ui/IntroSequence';
import SendingStone from './components/ui/SendingStone';
import RecruiterModeView from './components/ui/RecruiterModeView';
import GameToast from './components/ui/GameToast';
import QuestModal from './components/quests/QuestModal';
import { usePanelEvents } from './hooks/usePanelEvents';
import { useRecruiterMode } from './hooks/useRecruiterMode';
import { useKonamiCode } from './hooks/useKonamiCode';
import cv from './data/cv';
import { QUESTS } from './data/quests';
import type { PanelId } from './types/cv';
import './styles/globals.css';

const HP_DRAIN_INTERVAL_MS = 30_000; // 1 HP per 30s
const MP_DRAIN_INTERVAL_MS = 45_000; // 1 MP per 45s
const PANEL_HP_RESTORE     = 15;
const PANEL_MP_RESTORE     = 10;
const KONAMI_ACTIVE_MS     = 8_000;

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [visitedPanels, setVisitedPanels] = useState<Set<PanelId>>(new Set());
  const [panelVisitCount, setPanelVisitCount] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  // HP / MP state (visual atmosphere bars)
  const [hp, setHp] = useState(100);
  const [mp, setMp] = useState(100);

  // Konami Code easter egg
  const [konamiActive, setKonamiActive] = useState(false);

  // Quest system
  const [questBuilding,   setQuestBuilding]   = useState<PanelId | null>(null);
  const [completedQuests, setCompletedQuests] = useState<Set<PanelId>>(new Set());

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  useKonamiCode(() => {
    setKonamiActive(true);
    setTimeout(() => setKonamiActive(false), KONAMI_ACTIVE_MS);
  });

  const { activePanel, closePanel } = usePanelEvents();
  const { recruiterMode, enterRecruiterMode, exitRecruiterMode } = useRecruiterMode();

  // Route cv:buildingClicked through quest gate
  useEffect(() => {
    const handler = (e: Event) => {
      const { id } = (e as CustomEvent<{ id: PanelId }>).detail;
      if (completedQuests.has(id)) {
        window.dispatchEvent(new CustomEvent('cv:openPanel', { detail: { id } }));
      } else {
        setQuestBuilding(id);
      }
    };
    window.addEventListener('cv:buildingClicked', handler);
    return () => window.removeEventListener('cv:buildingClicked', handler);
  }, [completedQuests]);

  const completeQuest = useCallback((id: PanelId) => {
    setCompletedQuests((prev) => new Set([...prev, id]));
    setQuestBuilding(null);
    window.dispatchEvent(new CustomEvent('cv:openPanel', { detail: { id } }));
  }, []);

  const skipQuest = useCallback((id: PanelId) => {
    // Intentionally NOT added to completedQuests — quest will reappear next visit
    setQuestBuilding(null);
    window.dispatchEvent(new CustomEvent('cv:openPanel', { detail: { id } }));
  }, []);

  // Track visited panels
  useEffect(() => {
    if (activePanel) {
      setVisitedPanels((prev) => new Set([...prev, activePanel]));
      setPanelVisitCount((c) => c + 1);
    }
  }, [activePanel]);

  // Restore HP / MP on building visit
  useEffect(() => {
    if (activePanel) {
      setHp((h) => Math.min(100, h + PANEL_HP_RESTORE));
      setMp((m) => Math.min(100, m + PANEL_MP_RESTORE));
    }
  }, [activePanel]);

  // HP drain
  useEffect(() => {
    const id = setInterval(() => setHp((h) => Math.max(0, h - 1)), HP_DRAIN_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // MP drain
  useEffect(() => {
    const id = setInterval(() => setMp((m) => Math.max(0, m - 1)), MP_DRAIN_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app-root">
      {/* ── Layer 0: Phaser world ── */}
      <div
        className="phaser-layer"
        style={{ display: recruiterMode ? 'none' : undefined }}
      >
        <Play />
      </div>

      {/* ── Game UI layers: only after fonts are ready ── */}
      {fontsReady && !recruiterMode && (
        <>
          {/* Layer 5: Hub overlay (bottom bar + recruiter button) */}
          <HubOverlay
            name={cv.contact.name}
            title={cv.contact.title}
            hp={hp}
            mp={mp}
            konamiActive={konamiActive}
            onRecruiterMode={enterRecruiterMode}
          />

          {/* Layer 10: Content panels */}
          <PanelManager activePanel={activePanel} onClose={closePanel} />

          {/* Layer 15: Quest modal (sits above panels, below sending stone) */}
          {questBuilding && (
            <QuestModal
              quest={QUESTS[questBuilding]}
              onComplete={completeQuest}
              onSkip={skipQuest}
            />
          )}

          {/* Layer 20: Sending Stone */}
          <SendingStone
            activePanel={activePanel}
            visitedPanels={visitedPanels}
            introComplete={introComplete}
            hp={hp}
            konamiActive={konamiActive}
            panelVisitCount={panelVisitCount}
          />

          {/* Layer 25: Game event toasts (goblin, mimic) */}
          <GameToast />
        </>
      )}

      {/* ── Recruiter Mode: replaces everything ── */}
      {fontsReady && recruiterMode && (
        <RecruiterModeView data={cv} onExit={exitRecruiterMode} />
      )}

      {/* ── Intro sequence (shown until dismissed, fonts must be ready) ── */}
      {fontsReady && !introComplete && (
        <IntroSequence onComplete={() => setIntroComplete(true)} />
      )}
    </div>
  );
}
