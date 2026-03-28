import { useEffect, useState } from 'react';
import type { Experience } from '../../types/cv';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

interface Props {
  experience: Experience[];
}

export default function ChronicleView({ experience }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Slight delay so CSS transitions fire after paint
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Most recent first
  const sorted = [...experience].sort((a, b) => {
    const aDate = a.endDate ?? '9999-12';
    const bDate = b.endDate ?? '9999-12';
    return bDate.localeCompare(aDate);
  });

  // Estimated height per entry for the SVG line
  const ENTRY_MIN_H = 170;
  const totalLineH  = sorted.length * ENTRY_MIN_H + 40;
  const linePath    = `M11,16 L11,${totalLineH - 16}`;
  const lineLength  = totalLineH - 32;

  return (
    <div style={{ position: 'relative', paddingLeft: 34, paddingTop: 4, paddingBottom: 8 }}>
      {/* SVG timeline spine */}
      <svg
        width={22}
        height={totalLineH}
        style={{
          position:      'absolute',
          left:          0,
          top:           0,
          pointerEvents: 'none',
          overflow:      'visible',
        }}
      >
        {/* Dashed guide (always visible, very faint) */}
        <path
          d={linePath}
          fill="none"
          stroke="rgba(201,168,76,0.12)"
          strokeWidth={2}
        />
        {/* Animated drawing line */}
        <path
          d={linePath}
          fill="none"
          stroke="rgba(201,168,76,0.55)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={lineLength}
          strokeDashoffset={mounted ? 0 : lineLength}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' }}
        />
      </svg>

      {sorted.map((exp, i) => {
        const isCurrent = exp.endDate === null;
        return (
          <div
            key={exp.id}
            style={{
              position:   'relative',
              marginBottom: 24,
              paddingBottom: 20,
              borderBottom: i < sorted.length - 1
                ? '1px solid rgba(201,168,76,0.15)'
                : 'none',
              opacity:   mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(18px)',
              transition: `opacity 0.45s ease ${i * 110}ms, transform 0.45s ease ${i * 110}ms`,
            }}
          >
            {/* Dot on the spine */}
            <div
              style={{
                position:     'absolute',
                left:         -31,
                top:          8,
                width:        12,
                height:       12,
                borderRadius: '50%',
                background:   isCurrent ? 'var(--color-gold)' : '#584838',
                border:       `2px solid rgba(201,168,76,${isCurrent ? 0.8 : 0.35})`,
                boxShadow:    isCurrent ? '0 0 6px rgba(201,168,76,0.5)' : 'none',
                zIndex:       1,
              }}
            />

            {/* Date range badge */}
            <div
              style={{
                fontFamily:    'var(--font-pixel)',
                fontSize:      '0.33rem',
                color:         isCurrent ? 'var(--color-gold)' : 'var(--color-text-muted)',
                letterSpacing: '0.08em',
                marginBottom:  5,
              }}
            >
              {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
              {isCurrent && (
                <span
                  style={{
                    marginLeft:   8,
                    background:   'rgba(201,168,76,0.18)',
                    border:       '1px solid rgba(201,168,76,0.4)',
                    borderRadius: 3,
                    padding:      '1px 5px',
                    color:        'var(--color-gold)',
                  }}
                >
                  ACTIVE
                </span>
              )}
            </div>

            {/* Company + Role */}
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        7,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>{exp.guildRankIcon}</span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize:   '1.05rem',
                  color:      'var(--color-text)',
                }}
              >
                {exp.company}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle:  'italic',
                fontSize:   '0.9rem',
                color:      'var(--color-text-muted)',
                marginBottom: 10,
              }}
            >
              {exp.role} · {exp.location}
            </div>

            {/* Key deeds (first 2 for brevity in chronicle view) */}
            {exp.description.slice(0, 2).map((deed, j) => (
              <div
                key={j}
                style={{
                  display:       'flex',
                  gap:           8,
                  fontFamily:    'var(--font-body)',
                  fontSize:      '0.9rem',
                  lineHeight:    1.6,
                  color:         'var(--color-text)',
                  marginBottom:  3,
                }}
              >
                <span style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 2 }}>›</span>
                <span>{deed}</span>
              </div>
            ))}

            {/* Skill tags */}
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {exp.skills.slice(0, 6).map((s) => (
                <span className="tag" key={s}>{s}</span>
              ))}
              {exp.skills.length > 6 && (
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize:   '0.3rem',
                    color:      'var(--color-text-muted)',
                    padding:    '3px 6px',
                    alignSelf:  'center',
                  }}
                >
                  +{exp.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
