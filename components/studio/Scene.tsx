"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Cafe } from "./Cafe";
import { Park } from "./Park";
import type { RoomProps } from "./parts";
import { Room } from "./Room";
import { Shop } from "./Shop";
import { useStudioData } from "./StudioData";

const UP = new THREE.Vector3(0, 1, 0);
const PLACES = { room: Room, cafe: Cafe, park: Park, shop: Shop };

// Flies between the overview and each hotspot's close-up. Damped every frame,
// so a new selection mid-flight just bends the path instead of restarting it.
// `showcase` (the landing page): the room drifts slowly on its own and sits to
// the right of the headline, or above it on phones.
function CameraRig({ active, calm, showcase }: Pick<RoomProps, "active" | "calm"> & { showcase?: boolean }) {
  const { camera, size, pointer } = useThree();
  const { home: HOME_VIEW, intro: INTRO_VIEW, motto: MOTTO, views: VIEWS } = useStudioData().layout;
  const look = useRef(new THREE.Vector3(...(calm ? HOME_VIEW.target : INTRO_VIEW.target)));
  const started = useRef(false);
  const goalPos = useRef(new THREE.Vector3());
  const goalLook = useRef(new THREE.Vector3());

  if (!started.current) {
    camera.position.set(...(calm ? HOME_VIEW.camera : INTRO_VIEW.camera));
    camera.lookAt(look.current);
    started.current = true;
  }

  useFrame((state, dt) => {
    const aspect = size.width / size.height;
    const narrow = size.width < 820;
    const spot = VIEWS.find((h) => h.id === active);

    if (active === "motto") {
      // Square on to the sign, far enough back that it fills ~85% of the width.
      const span = 2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2));
      const dist = Math.max((MOTTO.size[1] * 1.8) / span, (MOTTO.size[0] * 1.18) / (span * aspect));
      goalLook.current.set(...MOTTO.center);
      goalPos.current.set(MOTTO.center[0] + dist, MOTTO.center[1] - 0.15, MOTTO.center[2]);
    } else if (spot) {
      goalPos.current.set(...spot.camera);
      goalLook.current.set(...spot.target);
      // Close-up views are authored tight; frame them with some breathing room.
      goalPos.current.sub(goalLook.current).multiplyScalar(1.4).add(goalLook.current);
      const dir = goalLook.current.clone().sub(goalPos.current);
      if (narrow) {
        // Bottom sheet covers the lower half: back off and look lower so the
        // object sits in the top half of the screen.
        goalPos.current.addScaledVector(dir.normalize(), -1.2);
        goalLook.current.y -= 0.55;
      } else if (showcase) {
        // The landing copy covers the left. From 1200px the object's panel
        // covers the right too (see .hero .panel), so the object sits between
        // them; on narrower screens it sits on the right.
        const right = dir.normalize().cross(UP).normalize();
        goalLook.current.addScaledVector(right, size.width >= 1200 ? -0.25 : -1.1);
      } else {
        // Side panel covers the right: aim to the right so the object sits left.
        const right = dir.normalize().cross(UP).normalize();
        goalLook.current.addScaledVector(right, 0.75);
      }
    } else {
      goalPos.current.set(...HOME_VIEW.camera);
      goalLook.current.set(...HOME_VIEW.target);
      // Fit the whole room on portrait screens.
      const fit = aspect < 1.25 ? Math.min(2.7, 1.25 / aspect) : 1;
      goalPos.current.sub(goalLook.current).multiplyScalar(fit).add(goalLook.current);
      if (showcase) {
        // Swing slowly around the room, then frame it beside (or above) the copy.
        if (!calm) {
          const yaw = Math.sin(state.clock.elapsedTime * 0.14) * 0.3;
          goalPos.current.sub(goalLook.current).applyAxisAngle(UP, yaw).add(goalLook.current);
        }
        const dir = goalLook.current.clone().sub(goalPos.current).normalize();
        if (narrow) {
          goalPos.current.addScaledVector(dir, -4);
          goalLook.current.y -= 3.3;
        } else {
          // Squarer windows leave less room beside the copy: step further back.
          goalPos.current.addScaledVector(dir, -(3.5 + Math.max(0, 1.6 - aspect) * 9));
          goalLook.current.addScaledVector(dir.cross(UP).normalize(), -3);
        }
      } else if (!calm) {
        goalPos.current.x += pointer.x * 0.8;
        goalPos.current.y += pointer.y * 0.5;
      }
    }

    const lambda = calm ? 8 : 2.6;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.current.x, lambda, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.current.y, lambda, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.current.z, lambda, dt);
    look.current.x = THREE.MathUtils.damp(look.current.x, goalLook.current.x, lambda, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, goalLook.current.y, lambda, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, goalLook.current.z, lambda, dt);
    camera.lookAt(look.current);
  });

  return null;
}

export default function Scene(props: RoomProps & { onReady: () => void; showcase?: boolean; paused?: boolean }) {
  const { onReady, showcase, paused, ...room } = props;
  const { design, place } = useStudioData();
  const { palette } = design;
  const Place = PLACES[place.id];
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 1.75]}
      camera={{ fov: 32, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={paused ? "never" : "always"}
      onCreated={() => onReady()}
      onPointerMissed={() => room.setHovered(null)}
    >
      <Suspense fallback={null}>
        <Environment resolution={128} environmentIntensity={room.night ? 0.25 : 0.7}>
          <Lightformer form="rect" intensity={2} position={[0, 6, 4]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1} color={palette.teal} position={[-6, 3, 0]} scale={[4, 4, 1]} />
          <Lightformer form="rect" intensity={1.5} color={palette.amber} position={[6, 2, 2]} scale={[4, 3, 1]} />
        </Environment>
        <Place {...room} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={room.night ? 0.9 : 0.4} radius={0.7} />
          <Vignette eskil={false} offset={0.25} darkness={room.night ? 0.65 : 0.35} />
        </EffectComposer>
      </Suspense>
      <CameraRig active={room.active} calm={room.calm} showcase={showcase} />
    </Canvas>
  );
}
