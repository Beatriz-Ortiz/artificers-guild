import { useEffect, useRef, useState } from 'react';
import ParchmentPanel from '../shared/ParchmentPanel';
import ConstellationView from './ConstellationView';
import type { Skill, SkillSchool } from '../../types/cv';
import { SKILL_LEVEL_NAMES, SKILL_SCHOOL_LABELS } from '../../types/cv';

const SCHOOLS: SkillSchool[] = ['arcane', 'transmutation', 'divination', 'enchantment'];

interface Props {
  skills: Skill[];
  onClose: () => void;
}

function SkillRow({ skill, animate }: { skill: Skill; animate: boolean }) {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!animate || !fillRef.current) return;
    // Small delay per skill for stagger effect (handled by parent via index)
    fillRef.current.style.width = `${(skill.level / 5) * 100}%`;
  }, [animate, skill.level]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          {skill.name}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.38rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          {SKILL_LEVEL_NAMES[skill.level]}
        </span>
      </div>
      <div className="skill-bar-track">
        <div
          ref={fillRef}
          className="skill-bar-fill"
          style={{ width: animate ? undefined : '0%' }}
        />
      </div>
    </div>
  );
}

function SchoolPage({
  skills,
  school,
}: {
  skills: Skill[];
  school: SkillSchool;
}) {
  const [animate, setAnimate] = useState(false);
  const schoolSkills = skills.filter((s) => s.school === school);
  const label = SKILL_SCHOOL_LABELS[school];

  // Trigger bar animation on mount with a small RAF delay
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{ animation: 'fade-in 0.2s ease' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: 2,
        }}
      >
        {label.icon} {label.name}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.38rem',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.08em',
          marginBottom: 16,
        }}
      >
        {label.subtitle.toUpperCase()}
      </div>
      {schoolSkills.map((skill, i) => (
        <div
          key={skill.id}
          style={{
            transitionDelay: animate ? `${i * 80}ms` : undefined,
          }}
        >
          <SkillRow skill={skill} animate={animate} />
        </div>
      ))}
    </div>
  );
}

type ViewMode = 'list' | 'constellation';

export default function SpellbookPanel({ skills, onClose }: Props) {
  const [activeSchool, setActiveSchool] = useState<SkillSchool>('arcane');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <ParchmentPanel
      title="Spellbook"
      subtitle="SCHOOLS OF MAGIC"
      onClose={onClose}
      width="min(820px, 96vw)"
    >
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
        {(['list', 'constellation'] as ViewMode[]).map((mode) => (
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
            {mode === 'list' ? '☰ List' : '✦ Constellation'}
          </button>
        ))}
      </div>

      {/* Constellation View */}
      {viewMode === 'constellation' && (
        <div style={{ animation: 'fade-in 0.25s ease', paddingBottom: 8 }}>
          <ConstellationView skills={skills} />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(160px, 200px) 1fr',
          gap: 24,
          paddingTop: 8,
          minHeight: 320,
        }}
      >
        {/* Left page — school list */}
        <div
          style={{
            borderRight: '1px solid rgba(201, 168, 76, 0.35)',
            paddingRight: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.38rem',
              color: 'var(--color-gold)',
              letterSpacing: '0.1em',
              marginBottom: 12,
            }}
          >
            DISCIPLINES
          </div>
          {SCHOOLS.map((school) => {
            const label = SKILL_SCHOOL_LABELS[school];
            const count = skills.filter((s) => s.school === school).length;
            const active = activeSchool === school;
            return (
              <button
                key={school}
                onClick={() => setActiveSchool(school)}
                style={{
                  width: '100%',
                  background: active ? 'rgba(201, 168, 76, 0.18)' : 'none',
                  border: active ? '1px solid rgba(201, 168, 76, 0.5)' : '1px solid transparent',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '8px 10px',
                  marginBottom: 6,
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.9rem',
                    color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                >
                  {label.icon} {label.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.32rem',
                    color: 'var(--color-text-muted)',
                    marginTop: 2,
                  }}
                >
                  {count} spell{count !== 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right page — skills */}
        <div>
          <SchoolPage key={activeSchool} skills={skills} school={activeSchool} />
        </div>
      </div>}
    </ParchmentPanel>
  );
}
