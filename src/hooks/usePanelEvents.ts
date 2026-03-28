import { useCallback, useEffect, useState } from 'react';
import type { PanelId } from '../types/cv';

export function usePanelEvents() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  const closePanel = useCallback(() => {
    setActivePanel(null);
    window.dispatchEvent(
      new CustomEvent('cv:buildingFocus', { detail: { building: null } })
    );
  }, []);

  const openPanel = useCallback((panelId: PanelId) => {
    setActivePanel(panelId);
    window.dispatchEvent(
      new CustomEvent('cv:buildingFocus', { detail: { building: panelId } })
    );
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id } = (e as CustomEvent<{ id: PanelId }>).detail;
      openPanel(id);
    };
    window.addEventListener('cv:openPanel', handler);
    return () => window.removeEventListener('cv:openPanel', handler);
  }, [openPanel]);

  return { activePanel, openPanel, closePanel };
}
