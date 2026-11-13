"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  Building blocks shared by every place (Room, Cafe, Park, Shop): the clickable wrapper,
//  boxes, lights, and the objects that look the same anywhere: certificate
//  frames, the telephone, steam, the hologram and a pot plant. Everything is
//  primitives + canvas textures, so there are no model files to download.
// ─────────────────────────────────────────────────────────────────────────────

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Float, Html, RoundedBox, useCursor, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Certificate } from "@/lib/profile";
import { MOTTO_HINT, type HotspotId } from "./hotspots";
import { useHotspots, useStudioData } from "./StudioData";
import { drawCertificate, drawInitials, useCanvasTexture } from "./textures";

// The colours come from the CV's design (lib/designs.ts).
export function useRoom() {
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

// ── Clickable wrapper (one CV section per object) ───────────────────────────────────────────────────────
export function Hotspot({
  id,
  room,
  labelAt,
  pivot,
  children,
}: {
  id: HotspotId;
  room: RoomProps;
  labelAt: [number, number, number];
  pivot?: [number, number, number]; // the hover lift scales around this point; default: the object's centre
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const isHover = room.hovered === id && room.active === null;
  useCursor(room.hovered === id);

  // Grow in place. Scaled around the room's origin instead, objects on the
  // walls slid into the wall and out from under the pointer, so hovering
  // flickered on and off.
  useLayoutEffect(() => {
    const outer = ref.current;
    const content = inner.current;
    if (!outer || !content) return;
    // Measure from a clean slate: this can run twice (React's dev double
    // effects), and measuring the already-shifted content gives the origin.
    outer.position.set(0, 0, 0);
    content.position.set(0, 0, 0);
    outer.updateWorldMatrix(true, true);
    let c: THREE.Vector3;
    if (pivot) c = new THREE.Vector3(...pivot);
    else {
      c = new THREE.Box3().setFromObject(content).getCenter(new THREE.Vector3());
      outer.parent?.worldToLocal(c);
    }
    outer.position.copy(c);
    content.position.copy(c).negate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pivot?.[0], pivot?.[1], pivot?.[2]]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, isHover ? 1.035 : 1, 10, dt);
    g.scale.setScalar(s);
  });

  const hotspots = useHotspots();
  const hint = id === "motto" ? MOTTO_HINT : (hotspots.find((h) => h.id === id)?.hint ?? "");

  return (
    <group
      ref={ref}
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
      <group ref={inner}>
        {children}
        {isHover && (
          <Html position={labelAt} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div className="scene-label">{hint}</div>
          </Html>
        )}
      </group>
    </group>
  );
}

export function Box({
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

// ── A framed certificate, facing +x on a left wall by default ───────────────
export function Certificate({
  cert,
  position,
  rotation = [0, Math.PI / 2, 0],
  scale = 1,
}: {
  cert: Certificate;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { C, profile } = useRoom();
  const tex = useCanvasTexture(drawCertificate(cert, profile.name), 640, 820, [JSON.stringify(cert), profile.name]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Box size={[0.98, 1.24, 0.05]} position={[0, 0, 0]} color={C.woodDark} rough={0.4} />
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.86, 1.1]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── Telephone: click to call ─────────────────────────────────
// Not a CV section, so it isn't a <Hotspot>: it has no panel or dock entry,
// it just dials. The About panel has the same number as a link.
export function Telephone({
  room,
  position = [-3.3, 2.04, -3.0],
  rotation = [0, 0.55, 0],
}: {
  room: RoomProps;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
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
      position={position}
      rotation={rotation}
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

// ── Steam rising from a cup ─────────────────────────────────────────────────
export function Steam({ position, calm }: { position: [number, number, number]; calm: boolean }) {
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

export function Hologram({
  room,
  at = [-1.6, 1.0],
  lift = 0,
}: {
  room: RoomProps;
  at?: [number, number]; // x, z on the floor
  lift?: number; // raise it, e.g. to stand behind a counter
}) {
  const [x, z] = at;
  const { C, profile } = useRoom();
  const rings = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!rings.current || room.calm) return;
    rings.current.rotation.y += dt * 0.6;
    rings.current.rotation.z += dt * 0.15;
  });
  const glow = new THREE.Color(C.teal).multiplyScalar(room.night ? 2.2 : 1.4);

  return (
    <Hotspot id="twin" room={room} labelAt={[x, 2.6 + lift, z]}>
      <group position={[0, lift, 0]}>
        <mesh position={[x, 0.3, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.5, 0.6, 40]} />
          <meshStandardMaterial color="#1a2131" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[x, 0.61, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.38, 48]} />
          <meshBasicMaterial color={glow} toneMapped={false} />
        </mesh>
        {/* light cone */}
        <mesh position={[x, 1.1, z]}>
          <cylinderGeometry args={[0.5, 0.32, 1.0, 40, 1, true]} />
          <meshBasicMaterial color={C.teal} transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <Float speed={room.calm ? 0 : 2} floatIntensity={room.calm ? 0 : 0.6} rotationIntensity={0}>
          <Billboard position={[x, 1.55, z]}>{profile.avatar ? <PhotoFace src={profile.avatar} /> : <InitialsFace />}</Billboard>
          <group ref={rings} position={[x, 1.55, z]}>
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
        <pointLight position={[x, 1.5, z]} color={C.teal} intensity={room.night ? 4 : 1} distance={4} decay={2} />
      </group>
    </Hotspot>
  );
}

export function Plant({ position = [-3.35, 0, 2.9] }: { position?: [number, number, number] }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        pos: [Math.cos(i * 2.4) * 0.22, 0.75 + (i % 3) * 0.2, Math.sin(i * 2.4) * 0.22] as [number, number, number],
        s: 0.22 + (i % 3) * 0.05,
      })),
    [],
  );
  return (
    <group position={position}>
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
export function Lights({
  night,
  calm,
  lamp: lampAt = [0.2, 1.75, -3.3],
}: {
  night: boolean;
  calm: boolean;
  lamp?: [number, number, number]; // the warm light that flickers on in the intro
}) {
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
      <pointLight ref={lamp} position={lampAt} color="#ffb867" distance={6} decay={2} castShadow shadow-mapSize={[512, 512]} />
    </>
  );
}
