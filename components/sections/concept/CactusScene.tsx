"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { sceneProgress, skyAt, type Wind } from "./scenes";

// Low-poly cactus (same flat-shaded style as GrowthScene's).
// SCENE 2: grows segment by segment and bends only slightly in the wind before springing back.
// SCENE 3: keeps growing while the light circles it (day → sunset → moonlight → dawn), turning its shadow.
// SCENE 4: a coral/yellow flower opens on top.
const GREEN = { dark: "#6b8049", base: "#7f9657", light: "#93a96a" };
const SEGMENT = { count: 4, height: 0.55 };
// Local SCENE 2 progress at which each part pops in.
const GROWTH = { segments: [0.2, 0.33, 0.46, 0.59], cap: 0.64, leftArm: 0.72, rightArm: 0.84, pop: 0.1 };
const SPROUT = { start: 0.06, length: 0.1 }; // local SCENE 2 progress; it hands over to the first segment
const BLOOM = { start: 0.08, length: 0.2 }; // local SCENE 4 progress
const PETALS = ["#e96b5a", "#e9a33a", "#e96b5a", "#e9a33a", "#e96b5a", "#e9a33a"];
const LIGHT = { day: new THREE.Color("#fff0cc"), low: new THREE.Color("#ffb27a"), moon: new THREE.Color("#9fb4e6") };

const easeOutBack = (t: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const popAt = (progress: number, start: number, length = GROWTH.pop) => {
  const t = Math.min(Math.max((progress - start) / length, 0), 1);
  return t === 0 ? 0 : easeOutBack(t);
};

function Spines({ height, radius }: { height: number; radius: number }) {
  return <>{[0.25, 0.6].flatMap((y, row) => [0, 1, 2].map(index => {
    const angle = index * (Math.PI * 2 / 3) + row * 0.9;
    return (
      <mesh key={`${row}-${index}`} position={[Math.cos(angle) * radius, y * height, Math.sin(angle) * radius]} rotation={[0, -angle, Math.PI / 2]}>
        <coneGeometry args={[0.014, 0.09, 3]} />
        <meshStandardMaterial color="#efe3c4" />
      </mesh>
    );
  }))}</>;
}

function Arm({ side }: { side: 1 | -1 }) {
  return (
    <group>
      <mesh position={[side * 0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.12, 0.34, 6]} />
        <meshStandardMaterial color={GREEN.base} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[side * 0.38, 0.24, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.5, 6]} />
        <meshStandardMaterial color={GREEN.light} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[side * 0.38, 0.5, 0]} scale={[0.09, 0.08, 0.09]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={GREEN.light} flatShading />
      </mesh>
    </group>
  );
}

function Flower({ petals }: { petals: MutableRefObject<(THREE.Group | null)[]> }) {
  return (
    <group position={[0, 0.16, 0]} scale={1.6}>
      {PETALS.map((color, index) => (
        <group key={index} rotation={[0, (index / PETALS.length) * Math.PI * 2, 0]}>
          {/* Each petal hinges at the center; it opens by tilting outward from upright. */}
          <group ref={node => { petals.current[index] = node; }}>
            <mesh position={[0, 0.11, 0]} scale={[0.06, 0.12, 0.025]}>
              <sphereGeometry args={[1, 6, 4]} />
              <meshStandardMaterial color={color} flatShading roughness={0.7} />
            </mesh>
          </group>
        </group>
      ))}
      <mesh scale={0.055}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#e9a33a" flatShading />
      </mesh>
    </group>
  );
}

type Props = { progress: MotionValue<number>; wind: MutableRefObject<Wind>; reduced: boolean; running: boolean };

function Cactus({ progress, wind, reduced }: Omit<Props, "running">) {
  const root = useRef<THREE.Group>(null);
  const segments = useRef<(THREE.Group | null)[]>([]);
  const cap = useRef<THREE.Group>(null);
  const flower = useRef<THREE.Group>(null);
  const petals = useRef<(THREE.Group | null)[]>([]);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const sprout = useRef<THREE.Group>(null);
  const bend = useRef({ angle: 0, velocity: 0 });
  useEffect(() => {
    root.current?.traverse(object => { if (object instanceof THREE.Mesh) object.castShadow = true; });
  }, []);
  useFrame((_, delta) => {
    const value = progress.get();
    const local = reduced ? 1 : sceneProgress(value, "build");
    // Parts that have not popped in yet are hidden, not just squashed (a flat segment reads as a green disc).
    const show = (part: THREE.Group | null, amount: number, axis: "y" | "all") => {
      if (!part) return;
      part.visible = amount > 0.001;
      if (axis === "y") part.scale.y = Math.max(amount, 0.0001);
      else part.scale.setScalar(Math.max(amount, 0.0001));
    };
    // Sprout → cactus: the bud pops out of the sand, then shrinks into the first segment as it grows.
    show(sprout.current, popAt(local, SPROUT.start, SPROUT.length) * (1 - Math.min(popAt(local, GROWTH.segments[0]), 1)), "all");
    GROWTH.segments.forEach((start, index) => show(segments.current[index], popAt(local, start), "y"));
    show(cap.current, popAt(local, GROWTH.cap), "all");
    [GROWTH.leftArm, GROWTH.rightArm].forEach((start, index) => show(arms.current[index], popAt(local, start), "all"));
    // Keeps growing a little through the changing sky and into the bloom.
    if (root.current) root.current.scale.setScalar(1 + 0.12 * sceneProgress(value, "adapt") + 0.04 * sceneProgress(value, "grow"));
    const bloom = popAt(sceneProgress(value, "grow"), BLOOM.start, BLOOM.length);
    show(flower.current, Math.min(bloom * 1.6, 1.2), "all");
    petals.current.forEach(petal => { if (petal) petal.rotation.x = -0.15 - Math.min(bloom, 1.1) * 1.05; });
    // Damped spring toward a small wind-driven lean: it gives a little, then settles back.
    const target = reduced ? 0 : THREE.MathUtils.clamp(-wind.current.value * 0.05, -0.09, 0.09);
    const spring = bend.current;
    const step = Math.min(delta, 0.05);
    spring.velocity += ((target - spring.angle) * 38 - spring.velocity * 7) * step;
    spring.angle += spring.velocity * step;
    // Each nested segment adds part of the lean, so the cactus curves slightly instead of tipping like a pole.
    segments.current.forEach((segment, index) => { if (segment) segment.rotation.z = spring.angle * (0.35 + index * 0.15); });
  });
  // Segments are nested: each one sits on top of the previous and inherits its scale and lean.
  const build = (index: number): JSX.Element | null => {
    if (index >= SEGMENT.count) {
      return (
        <group ref={cap} position={[0, SEGMENT.height, 0]}>
          <mesh position={[0, 0.02, 0]} scale={[0.2, 0.14, 0.2]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={GREEN.light} flatShading />
          </mesh>
          <group ref={flower}><Flower petals={petals} /></group>
        </group>
      );
    }
    const radius = 0.27 - index * 0.025;
    return (
      <group ref={node => { segments.current[index] = node; }} position={[0, index === 0 ? 0 : SEGMENT.height, 0]}>
        <mesh position={[0, SEGMENT.height / 2, 0]}>
          <cylinderGeometry args={[radius - 0.02, radius, SEGMENT.height, 7]} />
          <meshStandardMaterial color={index % 2 ? GREEN.base : GREEN.dark} flatShading roughness={0.9} />
        </mesh>
        <Spines height={SEGMENT.height} radius={radius} />
        {index === 1 && <group ref={node => { arms.current[0] = node; }} position={[0, 0.3, 0]}><Arm side={-1} /></group>}
        {index === 2 && <group ref={node => { arms.current[1] = node; }} position={[0, 0.15, 0]}><Arm side={1} /></group>}
        {build(index + 1)}
      </group>
    );
  };
  return (
    <group ref={root} position={[0, -0.05, 0]} rotation={[0, -0.35, 0]}>
      <group ref={sprout}>
        <mesh position={[0, 0.1, 0]} scale={[0.13, 0.17, 0.13]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={GREEN.light} flatShading />
        </mesh>
        <mesh position={[0.07, 0.2, 0]} rotation={[0, 0, -0.6]} scale={[0.04, 0.09, 0.03]}>
          <sphereGeometry args={[1, 5, 4]} />
          <meshStandardMaterial color={GREEN.base} flatShading />
        </mesh>
      </group>
      {build(0)}
    </group>
  );
}

// The light circles the cactus with the time of day; below the horizon it becomes a dim moonlight from the opposite side.
function Lights({ progress }: { progress: MotionValue<number> }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const sky = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    const { sunAngle, night } = skyAt(progress.get());
    const angle = THREE.MathUtils.degToRad(sunAngle);
    const height = Math.sin(angle);
    const isSun = height >= 0;
    const direction = isSun ? angle : angle + Math.PI;
    if (sun.current) {
      sun.current.position.set(Math.cos(direction) * 6, Math.abs(height) * 6 + 0.6, 3);
      sun.current.intensity = isSun ? 0.6 + 2 * Math.sqrt(height) : 0.5 * -height;
      sun.current.color.copy(isSun ? LIGHT.low.clone().lerp(LIGHT.day, Math.min(height * 1.4, 1)) : LIGHT.moon);
    }
    if (sky.current) sky.current.intensity = 1.5 - night * 0.9;
  });
  return (
    <>
      <hemisphereLight ref={sky} args={["#fff4dc", "#a98a5f", 1.5]} />
      <directionalLight ref={sun} position={[4, 6, 3]} intensity={2.6} color="#fff0cc" castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-1} />
    </>
  );
}

function FrameControl({ running, reduced, progress }: { running: boolean; reduced: boolean; progress: MotionValue<number> }) {
  const { invalidate } = useThree();
  // Reduced motion has no render loop, so redraw on scroll to keep the scenes in step. Off screen nothing redraws.
  useEffect(() => {
    invalidate();
    if (running || !reduced) return;
    return progress.on("change", () => invalidate());
  }, [running, reduced, progress, invalidate]);
  return null;
}

export default function CactusScene({ progress, wind, reduced, running }: Props) {
  return (
    <Canvas shadows frameloop={running ? "always" : "demand"} dpr={[1, 1.5]} camera={{ position: [0, 1.7, 8.5], fov: 34 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }}
      onCreated={({ camera }) => camera.lookAt(0, 1.35, 0)}>
      <Lights progress={progress} />
      <Cactus progress={progress} wind={wind} reduced={reduced} />
      {/* Invisible ground that only shows the cactus shadow on top of the sand image. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
      <FrameControl running={running} reduced={reduced} progress={progress} />
    </Canvas>
  );
}
