import GuildHallPanel from '../panels/GuildHallPanel';
import SpellbookPanel from '../panels/SpellbookPanel';
import ForgePanel from '../panels/ForgePanel';
import PortalPanel from '../panels/PortalPanel';
import type { PanelId } from '../../types/cv';
import cv from '../../data/cv';

interface Props {
  activePanel: PanelId | null;
  onClose: () => void;
}

export default function PanelManager({ activePanel, onClose }: Props) {
  if (!activePanel) return null;

  switch (activePanel) {
    case 'quests':
      return <GuildHallPanel experience={cv.experience} onClose={onClose} />;
    case 'skills':
      return <SpellbookPanel skills={cv.skills} onClose={onClose} />;
    case 'projects':
      return <ForgePanel projects={cv.projects} onClose={onClose} />;
    case 'contact':
      return <PortalPanel contact={cv.contact} onClose={onClose} />;
    default:
      return null;
  }
}
