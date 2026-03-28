import { useRef, useState, useCallback, type Ref } from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import type { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';
import { usePlayerControls } from './usePlayerControls';
import type { DoorId, DoorDef } from './usePlayerControls';

// ── Palette ─────────────────────────────────────────────────────────
const WALL_COLOR  = '#2a2018';
const FLOOR_COLOR = '#1e1810';
const CEIL_COLOR  = '#1a1510';

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
      <pointLight color="#ff7020" intensity={1.8} distance={7} decay={2} castShadow />
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ffaa40" emissive="#ff7020" emissiveIntensity={2} />
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
        intensity={isNear ? 2.5 : 1.2}
        distance={5}
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

      {/* HTML label */}
      <Html
        position={[0, doorH + 0.5, 0]}
        center
        occlude={false}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily:    'var(--font-pixel)',
          fontSize:      '11px',
          color:         isNear ? '#ffffff' : 'rgba(255,255,255,0.55)',
          textAlign:     'center',
          whiteSpace:    'nowrap',
          textShadow:    '0 0 8px ' + cfg.lightColor,
          transition:    'color 0.3s, text-shadow 0.3s',
          pointerEvents: 'none',
        }}>
          {cfg.icon} {cfg.label}
          {isNear && (
            <div style={{
              marginTop:  4,
              fontSize:   '9px',
              color:      cfg.lightColor,
              animation:  'door-pulse 1s ease-in-out infinite alternate',
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
  // Center of the corridor segment
  cx, cz,
  width, length, // width = X extent, length = Z extent
}: {
  cx: number; cz: number;
  width: number; length: number;
}) {
  const hw = width  / 2;
  const hl = length / 2;
  const y  = ARM_H  / 2;

  return (
    <group position={[cx, 0, cz]}>
      {/* Floor */}
      <Box position={[0, 0, 0]}           args={[width, 0.1, length]}   color={FLOOR_COLOR} />
      {/* Ceiling */}
      <Box position={[0, ARM_H, 0]}       args={[width, 0.1, length]}   color={CEIL_COLOR}  />
      {/* Walls along Z (left/right when moving along Z axis) */}
      <Box position={[-hw, y, 0]}         args={[0.1, ARM_H, length]}   color={WALL_COLOR}  />
      <Box position={[+hw, y, 0]}         args={[0.1, ARM_H, length]}   color={WALL_COLOR}  />
      {/* Walls along X (front/back when moving along X axis) */}
      <Box position={[0, y, -hl]}         args={[width, ARM_H, 0.1]}    color={WALL_COLOR}  />
      <Box position={[0, y, +hl]}         args={[width, ARM_H, 0.1]}    color={WALL_COLOR}  />
    </group>
  );
}

// ── Full world ────────────────────────────────────────────────────────

function CorridorWorld({
  nearDoor,
  onDoorClick,
}: {
  nearDoor: DoorId | null;
  onDoorClick: (id: DoorId) => void;
}) {
  const halfArm = ARM_L / 2;

  return (
    <group>
      {/* Center crossroads */}
      <CorridorSegment cx={0} cz={0} width={ARM_W + CTR * 2} length={ARM_W + CTR * 2} />

      {/* North arm (−Z) */}
      <CorridorSegment cx={0} cz={-(CTR + halfArm)} width={ARM_W} length={ARM_L} />
      {/* South arm (+Z) */}
      <CorridorSegment cx={0} cz={+(CTR + halfArm)} width={ARM_W} length={ARM_L} />
      {/* West arm (−X) */}
      <CorridorSegment cx={-(CTR + halfArm)} cz={0} width={ARM_L} length={ARM_W} />
      {/* East arm (+X) */}
      <CorridorSegment cx={+(CTR + halfArm)} cz={0} width={ARM_L} length={ARM_W} />

      {/* End walls for each arm */}
      {/* North */}
      <Box position={[0, ARM_H / 2, -(CTR + ARM_L)]} args={[ARM_W, ARM_H, 0.1]} color={WALL_COLOR} />
      {/* South */}
      <Box position={[0, ARM_H / 2, +(CTR + ARM_L)]} args={[ARM_W, ARM_H, 0.1]} color={WALL_COLOR} />
      {/* West */}
      <Box position={[-(CTR + ARM_L), ARM_H / 2, 0]} args={[0.1, ARM_H, ARM_W]} color={WALL_COLOR} />
      {/* East */}
      <Box position={[+(CTR + ARM_L), ARM_H / 2, 0]} args={[0.1, ARM_H, ARM_W]} color={WALL_COLOR} />

      {/* Torches near crossroads */}
      <Torch position={[-1.2, 2.8, -1.2]} />
      <Torch position={[+1.2, 2.8, -1.2]} />
      <Torch position={[-1.2, 2.8, +1.2]} />
      <Torch position={[+1.2, 2.8, +1.2]} />

      {/* Mid-arm torches */}
      <Torch position={[-1.3, 2.8, -(CTR + halfArm)]} />
      <Torch position={[+1.3, 2.8, -(CTR + halfArm)]} />
      <Torch position={[-1.3, 2.8, +(CTR + halfArm)]} />
      <Torch position={[+1.3, 2.8, +(CTR + halfArm)]} />
      <Torch position={[-(CTR + halfArm), 2.8, -1.3]} />
      <Torch position={[-(CTR + halfArm), 2.8, +1.3]} />
      <Torch position={[+(CTR + halfArm), 2.8, -1.3]} />
      <Torch position={[+(CTR + halfArm), 2.8, +1.3]} />

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

export default function World3D() {
  const [nearDoor, setNearDoor] = useState<DoorId | null>(null);
  const [locked,   setLocked]   = useState(false);
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);

  const handleDoorClick = useCallback((id: DoorId) => {
    window.dispatchEvent(new CustomEvent('cv:buildingClicked', { detail: { id } }));
  }, []);

  const handleCanvasClick = () => {
    if (!locked) {
      controlsRef.current?.lock();
    }
  };

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={handleCanvasClick}
    >
      <PointerLockOverlay locked={locked} />

      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 80, position: [0, 1.7, 0] }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={['#0a0806', 8, 40]} />
        <ambientLight intensity={0.06} />

        <PointerLockControls
          ref={controlsRef as Ref<PointerLockControlsImpl>}
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />

        <PlayerRig onNearDoor={setNearDoor} />

        <CorridorWorld nearDoor={nearDoor} onDoorClick={handleDoorClick} />
      </Canvas>
    </div>
  );
}
