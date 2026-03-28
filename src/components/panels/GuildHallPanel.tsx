import { useState } from 'react';
import ParchmentPanel from '../shared/ParchmentPanel';
import ChronicleView from './ChronicleView';
import type { Experience } from '../../types/cv';

interface Props {
  experience: Experience[];
  onClose: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

function ExperienceEntry({ exp, defaultOpen }: { exp: Experience; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(201, 168, 76, 0.25)',
        paddingBottom: '14px',
        marginBottom: '14px',
      }}
    >
      {/* ── Header row ── */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 2,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{exp.guildRankIcon}</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: 'var(--color-text)',
              }}
            >
              {exp.company}
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: 'var(--color-text-muted)',
            }}
          >
            {exp.role} · {exp.location}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.38rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.8,
            }}
          >
            {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'var(--color-gold)',
              marginTop: 4,
            }}
          >
            {open ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {/* ── Expanded content ── */}
      {open && (
        <div style={{ paddingTop: 10, animation: 'fade-in 0.2s ease' }}>
          {/* Deeds */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.38rem',
              color: 'var(--color-gold)',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            DEEDS ACCOMPLISHED
          </div>
          <ul
            style={{
              margin: '0 0 12px',
              paddingLeft: 20,
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              lineHeight: 1.65,
              color: 'var(--color-text)',
            }}
          >
            {exp.description.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>

          {/* Skills */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.38rem',
              color: 'var(--color-gold)',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            ARTS EMPLOYED
          </div>
          <div>
            {exp.skills.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type ViewMode = 'scroll' | 'chronicle';

export default function GuildHallPanel({ experience, onClose }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');

  return (
    <ParchmentPanel title="Guild Hall" subtitle="QUEST RECORDS" onClose={onClose}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
        {(['scroll', 'chronicle'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              background:   viewMode === mode ? 'rgba(201,168,76,0.2)' : 'none',
              border:       `1px solid rgba(201,168,76,${viewMode === mode ? 0.6 : 0.25})`,
              borderRadius: 4,
              cursor:       'pointer',
              padding:      '5px 12px',
              fontFamily:   'var(--font-pixel)',
              fontSize:     '0.3rem',
              color:        viewMode === mode ? 'var(--color-gold)' : 'var(--color-text-muted)',
              letterSpacing: '0.06em',
              transition:   'all 0.15s ease',
            }}
          >
            {mode === 'scroll' ? '📜 Scroll' : '📖 Chronicle'}
          </button>
        ))}
      </div>

      {viewMode === 'scroll' && (
        <div style={{ paddingTop: 8, animation: 'fade-in 0.2s ease' }}>
          {experience.map((exp, i) => (
            <ExperienceEntry key={exp.id} exp={exp} defaultOpen={i === 0} />
          ))}
        </div>
      )}

      {viewMode === 'chronicle' && (
        <div style={{ animation: 'fade-in 0.2s ease' }}>
          <ChronicleView experience={experience} />
        </div>
      )}
    </ParchmentPanel>
  );
}
