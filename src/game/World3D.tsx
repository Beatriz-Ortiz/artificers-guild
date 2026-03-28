import { useRef, useState, useEffect, useCallback, type Ref } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';
import { usePlayerControls } from './usePlayerControls';
import type { DoorId, DoorDef } from './usePlayerControls';

// ── Palette ─────────────────────────────────────────────────────────
const WALL_COLOR  = '#3a2e22';
const FLOOR_COLOR = '#2a2018';
const CEIL_COLOR  = '#252015';

// ── Corridor geometry constants ──────────────────────────────────────
// Each arm: 3 units wide, 8 units long, 3.5 units tall
// Center: 4×4 crossroads
const ARM_W  = 3;
const ARM_H  = 3.5;
const ARM_L  = 8;   // from center edge to end
const CTR    = 2;   // half-width of center square

// ── Geometry helpers ─────────────────────────────────────────────────

function Box({
  position,
  args,
  color,
  roughness = 0.9,
  metalness = 0,
  emissive,
  emissiveIntensity,
  onClick,
}: {
  position: [number, number, number];
  args:     [number, number, number];
  color:    string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  onClick?: () => void;
}) {
  return (
    <mesh position={position} onClick={onClick} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity ?? 0}
      />
    </mesh>
  );
}

// ── Torch ────────────────────────────────────────────────────────────

function Torch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <pointLight color="#ff8030" intensity={4} distance={12} decay={2} castShadow />
      {/* Bracket */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.18, 0.06]} />
        <meshStandardMaterial color="#584030" roughness={0.9} />
      </mesh>
      {/* Flame glow */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffcc60" emissive="#ff7020" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

// ── Door ─────────────────────────────────────────────────────────────

const DOOR_DEFS: DoorDef[] = [
  { id: 'quests',   position: [-(CTR + ARM_L - 0.3), ARM_H / 2,  0          ] },
  { id: 'skills',   position: [0,                    ARM_H / 2, -(CTR + ARM_L - 0.3)] },
  { id: 'projects', position: [+(CTR + ARM_L - 0.3), ARM_H / 2,  0          ] },
  { id: 'contact',  position: [0,                    ARM_H / 2, +(CTR + ARM_L - 0.3)] },
];

const DOOR_CONFIG: Record<DoorId, { color: string; lightColor: string; label: string; icon: string }> = {
  quests:   { color: '#4a4a4a', lightColor: '#cc2222', label: 'Guild Hall',  icon: '⚔' },
  skills:   { color: '#3a2a10', lightColor: '#2da091', label: 'Spellbook',   icon: '📖' },
  projects: { color: '#5c3a18', lightColor: '#dc6414', label: 'The Forge',   icon: '🔨' },
  contact:  { color: '#3a3060', lightColor: '#8855cc', label: 'Portal',      icon: '🔮' },
};

function Door({
  def,
  isNear,
  onClick,
  axisZ, // true = door faces Z axis (N/S), false = faces X axis (E/W)
}: {
  def:    DoorDef;
  isNear: boolean;
  onClick: () => void;
  axisZ:  boolean;
}) {
  const cfg  = DOOR_CONFIG[def.id];
  const doorW = 1.4;
  const doorH = 2.4;
  const frameT = 0.15;

  // Door sits at the end wall; position slightly in front
  const [dx, , dz] = def.position;

  return (
    <group position={[dx, 0, dz]}>
      {/* Accent light */}
      <pointLight
        color={cfg.lightColor}
        intensity={isNear ? 5 : 2.5}
        distance={8}
        decay={2}
      />

      {/* Door panel */}
      <mesh
        position={[0, doorH / 2, 0]}
        rotation={axisZ ? [0, 0, 0] : [0, Math.PI / 2, 0]}
        onClick={onClick}
      >
        <boxGeometry args={[doorW, doorH, 0.12]} />
        <meshStandardMaterial
          color={cfg.color}
          roughness={0.7}
          emissive={cfg.lightColor}
          emissiveIntensity={isNear ? 0.4 : 0.15}
        />
      </mesh>

      {/* Door frame top */}
      <mesh
        position={[0, doorH + frameT / 2, 0]}
        rotation={axisZ ? [0, 0, 0] : [0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[doorW + frameT * 2, frameT, 0.18]} />
        <meshStandardMaterial color="#584030" roughness={0.8} />
      </mesh>

      {/* Door frame sides */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={axisZ
            ? [side * (doorW / 2 + frameT / 2), doorH / 2, 0]
            : [0, doorH / 2, side * (doorW / 2 + frameT / 2)]}
          rotation={axisZ ? [0, 0, 0] : [0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[frameT, doorH, 0.18]} />
          <meshStandardMaterial color="#584030" roughness={0.8} />
        </mesh>
      ))}

      {/* HTML label — distanceFactor keeps it readable at any distance */}
      <Html
        position={[0, doorH + 0.7, 0]}
        center
        occlude={false}
        distanceFactor={6}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily:    "'Press Start 2P', monospace",
          fontSize:      '13px',
          color:         isNear ? '#ffffff' : 'rgba(255,255,255,0.75)',
          textAlign:     'center',
          whiteSpace:    'nowrap',
          textShadow:    `0 0 12px ${cfg.lightColor}, 0 0 24px ${cfg.lightColor}`,
          transition:    'color 0.3s, text-shadow 0.3s',
          pointerEvents: 'none',
          lineHeight:    1.6,
        }}>
          <span style={{ fontSize: '18px' }}>{cfg.icon}</span>
          <br />
          {cfg.label}
          {isNear && (
            <div style={{
              marginTop:     6,
              fontSize:      '11px',
              color:         cfg.lightColor,
              animation:     'door-pulse 0.8s ease-in-out infinite alternate',
              letterSpacing: '0.05em',
            }}>
              [E] Enter
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Corridor segments ─────────────────────────────────────────────────

function CorridorSegment({
  cx, cz,
  width, length,
  wallTint = WALL_COLOR,
}: {
  cx: number; cz: number;
  width: number; length: number;
  wallTint?: string;
}) {
  const hw = width  / 2;
  const hl = length / 2;
  const y  = ARM_H  / 2;

  // Stone block detail strip along base of walls
  const TRIM = '#1a1208';

  return (
    <group position={[cx, 0, cz]}>
      {/* Floor */}
      <Box position={[0, 0, 0]}     args={[width, 0.1, length]}  color={FLOOR_COLOR} />
      {/* Ceiling */}
      <Box position={[0, ARM_H, 0]} args={[width, 0.1, length]}  color={CEIL_COLOR}  />
      {/* Side walls (-X and +X) */}
      <Box position={[-hw, y, 0]}   args={[0.12, ARM_H, length]} color={wallTint}  />
      <Box position={[+hw, y, 0]}   args={[0.12, ARM_H, length]} color={wallTint}  />
      {/* Front/back walls (-Z and +Z) */}
      <Box position={[0, y, -hl]}   args={[width, ARM_H, 0.12]}  color={wallTint}  />
      <Box position={[0, y, +hl]}   args={[width, ARM_H, 0.12]}  color={wallTint}  />
      {/* Baseboard trim */}
      <Box position={[-hw, 0.12, 0]}  args={[0.14, 0.22, length]} color={TRIM} />
      <Box position={[+hw, 0.12, 0]}  args={[0.14, 0.22, length]} color={TRIM} />
    </group>
  );
}

// ── Crossroads centre pillar ──────────────────────────────────────────

function CentrePillar() {
  return (
    <group position={[0, 0, 0]}>
      {/* Overhead magic chandelier glow */}
      <pointLight color="#c9a84c" intensity={3} distance={6} decay={2} position={[0, 3.3, 0]} />
      {/* Hanging orb */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#ffe090" emissive="#c9a84c" emissiveIntensity={3} />
      </mesh>
      {/* Thin chain suggestion */}
      <mesh position={[0, 3.25, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#7a6040" roughness={0.8} />
      </mesh>
      {/* Floor rune circle — flat disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshStandardMaterial color="#c9a84c" emissive="#a07828" emissiveIntensity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshStandardMaterial color="#c9a84c" emissive="#a07828" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

// ── Directional wall sign ─────────────────────────────────────────────

function WallSign({
  position,
  rotation,
  label,
  icon,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Plaque */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.9, 0.35, 0.04]} />
        <meshStandardMaterial color="#3a2810" roughness={0.9} emissive={color} emissiveIntensity={0.08} />
      </mesh>
      <Html center distanceFactor={4} position={[0, 0, 0.04]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily:  "'Press Start 2P', monospace",
          fontSize:    '11px',
          color:       '#e8c96a',
          whiteSpace:  'nowrap',
          textShadow:  `0 0 8px ${color}`,
          pointerEvents: 'none',
        }}>
          {icon} {label}
        </div>
      </Html>
    </group>
  );
}

// ── Shadow figure (jump-scare NPC) ────────────────────────────────────

// One position per arm end (just inside the end wall)
const SHADOW_POSITIONS: [number, number, number][] = [
  [0,              0, -(CTR + ARM_L - 0.6)],  // North
  [0,              0, +(CTR + ARM_L - 0.6)],  // South
  [-(CTR + ARM_L - 0.6), 0, 0             ],  // West
  [+(CTR + ARM_L - 0.6), 0, 0             ],  // East
];

function ShadowFigure({ visible }: { visible: boolean }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const target = visible ? 1 : 0;
    const speed  = delta * (visible ? 6 : 3); // fast fade-in, slower fade-out

    [bodyRef, headRef].forEach((r) => {
      if (!r.current) return;
      const mat = r.current.material as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, speed);
    });

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity, visible ? 2 : 0, speed,
      );
    }
  });

  return (
    <group>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.55, 1.4, 0.22]} />
        <meshStandardMaterial
          color="#080000"
          transparent
          opacity={0}
          emissive="#300000"
          emissiveIntensity={0.8}
          depthWrite={false}
        />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.28, 10, 10]} />
        <meshStandardMaterial
          color="#080000"
          transparent
          opacity={0}
          emissive="#300000"
          emissiveIntensity={0.8}
          depthWrite={false}
        />
      </mesh>
      {/* Dim red glow */}
      <pointLight ref={lightRef} color="#880000" intensity={0} distance={4} decay={2} />
    </group>
  );
}

// ── ScaryEvents (managed outside Canvas, positions injected) ──────────

function ScaryEvents({ onFlash }: { onFlash: () => void }) {
  const [armIdx, setArmIdx] = useState<number | null>(null);
  const [show,   setShow]   = useState(false);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    const schedule = () => {
      const delay = 25_000 + Math.random() * 55_000; // 25–80 s
      timerRef.current = window.setTimeout(() => {
        const idx = Math.floor(Math.random() * 4);
        setArmIdx(idx);
        setShow(true);
        onFlash();
        // visible for 2.8 s, then fade out and reschedule
        window.setTimeout(() => {
          setShow(false);
          window.setTimeout(() => {
            setArmIdx(null);
            schedule();
          }, 800); // wait for fade-out
        }, 2_800);
      }, delay);
    };
    schedule();
    return () => window.clearTimeout(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (armIdx === null) return null;

  return (
    <group position={SHADOW_POSITIONS[armIdx]}>
      <ShadowFigure visible={show} />
    </group>
  );
}

// ── Full world ────────────────────────────────────────────────────────

function CorridorWorld({
  nearDoor,
  onDoorClick,
  onFlash,
}: {
  nearDoor: DoorId | null;
  onDoorClick: (id: DoorId) => void;
  onFlash: () => void;
}) {
  const halfArm = ARM_L / 2;

  // Slightly tinted wall colors per arm
  const TINT_N = '#2e2840'; // skills — teal-ish dark
  const TINT_S = '#2e2040'; // contact — purple-ish dark
  const TINT_W = '#302018'; // quests — iron dark
  const TINT_E = '#322010'; // projects — forge warm
  const wallH  = ARM_H / 2;

  return (
    <group>
      {/* Center crossroads */}
      <CorridorSegment cx={0} cz={0} width={ARM_W + CTR * 2} length={ARM_W + CTR * 2} />

      {/* North arm (−Z) — skills/teal */}
      <CorridorSegment cx={0} cz={-(CTR + halfArm)} width={ARM_W} length={ARM_L} wallTint={TINT_N} />
      {/* South arm (+Z) — contact/purple */}
      <CorridorSegment cx={0} cz={+(CTR + halfArm)} width={ARM_W} length={ARM_L} wallTint={TINT_S} />
      {/* West arm (−X) — quests/red */}
      <CorridorSegment cx={-(CTR + halfArm)} cz={0} width={ARM_L} length={ARM_W} wallTint={TINT_W} />
      {/* East arm (+X) — projects/orange */}
      <CorridorSegment cx={+(CTR + halfArm)} cz={0} width={ARM_L} length={ARM_W} wallTint={TINT_E} />

      {/* End walls for each arm */}
      <Box position={[0, wallH, -(CTR + ARM_L)]} args={[ARM_W, ARM_H, 0.12]} color={TINT_N} />
      <Box position={[0, wallH, +(CTR + ARM_L)]} args={[ARM_W, ARM_H, 0.12]} color={TINT_S} />
      <Box position={[-(CTR + ARM_L), wallH, 0]} args={[0.12, ARM_H, ARM_W]} color={TINT_W} />
      <Box position={[+(CTR + ARM_L), wallH, 0]} args={[0.12, ARM_H, ARM_W]} color={TINT_E} />

      {/* Central chandelier + rune circle */}
      <CentrePillar />

      {/* Torches near crossroads (on the arm entries) */}
      <Torch position={[-1.35, 2.6, -(CTR + 0.3)]} />
      <Torch position={[+1.35, 2.6, -(CTR + 0.3)]} />
      <Torch position={[-1.35, 2.6, +(CTR + 0.3)]} />
      <Torch position={[+1.35, 2.6, +(CTR + 0.3)]} />
      <Torch position={[-(CTR + 0.3), 2.6, -1.35]} />
      <Torch position={[-(CTR + 0.3), 2.6, +1.35]} />
      <Torch position={[+(CTR + 0.3), 2.6, -1.35]} />
      <Torch position={[+(CTR + 0.3), 2.6, +1.35]} />

      {/* Mid-arm torches */}
      <Torch position={[-1.35, 2.6, -(CTR + halfArm)]} />
      <Torch position={[+1.35, 2.6, -(CTR + halfArm)]} />
      <Torch position={[-1.35, 2.6, +(CTR + halfArm)]} />
      <Torch position={[+1.35, 2.6, +(CTR + halfArm)]} />
      <Torch position={[-(CTR + halfArm), 2.6, -1.35]} />
      <Torch position={[-(CTR + halfArm), 2.6, +1.35]} />
      <Torch position={[+(CTR + halfArm), 2.6, -1.35]} />
      <Torch position={[+(CTR + halfArm), 2.6, +1.35]} />

      {/* Directional wall signs at crossroads entries */}
      <WallSign
        position={[0, 2.0, -(CTR - 0.08)]}
        rotation={[0, 0, 0]}
        label="Spellbook"  icon="📖" color="#2da091"
      />
      <WallSign
        position={[0, 2.0, +(CTR - 0.08)]}
        rotation={[0, Math.PI, 0]}
        label="Portal"     icon="🔮" color="#8855cc"
      />
      <WallSign
        position={[-(CTR - 0.08), 2.0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        label="Guild Hall" icon="⚔" color="#cc2222"
      />
      <WallSign
        position={[+(CTR - 0.08), 2.0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        label="The Forge"  icon="🔨" color="#dc6414"
      />

      {/* Scary events */}
      <ScaryEvents onFlash={onFlash} />

      {/* Doors */}
      {DOOR_DEFS.map((def) => (
        <Door
          key={def.id}
          def={def}
          isNear={nearDoor === def.id}
          onClick={() => onDoorClick(def.id)}
          axisZ={def.id === 'skills' || def.id === 'contact'}
        />
      ))}
    </group>
  );
}

// ── PlayerRig (uses hook inside Canvas) ─────────────────────────────

function PlayerRig({
  onNearDoor,
}: {
  onNearDoor: (id: DoorId | null) => void;
}) {
  usePlayerControls(DOOR_DEFS, onNearDoor);
  return null;
}

// ── PointerLock helper ───────────────────────────────────────────────

function PointerLockOverlay({ locked }: { locked: boolean }) {
  if (locked) return null;
  return (
    <div style={{
      position:       'absolute',
      inset:          0,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'rgba(0,0,0,0.7)',
      zIndex:         1,
      cursor:         'pointer',
      gap:            16,
    }}>
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize:   '11px',
        color:      'var(--color-gold)',
        textAlign:  'center',
        lineHeight: 2,
      }}>
        Click to enter the guild
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize:   '0.9rem',
        color:      'rgba(244,228,188,0.6)',
        textAlign:  'center',
        fontStyle:  'italic',
      }}>
        WASD to move · Mouse to look<br />E or click door to enter
      </div>
    </div>
  );
}

// ── World3D ──────────────────────────────────────────────────────────

const DOOR_CONFIG_MAP = {
  quests:   { label: 'Guild Hall',  icon: '⚔',  color: '#cc2222' },
  skills:   { label: 'Spellbook',   icon: '📖', color: '#2da091' },
  projects: { label: 'The Forge',   icon: '🔨', color: '#dc6414' },
  contact:  { label: 'Portal',      icon: '🔮', color: '#8855cc' },
} as const;

export default function World3D() {
  const [nearDoor,    setNearDoor]    = useState<DoorId | null>(null);
  const [locked,      setLocked]      = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const nearDoorRef = useRef<DoorId | null>(null);

  // Keep ref in sync so the click handler can read it synchronously
  useEffect(() => { nearDoorRef.current = nearDoor; }, [nearDoor]);

  const dispatchDoor = useCallback((id: DoorId) => {
    window.dispatchEvent(new CustomEvent('cv:buildingClicked', { detail: { id } }));
  }, []);

  const triggerFlash = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 600);
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (!locked) {
      controlsRef.current?.lock();
      return;
    }
    // If standing near a door, click = interact
    if (nearDoorRef.current) {
      dispatchDoor(nearDoorRef.current);
    }
  }, [locked, dispatchDoor]);

  const near = nearDoor ? DOOR_CONFIG_MAP[nearDoor] : null;

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={handleCanvasClick}
    >
      <PointerLockOverlay locked={locked} />

      {/* ── Crosshair ── */}
      {locked && (
        <div style={{
          position:  'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex:    2,
          pointerEvents: 'none',
          color: near ? near.color : 'rgba(255,255,255,0.55)',
          fontSize: near ? '22px' : '14px',
          lineHeight: 1,
          textShadow: near ? `0 0 10px ${near.color}` : 'none',
          transition: 'color 0.2s, font-size 0.2s',
        }}>
          {near ? near.icon : '·'}
        </div>
      )}

      {/* ── Door interaction prompt (bottom-center HUD) ── */}
      {locked && near && (
        <div style={{
          position:       'absolute',
          bottom:         80,
          left:           '50%',
          transform:      'translateX(-50%)',
          zIndex:         2,
          pointerEvents:  'none',
          textAlign:      'center',
          animation:      'door-pulse 0.8s ease-in-out infinite alternate',
        }}>
          <div style={{
            fontFamily:    "'Press Start 2P', monospace",
            fontSize:      '11px',
            color:         near.color,
            textShadow:    `0 0 12px ${near.color}`,
            letterSpacing: '0.05em',
            marginBottom:  4,
          }}>
            [ E ] {near.label}
          </div>
          <div style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            fontSize:   '0.8rem',
            color:      'rgba(244,228,188,0.55)',
            fontStyle:  'italic',
          }}>
            click or press E to enter
          </div>
        </div>
      )}

      {/* ── Scare flash overlay ── */}
      <div style={{
        position:   'absolute',
        inset:      0,
        zIndex:     3,
        background: 'radial-gradient(ellipse at center, rgba(120,0,0,0.0) 30%, rgba(180,0,0,0.65) 100%)',
        opacity:    flashActive ? 1 : 0,
        transition: flashActive ? 'opacity 0.05s' : 'opacity 0.55s ease-out',
        pointerEvents: 'none',
      }} />

      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 80, position: [0, 1.7, 0] }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={['#0a0806', 14, 50]} />
        <ambientLight intensity={0.25} />

        <PointerLockControls
          ref={controlsRef as Ref<PointerLockControlsImpl>}
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />

        <PlayerRig onNearDoor={setNearDoor} />

        <CorridorWorld
          nearDoor={nearDoor}
          onDoorClick={dispatchDoor}
          onFlash={triggerFlash}
        />
      </Canvas>
    </div>
  );
}
