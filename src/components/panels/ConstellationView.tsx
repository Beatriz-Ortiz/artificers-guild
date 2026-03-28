import { useEffect, useState } from 'react';
import type { Skill, SkillSchool } from '../../types/cv';
import { SKILL_LEVEL_NAMES, SKILL_SCHOOL_LABELS } from '../../types/cv';

const SCHOOL_COLORS: Record<SkillSchool, string> = {
  arcane:        '#2da091',
  transmutation: '#c9a84c',
  divination:    '#9b59b6',
  enchantment:   '#4169e1',
};

// Center angle (degrees) for each school sector
const SCHOOL_CENTER_ANGLE: Record<SkillSchool, number> = {
  arcane:        -90, // top
  transmutation:   0, // right
  divination:     90, // bottom
  enchantment:   180, // left
};

const SCHOOLS: SkillSchool[] = ['arcane', 'transmutation', 'divination', 'enchantment'];
const toRad = (deg: number) => (deg * Math.PI) / 180;

const SKILL_RADIUS   = 185; // distance of skill nodes from center
const HUB_RADIUS     =  78; // distance of school hubs from center
const LABEL_RADIUS   = 225; // distance of school name labels
const SECTOR_SPAN    =  68; // degrees, each school's arc width

interface NodeData {
  skill: Skill;
  cx: number;
  cy: number;
  baseR: number;
  color: string;
}

interface HubData {
  school: SkillSchool;
  cx: number;
  cy: number;
  labelCx: number;
  labelCy: number;
}

export default function ConstellationView({ skills }: { skills: Skill[] }) {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const nodes: NodeData[] = [];
  const hubs: HubData[]   = [];

  for (const school of SCHOOLS) {
    const center = SCHOOL_CENTER_ANGLE[school];
    const rad    = toRad(center);
    hubs.push({
      school,
      cx:      Math.cos(rad) * HUB_RADIUS,
      cy:      Math.sin(rad) * HUB_RADIUS,
      labelCx: Math.cos(rad) * LABEL_RADIUS,
      labelCy: Math.sin(rad) * LABEL_RADIUS,
    });

    const schoolSkills = skills.filter((s) => s.school === school);
    const n = schoolSkills.length;
    schoolSkills.forEach((skill, i) => {
      const frac  = n === 1 ? 0.5 : i / (n - 1);
      const angle = center - SECTOR_SPAN / 2 + frac * SECTOR_SPAN;
      const aRad  = toRad(angle);
      nodes.push({
        skill,
        cx:    Math.cos(aRad) * SKILL_RADIUS,
        cy:    Math.sin(aRad) * SKILL_RADIUS,
        baseR: 4 + skill.level * 2.8,
        color: SCHOOL_COLORS[school],
      });
    });
  }

  const hoveredNode = hovered ? nodes.find((n) => n.skill.id === hovered) : null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SCHOOLS.map((school) => (
          <div
            key={school}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.32rem',
              color: SCHOOL_COLORS[school],
              letterSpacing: '0.05em',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: SCHOOL_COLORS[school],
                opacity: 0.8,
              }}
            />
            {SKILL_SCHOOL_LABELS[school].name.toUpperCase()}
          </div>
        ))}
      </div>

      {/* SVG Constellation */}
      <svg
        viewBox="-270 -260 540 520"
        width="100%"
        style={{ maxWidth: 500, userSelect: 'none' }}
      >
        {/* Subtle background rings */}
        {[80, 140, 185, 225].map((r) => (
          <circle
            key={r}
            cx={0} cy={0} r={r}
            fill="none"
            stroke="rgba(201,168,76,0.07)"
            strokeWidth={1}
          />
        ))}

        {/* Lines: hub → skill nodes */}
        {SCHOOLS.map((school) => {
          const hub = hubs.find((h) => h.school === school)!;
          return nodes
            .filter((n) => n.skill.school === school)
            .map((node) => (
              <line
                key={`line-${node.skill.id}`}
                x1={hub.cx} y1={hub.cy}
                x2={node.cx} y2={node.cy}
                stroke={SCHOOL_COLORS[school]}
                strokeWidth={0.8}
                opacity={animated ? (hovered && node.skill.school !== hovered?.split('_')[0] ? 0.12 : 0.3) : 0}
                style={{ transition: 'opacity 0.3s ease' }}
              />
            ));
        })}

        {/* Center emblem */}
        <circle cx={0} cy={0} r={18} fill="rgba(201,168,76,0.12)" stroke="rgba(201,168,76,0.35)" strokeWidth={1} />
        <text
          x={0} y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(201,168,76,0.8)"
          fontSize={13}
          fontFamily="'Cinzel', serif"
        >
          ✦
        </text>

        {/* School hubs */}
        {hubs.map((hub) => {
          const color = SCHOOL_COLORS[hub.school];
          const label = SKILL_SCHOOL_LABELS[hub.school];
          const schoolCount = skills.filter((s) => s.school === hub.school).length;
          return (
            <g key={hub.school}>
              {/* Hub glow */}
              <circle cx={hub.cx} cy={hub.cy} r={14} fill={color} opacity={0.15} />
              <circle cx={hub.cx} cy={hub.cy} r={8}  fill={color} opacity={animated ? 0.65 : 0}
                style={{ transition: 'opacity 0.5s ease' }} />
              {/* School icon */}
              <text
                x={hub.cx} y={hub.cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                style={{ pointerEvents: 'none' }}
              >
                {label.icon}
              </text>
              {/* School label at outer ring */}
              <text
                x={hub.labelCx}
                y={hub.labelCy - 7}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={7}
                fontFamily="'Cinzel', serif"
                fontWeight={600}
                opacity={animated ? 0.9 : 0}
                style={{ transition: 'opacity 0.5s ease 0.3s' }}
              >
                {label.name}
              </text>
              <text
                x={hub.labelCx}
                y={hub.labelCy + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={5.5}
                fontFamily="'Press Start 2P', monospace"
                opacity={animated ? 0.55 : 0}
                style={{ transition: 'opacity 0.5s ease 0.4s' }}
              >
                {schoolCount} spell{schoolCount !== 1 ? 's' : ''}
              </text>
            </g>
          );
        })}

        {/* Skill nodes */}
        {nodes.map((node, idx) => {
          const isHovered = hovered === node.skill.id;
          return (
            <g
              key={node.skill.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(node.skill.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Outer ring on hover */}
              <circle
                cx={node.cx} cy={node.cy}
                r={node.baseR + 5}
                fill="none"
                stroke={node.color}
                strokeWidth={1}
                opacity={isHovered ? 0.5 : 0}
                style={{ transition: 'opacity 0.15s ease' }}
              />
              {/* Main node — scale from 0 on mount */}
              <circle
                cx={node.cx} cy={node.cy}
                r={node.baseR}
                fill={node.color}
                opacity={isHovered ? 1 : 0.72}
                style={{
                  transform:       `scale(${animated ? 1 : 0})`,
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  transition:      `transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${idx * 38}ms, opacity 0.15s ease`,
                }}
              />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredNode && (() => {
          const { cx, cy, baseR, color, skill } = hoveredNode;
          const right  = cx > 0;
          const tx     = cx + (right ? baseR + 8 : -(baseR + 8));
          const anchor = right ? 'start' : 'end';
          // Keep tooltip inside viewBox
          const clampedTy = Math.max(-235, Math.min(cy, 220));
          return (
            <g style={{ pointerEvents: 'none' }}>
              {/* Connector dot */}
              <line
                x1={cx + (right ? baseR : -baseR)}
                y1={cy}
                x2={tx}
                y2={clampedTy}
                stroke={color}
                strokeWidth={0.8}
                opacity={0.4}
              />
              <text
                x={tx} y={clampedTy - 6}
                textAnchor={anchor}
                dominantBaseline="auto"
                fill="#f4e4bc"
                fontSize={9.5}
                fontFamily="'Crimson Text', serif"
                fontWeight={600}
              >
                {skill.name}
              </text>
              <text
                x={tx} y={clampedTy + 7}
                textAnchor={anchor}
                dominantBaseline="auto"
                fill={color}
                fontSize={5.5}
                fontFamily="'Press Start 2P', monospace"
              >
                {SKILL_LEVEL_NAMES[skill.level].toUpperCase()}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
