import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type DoorId = 'quests' | 'skills' | 'projects' | 'contact';

export interface DoorDef {
  id:       DoorId;
  position: [number, number, number];
}

const SPEED           = 4;
const PROXIMITY_DIST  = 2.5;

// Corridor bounds (keep player inside the cross)
// Cross arms: each is 3 wide, 8 long. Center 4×4.
// Along X axis: -10 to +10
// Along Z axis: -10 to +10
// But only inside the cross shape, not corners.
// Simple approach: clamp to a generous box; walls handle the feel.
const BOUNDS = { minX: -9.5, maxX: 9.5, minZ: -9.5, maxZ: 9.5 };

function clampToBounds(pos: THREE.Vector3) {
  // Cross-shaped corridor: allow movement in the cross but block corners.
  // Arm half-width = 1.5 (3 units wide). Cross center half-size = 2.
  const inHorizontalArm = Math.abs(pos.z) <= 1.5;
  const inVerticalArm   = Math.abs(pos.x) <= 1.5;
  const inCenter        = Math.abs(pos.x) <= 2 && Math.abs(pos.z) <= 2;

  if (!inHorizontalArm && !inVerticalArm && !inCenter) {
    // We're in a corner — push back to nearest arm
    const clampedX = Math.max(-1.5, Math.min(1.5, pos.x));
    const clampedZ = Math.max(-1.5, Math.min(1.5, pos.z));
    if (Math.abs(pos.x) > Math.abs(pos.z)) {
      // Closer to horizontal arm wall
      pos.z = clampedZ;
    } else {
      pos.x = clampedX;
    }
  }

  // Hard bounds
  pos.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, pos.x));
  pos.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, pos.z));
}

export function usePlayerControls(
  doors: DoorDef[],
  onNearDoor: (id: DoorId | null) => void,
) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const nearDoorRef = useRef<DoorId | null>(null);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // E-key door entry
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearDoorRef.current) {
        window.dispatchEvent(
          new CustomEvent('cv:buildingClicked', { detail: { id: nearDoorRef.current } }),
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((_, delta) => {
    const k = keys.current;
    const forward  = k['KeyW'] || k['ArrowUp'];
    const backward = k['KeyS'] || k['ArrowDown'];
    const left     = k['KeyA'] || k['ArrowLeft'];
    const right    = k['KeyD'] || k['ArrowRight'];

    if (forward || backward || left || right) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();

      const strafe = new THREE.Vector3(-dir.z, 0, dir.x);

      const move = new THREE.Vector3();
      if (forward)  move.add(dir);
      if (backward) move.sub(dir);
      if (left)     move.sub(strafe);
      if (right)    move.add(strafe);

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(SPEED * delta);
        camera.position.add(move);
        clampToBounds(camera.position);
        camera.position.y = 1.7; // keep eye height
      }
    }

    // Proximity check
    const camPos = camera.position;
    let nearest: DoorId | null = null;
    let nearestDist = PROXIMITY_DIST;
    for (const door of doors) {
      const d = new THREE.Vector3(...door.position).distanceTo(camPos);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = door.id;
      }
    }

    if (nearest !== nearDoorRef.current) {
      nearDoorRef.current = nearest;
      onNearDoor(nearest);
    }
  });
}
