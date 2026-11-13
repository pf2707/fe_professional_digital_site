"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  The studio diorama. Built entirely from primitives + canvas textures so
//  there are no model files to download. Each section of the CV lives in
//  one object, wrapped in <Hotspot>.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Float, Html, RoundedBox, Sparkles, useCursor, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Certificate } from "@/lib/profile";
import { MOTTO, type HotspotId } from "./hotspots";
import { useHotspots, useStudioData } from "./StudioData";
import {
  drawCertificate,
  drawCorkboard,
  drawInitials,
  drawLabel,
  drawNeon,
  drawSkyline,
  drawTerminal,
  useCanvasTexture,
} from "./textures";

// The room's colours come from the CV's design (lib/designs.ts).
function useRoom() {
  const { design, profile } = useStudioData();
  return { C: design.palette, profile };
}

export type RoomProps = {
  active: HotspotId | null;
  hovered: HotspotId | null;
  setHovered: (id: HotspotId | null) => void;
  onSelect: (id: HotspotId) => void;
  onToggleLights: () => void;
  night: boolean;
  calm: boolean; // prefers-reduced-motion
};

// ── Clickable wrapper ───────────────────────────────────────────────────────
function Hotspot({
  id,
  room,
  labelAt,
  pivot = [0, 0, 0],
  children,
}: {
  id: HotspotId;
  room: RoomProps;
  labelAt: [number, number, number];
  pivot?: [number, number, number]; // the hover lift scales around this point
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const isHover = room.hovered === id && room.active === null;
  useCursor(room.hovered === id);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, isHover ? 1.035 : 1, 10, dt);
    g.scale.setScalar(s);
  });

  const hotspots = useHotspots();
  const hint = id === "motto" ? MOTTO.hint : (hotspots.find((h) => h.id === id)?.hint ?? "");

  return (
    <group
      ref={ref}
      position={pivot}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        room.setHovered(id);
      }}
      onPointerOut={() => room.hovered === id && room.setHovered(null)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        room.onSelect(id);
      }}
    >
      <group position={[-pivot[0], -pivot[1], -pivot[2]]}>{children}</group>
      {isHover && (
        <Html position={[labelAt[0] - pivot[0], labelAt[1] - pivot[1], labelAt[2] - pivot[2]]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="scene-label">{hint}</div>
        </Html>
      )}
    </group>
  );
}

function Box({
  size,
  position,
  color,
  rough = 0.8,
  metal = 0,
  rotation,
  shadow = true,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  rough?: number;
  metal?: number;
  rotation?: [number, number, number];
  shadow?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

// ── Shell: plinth, floor, two walls, window ─────────────────────────────────
function Shell({ night }: { night: boolean }) {
  const { C } = useRoom();
  const sky = useCanvasTexture(drawSkyline(night), 1024, 768, [night]);
  const wall = night ? C.wallNight : C.wall;
  return (
    <group>
      <Box size={[9.2, 0.7, 9.2]} position={[0.1, -0.65, 0.1]} color={C.base} rough={0.6} />
      <Box size={[8.4, 0.3, 8.4]} position={[0, -0.15, 0]} color={C.floor} rough={0.55} />
      {/* floor boards */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[-4 + i * 0.76, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, 8.4]} />
          <meshBasicMaterial color="#3d281b" transparent opacity={0.5} />
        </mesh>
      ))}
      <Box size={[8.4, 4.4, 0.3]} position={[0, 2.2, -4.15]} color={wall} rough={0.95} />
      <Box size={[0.3, 4.4, 8.4]} position={[-4.15, 2.2, 0]} color={wall} rough={0.95} />
      {/* skirting */}
      <Box size={[8.4, 0.16, 0.04]} position={[0, 0.08, -3.98]} color={C.woodDark} />
      <Box size={[0.04, 0.16, 8.4]} position={[-3.98, 0.08, 0]} color={C.woodDark} />

      {/* window */}
      <group position={[-1.25, 2.45, -3.99]}>
        <mesh>
          <planeGeometry args={[1.7, 1.6]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        <Box size={[1.86, 0.08, 0.1]} position={[0, 0.84, 0.03]} color={C.woodDark} />
        <Box size={[1.86, 0.12, 0.22]} position={[0, -0.84, 0.08]} color={C.woodDark} />
        <Box size={[0.08, 1.7, 0.1]} position={[-0.89, 0, 0.03]} color={C.woodDark} />
        <Box size={[0.08, 1.7, 0.1]} position={[0.89, 0, 0.03]} color={C.woodDark} />
        <Box size={[0.04, 1.6, 0.06]} position={[0, 0, 0.03]} color={C.woodDark} />
      </group>
    </group>
  );
}

// ── Desk, monitor (Work), lamp (lights switch), chair ───────────────────────
function Desk({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const lines = profile.studio.terminal;
  const [step, setStep] = useState(room.calm ? lines.length : 1);
  useEffect(() => {
    if (room.calm) return;
    const t = setInterval(() => setStep((s) => (s >= lines.length + 6 ? 1 : s + 1)), 700);
    return () => clearInterval(t);
  }, [room.calm, lines.length]);
  const screen = useCanvasTexture(drawTerminal(lines, step), 1024, 576, [step, lines.join("\n")]);
  const [lampHover, setLampHover] = useState(false);
  useCursor(lampHover);

  return (
    <group>
      {/* desk */}
      <Box size={[2.7, 0.08, 1.15]} position={[0.9, 1.15, -3.35]} color={C.wood} rough={0.5} />
      {[
        [-0.4, -3.85],
        [2.2, -3.85],
        [-0.4, -2.85],
        [2.2, -2.85],
      ].map(([x, z], i) => (
        <Box key={i} size={[0.07, 1.12, 0.07]} position={[x, 0.56, z]} color={C.metal} metal={0.6} rough={0.4} />
      ))}

      <Hotspot id="work" room={room} labelAt={[0.9, 2.75, -3.4]}>
        <Box size={[0.08, 0.5, 0.08]} position={[0.9, 1.43, -3.62]} color={C.metal} metal={0.6} rough={0.4} />
        <Box size={[0.5, 0.03, 0.3]} position={[0.9, 1.205, -3.6]} color={C.metal} metal={0.6} rough={0.4} />
        <RoundedBox args={[1.62, 0.96, 0.06]} radius={0.03} position={[0.9, 2.05, -3.62]} castShadow>
          <meshStandardMaterial color="#141a26" roughness={0.3} metalness={0.4} />
        </RoundedBox>
        <mesh position={[0.9, 2.05, -3.585]}>
          <planeGeometry args={[1.52, 0.86]} />
          <meshBasicMaterial map={screen} toneMapped={false} color={[1.35, 1.35, 1.35]} />
        </mesh>
        <pointLight position={[0.9, 2.0, -3.0]} color={C.teal} intensity={room.night ? 1.6 : 0.3} distance={2.5} decay={2} />
        {/* keyboard + mouse */}
        <RoundedBox args={[0.9, 0.03, 0.28]} radius={0.01} position={[0.8, 1.21, -3.05]}>
          <meshStandardMaterial color="#2b3142" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.04, 0.16]} radius={0.02} position={[1.45, 1.215, -3.02]}>
          <meshStandardMaterial color="#2b3142" roughness={0.6} />
        </RoundedBox>
      </Hotspot>

      {/* mug */}
      <mesh position={[-0.05, 1.27, -3.0]} castShadow>
        <cylinderGeometry args={[0.07, 0.065, 0.16, 20]} />
        <meshStandardMaterial color="#e9e2d4" roughness={0.4} />
      </mesh>

      {/* desk lamp — clicking it switches the lights (theme) */}
      <group
        position={[-0.1, 1.19, -3.65]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLampHover(true);
        }}
        onPointerOut={() => setLampHover(false)}
        onClick={(e) => {
          e.stopPropagation();
          room.onToggleLights();
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.04, 24]} />
          <meshStandardMaterial color={C.metal} metalness={0.7} roughness={0.35} />
        </mesh>
        <Box size={[0.03, 0.62, 0.03]} position={[0.08, 0.3, 0.02]} rotation={[0, 0, -0.25]} color={C.metal} />
        <group position={[0.2, 0.62, 0.12]} rotation={[0.5, 0, -0.6]}>
          <mesh castShadow>
            <coneGeometry args={[0.13, 0.2, 24, 1, true]} />
            <meshStandardMaterial color={C.amber} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={room.night ? [4, 2.6, 1.2] : [1, 0.9, 0.7]} toneMapped={false} />
          </mesh>
        </group>
        {lampHover && (
          <Html position={[0.2, 1.0, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div className="scene-label">{room.night ? "Turn the lights on" : "Turn the lights off"}</div>
          </Html>
        )}
      </group>

      {/* chair */}
      <group position={[0.9, 0, -2.25]} rotation={[0, 0.25, 0]}>
        <RoundedBox args={[0.7, 0.1, 0.65]} radius={0.04} position={[0, 0.72, 0]} castShadow>
          <meshStandardMaterial color="#232a3a" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.66, 0.8, 0.09]} radius={0.04} position={[0, 1.2, 0.32]} rotation={[-0.12, 0, 0]} castShadow>
          <meshStandardMaterial color="#232a3a" roughness={0.7} />
        </RoundedBox>
        <Box size={[0.06, 0.62, 0.06]} position={[0, 0.36, 0]} color={C.metal} metal={0.7} rough={0.3} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            size={[0.34, 0.04, 0.05]}
            position={[Math.cos((i * Math.PI * 2) / 5) * 0.17, 0.06, Math.sin((i * Math.PI * 2) / 5) * 0.17]}
            rotation={[0, -(i * Math.PI * 2) / 5, 0]}
            color={C.metal}
          />
        ))}
      </group>
    </group>
  );
}

// ── Agent rack (Stack) ──────────────────────────────────────────────────────
function Rack({ room }: { room: RoomProps }) {
  const { C } = useRoom();
  const leds = useRef<THREE.MeshBasicMaterial[]>([]);
  const ledLayout = useMemo(
    () =>
      Array.from({ length: 7 }).flatMap((_, row) =>
        Array.from({ length: 5 }).map((__, col) => ({
          pos: [2.88 + col * 0.09, 0.55 + row * 0.3, -2.84] as [number, number, number],
          phase: (row * 5 + col) * 1.7,
          color: (row + col) % 4 === 0 ? C.amber : C.teal,
        })),
      ),
    [C.amber, C.teal],
  );

  useFrame(({ clock }) => {
    if (room.calm) return;
    const t = clock.elapsedTime;
    leds.current.forEach((m, i) => {
      const on = Math.sin(t * (2 + (i % 5)) + ledLayout[i].phase) > -0.2;
      m.opacity = on ? 1 : 0.15;
    });
  });

  return (
    <Hotspot id="stack" room={room} labelAt={[3.25, 3.0, -3.3]}>
      <RoundedBox args={[1.05, 2.5, 0.95]} radius={0.04} position={[3.25, 1.25, -3.3]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a2131" roughness={0.45} metalness={0.5} />
      </RoundedBox>
      {Array.from({ length: 7 }).map((_, row) => (
        <Box
          key={row}
          size={[0.92, 0.22, 0.02]}
          position={[3.25, 0.55 + row * 0.3, -2.83]}
          color="#262f45"
          rough={0.35}
          metal={0.6}
          shadow={false}
        />
      ))}
      {ledLayout.map((l, i) => (
        <mesh key={i} position={[l.pos[0], l.pos[1], l.pos[2] + 0.015]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) leds.current[i] = m;
            }}
            color={new THREE.Color(l.color).multiplyScalar(3)}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
      {/* vent lines on the right of each unit */}
      {Array.from({ length: 7 }).map((_, row) => (
        <Box
          key={row}
          size={[0.32, 0.015, 0.01]}
          position={[3.52, 0.55 + row * 0.3, -2.82]}
          color="#0f1420"
          shadow={false}
        />
      ))}
      <pointLight position={[3.25, 1.4, -2.4]} color={C.teal} intensity={room.night ? 2.5 : 0.6} distance={3} decay={2} />
    </Hotspot>
  );
}

// ── Certificates on the left wall (Certificates) + neon name sign ───────────
function Certificate({ cert, z }: { cert: Certificate; z: number }) {
  const { C, profile } = useRoom();
  const tex = useCanvasTexture(drawCertificate(cert, profile.name), 640, 820, [JSON.stringify(cert), profile.name]);
  return (
    <group position={[-3.97, 2.3, z]} rotation={[0, Math.PI / 2, 0]}>
      <Box size={[0.98, 1.24, 0.05]} position={[0, 0, 0]} color={C.woodDark} rough={0.4} />
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.86, 1.1]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}

function CertWall({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const neon = useCanvasTexture(drawNeon(profile.studio.neon, C.teal), 1680, 440, [profile.studio.neon, C.teal]);
  return (
    <>
      <Hotspot id="certs" room={room} labelAt={[-3.6, 3.2, -0.6]}>
        {/* The wall has room for three frames; newest first. */}
        {profile.certificates.slice(0, 3).map((c, i) => (
          <Certificate key={c.title} cert={c} z={0.6 - i * 1.25} />
        ))}
      </Hotspot>
      <Hotspot id="motto" room={room} labelAt={[-3.6, 3.0, -0.65]} pivot={MOTTO.center}>
        <mesh position={MOTTO.center} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={MOTTO.size} />
          {/* Kept at or below 1 so bloom doesn't smear the letters. */}
          <meshBasicMaterial map={neon} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Hotspot>
    </>
  );
}

// ── Corkboard (Career) ──────────────────────────────────────────────────────
function Corkboard({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const tex = useCanvasTexture(drawCorkboard(profile.experience), 1280, 560, [JSON.stringify(profile.experience)]);
  return (
    <Hotspot id="career" room={room} labelAt={[0.9, 4.1, -3.8]}>
      <Box size={[2.5, 1.14, 0.06]} position={[0.9, 3.32, -3.97]} color={C.woodDark} />
      <mesh position={[0.9, 3.32, -3.935]}>
        <planeGeometry args={[2.36, 1.03]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </Hotspot>
  );
}

// ── Filing cabinet (Mobile archive) ─────────────────────────────────────────
function Drawer({ index, pull, label }: { index: number; pull: number; label: string }) {
  const { C } = useRoom();
  const ref = useRef<THREE.Group>(null);
  const tex = useCanvasTexture(drawLabel(label), 320, 96, [label]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, pull, 6, dt);
  });
  const y = 1.66 - index * 0.46;
  return (
    <group ref={ref}>
      <group position={[-3.2, y, -2.73]}>
        <Box size={[0.98, 0.4, 0.05]} position={[0, 0, 0]} color={C.wood} rough={0.55} />
        <Box size={[0.3, 0.04, 0.05]} position={[0, -0.07, 0.05]} color="#c9a96a" metal={0.8} rough={0.3} />
        <mesh position={[0, 0.07, 0.027]}>
          <planeGeometry args={[0.36, 0.11]} />
          <meshStandardMaterial map={tex} />
        </mesh>
        {/* tray + folder tabs, visible when pulled out */}
        <Box size={[0.9, 0.3, 0.75]} position={[0, -0.03, -0.4]} color={C.woodDark} />
        {["#e5d3a8", "#d9c08a", "#e8dcc0", "#cfb57e", "#e5d3a8", "#d9c08a"].map((c, i) => (
          <Box
            key={i}
            size={[0.82, 0.3, 0.012]}
            position={[0, 0.05, -0.12 - i * 0.1]}
            color={c}
            rough={0.95}
            shadow={false}
          />
        ))}
      </group>
    </group>
  );
}

function Cabinet({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const open = room.active === "archive";
  const peek = room.hovered === "archive" && !room.active;
  return (
    <Hotspot id="archive" room={room} labelAt={[-3.2, 2.5, -3.0]}>
      <Box size={[1.1, 1.98, 0.9]} position={[-3.2, 0.99, -3.2]} color={C.woodDark} rough={0.6} />
      <Box size={[1.16, 0.06, 0.96]} position={[-3.2, 2.01, -3.2]} color={C.wood} rough={0.45} />
      {[0, 1, 2, 3].map((i) => profile.studio.drawers[i] ?? "").map((label, i) => (
        <Drawer key={i} index={i} label={label} pull={i === 0 ? (open ? 0.62 : peek ? 0.12 : 0) : 0} />
      ))}
      {/* a little dust over the archive (not clickable, so it can't cover the phone) */}
      {!room.calm && <Sparkles raycast={() => null} count={14} scale={[1.2, 1.2, 1.2]} position={[-3.2, 2.5, -3.0]} size={2} speed={0.2} color="#f6e6c4" opacity={0.6} />}
      {/* old phones resting on top: the mobile era */}
      <RoundedBox args={[0.2, 0.02, 0.4]} radius={0.01} position={[-2.8, 2.05, -3.42]} rotation={[0, -0.2, 0]}>
        <meshStandardMaterial color="#d8d8dc" roughness={0.3} metalness={0.5} />
      </RoundedBox>
    </Hotspot>
  );
}

// ── Telephone on the cabinet: click to call ─────────────────────────────────
// Not a CV section, so it isn't a <Hotspot>: it has no panel or dock entry,
// it just dials. The About panel has the same number as a link.
function Telephone({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const body = useRef<THREE.Group>(null);
  const handset = useRef<THREE.Group>(null);
  const waves = useRef<THREE.Mesh[]>([]);
  const [hover, setHover] = useState(false);
  useCursor(hover);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const ringing = hover && !room.calm;
    // Old-phone ring: bursts of rattling with short pauses in between.
    const burst = ringing && t % 1.2 < 0.8;
    if (body.current) {
      body.current.rotation.y = burst ? Math.sin(t * 50) * 0.06 : 0;
      body.current.position.y = burst ? Math.abs(Math.sin(t * 50)) * 0.006 : 0;
    }
    const h = handset.current;
    if (h) {
      // The handset jumps in its cradle while ringing and lifts on hover.
      const hop = burst ? Math.abs(Math.sin(t * 25)) * 0.035 : 0;
      h.position.y = THREE.MathUtils.damp(h.position.y, hover ? 0.2 + hop : 0.155, 18, dt);
      h.rotation.z = burst ? Math.sin(t * 38) * 0.14 : THREE.MathUtils.damp(h.rotation.z, 0, 10, dt);
      h.rotation.x = burst ? Math.sin(t * 31) * 0.06 : THREE.MathUtils.damp(h.rotation.x, 0, 10, dt);
    }
    // Rings of sound spreading out from the phone.
    waves.current.forEach((m, k) => {
      const p = (t * 0.9 + k / 3) % 1;
      m.scale.setScalar(0.6 + p * 2.2);
      (m.material as THREE.MeshBasicMaterial).opacity = ringing ? (1 - p) * 0.75 : 0;
    });
  });

  const red = "#c2412d";
  return (
    <group
      position={[-3.3, 2.04, -3.0]}
      rotation={[0, 0.55, 0]}
      scale={1.7}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        room.setHovered(null);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        window.location.href = `tel:${profile.phone.replace(/[^\d+]/g, "")}`;
      }}
    >
      <group ref={body}>
        <RoundedBox args={[0.36, 0.11, 0.28]} radius={0.03} position={[0, 0.055, 0]} castShadow>
          <meshStandardMaterial color={red} roughness={0.35} />
        </RoundedBox>
        {/* rotary dial on the sloped front */}
        <group position={[0, 0.1, 0.09]} rotation={[0.5, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.012, 28]} />
            <meshStandardMaterial color="#f1e6d0" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.01, 20]} />
            <meshStandardMaterial color={red} roughness={0.35} />
          </mesh>
        </group>
        {/* cradle prongs */}
        {[-0.12, 0.12].map((x) => (
          <Box key={x} size={[0.04, 0.05, 0.05]} position={[x, 0.125, -0.05]} color={red} rough={0.35} />
        ))}
        {/* handset */}
        <group ref={handset} position={[0, 0.155, -0.05]}>
          <Box size={[0.3, 0.035, 0.06]} position={[0, 0.01, 0]} color={red} rough={0.35} />
          {[-0.15, 0.15].map((x) => (
            <mesh key={x} position={[x, -0.01, 0]} castShadow>
              <cylinderGeometry args={[0.042, 0.035, 0.05, 20]} />
              <meshStandardMaterial color={red} roughness={0.35} />
            </mesh>
          ))}
        </group>
      </group>
      {[0, 1, 2].map((k) => (
        <mesh
          key={k}
          ref={(m) => {
            if (m) waves.current[k] = m;
          }}
          position={[0, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <ringGeometry args={[0.2, 0.215, 48]} />
          <meshBasicMaterial color={C.amber} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
      {hover && (
        <Html position={[0, 0.85, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="scene-label">Call me · {profile.phone}</div>
        </Html>
      )}
    </group>
  );
}

// ── Reading corner (About) ──────────────────────────────────────────────────
function Steam({ position, calm }: { position: [number, number, number]; calm: boolean }) {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      const t = (clock.elapsedTime * 0.4 + i / 3) % 1;
      m.position.y = position[1] + t * 0.45;
      m.position.x = position[0] + Math.sin(t * 6 + i) * 0.03;
      m.scale.setScalar(0.5 + t);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.35;
    });
  });
  if (calm) return null;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) refs.current[i] = m;
          }}
          position={position}
        >
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function ReadingCorner({ room }: { room: RoomProps }) {
  const { C } = useRoom();
  return (
    <Hotspot id="about" room={room} labelAt={[2.4, 2.1, 1.2]}>
      <mesh position={[2.4, 0.01, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 48]} />
        <meshStandardMaterial color={C.rug} roughness={1} />
      </mesh>
      {/* armchair */}
      <group position={[2.6, 0, 0.9]} rotation={[0, -0.75, 0]}>
        <RoundedBox args={[1.2, 0.45, 1.0]} radius={0.12} position={[0, 0.3, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={C.velvet} roughness={0.85} />
        </RoundedBox>
        <RoundedBox args={[1.2, 0.9, 0.25]} radius={0.12} position={[0, 0.85, -0.42]} castShadow>
          <meshStandardMaterial color={C.velvet} roughness={0.85} />
        </RoundedBox>
        {[-0.55, 0.55].map((x) => (
          <RoundedBox key={x} args={[0.2, 0.35, 1.0]} radius={0.08} position={[x, 0.65, 0]} castShadow>
            <meshStandardMaterial color={C.velvet} roughness={0.85} />
          </RoundedBox>
        ))}
        {/* game controller on the seat */}
        <RoundedBox args={[0.3, 0.06, 0.18]} radius={0.03} position={[0.05, 0.56, 0.1]} rotation={[0, 0.4, 0]}>
          <meshStandardMaterial color="#e9e6df" roughness={0.4} />
        </RoundedBox>
      </group>
      {/* side table + coffee */}
      <mesh position={[1.35, 0.55, 0.2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 32]} />
        <meshStandardMaterial color={C.wood} roughness={0.45} />
      </mesh>
      <Box size={[0.05, 0.55, 0.05]} position={[1.35, 0.27, 0.2]} color={C.metal} />
      <mesh position={[1.35, 0.64, 0.2]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.13, 20]} />
        <meshStandardMaterial color="#e9e2d4" roughness={0.4} />
      </mesh>
      <Steam position={[1.35, 0.74, 0.2]} calm={room.calm} />
      {/* football */}
      <group position={[2.0, 0.2, 2.25]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="#f2f2f2" roughness={0.5} flatShading />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.202, 1]} />
          <meshBasicMaterial color="#1b1b1b" wireframe />
        </mesh>
      </group>
      {/* floor lamp */}
      <group position={[3.65, 0, -0.35]}>
        <Box size={[0.04, 1.9, 0.04]} position={[0, 0.95, 0]} color={C.metal} />
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
          <meshStandardMaterial color={C.metal} />
        </mesh>
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 0.32, 24, 1, true]} />
          <meshStandardMaterial
            color="#f3e3c3"
            emissive={C.amber}
            emissiveIntensity={room.night ? 1.4 : 0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight position={[0, 1.8, 0]} color={C.amber} intensity={room.night ? 5 : 0.5} distance={5} decay={2} />
      </group>
    </Hotspot>
  );
}

// ── Hologram (Digital twin) ─────────────────────────────────────────────────
function PhotoFace({ src }: { src: string }) {
  const map = useTexture(src);
  return <HoloDisc map={map} />;
}

// No photo set: project the initials instead.
function InitialsFace() {
  const { profile } = useRoom();
  const map = useCanvasTexture(drawInitials(profile.initials), 512, 512, [profile.initials]);
  return <HoloDisc map={map} />;
}

function HoloDisc({ map }: { map: THREE.Texture }) {
  return (
    <mesh>
      <circleGeometry args={[0.36, 48]} />
      <meshBasicMaterial
        map={map}
        color={[0.55, 1.6, 1.5]}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function Hologram({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const rings = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!rings.current || room.calm) return;
    rings.current.rotation.y += dt * 0.6;
    rings.current.rotation.z += dt * 0.15;
  });
  const glow = new THREE.Color(C.teal).multiplyScalar(room.night ? 2.2 : 1.4);

  return (
    <Hotspot id="twin" room={room} labelAt={[-1.6, 2.6, 1.0]}>
      <mesh position={[-1.6, 0.3, 1.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.6, 40]} />
        <meshStandardMaterial color="#1a2131" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-1.6, 0.61, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 48]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      {/* light cone */}
      <mesh position={[-1.6, 1.1, 1.0]}>
        <cylinderGeometry args={[0.5, 0.32, 1.0, 40, 1, true]} />
        <meshBasicMaterial color={C.teal} transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Float speed={room.calm ? 0 : 2} floatIntensity={room.calm ? 0 : 0.6} rotationIntensity={0}>
        <Billboard position={[-1.6, 1.55, 1.0]}>
          {profile.avatar ? <PhotoFace src={profile.avatar} /> : <InitialsFace />}
        </Billboard>
        <group ref={rings} position={[-1.6, 1.55, 1.0]}>
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.52, 0.008, 8, 80]} />
            <meshBasicMaterial color={glow} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 1.7, 0.6, 0]}>
            <torusGeometry args={[0.6, 0.006, 8, 80]} />
            <meshBasicMaterial color={glow} toneMapped={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.7, 1]} />
            <meshBasicMaterial color={C.teal} wireframe transparent opacity={0.12} />
          </mesh>
        </group>
      </Float>
      <pointLight position={[-1.6, 1.5, 1.0]} color={C.teal} intensity={room.night ? 4 : 1} distance={4} decay={2} />
    </Hotspot>
  );
}

function Plant() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        pos: [Math.cos(i * 2.4) * 0.22, 0.75 + (i % 3) * 0.2, Math.sin(i * 2.4) * 0.22] as [number, number, number],
        s: 0.22 + (i % 3) * 0.05,
      })),
    [],
  );
  return (
    <group position={[-3.35, 0, 2.9]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.56, 24]} />
        <meshStandardMaterial color="#c9b8a0" roughness={0.9} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.pos} scale={l.s} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? "#3f7a4e" : "#2f6140"} roughness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ── Lights, with the intro "lights on" moment ───────────────────────────────
function Lights({ night, calm }: { night: boolean; calm: boolean }) {
  const lamp = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // 0 → 1 between 0.8s and 2.2s, with a fluorescent-style flicker on the way.
    let power = calm ? 1 : THREE.MathUtils.smoothstep(t, 0.8, 2.2);
    if (!calm && t > 0.8 && t < 2.0 && Math.sin(t * 47) > 0.55) power *= 0.25;
    if (lamp.current) lamp.current.intensity = (night ? 7 : 1.5) * power;
    if (key.current) key.current.intensity = (night ? 0.6 : 2.4) * (0.35 + 0.65 * power);
    if (hemi.current) hemi.current.intensity = (night ? 0.6 : 1.1) * (0.4 + 0.6 * power);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[night ? "#8fa6d6" : "#fff4e2", night ? "#2a1f2e" : "#b59b80", 1]} />
      <directionalLight
        ref={key}
        position={night ? [-6, 9, 4] : [6, 10, 7]}
        color={night ? "#9db4ff" : "#ffe8c7"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight ref={lamp} position={[0.2, 1.75, -3.3]} color="#ffb867" distance={6} decay={2} castShadow shadow-mapSize={[512, 512]} />
    </>
  );
}

export function Room(props: RoomProps) {
  const { profile } = useRoom();
  const { twin } = useStudioData();
  return (
    <group>
      <Lights night={props.night} calm={props.calm} />
      <Shell night={props.night} />
      <Desk room={props} />
      <Rack room={props} />
      <CertWall room={props} />
      <Corkboard room={props} />
      <Cabinet room={props} />
      {profile.phone && <Telephone room={props} />}
      <ReadingCorner room={props} />
      {twin !== "off" && <Hologram room={props} />}
      <Plant />
    </group>
  );
}
