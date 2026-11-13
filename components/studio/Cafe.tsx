"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  The coffee shop. Same CV, same sections, different objects: the chalkboard
//  menu lists the projects, the jar shelves hold the skills, award frames,
//  a photo wall for the career, a recipe box for the archive, an armchair
//  corner for "about" and a hologram barista behind the counter. Camera
//  positions for each are in LAYOUTS.cafe (./hotspots).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { liveGroups } from "@/lib/profile";
import { Box, Certificate, Hologram, Hotspot, Lights, Plant, Steam, Telephone, useRoom, type RoomProps } from "./parts";
import { useStudioData } from "./StudioData";
import {
  drawBricks,
  drawChalkboard,
  drawLabel,
  drawNeon,
  drawPolaroids,
  drawSkyline,
  useCanvasTexture,
} from "./textures";

const COUNTER = { x: 1.45, z: -2.2, length: 4.7, depth: 0.8, height: 1.08 };
const TOP = COUNTER.height + 0.03; // where things stand on the counter

// ── Shell: plinth, tiled floor, brick walls with wainscoting, shop window ───
function Shell({ night }: { night: boolean }) {
  const { C } = useRoom();
  const wall = night ? C.wallNight : C.wall;
  const bricks = useCanvasTexture(drawBricks(wall), 1024, 512, [wall]);
  const sky = useCanvasTexture(drawSkyline(night), 1024, 768, [night]);
  const back = useMemo(() => {
    const t = bricks.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.2, 1.2);
    t.needsUpdate = true;
    return t;
  }, [bricks]);
  const tiles = useMemo(
    () =>
      Array.from({ length: 64 }).flatMap((_, i) => {
        const r = Math.floor(i / 8);
        const c = i % 8;
        return (r + c) % 2 ? [] : [[-3.675 + c * 1.05, -3.675 + r * 1.05] as [number, number]];
      }),
    [],
  );

  return (
    <group>
      <Box size={[9.2, 0.7, 9.2]} position={[0.1, -0.65, 0.1]} color={C.base} rough={0.6} />
      <Box size={[8.4, 0.3, 8.4]} position={[0, -0.15, 0]} color={C.floor} rough={0.45} />
      {/* checkerboard tiles */}
      {tiles.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.003, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.05, 1.05]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.18} roughness={0.5} />
        </mesh>
      ))}
      {/* brick walls */}
      <mesh position={[0, 2.2, -4.15]} receiveShadow>
        <boxGeometry args={[8.4, 4.4, 0.3]} />
        <meshStandardMaterial map={back} roughness={0.95} />
      </mesh>
      <mesh position={[-4.15, 2.2, 0]} receiveShadow>
        <boxGeometry args={[0.3, 4.4, 8.4]} />
        <meshStandardMaterial map={back} roughness={0.95} />
      </mesh>
      {/* wainscoting */}
      <Box size={[8.4, 1.0, 0.06]} position={[0, 0.5, -3.98]} color={C.woodDark} rough={0.6} />
      <Box size={[0.06, 1.0, 8.4]} position={[-3.98, 0.5, 0]} color={C.woodDark} rough={0.6} />
      <Box size={[8.4, 0.06, 0.1]} position={[0, 1.02, -3.95]} color={C.wood} />
      <Box size={[0.1, 0.06, 8.4]} position={[-3.95, 1.02, 0]} color={C.wood} />

      {/* shop window on the left wall */}
      <group position={[-3.99, 1.95, 1.0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[2.4, 1.5]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        <Box size={[2.6, 0.1, 0.12]} position={[0, 0.8, 0.03]} color={C.woodDark} />
        <Box size={[2.6, 0.14, 0.3]} position={[0, -0.8, 0.12]} color={C.woodDark} />
        <Box size={[0.1, 1.6, 0.12]} position={[-1.25, 0, 0.03]} color={C.woodDark} />
        <Box size={[0.1, 1.6, 0.12]} position={[1.25, 0, 0.03]} color={C.woodDark} />
        <Box size={[0.05, 1.5, 0.08]} position={[0, 0, 0.03]} color={C.woodDark} />
      </group>
    </group>
  );
}

// ── Counter, espresso machine, pastry case, cups ────────────────────────────
function Counter({ room }: { room: RoomProps }) {
  const { C } = useRoom();
  const { x, z, length, depth, height } = COUNTER;
  return (
    <group>
      <Box size={[length, height - 0.05, depth]} position={[x, (height - 0.05) / 2, z]} color={C.woodDark} rough={0.6} />
      <Box size={[length + 0.1, 0.06, depth + 0.12]} position={[x, height, z + 0.02]} color={C.wood} rough={0.35} />
      {/* front slats */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Box
          key={i}
          size={[0.02, height - 0.2, 0.02]}
          position={[x - length / 2 + 0.16 + i * 0.31, (height - 0.05) / 2, z + depth / 2 + 0.005]}
          color="#000000"
          rough={1}
          shadow={false}
        />
      ))}

      {/* espresso machine */}
      <group position={[1.55, TOP, -2.4]}>
        <RoundedBox args={[0.8, 0.55, 0.45]} radius={0.05} position={[0, 0.28, 0]} castShadow>
          <meshStandardMaterial color={C.metal} metalness={0.75} roughness={0.25} />
        </RoundedBox>
        <Box size={[0.82, 0.04, 0.47]} position={[0, 0.57, 0]} color="#c8ccd4" metal={0.9} rough={0.2} />
        {[-0.2, 0.2].map((dx) => (
          <group key={dx} position={[dx, 0.16, 0.25]}>
            <Box size={[0.1, 0.06, 0.1]} position={[0, 0, 0]} color="#1a1d24" metal={0.6} rough={0.3} />
            <mesh position={[0, -0.1, 0.02]}>
              <cylinderGeometry args={[0.05, 0.04, 0.07, 16]} />
              <meshStandardMaterial color="#efe8dc" roughness={0.4} />
            </mesh>
          </group>
        ))}
        {/* pressure gauges */}
        {[-0.15, 0.15].map((dx) => (
          <mesh key={dx} position={[dx, 0.42, 0.226]}>
            <circleGeometry args={[0.055, 20]} />
            <meshBasicMaterial color={new THREE.Color(C.amber).multiplyScalar(room.night ? 1.6 : 1)} toneMapped={false} />
          </mesh>
        ))}
        {/* cups warming on top */}
        {[-0.25, -0.08, 0.09].map((dx) => (
          <mesh key={dx} position={[dx, 0.63, -0.05]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.08, 16]} />
            <meshStandardMaterial color="#efe8dc" roughness={0.4} />
          </mesh>
        ))}
        <Steam position={[-0.2, 0.0, 0.27]} calm={room.calm} />
      </group>

      {/* pastry case at the left end */}
      <group position={[-0.35, TOP, -2.15]}>
        <Box size={[0.95, 0.06, 0.6]} position={[0, 0.03, 0]} color={C.woodDark} />
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.92, 0.44, 0.58]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.16} roughness={0.05} metalness={0} />
        </mesh>
        {[
          [-0.28, 0.1, "#d9a35f"],
          [-0.05, 0.12, "#8b5a3c"],
          [0.2, 0.08, "#e7c27d"],
          [0.32, -0.12, "#c46b6b"],
          [-0.2, -0.12, "#e7c27d"],
          [0.05, -0.1, "#d9a35f"],
        ].map(([dx, dz, color], i) => (
          <mesh key={i} position={[dx as number, 0.13, dz as number]} scale={[1, 0.6, 1]} castShadow>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial color={color as string} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* a cup waiting for its customer */}
      <mesh position={[0.4, TOP + 0.06, -1.95]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.12, 20]} />
        <meshStandardMaterial color="#efe8dc" roughness={0.4} />
      </mesh>
      <Steam position={[0.4, TOP + 0.15, -1.95]} calm={room.calm} />
    </group>
  );
}

// ── Chalkboard menu (Work) ──────────────────────────────────────────────────
function Chalkboard({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const live = new Set(liveGroups(profile).map((g) => g.key));
  const items = profile.projects.filter((p) => live.has(p.category)).map((p) => ({ icon: p.icon, name: p.name }));
  const title = profile.studio.sections.work.title || "Today's specials";
  const tex = useCanvasTexture(drawChalkboard(title, items), 1200, 800, [title, JSON.stringify(items)]);
  return (
    <Hotspot id="work" room={room} labelAt={[-0.6, 3.85, -3.8]}>
      <Box size={[1.95, 1.33, 0.06]} position={[-0.6, 2.95, -3.97]} color={C.woodDark} rough={0.5} />
      <mesh position={[-0.6, 2.95, -3.935]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      {/* chalk ledge */}
      <Box size={[1.95, 0.05, 0.1]} position={[-0.6, 2.27, -3.9]} color={C.wood} />
      <Box size={[0.12, 0.025, 0.025]} position={[-0.2, 2.31, -3.88]} color="#f3efe4" shadow={false} />
    </Hotspot>
  );
}

// ── Jar shelves (Stack): one shelf per skill group ──────────────────────────
function Jar({ position, fill, height }: { position: [number, number, number]; fill: string; height: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height * 0.42, 0]}>
        <cylinderGeometry args={[0.1, 0.1, height * 0.84, 18]} />
        <meshStandardMaterial color={fill} roughness={0.85} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.115, 0.115, height, 18]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.22} roughness={0.05} />
      </mesh>
      <mesh position={[0, height + 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.06, 18]} />
        <meshStandardMaterial color="#2a2522" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function ShelfLabel({ text, position }: { text: string; position: [number, number, number] }) {
  const tex = useCanvasTexture(drawLabel(text), 1280, 96, [text]);
  return (
    <mesh position={position}>
      <planeGeometry args={[2.1, 0.16]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}

function JarShelves({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const groups = profile.skills.filter((g) => !g.archived).slice(0, 3);
  const fills = ["#5b3a29", "#c9a46b", "#7a8f5a", "#a8553f", "#e6dcc8", "#3f2b20"];
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (strip.current && !room.calm) strip.current.opacity = 0.75 + Math.sin(clock.elapsedTime * 1.4) * 0.15;
  });
  return (
    <Hotspot id="stack" room={room} labelAt={[2.75, 3.75, -3.7]}>
      {[1.75, 2.45, 3.15].map((y, row) => {
        const group = groups[row];
        const count = group ? Math.min(6, Math.max(3, group.items.length)) : 4;
        return (
          <group key={row}>
            <Box size={[2.2, 0.06, 0.38]} position={[2.75, y, -3.8]} color={C.wood} rough={0.5} />
            {Array.from({ length: count }).map((_, i) => (
              <Jar
                key={i}
                position={[2.75 - 0.9 + (i * 1.8) / Math.max(count - 1, 1), y + 0.03, -3.82]}
                fill={fills[(row * 2 + i) % fills.length]}
                height={0.3 + ((row + i) % 3) * 0.06}
              />
            ))}
            {group && <ShelfLabel text={group.group} position={[2.75, y - 0.03, -3.605]} />}
          </group>
        );
      })}
      {/* warm light strip under the top shelf */}
      <mesh position={[2.75, 3.11, -3.75]}>
        <boxGeometry args={[2.1, 0.02, 0.02]} />
        <meshBasicMaterial ref={strip} color={new THREE.Color(C.amber).multiplyScalar(room.night ? 3 : 1.2)} toneMapped={false} transparent />
      </mesh>
      <pointLight position={[2.75, 2.6, -3.2]} color={C.amber} intensity={room.night ? 2.5 : 0.6} distance={3} decay={2} />
    </Hotspot>
  );
}

// ── Award frames (Certificates) + the neon sign above the window ────────────
function Awards({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const { motto: MOTTO } = useStudioData().layout;
  const neon = useCanvasTexture(drawNeon(profile.studio.neon, C.teal), 1680, 440, [profile.studio.neon, C.teal]);
  return (
    <>
      <Hotspot id="certs" room={room} labelAt={[-3.6, 3.0, -2.25]}>
        {profile.certificates.slice(0, 3).map((c, i) => (
          <Certificate key={c.title} cert={c} position={[-3.97, 2.3, -3.15 + i * 0.9]} scale={0.75} />
        ))}
      </Hotspot>
      <Hotspot id="motto" room={room} labelAt={[-3.6, 3.0, MOTTO.center[2]]} pivot={MOTTO.center}>
        <mesh position={MOTTO.center} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={MOTTO.size} />
          <meshBasicMaterial map={neon} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </Hotspot>
    </>
  );
}

// ── Photo wall (Career) ─────────────────────────────────────────────────────
function PhotoWall({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const tex = useCanvasTexture(drawPolaroids(profile.experience, C.teal), 1400, 640, [JSON.stringify(profile.experience), C.teal]);
  return (
    <Hotspot id="career" room={room} labelAt={[-2.75, 3.45, -3.8]}>
      <mesh position={[-2.75, 2.6, -3.985]}>
        <planeGeometry args={[2.1, 0.96]} />
        <meshStandardMaterial map={tex} transparent roughness={0.9} />
      </mesh>
      {/* a little shelf of coffee bags under the photos */}
      <Box size={[1.6, 0.05, 0.25]} position={[-2.75, 1.8, -3.88]} color={C.wood} />
      {[-0.55, -0.2, 0.15, 0.5].map((dx, i) => (
        <RoundedBox key={dx} args={[0.22, 0.32, 0.12]} radius={0.03} position={[-2.75 + dx, 1.99, -3.88]} castShadow>
          <meshStandardMaterial color={["#a8553f", "#3f2b20", "#c9a46b", "#5b3a29"][i]} roughness={0.8} />
        </RoundedBox>
      ))}
    </Hotspot>
  );
}

// ── Recipe box (Archive): the lid opens to show the index cards ─────────────
function RecipeBox({ room }: { room: RoomProps }) {
  const { C, profile } = useRoom();
  const lid = useRef<THREE.Group>(null);
  const open = room.active === "archive";
  const peek = room.hovered === "archive" && !room.active;
  useFrame((_, dt) => {
    if (!lid.current) return;
    const goal = open ? -1.9 : peek ? -0.35 : 0;
    lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, goal, 6, dt);
  });
  const labels = [0, 1, 2, 3].map((i) => profile.studio.drawers[i] ?? "");
  return (
    <Hotspot id="archive" room={room} labelAt={[2.6, 1.95, -2.15]}>
      <group position={[2.6, TOP, -2.15]} rotation={[0, -0.25, 0]}>
        <Box size={[0.62, 0.3, 0.42]} position={[0, 0.15, 0]} color={C.wood} rough={0.5} />
        <Box size={[0.12, 0.05, 0.02]} position={[0, 0.2, 0.22]} color="#c9a96a" metal={0.8} rough={0.3} />
        {/* index cards with tabs */}
        {labels.map((label, i) => (
          <IndexCard key={i} label={label} z={0.12 - i * 0.08} />
        ))}
        <group ref={lid} position={[0, 0.3, -0.21]}>
          <Box size={[0.64, 0.05, 0.44]} position={[0, 0.025, 0.21]} color={C.woodDark} rough={0.5} />
        </group>
      </group>
    </Hotspot>
  );
}

function IndexCard({ label, z }: { label: string; z: number }) {
  const tex = useCanvasTexture(drawLabel(label), 320, 96, [label]);
  return (
    <group position={[0, 0.25, z]}>
      <Box size={[0.56, 0.2, 0.01]} position={[0, 0, 0]} color="#f2ead8" rough={0.95} shadow={false} />
      <mesh position={[0, 0.06, 0.006]}>
        <planeGeometry args={[0.32, 0.09]} />
        <meshStandardMaterial map={tex} />
      </mesh>
    </group>
  );
}

// ── Bistro tables by the window ─────────────────────────────────────────────
function Bistro({ position }: { position: [number, number, number] }) {
  const { C } = useRoom();
  return (
    <group position={position}>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
        <meshStandardMaterial color={C.wood} roughness={0.4} />
      </mesh>
      <Box size={[0.05, 0.76, 0.05]} position={[0, 0.38, 0]} color={C.metal} metal={0.6} rough={0.35} />
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.03, 24]} />
        <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.35} />
      </mesh>
      {[0.65, -0.65].map((dx) => (
        <group key={dx} position={[dx, 0, 0]}>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
            <meshStandardMaterial color={C.velvet} roughness={0.8} />
          </mesh>
          <Box size={[0.04, 0.46, 0.04]} position={[0, 0.23, 0]} color={C.metal} metal={0.6} rough={0.35} />
        </group>
      ))}
      <mesh position={[0.1, 0.86, 0.05]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 16]} />
        <meshStandardMaterial color="#efe8dc" roughness={0.4} />
      </mesh>
    </group>
  );
}

// ── Armchair corner (About) ─────────────────────────────────────────────────
function ArmchairCorner({ room }: { room: RoomProps }) {
  const { C } = useRoom();
  return (
    <Hotspot id="about" room={room} labelAt={[2.5, 2.1, 1.6]}>
      <mesh position={[2.5, 0.01, 1.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial color={C.rug} roughness={1} />
      </mesh>
      <group position={[2.7, 0, 1.35]} rotation={[0, -0.75, 0]}>
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
        {/* an open book on the seat */}
        <group position={[0.05, 0.54, 0.12]} rotation={[0, 0.3, 0]}>
          <Box size={[0.22, 0.03, 0.3]} position={[-0.11, 0, 0]} rotation={[0, 0, 0.08]} color="#f4ecdc" rough={0.9} />
          <Box size={[0.22, 0.03, 0.3]} position={[0.11, 0, 0]} rotation={[0, 0, -0.08]} color="#f4ecdc" rough={0.9} />
        </group>
      </group>
      {/* side table with a latte */}
      <mesh position={[1.45, 0.55, 0.6]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
        <meshStandardMaterial color={C.wood} roughness={0.45} />
      </mesh>
      <Box size={[0.05, 0.55, 0.05]} position={[1.45, 0.27, 0.6]} color={C.metal} />
      <mesh position={[1.45, 0.63, 0.6]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 20]} />
        <meshStandardMaterial color="#efe8dc" roughness={0.4} />
      </mesh>
      <Steam position={[1.45, 0.72, 0.6]} calm={room.calm} />
      {/* floor lamp */}
      <group position={[3.7, 0, 0.1]}>
        <Box size={[0.04, 1.9, 0.04]} position={[0, 0.95, 0]} color={C.metal} />
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
          <meshStandardMaterial color={C.metal} />
        </mesh>
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 0.32, 24, 1, true]} />
          <meshStandardMaterial color="#f3e3c3" emissive={C.amber} emissiveIntensity={room.night ? 1.4 : 0.1} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 1.8, 0]} color={C.amber} intensity={room.night ? 5 : 0.5} distance={5} decay={2} />
      </group>
    </Hotspot>
  );
}

export function Cafe(props: RoomProps) {
  const { profile } = useRoom();
  const { twin } = useStudioData();
  return (
    <group>
      <Lights night={props.night} calm={props.calm} lamp={[1.4, 2.4, -1.6]} />
      <Shell night={props.night} />
      <Counter room={props} />
      <Chalkboard room={props} />
      <JarShelves room={props} />
      <Awards room={props} />
      <PhotoWall room={props} />
      <RecipeBox room={props} />
      {profile.phone && <Telephone room={props} position={[3.45, TOP, -2.05]} rotation={[0, -0.35, 0]} />}
      <ArmchairCorner room={props} />
      {twin !== "off" && <Hologram room={props} at={[0.75, -3.15]} lift={0.55} />}
      <Bistro position={[-2.45, 0, 0.4]} />
      <Bistro position={[-1.2, 0, 2.5]} />
      <Plant position={[-3.35, 0, 3.4]} />
    </group>
  );
}
