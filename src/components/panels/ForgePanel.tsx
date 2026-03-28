import { useState } from 'react';
import ParchmentPanel from '../shared/ParchmentPanel';
import type { Project } from '../../types/cv';
import { RARITY_COLORS, STATUS_LABELS } from '../../types/cv';

interface Props {
  projects: Project[];
  onClose: () => void;
}

function ArtifactCard({ project }: { project: Project }) {
  const [flipped, setFlipped] = useState(false);
  const rarityColor = RARITY_COLORS[project.rarity];

  const cardBase: React.CSSProperties = {
    background: 'var(--color-parchment)',
    border: `2px solid ${rarityColor}`,
    boxShadow: `0 2px 12px rgba(0,0,0,0.2), 0 0 8px ${rarityColor}44`,
    borderRadius: 6,
    padding: '14px 16px',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  return (
    <div
      className="card-scene"
      style={{ height: 200 }}
      onClick={() => setFlipped((p) => !p)}
      role="button"
      aria-label={`Artifact: ${project.name}. Click to ${flipped ? 'flip back' : 'reveal details'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setFlipped((p) => !p);
      }}
    >
      <div className={`card-inner${flipped ? ' flipped' : ''}`}>
        {/* ── Front ── */}
        <div className="card-face card-face--front" style={cardBase}>
          {/* Rarity badge */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.32rem',
              color: rarityColor,
              letterSpacing: '0.1em',
              textTransform: 'capitalize',
            }}
          >
            ◆ {project.rarity} — {STATUS_LABELS[project.status]}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.0rem',
              color: 'var(--color-text)',
              lineHeight: 1.25,
            }}
          >
            {project.name}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {project.tagline}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.3rem',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              marginTop: 'auto',
            }}
          >
            ↺ Examine
          </div>
        </div>

        {/* ── Back ── */}
        <div className="card-face card-face--back" style={{ ...cardBase, gap: 8 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--color-text)',
              borderBottom: '1px solid rgba(201,168,76,0.3)',
              paddingBottom: 6,
            }}
          >
            {project.name}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              color: 'var(--color-text)',
              lineHeight: 1.55,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            {project.description}
          </div>

          {/* Tech stack */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {project.techStack.map((t) => (
              <span className="tag" key={t} style={{ fontSize: '0.6rem' }}>
                {t}
              </span>
            ))}
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.32rem',
                  color: 'var(--color-green)',
                  textDecoration: 'underline',
                }}
              >
                Inspect
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.32rem',
                  color: 'var(--color-mana)',
                  textDecoration: 'underline',
                }}
              >
                Wield
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgePanel({ projects, onClose }: Props) {
  return (
    <ParchmentPanel
      title="The Forge"
      subtitle="CRAFTED ARTIFACTS"
      onClose={onClose}
      width="min(900px, 96vw)"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
          paddingTop: 8,
        }}
      >
        {projects.map((p) => (
          <ArtifactCard key={p.id} project={p} />
        ))}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.32rem',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          marginTop: 16,
          letterSpacing: '0.05em',
        }}
      >
        Click any artifact to examine it
      </p>
    </ParchmentPanel>
  );
}
