"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  The shop. Same CV, same sections, a corner shop: a poster in the window
//  lists the projects, the product shelves hold the skills, licences hang
//  behind the till, a clock and wall calendar for the career, stockroom boxes
//  for the archive, the owner's counter for "about" and a hologram assistant
//  on the shop floor. Camera positions for each are in LAYOUTS.shop
//  (./hotspots).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { liveGroups } from "@/lib/profile";
import { Box, Certificate, Hologram, Hotspot, Lights, Plant, Telephone, useRoom, type RoomProps } from "./parts";
import { useStudioData } from "./StudioData";
import {
  drawCalendar,
  drawClockFace,
  drawLabel,
  drawNeon,
  drawShopPoster,
  drawSkyline,
  useCanvasTexture,
} from "./textures";

const COUNTER = { x: -2.55, z: -2.0, length: 2.4, depth: 0.75, height: 1.05 }; // runs along z
const TOP = COUNTER.height + 0.03;
const WINDOW = { z: 1.3, width: 3.4, height: 1.9, y: 1.95 };
const BOX = "#c49a6c"; // cardboard

// ── Shell: plinth, plank floor, plastered walls, the shop window ───────────
function Shell({ night }: { night: boolean }) {
  const { C } = useRoom();
  const wall = night ? C.wallNight : C.wall;
  const sky = useCanvasTexture(drawSkyline(night), 1024, 768, [night]);
  const { z, width, height, y } = WINDOW;
  return (
    <group>
      <Box size={[9.2, 0.7, 9.2]} position={[0.1, -0.65, 0.1]} color={C.base} rough={0.6} />
      <Box size={[8.4, 0.3, 8.4]} position={[0, -0.15, 0]} color={C.floor} rough={0.55} />
      {/* floorboards */}
      {Array.from({ length: 23 }).map((_, i) => (
        <mesh key={i} position={[0, 0.002, -4.2 + (i + 1) * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.4, 0.015]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.25} />
        </mesh>
      ))}
      <Box size={[8.4, 4.4, 0.3]} position={[0, 2.2, -4.15]} color={wall} rough={0.95} />
      {/* left wall, built round the window */}
      <Box size={[0.3, 4.4, 4.2 + z - width / 2]} position={[-4.15, 2.2, (-4.2 + z - width / 2) / 2]} color={wall} rough={0.95} />
      <Box size={[0.3, 4.4, 4.2 - z - width / 2]} position={[-4.15, 2.2, (4.2 + z + width / 2) / 2]} color={wall} rough={0.95} />
      <Box size={[0.3, y - height / 2, width]} position={[-4.15, (y - height / 2) / 2, z]} color={wall} rough={0.95} />
      <Box size={[0.3, 4.4 - y - height / 2, width]} position={[-4.15, (4.4 + y + height / 2) / 2, z]} color={wall} rough={0.95} />
      <mesh position={[-4.2, y, z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      {/* window frame and mullions */}
      <Box size={[0.12, 0.1, width + 0.1]} position={[-3.98, y + height / 2, z]} color={C.woodDark} />
      <Box size={[0.3, 0.1, width + 0.1]} position={[-3.9, y - height / 2, z]} color={C.woodDark} />
      {[-1, 0, 1].map((k) => (
        <Box key={k} size={[0.1, height, 0.08]} position={[-3.98, y, z + (k * width) / 2]} color={C.woodDark} />
      ))}
      {/* skirting and a painted dado rail */}
      <Box size={[8.4, 0.16, 0.05]} position={[0, 0.08, -3.98]} color={C.woodDark} />
      <Box size={[0.05, 0.16, 8.4]} position={[-3.98, 0.08, 0]} color={C.woodDark} />
      <Box size={[8.4, 0.05, 0.05]} position={[0, 1.0, -3.98]} color={C.wood} />
    </group>
  );
}

// ── Shop window (Work): a poster hung in it, stock on the display shelf ────
function ShopWindow({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const live = new Set(liveGroups(profile).map((g) => g.key));
  const items = profile.projects.filter((p) => live.has(p.category)).map((p) => ({ icon: p.icon, name: p.name }));
  const title = profile.studio.sections.work.title || "New in";
  const tex = useCanvasTexture(drawShopPoster(title, items, C.teal), 900, 620, [title, JSON.stringify(items), C.teal]);
  const { z, y, height } = WINDOW;
  return (
    <Hotspot id="work" room={room} labelAt={[-3.6, y + height / 2 + 0.2, z]}>
      <group position={[-3.92, y + 0.1, z]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[1.7, 1.17]} />
          <meshStandardMaterial map={tex} roughness={0.8} />
        </mesh>
        {/* hanging strings */}
        {[-0.7, 0.7].map((x) => (
          <Box key={x} size={[0.01, 0.4, 0.01]} position={[x, 0.78, 0]} color="#3a3f4a" shadow={false} />
        ))}
      </group>
      {/* display shelf with stock either side of the poster */}
      <Box size={[0.6, 0.06, 3.3]} position={[-3.72, y - height / 2 + 0.02, z]} color={C.wood} />
      {[-1.35, -1.05, 1.05, 1.35].map((dz, i) => (
        <RoundedBox
          key={dz}
          args={[0.22, 0.3 + (i % 2) * 0.12, 0.22]}
          radius={0.02}
          position={[-3.72, y - height / 2 + 0.05 + (0.3 + (i % 2) * 0.12) / 2, z + dz]}
          castShadow
        >
          <meshStandardMaterial color={[C.teal, C.amber, C.velvet, C.rug][i]} roughness={0.6} />
        </RoundedBox>
      ))}
    </Hotspot>
  );
}

// ── Product shelves (Stack): one shelf per skill group ─────────────────────
function Product({ position, color, kind }: { position: [number, number, number]; color: string; kind: number }) {
  if (kind === 0)
    return (
      <Box size={[0.2, 0.34, 0.12]} position={[position[0], position[1] + 0.17, position[2]]} color={color} rough={0.6} />
    );
  if (kind === 1)
    return (
      <group position={position}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.28, 16]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.072, 0.072, 0.1, 16]} />
          <meshStandardMaterial color="#f4ecdc" roughness={0.6} />
        </mesh>
      </group>
    );
  return (
    <group position={position}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.26, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.08, 12]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.03, 12]} />
        <meshStandardMaterial color="#2a2522" />
      </mesh>
    </group>
  );
}

function ShelfLabel({ text, position }: { text: string; position: [number, number, number] }) {
  const tex = useCanvasTexture(drawLabel(text), 1280, 96, [text]);
  return (
    <mesh position={position}>
      <planeGeometry args={[2.4, 0.18]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}

function Shelves({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const groups = profile.skills.filter((g) => !g.archived).slice(0, 3);
  const colors = ["#c2412d", "#e8b04a", "#3f7a8f", "#6a8f4e", "#e6dcc8", "#8b4a7a", "#f08a4b"];
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (strip.current && !room.calm) strip.current.opacity = 0.8 + Math.sin(clock.elapsedTime * 1.2) * 0.12;
  });
  const X = 2.0;
  return (
    <Hotspot id="stack" room={room} labelAt={[X, 3.4, -3.7]}>
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.06, 3.0, 0.45]} position={[X + s * 1.33, 1.5, -3.77]} color={C.woodDark} />
      ))}
      <Box size={[2.72, 0.06, 0.45]} position={[X, 3.0, -3.77]} color={C.woodDark} />
      <Box size={[2.6, 0.3, 0.42]} position={[X, 0.15, -3.77]} color={C.woodDark} />
      {[0.9, 1.6, 2.3].map((y, row) => {
        const group = groups[row];
        const count = group ? Math.min(7, Math.max(4, group.items.length)) : 5;
        return (
          <group key={row}>
            <Box size={[2.6, 0.05, 0.42]} position={[X, y, -3.77]} color={C.wood} rough={0.5} />
            {Array.from({ length: count }).map((_, i) => (
              <Product
                key={i}
                position={[X - 1.05 + (i * 2.1) / Math.max(count - 1, 1), y + 0.025, -3.8]}
                color={colors[(row * 3 + i) % colors.length]}
                kind={(row + i) % 3}
              />
            ))}
            {group && <ShelfLabel text={group.group} position={[X, y - 0.09, -3.555]} />}
          </group>
        );
      })}
      <mesh position={[X, 2.95, -3.65]}>
        <boxGeometry args={[2.5, 0.02, 0.02]} />
        <meshBasicMaterial ref={strip} color={new THREE.Color(C.amber).multiplyScalar(room.night ? 3 : 1.2)} toneMapped={false} transparent />
      </mesh>
      <pointLight position={[X, 2.2, -3.1]} color={C.amber} intensity={room.night ? 2.5 : 0.6} distance={3} decay={2} />
    </Hotspot>
  );
}

// ── Licences behind the till (Certificates) + the shop sign (motto) ────────
function Licences({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const { motto: MOTTO } = useStudioData().layout;
  const neon = useCanvasTexture(drawNeon(profile.studio.neon, C.teal), 1680, 440, [profile.studio.neon, C.teal]);
  return (
    <>
      <Hotspot id="certs" room={room} labelAt={[-3.6, 3.1, -2.4]}>
        {profile.certificates.slice(0, 3).map((c, i) => (
          <Certificate key={c.title} cert={c} position={[-3.97, 2.35, -3.25 + i * 0.85]} scale={0.75} />
        ))}
      </Hotspot>
      <Hotspot id="motto" room={room} labelAt={[-3.6, MOTTO.center[1] + 0.75, MOTTO.center[2]]} pivot={MOTTO.center}>
        {/* the sign board, with the slogan lit up on it */}
        <Box
          size={[0.08, MOTTO.size[1] + 0.2, MOTTO.size[0] + 0.2]}
          position={[MOTTO.center[0] - 0.05, MOTTO.center[1], MOTTO.center[2]]}
          color={C.base}
          rough={0.5}
        />
        <mesh position={MOTTO.center} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={MOTTO.size} />
          <meshBasicMaterial map={neon} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Hotspot>
    </>
  );
}

// ── Clock and wall calendar (Career) ───────────────────────────────────────
function ClockAndCalendar({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const title = profile.studio.sections.career.title || "Career";
  const items = profile.experience.map(({ period, role, org }) => ({ period, role, org }));
  const calendar = useCanvasTexture(drawCalendar(title, items, C.teal), 900, 700, [title, JSON.stringify(items), C.teal]);
  const face = useCanvasTexture(drawClockFace(), 512, 512, []);
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  // The clock keeps real time.
  useFrame(() => {
    const now = new Date();
    const s = now.getSeconds() + (room.calm ? 0 : now.getMilliseconds() / 1000);
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (second.current) second.current.rotation.z = -(Math.floor(s) / 60) * Math.PI * 2;
  });
  const X = -0.9;
  return (
    <Hotspot id="career" room={room} labelAt={[X, 3.95, -3.8]}>
      {/* calendar on a nail */}
      <mesh position={[X, 2.0, -3.985]}>
        <planeGeometry args={[1.5, 1.17]} />
        <meshStandardMaterial map={calendar} roughness={0.85} />
      </mesh>
      <Box size={[1.5, 0.02, 0.01]} position={[X, 1.41, -3.985]} color="#d8cfbf" shadow={false} />
      {/* clock */}
      <group position={[X, 3.3, -3.96]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.07, 40]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.037]}>
          <circleGeometry args={[0.37, 40]} />
          <meshStandardMaterial map={face} roughness={0.6} />
        </mesh>
        <group ref={hour} position={[0, 0, 0.045]}>
          <Box size={[0.035, 0.2, 0.01]} position={[0, 0.09, 0]} color="#1d2433" shadow={false} />
        </group>
        <group ref={minute} position={[0, 0, 0.052]}>
          <Box size={[0.025, 0.29, 0.01]} position={[0, 0.13, 0]} color="#1d2433" shadow={false} />
        </group>
        {!room.calm && (
          <group ref={second} position={[0, 0, 0.058]}>
            <Box size={[0.01, 0.32, 0.005]} position={[0, 0.12, 0]} color="#c2412d" shadow={false} />
          </group>
        )}
        <mesh position={[0, 0, 0.062]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color="#1d2433" />
        </mesh>
      </group>
    </Hotspot>
  );
}

// ── Stockroom boxes (Archive): they slide apart to show their labels ───────
function StockBox({ label, rest, out, active }: { label: string; rest: THREE.Vector3; out: THREE.Vector3; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useCanvasTexture(drawLabel(label), 320, 96, [label]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const goal = active ? out : rest;
    g.position.x = THREE.MathUtils.damp(g.position.x, goal.x, 6, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, goal.y, 6, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, goal.z, 6, dt);
  });
  return (
    <group ref={ref} position={rest}>
      <Box size={[0.55, 0.42, 0.45]} position={[0, 0.21, 0]} color={BOX} rough={0.9} />
      <Box size={[0.56, 0.01, 0.1]} position={[0, 0.425, 0]} color="#d9c9a8" rough={0.6} shadow={false} />
      <mesh position={[0, 0.22, 0.226]}>
        <planeGeometry args={[0.36, 0.11]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}

function Stockroom({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const active = room.active === "archive";
  const sign = useCanvasTexture(drawLabel("Stockroom"), 512, 96, []);
  const labels = [0, 1, 2, 3].map((i) => profile.studio.drawers[i] ?? "");
  // Two boxes on the floor, one on each of those, fanned out when open.
  const spots = useMemo(
    () =>
      [
        [-0.3, 0, 0, -0.55, 0, 0.55],
        [0.3, 0, 0, 0.45, 0, 0.75],
        [-0.28, 0.42, -0.02, -0.55, 0.5, 0.05],
        [0.25, 0.42, 0.03, 0.45, 0.5, 0.25],
      ].map(([a, b, c, d, e, f]) => ({ rest: new THREE.Vector3(a, b, c), out: new THREE.Vector3(d, e, f) })),
    [],
  );
  return (
    <Hotspot id="archive" room={room} labelAt={[3.3, 2.7, -3.2]}>
      {/* the stockroom door behind */}
      <group position={[3.3, 0, -3.985]}>
        <mesh position={[0, 1.05, 0]}>
          <planeGeometry args={[1.0, 2.1]} />
          <meshStandardMaterial color={C.woodDark} roughness={0.7} />
        </mesh>
        <Box size={[1.12, 0.06, 0.04]} position={[0, 2.13, 0.01]} color={C.wood} />
        <mesh position={[0, 2.35, 0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshStandardMaterial map={sign} />
        </mesh>
      </group>
      <group position={[3.3, 0, -3.3]}>
        {spots.map((s, i) => (
          <StockBox key={i} label={labels[i]} rest={s.rest} out={s.out} active={active} />
        ))}
      </group>
    </Hotspot>
  );
}

// ── Owner's counter with the till (About) ──────────────────────────────────
function OwnersCounter({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const { x, z, length, depth, height } = COUNTER;
  const card = useCanvasTexture(drawLabel(profile.name), 512, 96, [profile.name]);
  return (
    <Hotspot id="about" room={room} labelAt={[x, 2.0, z + 0.4]}>
      <Box size={[depth, height - 0.05, length]} position={[x, (height - 0.05) / 2, z]} color={C.woodDark} rough={0.6} />
      <Box size={[depth + 0.12, 0.06, length + 0.1]} position={[x + 0.02, height, z]} color={C.wood} rough={0.35} />
      {/* front panels */}
      {[-0.8, 0, 0.8].map((dz) => (
        <Box key={dz} size={[0.02, height - 0.35, 0.65]} position={[x + depth / 2 + 0.005, height / 2, z + dz]} color={C.wood} shadow={false} />
      ))}
      {/* the till */}
      <group position={[x, TOP, z - 0.55]} rotation={[0, Math.PI / 2, 0]}>
        <Box size={[0.55, 0.14, 0.45]} position={[0, 0.07, 0]} color={C.metal} metal={0.4} rough={0.4} />
        <Box size={[0.5, 0.12, 0.3]} position={[0, 0.2, -0.04]} rotation={[0.35, 0, 0]} color={C.metal} metal={0.4} rough={0.4} />
        <mesh position={[0, 0.35, -0.15]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshBasicMaterial color={new THREE.Color(C.teal).multiplyScalar(room.night ? 1.8 : 1.1)} toneMapped={false} />
        </mesh>
        <Box size={[0.04, 0.18, 0.04]} position={[0, 0.28, -0.15]} color={C.metal} />
      </group>
      {/* a name card and a jar of sweets */}
      <group position={[x + 0.12, TOP, z + 0.15]} rotation={[0, Math.PI / 2, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.06, s * 0.03]} rotation={[s * 0.45, 0, 0]}>
            <planeGeometry args={[0.42, 0.12]} />
            <meshStandardMaterial map={card} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <group position={[x - 0.05, TOP, z - 1.0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.24, 18]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.25} roughness={0.05} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.3) * 0.05, 0.04 + (i % 3) * 0.04, Math.sin(i * 1.3) * 0.05]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshStandardMaterial color={["#e86a6a", "#f2c14e", C.teal, "#7fb6e8", "#c58be0"][i]} />
          </mesh>
        ))}
      </group>
      {/* the owner's stool behind the counter */}
      <group position={[x - 0.9, 0, z + 0.2]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 20]} />
          <meshStandardMaterial color={C.velvet} roughness={0.8} />
        </mesh>
        <Box size={[0.05, 0.7, 0.05]} position={[0, 0.35, 0]} color={C.metal} metal={0.6} rough={0.35} />
        <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.012, 6, 24]} />
          <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
    </Hotspot>
  );
}

// ── Shop floor: a display table ─────────────────────────────────────────────
function DisplayTable() {
  const { C } = useRoom();
  return (
    <group position={[0.2, 0, 1.5]}>
      <Box size={[1.6, 0.06, 0.9]} position={[0, 0.8, 0]} color={C.wood} rough={0.45} />
      {[
        [-0.72, -0.38],
        [0.72, -0.38],
        [-0.72, 0.38],
        [0.72, 0.38],
      ].map(([dx, dz]) => (
        <Box key={`${dx}${dz}`} size={[0.06, 0.78, 0.06]} position={[dx, 0.39, dz]} color={C.woodDark} />
      ))}
      {/* folded stock in neat piles */}
      {[-0.5, 0, 0.5].map((dx, i) =>
        [0, 1, 2].map((k) => (
          <Box
            key={`${dx}${k}`}
            size={[0.38, 0.06, 0.3]}
            position={[dx, 0.86 + k * 0.065, (k % 2) * 0.02]}
            color={[C.teal, C.amber, C.velvet, C.rug, "#e6dcc8", C.teal][(i + k) % 6]}
            rough={0.9}
          />
        )),
      )}
    </group>
  );
}

export function Shop(props: RoomProps) {
  const { profile } = useRoom();
  const { twin } = useStudioData();
  return (
    <group>
      <Lights night={props.night} calm={props.calm} lamp={[0.4, 2.8, -1.4]} />
      <Shell night={props.night} />
      <ShopWindow room={props} />
      <Shelves room={props} />
      <Licences room={props} />
      <ClockAndCalendar room={props} />
      <Stockroom room={props} />
      <OwnersCounter room={props} />
      {profile.phone && <Telephone room={props} position={[COUNTER.x, TOP, -1.15]} rotation={[0, Math.PI / 2 - 0.35, 0]} />}
      {twin !== "off" && <Hologram room={props} at={[0.7, -1.3]} />}
      <DisplayTable />
      <Plant position={[-3.4, 0, 3.55]} />
    </group>
  );
}
