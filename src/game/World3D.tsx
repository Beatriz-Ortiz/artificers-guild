import { useRef, useState, useEffect, useCallback, type Ref } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';
import { usePlayerControls } from './usePlayerControls';
import type { DoorId, DoorDef } from './usePlayerControls';

// ─── Palette ─────────────────────────────────────────────────────────
const STONE    = '#3a342c';
const STONE_D  = '#26221c';
const STONE_L  = '#4e463c';
const FLOOR_C  = '#1e1c18';
const RUBBLE_C = '#2c2820';

// ─── Building interaction points (where the player must stand) ────────
const DOOR_DEFS: DoorDef[] = [
  { id: 'quests',   position: [-10,  1.7,  2.0] },
  { id: 'skills',   position: [ 10,  1.7,  2.0] },
  { id: 'projects', position: [ -5,  1.7, -8.5] },
  { id: 'contact',  position: [  5,  1.7, -8.5] },
];

const DOOR_CONFIG: Record<DoorId, { lightColor: string; label: string; icon: string }> = {
  quests:   { lightColor: '#cc2222', label: 'Guild Hall',  icon: '⚔' },
  skills:   { lightColor: '#2da091', label: 'Spellbook',   icon: '📖' },
  projects: { lightColor: '#dc6414', label: 'The Forge',   icon: '🔨' },
  contact:  { lightColor: '#8855cc', label: 'Portal',      icon: '🔮' },
};

// shadow figure spawn positions — far corners of the city
const SHADOW_POSITIONS: [number, number, number][] = [
  [  0,  0, -17],
  [-16,  0,  -4],
  [ 16,  0,  -4],
  [  0,  0,  13],
];

// ─── Primitive helpers ────────────────────────────────────────────────

function Box({
  position, args, color,
  roughness = 0.95,
  emissive, emissiveIntensity,
}: {
  position: [number, number, number];
  args:     [number, number, number];
  color:    string;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={0}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity ?? 0}
      />
    </mesh>
  );
}

// ─── Torch ────────────────────────────────────────────────────────────

function Torch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <pointLight color="#ff8030" intensity={5} distance={10} decay={2} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#ffcc60" emissive="#ff7020" emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

// ─── Rubble pile ──────────────────────────────────────────────────────

function RubblePile({ position }: { position: [number, number, number] }) {
  const [px, py, pz] = position;
  const chunks: Array<{ p: [number,number,number]; s: [number,number,number]; r: number }> = [
    { p: [px,       py + 0.1, pz],       s: [0.9, 0.22, 0.7], r: 0.4  },
    { p: [px + 0.5, py + 0.15, pz - 0.3], s: [0.55, 0.3, 0.45], r: 0.9 },
    { p: [px - 0.4, py + 0.08, pz + 0.4], s: [0.6, 0.18, 0.5], r: -0.5 },
    { p: [px + 0.2, py + 0.22, pz + 0.3], s: [0.35, 0.22, 0.35], r: 1.1 },
  ];
  return (
    <group>
      {chunks.map((c, i) => (
        <mesh key={i} position={c.p} rotation={[0, c.r, 0]}>
          <boxGeometry args={c.s} />
          <meshStandardMaterial color={RUBBLE_C} roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Broken column ────────────────────────────────────────────────────

function BrokenColumn({ position, height = 3 }: { position: [number,number,number]; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.25, height, 8]} />
        <meshStandardMaterial color={STONE_L} roughness={0.9} />
      </mesh>
      {/* Crumbled top */}
      <mesh position={[0.15, height + 0.1, -0.1]} rotation={[0.3, 0.5, 0.2]}>
        <boxGeometry args={[0.4, 0.25, 0.4]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
    </group>
  );
}

// ─── Ruined building ─────────────────────────────────────────────────
// The entrance faces south (+Z). The building extends north (-Z).
// cx/cz = center of the building footprint.

function RuinedBuilding({
  cx, cz,
  doorId,
  isNear,
  onEnter,
}: {
  cx: number; cz: number;
  doorId: DoorId;
  isNear: boolean;
  onEnter: () => void;
}) {
  const cfg = DOOR_CONFIG[doorId];
  const W = 8, D = 7, H = 5;
  const hw = W / 2, hd = D / 2;

  // Entrance gap width
  const gapW = 2.4;
  const sideW = (W - gapW) / 2;

  return (
    <group position={[cx, 0, cz]}>
      {/* ── Floor slab ── */}
      <Box position={[0, 0.06, 0]} args={[W, 0.14, D]} color={STONE_D} roughness={1} />

      {/* ── Back wall (north) — mostly intact ── */}
      <Box position={[0, H / 2, -hd]}          args={[W,     H,       0.45]} color={STONE} />

      {/* ── West wall — partial, broken at top ── */}
      <Box position={[-hw, H * 0.38, 0]}        args={[0.4, H * 0.76, D]}    color={STONE} />
      <Box position={[-hw, H * 0.82, -hd * 0.4]} args={[0.45, H * 0.12, D * 0.55]} color={STONE_D} />

      {/* ── East wall — more ruined (shorter) ── */}
      <Box position={[+hw, H * 0.28, 0]}        args={[0.4, H * 0.56, D]}    color={STONE} />

      {/* ── South wall — left section (west of entrance) ── */}
      <Box
        position={[-hw + sideW / 2, H / 2, +hd]}
        args={[sideW, H, 0.4]}
        color={STONE}
      />
      {/* ── South wall — right section (east of entrance) ── */}
      <Box
        position={[+hw - sideW / 2, H / 2, +hd]}
        args={[sideW, H, 0.4]}
        color={STONE}
      />
      {/* ── Lintel above entrance ── */}
      <Box position={[0, 3.1, +hd]}  args={[gapW + 0.4, 0.35, 0.55]} color={STONE_D} />
      {/* ── Doorstep ── */}
      <Box position={[0, 0.12, +hd + 0.2]} args={[gapW, 0.22, 0.4]} color={STONE_L} />

      {/* ── Wall cracks / detail lines (thin dark strips) ── */}
      <Box position={[-hw, H * 0.65, -hd * 0.7]} args={[0.41, 0.05, D * 0.3]} color={STONE_D} />
      <Box position={[0, H * 0.4, -hd]}           args={[W * 0.3, 0.06, 0.46]} color={STONE_D} />

      {/* ── Rubble ── */}
      <RubblePile position={[-hw + 0.5, 0, -hd * 0.5]} />
      <RubblePile position={[+hw - 0.6, 0,  hd * 0.3]} />
      <RubblePile position={[0,         0, -hd + 0.4]} />

      {/* ── Interior coloured glow ── */}
      <pointLight
        color={cfg.lightColor}
        intensity={isNear ? 8 : 3.5}
        distance={12}
        decay={2}
        position={[0, 1.5, 0]}
      />
      {/* Glow orb visible through entrance */}
      <mesh position={[0, 1.6, -hd * 0.3]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial
          color={cfg.lightColor}
          emissive={cfg.lightColor}
          emissiveIntensity={isNear ? 5 : 2.5}
        />
      </mesh>

      {/* ── Torches flanking entrance ── */}
      <Torch position={[-(gapW / 2 + 0.3), 2.5, +hd + 0.05]} />
      <Torch position={[+(gapW / 2 + 0.3), 2.5, +hd + 0.05]} />

      {/* ── Label above entrance ── */}
      <Html
        position={[0, H + 1.0, +hd]}
        center
        occlude={false}
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div
          onClick={onEnter}
          style={{
            fontFamily:    "'Press Start 2P', monospace",
            fontSize:      '13px',
            color:         isNear ? '#ffffff' : 'rgba(255,255,255,0.6)',
            textAlign:     'center',
            whiteSpace:    'nowrap',
            textShadow:    `0 0 14px ${cfg.lightColor}, 0 0 28px ${cfg.lightColor}`,
            transition:    'color 0.25s',
            pointerEvents: 'none',
            lineHeight:    1.7,
          }}
        >
          <span style={{ fontSize: '20px' }}>{cfg.icon}</span>
          <br />
          {cfg.label}
          {isNear && (
            <div style={{
              marginTop:     8,
              fontSize:      '11px',
              color:         cfg.lightColor,
              animation:     'door-pulse 0.8s ease-in-out infinite alternate',
              letterSpacing: '0.06em',
            }}>
              [ E ] Enter
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── Perimeter broken wall segment ───────────────────────────────────

function WallSegment({
  position, args, rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  args:     [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={STONE_D} roughness={0.98} />
    </mesh>
  );
}

// ─── Ruined central well / fountain ──────────────────────────────────

function RuinedFountain() {
  return (
    <group position={[0, 0, -2]}>
      {/* Base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
        <ringGeometry args={[1.1, 1.5, 16]} />
        <meshStandardMaterial color={STONE_L} roughness={0.9} />
      </mesh>
      {/* Low wall segments */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.3, 0.35, Math.sin(a) * 1.3]}
            rotation={[0, -a, 0]}>
            <boxGeometry args={[0.35, 0.5, 0.35]} />
            <meshStandardMaterial color={i % 3 === 0 ? STONE_D : STONE} roughness={0.95} />
          </mesh>
        );
      })}
      {/* Collapsed center post */}
      <mesh position={[-0.4, 0.3, 0.2]} rotation={[0.2, 0.5, 0.8]}>
        <cylinderGeometry args={[0.12, 0.15, 1.2, 6]} />
        <meshStandardMaterial color={STONE_L} roughness={0.9} />
      </mesh>
      {/* Ambient glow from stagnant water */}
      <pointLight color="#2040a0" intensity={1.5} distance={5} decay={2} position={[0, 0.4, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshStandardMaterial color="#1a2850" emissive="#1a3060" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// ─── Shadow figure (jump-scare) ───────────────────────────────────────

function ShadowFigure({ visible }: { visible: boolean }) {
  const bodyRef  = useRef<THREE.Mesh>(null);
  const headRef  = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const target = visible ? 1 : 0;
    const speed  = delta * (visible ? 6 : 3);
    [bodyRef, headRef].forEach((r) => {
      if (!r.current) return;
      (r.current.material as THREE.MeshStandardMaterial).opacity =
        THREE.MathUtils.lerp(
          (r.current.material as THREE.MeshStandardMaterial).opacity,
          target, speed,
        );
    });
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity, visible ? 2 : 0, speed,
      );
    }
  });

  return (
    <group>
      <mesh ref={bodyRef} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.55, 1.4, 0.22]} />
        <meshStandardMaterial color="#050000" transparent opacity={0}
          emissive="#300000" emissiveIntensity={0.8} depthWrite={false} />
      </mesh>
      <mesh ref={headRef} position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.28, 10, 10]} />
        <meshStandardMaterial color="#050000" transparent opacity={0}
          emissive="#300000" emissiveIntensity={0.8} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} color="#880000" intensity={0} distance={4} decay={2} />
    </group>
  );
}

function ScaryEvents({ onFlash }: { onFlash: () => void }) {
  const [idx,  setIdx]  = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    const schedule = () => {
      timer.current = window.setTimeout(() => {
        const i = Math.floor(Math.random() * 4);
        setIdx(i); setShow(true); onFlash();
        window.setTimeout(() => {
          setShow(false);
          window.setTimeout(() => { setIdx(null); schedule(); }, 800);
        }, 2_800);
      }, 25_000 + Math.random() * 55_000);
    };
    schedule();
    return () => window.clearTimeout(timer.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (idx === null) return null;
  return (
    <group position={SHADOW_POSITIONS[idx]}>
      <ShadowFigure visible={show} />
    </group>
  );
}

// ─── Full city world ──────────────────────────────────────────────────

function CityWorld({
  nearDoor,
  onDoorClick,
  onFlash,
}: {
  nearDoor:    DoorId | null;
  onDoorClick: (id: DoorId) => void;
  onFlash:     () => void;
}) {
  return (
    <group>
      {/* ── Ground ── */}
      <mesh position={[0, -0.05, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 38]} />
        <meshStandardMaterial color={FLOOR_C} roughness={1} />
      </mesh>

      {/* ── Hemisphere "moonlight" ── */}
      {/* @ts-expect-error – drei re-exports Three primitives as JSX */}
      <hemisphereLight skyColor="#1a2040" groundColor="#100a08" intensity={0.4} />

      {/* ── Four ruined buildings ── */}
      {/* West: Guild Hall (quests) — entrance faces south at z=2 */}
      <RuinedBuilding
        cx={-10} cz={-1.5}
        doorId="quests"
        isNear={nearDoor === 'quests'}
        onEnter={() => onDoorClick('quests')}
      />
      {/* East: Spellbook (skills) */}
      <RuinedBuilding
        cx={10} cz={-1.5}
        doorId="skills"
        isNear={nearDoor === 'skills'}
        onEnter={() => onDoorClick('skills')}
      />
      {/* North-west: The Forge (projects) */}
      <RuinedBuilding
        cx={-5} cz={-12}
        doorId="projects"
        isNear={nearDoor === 'projects'}
        onEnter={() => onDoorClick('projects')}
      />
      {/* North-east: Portal (contact) */}
      <RuinedBuilding
        cx={5} cz={-12}
        doorId="contact"
        isNear={nearDoor === 'contact'}
        onEnter={() => onDoorClick('contact')}
      />

      {/* ── Central ruined fountain / plaza ── */}
      <RuinedFountain />

      {/* ── Broken columns along the main path ── */}
      <BrokenColumn position={[-3.5, 0, 5]} height={2.5} />
      <BrokenColumn position={[ 3.5, 0, 5]} height={3.2} />
      <BrokenColumn position={[-3.5, 0,-5]} height={1.8} />
      <BrokenColumn position={[ 3.5, 0,-5]} height={4.0} />
      <BrokenColumn position={[-7,   0,-6]} height={2.2} />
      <BrokenColumn position={[ 7,   0,-6]} height={3.0} />

      {/* ── Scattered rubble ── */}
      <RubblePile position={[-5,  0,  6]} />
      <RubblePile position={[ 5,  0,  6]} />
      <RubblePile position={[-13, 0, -5]} />
      <RubblePile position={[ 13, 0, -5]} />
      <RubblePile position={[ -2, 0, -7]} />
      <RubblePile position={[  2, 0, -7]} />
      <RubblePile position={[-8,  0,-15]} />
      <RubblePile position={[ 8,  0,-15]} />

      {/* ── Perimeter broken walls ── */}
      {/* North */}
      <WallSegment position={[-8,  2, -18]} args={[6, 4.5, 0.5]} />
      <WallSegment position={[ 8,  1.2,-18]} args={[5, 2.5, 0.5]} />
      <WallSegment position={[ 0,  3, -18]} args={[4, 6,   0.5]} />
      {/* South */}
      <WallSegment position={[-6,  1.8, 14]} args={[5, 3.8, 0.5]} />
      <WallSegment position={[ 6,  1.2, 14]} args={[4, 2.4, 0.5]} />
      <WallSegment position={[ 0,  2.5, 14]} args={[3, 5,   0.5]} />
      {/* West */}
      <WallSegment position={[-19, 2, -2]}  args={[0.5, 4, 10]} />
      <WallSegment position={[-19, 1.4, -13]} args={[0.5, 2.8, 6]} />
      <WallSegment position={[-19, 2.8, 8]}  args={[0.5, 5.5, 5]} />
      {/* East */}
      <WallSegment position={[ 19, 2, -2]}  args={[0.5, 4, 10]} />
      <WallSegment position={[ 19, 1.4, -13]} args={[0.5, 2.8, 6]} />
      <WallSegment position={[ 19, 2.8, 8]}  args={[0.5, 5.5, 5]} />

      {/* ── Open torches / fires in the plaza ── */}
      <Torch position={[-2, 1.8,  4]} />
      <Torch position={[ 2, 1.8,  4]} />
      <Torch position={[-2, 1.8, -8]} />
      <Torch position={[ 2, 1.8, -8]} />
      <Torch position={[ 0, 1.8,  9]} />

      {/* ── Jump-scare figure ── */}
      <ScaryEvents onFlash={onFlash} />
    </group>
  );
}

// ─── Player rig ───────────────────────────────────────────────────────

function PlayerRig({ onNearDoor }: { onNearDoor: (id: DoorId | null) => void }) {
  usePlayerControls(DOOR_DEFS, onNearDoor);
  return null;
}

// ─── Pointer lock overlay ─────────────────────────────────────────────

function PointerLockOverlay({ locked }: { locked: boolean }) {
  if (locked) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', zIndex: 1, cursor: 'pointer', gap: 16,
    }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px',
        color: 'var(--color-gold)', textAlign: 'center', lineHeight: 2 }}>
        Click to enter the ruins
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        color: 'rgba(244,228,188,0.55)', textAlign: 'center', fontStyle: 'italic' }}>
        WASD to move · Mouse to look · E to enter a building
      </div>
    </div>
  );
}

// ─── World3D ──────────────────────────────────────────────────────────

const HUD_CONFIG: Record<DoorId, { label: string; color: string; icon: string }> = {
  quests:   { label: 'Guild Hall',  color: '#cc2222', icon: '⚔'  },
  skills:   { label: 'Spellbook',   color: '#2da091', icon: '📖' },
  projects: { label: 'The Forge',   color: '#dc6414', icon: '🔨' },
  contact:  { label: 'Portal',      color: '#8855cc', icon: '🔮' },
};

export default function World3D() {
  const [nearDoor,    setNearDoor]    = useState<DoorId | null>(null);
  const [locked,      setLocked]      = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const nearDoorRef = useRef<DoorId | null>(null);

  useEffect(() => { nearDoorRef.current = nearDoor; }, [nearDoor]);

  // Release pointer lock whenever a quest modal or panel opens
  useEffect(() => {
    const unlock = () => controlsRef.current?.unlock();
    window.addEventListener('cv:buildingClicked', unlock);
    window.addEventListener('cv:openPanel',       unlock);
    return () => {
      window.removeEventListener('cv:buildingClicked', unlock);
      window.removeEventListener('cv:openPanel',       unlock);
    };
  }, []);

  const dispatchDoor = useCallback((id: DoorId) => {
    window.dispatchEvent(new CustomEvent('cv:buildingClicked', { detail: { id } }));
  }, []);

  const triggerFlash = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 600);
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (!locked) { controlsRef.current?.lock(); return; }
    if (nearDoorRef.current) dispatchDoor(nearDoorRef.current);
  }, [locked, dispatchDoor]);

  const near = nearDoor ? HUD_CONFIG[nearDoor] : null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} onClick={handleCanvasClick}>
      <PointerLockOverlay locked={locked} />

      {/* Crosshair */}
      {locked && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', zIndex: 2, pointerEvents: 'none',
          color: near ? near.color : 'rgba(255,255,255,0.45)',
          fontSize: near ? '22px' : '12px',
          textShadow: near ? `0 0 10px ${near.color}` : 'none',
          transition: 'color 0.2s, font-size 0.2s',
        }}>
          {near ? near.icon : '·'}
        </div>
      )}

      {/* Door HUD */}
      {locked && near && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%',
          transform: 'translateX(-50%)', zIndex: 2, pointerEvents: 'none',
          textAlign: 'center', animation: 'door-pulse 0.8s ease-in-out infinite alternate',
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: '11px',
            color: near.color, textShadow: `0 0 12px ${near.color}`,
            letterSpacing: '0.05em', marginBottom: 4,
          }}>
            [ E ]  {near.label}
          </div>
          <div style={{
            fontFamily: "'Crimson Text', Georgia, serif", fontSize: '0.82rem',
            color: 'rgba(244,228,188,0.5)', fontStyle: 'italic',
          }}>
            click or press E to enter
          </div>
        </div>
      )}

      {/* Scare flash */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(120,0,0,0) 30%, rgba(180,0,0,0.65) 100%)',
        opacity: flashActive ? 1 : 0,
        transition: flashActive ? 'opacity 0.05s' : 'opacity 0.55s ease-out',
      }} />

      <Canvas
        camera={{ fov: 75, near: 0.1, far: 80, position: [0, 1.7, 11] }}
        gl={{ antialias: true }}
      >
        {/* Dark overcast sky fog */}
        <fog attach="fog" args={['#0c0a08', 10, 32]} />
        <ambientLight intensity={0.12} />

        <PointerLockControls
          ref={controlsRef as Ref<PointerLockControlsImpl>}
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />

        <PlayerRig onNearDoor={setNearDoor} />
        <CityWorld nearDoor={nearDoor} onDoorClick={dispatchDoor} onFlash={triggerFlash} />
      </Canvas>
    </div>
  );
}
