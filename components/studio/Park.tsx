"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  The park. Same CV, same sections, outdoors: a notice board pinned with the
//  projects, terraced flower beds for the skills, plaques on a stone wall, a
//  signpost for the career, a garden shed for the archive, a bench under a
//  lamp for "about" and the twin rising out of the fountain. Camera positions
//  for each are in LAYOUTS.park (./hotspots).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { liveGroups } from "@/lib/profile";
import { Box, Certificate, Hologram, Hotspot, Lights, Steam, Telephone, useRoom, type RoomProps } from "./parts";
import { useStudioData } from "./StudioData";
import { drawLabel, drawNeon, drawNoticeBoard, drawPlank, useCanvasTexture } from "./textures";

const FOUNTAIN = { x: 0.5, z: -0.6 };
const HEDGE = "#2f5a3a";

// ── Ground: plinth, lawn, gravel paths, hedges ──────────────────────────────
function Ground() {
  const { C } = useRoom();
  const grass = useMemo(() => `#${new THREE.Color("#5f8f4e").lerp(new THREE.Color(C.velvet), 0.2).getHexString()}`, [C.velvet]);
  return (
    <group>
      <Box size={[9.2, 0.7, 9.2]} position={[0.1, -0.65, 0.1]} color={C.base} rough={0.6} />
      <Box size={[8.4, 0.3, 8.4]} position={[0, -0.15, 0]} color={grass} rough={0.95} />
      {/* gravel: a ring round the fountain, a path in from the front corner, spurs to the back */}
      <mesh position={[FOUNTAIN.x, 0.004, FOUNTAIN.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.15, 1.85, 48]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[2.6, 0.003, 2.4]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <planeGeometry args={[0.9, 5.6]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[0.4, 0.003, -2.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.9, 1.6]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      {/* stepping stones to the signpost */}
      {[
        [-0.75, -1.6],
        [-1.05, -2.1],
        [-1.3, -2.6],
      ].map(([x, z]) => (
        <mesh key={x} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.2, 20]} />
          <meshStandardMaterial color={C.wall} roughness={1} />
        </mesh>
      ))}
      {/* hedges along the back, and the left edge in front of the banner */}
      <Box size={[8.4, 0.7, 0.4]} position={[0, 0.35, -4.0]} color={HEDGE} rough={0.95} />
      <Box size={[0.4, 0.7, 1.2]} position={[-4.0, 0.35, 3.6]} color={HEDGE} rough={0.95} />
    </group>
  );
}

function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[
        [0, 0.3, 0, 0.42],
        [0.32, 0.22, 0.1, 0.3],
        [-0.28, 0.24, -0.05, 0.32],
        [0.05, 0.5, -0.1, 0.28],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={r} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? "#3f7a4e" : "#2f6140"} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 2.0, 10]} />
        <meshStandardMaterial color="#5a3d2a" roughness={0.9} />
      </mesh>
      {[
        [0, 2.3, 0, 0.95],
        [0.45, 2.0, 0.2, 0.65],
        [-0.4, 2.1, -0.15, 0.7],
        [0.05, 2.95, 0.05, 0.6],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={r} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? "#3f7a4e" : "#2f6140"} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// A park lamp post, lit up at night.
function LampPost({ position, night }: { position: [number, number, number]; night: boolean }) {
  const { C } = useRoom();
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.12, 16]} />
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 2.5, 10]} />
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.68, 0]}>
        <cylinderGeometry args={[0.13, 0.09, 0.3, 6]} />
        <meshStandardMaterial color="#f3e3c3" emissive={C.amber} emissiveIntensity={night ? 2 : 0.15} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 2.88, 0]} castShadow>
        <coneGeometry args={[0.2, 0.16, 6]} />
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 2.55, 0]} color={C.amber} intensity={night ? 5 : 0.4} distance={5} decay={2} />
    </group>
  );
}

// ── Notice board (Work) ─────────────────────────────────────────────────────
function NoticeBoard({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const live = new Set(liveGroups(profile).map((g) => g.key));
  const items = profile.projects.filter((p) => live.has(p.category)).map((p) => ({ icon: p.icon, name: p.name }));
  const title = profile.studio.sections.work.title || "Notices";
  const tex = useCanvasTexture(drawNoticeBoard(title, items, C.teal), 1200, 800, [title, JSON.stringify(items), C.teal]);
  return (
    <Hotspot id="work" room={room} labelAt={[0.4, 3.35, -3.5]}>
      <group position={[0.4, 0, -3.55]}>
        {[-1.08, 1.08].map((x) => (
          <Box key={x} size={[0.1, 2.75, 0.1]} position={[x, 1.37, 0]} color={C.woodDark} />
        ))}
        <Box size={[2.1, 1.42, 0.08]} position={[0, 1.95, -0.02]} color={C.woodDark} />
        <mesh position={[0, 1.95, 0.025]}>
          <planeGeometry args={[1.95, 1.3]} />
          <meshStandardMaterial map={tex} roughness={0.9} />
        </mesh>
        {/* a little pitched roof */}
        {[-1, 1].map((s) => (
          <Box key={s} size={[2.4, 0.05, 0.42]} position={[0, 2.8, s * 0.1]} rotation={[s * 0.45, 0, 0]} color={C.wood} />
        ))}
      </group>
    </Hotspot>
  );
}

// ── Flower beds (Stack): three terraced planters, one per skill group ──────
const BLOOMS = ["#f2c14e", "#e86a6a", "#f4f0e6", "#c58be0", "#ff9f6e", "#7fb6e8"];

function BedLabel({ text, position }: { text: string; position: [number, number, number] }) {
  const tex = useCanvasTexture(drawLabel(text), 1280, 96, [text]);
  return (
    <mesh position={position}>
      <planeGeometry args={[2.2, 0.165]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}

function FlowerBeds({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const groups = profile.skills.filter((g) => !g.archived).slice(0, 3);
  const rows = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    if (room.calm) return;
    rows.current.forEach((g, r) => {
      if (g) g.rotation.z = Math.sin(clock.elapsedTime * 1.3 + r) * 0.025;
    });
  });
  return (
    <Hotspot id="stack" room={room} labelAt={[2.7, 2.5, -3.3]}>
      {[0, 1, 2].map((row) => {
        const group = groups[row];
        const count = group ? Math.min(7, Math.max(4, group.items.length)) : 5;
        const z = -2.85 - row * 0.5;
        const h = 0.3 + row * 0.55; // tall steps, so each label shows above the flowers in front
        return (
          <group key={row}>
            <Box size={[2.3, h, 0.46]} position={[2.7, h / 2, z]} color={C.wood} rough={0.7} />
            <Box size={[2.2, 0.03, 0.38]} position={[2.7, h + 0.005, z]} color="#3b2a1e" rough={1} shadow={false} />
            <group
              ref={(g) => {
                if (g) rows.current[row] = g;
              }}
              position={[2.7, h, z]}
            >
              {Array.from({ length: count }).map((_, i) => {
                const x = -0.95 + (i * 1.9) / Math.max(count - 1, 1);
                const stem = 0.18 + ((row + i) % 3) * 0.05;
                return (
                  <group key={i} position={[x, 0, (i % 2) * 0.06 - 0.06]}>
                    <mesh position={[0, stem / 2, 0]}>
                      <cylinderGeometry args={[0.012, 0.012, stem, 6]} />
                      <meshStandardMaterial color="#3f7a4e" />
                    </mesh>
                    <mesh position={[0.05, stem * 0.45, 0]} rotation={[0, 0, -0.8]} scale={[0.07, 0.025, 0.04]}>
                      <sphereGeometry args={[1, 8, 6]} />
                      <meshStandardMaterial color="#3f7a4e" />
                    </mesh>
                    <mesh position={[0, stem, 0]} castShadow>
                      <icosahedronGeometry args={[0.085, 0]} />
                      <meshStandardMaterial color={BLOOMS[(row * 2 + i) % BLOOMS.length]} roughness={0.6} flatShading />
                    </mesh>
                    <mesh position={[0, stem + 0.02, 0.05]}>
                      <sphereGeometry args={[0.03, 8, 8]} />
                      <meshStandardMaterial color="#f2c14e" />
                    </mesh>
                  </group>
                );
              })}
            </group>
            {group && <BedLabel text={group.group} position={[2.7, h - 0.12, z + 0.235]} />}
          </group>
        );
      })}
    </Hotspot>
  );
}

// ── Plaques on the stone wall (Certificates) + the banner (motto) ──────────
function Plaques({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const { motto: MOTTO } = useStudioData().layout;
  const stone = useMemo(() => `#${new THREE.Color(C.wall).multiplyScalar(0.78).getHexString()}`, [C.wall]);
  const neon = useCanvasTexture(drawNeon(profile.studio.neon, C.teal), 1680, 440, [profile.studio.neon, C.teal]);
  const [w, h] = MOTTO.size;
  return (
    <>
      <Hotspot id="certs" room={room} labelAt={[-3.5, 2.25, -1.2]}>
        <Box size={[0.3, 1.9, 2.1]} position={[-3.95, 0.95, -1.2]} color={stone} rough={0.95} />
        <Box size={[0.4, 0.1, 2.2]} position={[-3.95, 1.95, -1.2]} color={stone} rough={0.9} />
        {profile.certificates.slice(0, 3).map((c, i) => (
          <Certificate key={c.title} cert={c} position={[-3.77, 1.12, -1.85 + i * 0.65]} scale={0.58} />
        ))}
      </Hotspot>
      <Hotspot id="motto" room={room} labelAt={[-3.5, MOTTO.center[1] + h / 2 + 0.3, MOTTO.center[2]]} pivot={MOTTO.center}>
        {/* two posts and a cloth banner between them */}
        {[-1, 1].map((s) => (
          <group key={s} position={[-3.92, 0, MOTTO.center[2] + s * (w / 2 + 0.12)]}>
            <Box size={[0.1, MOTTO.center[1] + h / 2 + 0.25, 0.1]} position={[0, (MOTTO.center[1] + h / 2 + 0.25) / 2, 0]} color={C.woodDark} />
            <mesh position={[0, MOTTO.center[1] + h / 2 + 0.3, 0]}>
              <sphereGeometry args={[0.08, 12, 10]} />
              <meshStandardMaterial color={C.amber} />
            </mesh>
          </group>
        ))}
        <mesh position={[MOTTO.center[0] - 0.06, MOTTO.center[1], MOTTO.center[2]]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[w + 0.2, h + 0.2]} />
          <meshStandardMaterial color={C.base} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={MOTTO.center} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={MOTTO.size} />
          <meshBasicMaterial map={neon} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Hotspot>
    </>
  );
}

// ── Signpost (Career): one arrow per job, newest at the top ────────────────
function SignArrow({ role, period, y, left }: { role: string; period: string; y: number; left: boolean }) {
  const { C } = useRoom();
  const tex = useCanvasTexture(drawPlank(role, period, left), 640, 148, [role, period, left]);
  const s = left ? -1 : 1;
  return (
    <group position={[0, y, 0.07]} rotation={[0, s * 0.12, 0]}>
      <Box size={[1.15, 0.29, 0.05]} position={[s * 0.5, 0, -0.03]} color={C.woodDark} />
      <mesh position={[s * 0.58, 0, 0]}>
        <planeGeometry args={[1.3, 0.3]} />
        <meshStandardMaterial map={tex} transparent roughness={0.8} />
      </mesh>
    </group>
  );
}

function Signpost({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const jobs = profile.experience.slice(0, 4);
  return (
    <Hotspot id="career" room={room} labelAt={[-1.5, 3.45, -3.1]}>
      <group position={[-1.5, 0, -3.1]}>
        <Box size={[0.12, 3.05, 0.12]} position={[0, 1.52, 0]} color={C.woodDark} />
        <mesh position={[0, 3.1, 0]} castShadow>
          <coneGeometry args={[0.11, 0.16, 4]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
        {jobs.map((j, i) => (
          <SignArrow key={i} role={j.role} period={j.period} y={2.75 - i * 0.42} left={i % 2 === 1} />
        ))}
      </group>
    </Hotspot>
  );
}

// ── Garden shed (Archive): the doors open onto labelled boxes ──────────────
function ShedBox({ label, position }: { label: string; position: [number, number, number] }) {
  const tex = useCanvasTexture(drawLabel(label), 320, 96, [label]);
  return (
    <group position={position}>
      <Box size={[0.42, 0.3, 0.36]} position={[0, 0.15, 0]} color="#c49a6c" rough={0.9} />
      <mesh position={[0, 0.16, 0.181]}>
        <planeGeometry args={[0.32, 0.1]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}

function Shed({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const doors = useRef<THREE.Group[]>([]);
  const open = room.active === "archive";
  const peek = room.hovered === "archive" && !room.active;
  useFrame((_, dt) => {
    const goal = open ? 1.9 : peek ? 0.35 : 0;
    doors.current.forEach((d, i) => {
      if (d) d.rotation.y = THREE.MathUtils.damp(d.rotation.y, (i ? 1 : -1) * goal, 6, dt);
    });
  });
  const labels = [0, 1, 2, 3].map((i) => profile.studio.drawers[i] ?? "");
  // Footprint x -3.75..-2.25, z -3.7..-2.3; the doorway is on the front (+z).
  return (
    <Hotspot id="archive" room={room} labelAt={[-3.0, 3.0, -2.3]}>
      <group position={[-3.0, 0, -3.0]}>
        <Box size={[1.5, 1.9, 0.08]} position={[0, 0.95, -0.66]} color={C.wood} rough={0.8} />
        {[-1, 1].map((s) => (
          <Box key={s} size={[0.08, 1.9, 1.4]} position={[s * 0.71, 0.95, 0]} color={C.wood} rough={0.8} />
        ))}
        {/* front: either side of the doorway, and the lintel */}
        {[-1, 1].map((s) => (
          <Box key={s} size={[0.25, 1.9, 0.08]} position={[s * 0.625, 0.95, 0.66]} color={C.wood} rough={0.8} />
        ))}
        <Box size={[1.5, 0.3, 0.08]} position={[0, 1.75, 0.66]} color={C.wood} rough={0.8} />
        {/* gable (a triangular prism) and the roof over it */}
        <mesh position={[0, 2.117, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.5]} castShadow>
          <cylinderGeometry args={[0.866, 0.866, 1.4, 3]} />
          <meshStandardMaterial color={C.wood} roughness={0.8} flatShading />
        </mesh>
        {[-1, 1].map((s) => (
          <Box key={s} size={[1.08, 0.06, 1.6]} position={[s * 0.38, 2.27, 0]} rotation={[0, 0, -s * 0.714]} color={C.metal} rough={0.6} />
        ))}
        {/* inside: a shelf of labelled boxes */}
        <Box size={[1.3, 0.04, 0.5]} position={[0, 0.8, -0.35]} color={C.woodDark} shadow={false} />
        {labels.map((label, i) => (
          <ShedBox key={i} label={label} position={[i % 2 ? 0.25 : -0.25, i < 2 ? 0.05 : 0.82, -0.35]} />
        ))}
        {open && <pointLight position={[0, 1.4, 0.2]} color={C.amber} intensity={room.night ? 2 : 0.8} distance={2.5} decay={2} />}
        {/* doors, hinged at the sides of the doorway */}
        {[-1, 1].map((s, i) => (
          <group
            key={s}
            ref={(g) => {
              if (g) doors.current[i] = g;
            }}
            position={[s * 0.5, 0, 0.7]}
          >
            <Box size={[0.5, 1.6, 0.05]} position={[-s * 0.25, 0.8, 0]} color={C.woodDark} rough={0.7} />
            <Box size={[0.04, 0.12, 0.03]} position={[-s * 0.44, 0.85, 0.04]} color="#c9a96a" metal={0.8} rough={0.3} />
          </group>
        ))}
      </group>
    </Hotspot>
  );
}

// ── Bench under the lamp (About) ────────────────────────────────────────────
function Bench({ room }: { room: RoomProps }) {
  const { C } = useRoom();
  return (
    <Hotspot id="about" room={room} labelAt={[2.5, 1.9, 1.4]}>
      <mesh position={[2.5, 0.006, 1.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <group position={[2.6, 0, 1.3]} rotation={[0, -0.75, 0]}>
        {/* seat and back slats */}
        {[-0.18, 0, 0.18].map((z) => (
          <Box key={z} size={[1.7, 0.05, 0.14]} position={[0, 0.48, z]} color={C.wood} rough={0.6} />
        ))}
        {[0.66, 0.84].map((y) => (
          <Box key={y} size={[1.7, 0.14, 0.05]} position={[0, y, -0.3]} rotation={[-0.15, 0, 0]} color={C.wood} rough={0.6} />
        ))}
        {/* iron ends */}
        {[-0.75, 0.75].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Box size={[0.06, 0.46, 0.06]} position={[0, 0.23, 0.2]} color={C.metal} metal={0.5} rough={0.4} />
            <Box size={[0.06, 0.95, 0.06]} position={[0, 0.47, -0.27]} rotation={[-0.15, 0, 0]} color={C.metal} metal={0.5} rough={0.4} />
            <Box size={[0.06, 0.05, 0.55]} position={[0, 0.66, -0.02]} color={C.metal} metal={0.5} rough={0.4} />
          </group>
        ))}
        {/* an open book and a takeaway coffee */}
        <group position={[-0.25, 0.52, 0.02]} rotation={[0, 0.3, 0]}>
          <Box size={[0.22, 0.03, 0.3]} position={[-0.11, 0, 0]} rotation={[0, 0, 0.08]} color="#f4ecdc" rough={0.9} />
          <Box size={[0.22, 0.03, 0.3]} position={[0.11, 0, 0]} rotation={[0, 0, -0.08]} color="#f4ecdc" rough={0.9} />
        </group>
        <mesh position={[0.5, 0.58, 0.05]} castShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.16, 16]} />
          <meshStandardMaterial color="#efe8dc" roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 0.67, 0.05]}>
          <cylinderGeometry args={[0.058, 0.058, 0.03, 16]} />
          <meshStandardMaterial color={C.velvet} />
        </mesh>
        <Steam position={[0.5, 0.7, 0.05]} calm={room.calm} />
      </group>
      <LampPost position={[3.75, 0, 0.15]} night={room.night} />
    </Hotspot>
  );
}

// ── Fountain: water on its own, or the twin rising out of it ───────────────
function Fountain({ room, twin }: { room: RoomProps; twin: boolean }) {
  const { C } = useRoom();
  const stone = useMemo(() => `#${new THREE.Color(C.wall).multiplyScalar(0.85).getHexString()}`, [C.wall]);
  const ripples = useRef<THREE.Mesh[]>([]);
  const jet = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ripples.current.forEach((m, k) => {
      const p = room.calm ? 0.5 : (t * 0.35 + k / 3) % 1;
      m.scale.setScalar(0.5 + p * 1.6);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.4;
    });
    jet.current.forEach((m, i) => {
      const p = (t * 0.8 + i / 6) % 1;
      m.position.y = 0.95 + Math.sin(p * Math.PI) * 0.5;
      m.position.x = Math.cos(i * 1.05) * p * 0.55;
      m.position.z = Math.sin(i * 1.05) * p * 0.55;
    });
  });
  return (
    <group position={[FOUNTAIN.x, 0, FOUNTAIN.z]}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.12, 0.44, 40, 1, true]} />
        <meshStandardMaterial color={stone} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1.1, 40]} />
        <meshStandardMaterial color={stone} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.95, 40]} />
        <meshStandardMaterial color="#3d7f99" roughness={0.1} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh
          key={k}
          ref={(m) => {
            if (m) ripples.current[k] = m;
          }}
          position={[0, 0.37, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <ringGeometry args={[0.3, 0.33, 40]} />
          <meshBasicMaterial color={twin ? C.teal : "#cfefff"} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {!twin && (
        <>
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.6, 16]} />
            <meshStandardMaterial color={stone} roughness={0.9} />
          </mesh>
          {!room.calm &&
            Array.from({ length: 6 }).map((_, i) => (
              <mesh
                key={i}
                ref={(m) => {
                  if (m) jet.current[i] = m;
                }}
              >
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial color="#cfefff" transparent opacity={0.8} />
              </mesh>
            ))}
        </>
      )}
    </group>
  );
}

// ── Phone box ───────────────────────────────────────────────────────────────
function PhoneBox({ room }: { room: RoomProps }) {
  const { profile } = useRoom();
  const red = "#c2412d";
  const sign = useCanvasTexture(drawLabel("TELEPHONE"), 512, 96, []);
  return (
    <group position={[1.4, 0, 3.6]} rotation={[0, Math.PI / 4, 0]}>
      {[
        [-0.42, -0.42],
        [0.42, -0.42],
        [-0.42, 0.42],
        [0.42, 0.42],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.1, 2.3, 0.1]} position={[x, 1.15, z]} color={red} rough={0.4} />
      ))}
      <Box size={[0.94, 0.12, 0.94]} position={[0, 2.36, 0]} color={red} rough={0.4} />
      <mesh position={[0, 2.47, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 0.12, 4, 1, false, Math.PI / 4]} />
        <meshStandardMaterial color={red} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.2, 0.48]}>
        <planeGeometry args={[0.7, 0.13]} />
        <meshStandardMaterial map={sign} />
      </mesh>
      {/* back wall, glazed sides; the front is open */}
      <Box size={[0.76, 2.2, 0.04]} position={[0, 1.1, -0.42]} color={red} rough={0.4} />
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 1.25, 0]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
          <planeGeometry args={[0.76, 1.6]} />
          <meshPhysicalMaterial color="#dfefff" transparent opacity={0.22} roughness={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Box size={[0.76, 0.6, 0.04]} position={[0, 0.3, -0.38]} color={red} rough={0.4} />
      <Box size={[0.6, 0.04, 0.3]} position={[0, 1.02, -0.26]} color="#3a2a1c" />
      {profile.phone && <Telephone room={room} position={[0, 1.04, -0.24]} rotation={[0, 0, 0]} />}
    </group>
  );
}

export function Park(props: RoomProps) {
  const { twin } = useStudioData();
  const withTwin = twin !== "off";
  return (
    <group>
      <Lights night={props.night} calm={props.calm} lamp={[3.75, 2.55, 0.15]} />
      <Ground />
      <NoticeBoard room={props} />
      <FlowerBeds room={props} />
      <Plaques room={props} />
      <Signpost room={props} />
      <Shed room={props} />
      <Bench room={props} />
      <Fountain room={props} twin={withTwin} />
      {withTwin && <Hologram room={props} at={[FOUNTAIN.x, FOUNTAIN.z]} lift={0.15} />}
      <PhoneBox room={props} />
      <Tree position={[-3.3, 0, 3.75]} />
      <Bush position={[3.6, 0, 3.3]} />
      <Bush position={[3.65, 0, -1.6]} scale={0.8} />
      <Bush position={[-1.6, 0, 3.7]} scale={0.7} />
    </group>
  );
}
