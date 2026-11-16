"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  The digital twin's robot: a small friendly humanoid that walks a loop
//  through the place (its `robot` path in hotspots.ts) with "Digital Twin"
//  above its head. Clicking it opens the twin, like the hologram. It stops
//  while hovered, so it's easy to click, and stands still for reduced motion.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, RoundedBox, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { useT } from "@/components/I18nProvider";
import { useRoom, type RoomProps } from "./parts";

const SPEED = 0.55; // metres a second
const BODY = "#f1f3f7";
const JOINT = "#8d97ab";

// Turn by the short way round.
const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

export function Robot({ room, path }: { room: RoomProps; path: [number, number][] }) {
  const { C } = useRoom();
  const label = useT().scene.robotTag;
  const root = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const eyes = useRef<THREE.Group>(null);
  const walked = useRef(0);
  const stride = useRef(0);
  const hovered = room.hovered === "twin";
  useCursor(hovered);

  // The loop's corners and how far along it each one is.
  const loop = useMemo(() => {
    const pts = path.map(([x, z]) => new THREE.Vector2(x, z));
    const at = [0];
    for (let i = 0; i < pts.length; i++) at.push(at[i] + pts[i].distanceTo(pts[(i + 1) % pts.length]));
    return { pts, at, length: at[pts.length] };
  }, [path]);

  useFrame(({ clock }, dt) => {
    const g = root.current;
    if (!g) return;
    const walking = !room.calm && !hovered && room.active !== "twin" && loop.length > 0;
    if (walking) {
      walked.current = (walked.current + SPEED * dt) % loop.length;
      stride.current += dt * 7.5;
    }
    // Where on the loop we are, and which way that leg of it goes.
    const d = walked.current;
    let i = 0;
    while (i < loop.pts.length - 1 && loop.at[i + 1] <= d) i++;
    const a = loop.pts[i];
    const b = loop.pts[(i + 1) % loop.pts.length];
    const t = (d - loop.at[i]) / Math.max(1e-6, loop.at[i + 1] - loop.at[i]);
    g.position.set(a.x + (b.x - a.x) * t, 0, a.y + (b.y - a.y) * t);
    // Face the way it walks; stopped, face the visitor (the camera side of the place).
    const heading = walking ? Math.atan2(b.x - a.x, b.y - a.y) : Math.PI / 4;
    g.rotation.y += angleTo(g.rotation.y, heading) * Math.min(1, dt * 6);

    // Swing arms and legs while walking; settle when stopped.
    const swing = walking ? Math.sin(stride.current) * 0.55 : 0;
    legs.current.forEach((leg, k) => leg && (leg.rotation.x = THREE.MathUtils.damp(leg.rotation.x, k ? -swing : swing, 12, dt)));
    arms.current.forEach((arm, k) => arm && (arm.rotation.x = THREE.MathUtils.damp(arm.rotation.x, k ? swing * 0.8 : -swing * 0.8, 12, dt)));
    g.position.y = walking ? Math.abs(Math.sin(stride.current)) * 0.025 : 0;
    // A blink every few seconds.
    if (eyes.current) eyes.current.scale.y = clock.elapsedTime % 3.6 < 0.12 ? 0.15 : 1;
  });

  const glow = new THREE.Color(C.teal).multiplyScalar(2);
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    room.setHovered("twin");
  };

  return (
    <group
      ref={root}
      position={[path[0][0], 0, path[0][1]]}
      onPointerOver={over}
      onPointerOut={() => hovered && room.setHovered(null)}
      onClick={(e) => {
        e.stopPropagation();
        room.onSelect("twin");
      }}
    >
      {/* legs, hinged at the hip */}
      {[-0.1, 0.1].map((x, k) => (
        <group key={x} ref={(el) => void (legs.current[k] = el)} position={[x, 0.5, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.3, 6, 12]} />
            <meshStandardMaterial color={JOINT} roughness={0.5} metalness={0.4} />
          </mesh>
          <RoundedBox args={[0.13, 0.07, 0.2]} radius={0.03} position={[0, -0.47, 0.03]} castShadow>
            <meshStandardMaterial color={BODY} roughness={0.35} />
          </RoundedBox>
        </group>
      ))}

      {/* body */}
      <RoundedBox args={[0.44, 0.46, 0.3]} radius={0.1} position={[0, 0.78, 0]} castShadow>
        <meshStandardMaterial color={BODY} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.82, 0.152]}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>

      {/* arms, hinged at the shoulder */}
      {[-0.29, 0.29].map((x, k) => (
        <group key={x} ref={(el) => void (arms.current[k] = el)} position={[x, 0.95, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.26, 6, 12]} />
            <meshStandardMaterial color={JOINT} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.36, 0]} castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color={BODY} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* head: a rounded screen with two glowing eyes */}
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.06, 12]} />
        <meshStandardMaterial color={JOINT} />
      </mesh>
      <RoundedBox args={[0.4, 0.31, 0.32]} radius={0.11} position={[0, 1.22, 0]} castShadow>
        <meshStandardMaterial color={BODY} roughness={0.35} />
      </RoundedBox>
      <RoundedBox args={[0.32, 0.17, 0.02]} radius={0.008} position={[0, 1.22, 0.158]}>
        <meshStandardMaterial color="#1b2333" roughness={0.2} metalness={0.3} />
      </RoundedBox>
      <group ref={eyes} position={[0, 1.225, 0.17]}>
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <circleGeometry args={[0.03, 20]} />
            <meshBasicMaterial color={glow} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 1.44, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
        <meshStandardMaterial color={JOINT} />
      </mesh>
      <mesh position={[0, 1.51, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>

      {room.active === null && (
        <Html position={[0, 1.72, 0]} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
          <div className="robot-tag">{label}</div>
        </Html>
      )}
    </group>
  );
}
