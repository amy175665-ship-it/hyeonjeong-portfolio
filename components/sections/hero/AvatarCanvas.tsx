"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import styles from "./HeroAvatar.module.css";

const MODEL_URL = "/models/avatar6.glb";
const ROTATION_LIMIT = { x: 0.15, y: 0.48 };
const ROTATION_SMOOTHING = 6;
const IDLE_MOTION = { delay: 1.8, floatHeight: 0.025, turnAngle: 0.10, blendSpeed: 2 };
// Normalize the head height, then center it inside the rotating parent.
const MODEL_HEIGHT = 2.8;
const MODEL_OFFSET: [number, number, number] = [0, 0, 0];

function Avatar3D({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  // Mounted means the model has loaded (Suspense resolved); the wrapper can start its entrance.
  useEffect(() => { onReady(); }, [onReady]);
  const pivot = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(false);
  const idle = useRef({ sincePointer: IDLE_MOTION.delay, time: 0, blend: 0 });
  const model = useMemo(() => {
    // Clone objects only; leave the cached GLTF geometry and face/hat materials intact.
    const clone = scene.clone(true);
    // The export contains overlapping brown and dark hair. Hide only the dark
    // duplicate in this scene; preserve the GLB and both original materials.
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        if (materials.some((material) => material.name === "Hair_Web.001")) {
          object.visible = false;
        }
      }
    });
    clone.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(clone, true);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = MODEL_HEIGHT / Math.max(size.y, 0.001);
    return { clone, scale, position: center.multiplyScalar(-scale) };
  }, [scene]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reset = () => {
      target.current = { x: 0, y: 0 };
      idle.current.sincePointer = 0;
    };
    const updatePreference = () => { reducedMotion.current = preference.matches; reset(); };
    const move = (event: PointerEvent) => {
      if (reducedMotion.current || event.pointerType === "touch") return;
      idle.current.sincePointer = 0;
      target.current = {
        x: THREE.MathUtils.clamp(event.clientY / innerHeight * 2 - 1, -1, 1) * ROTATION_LIMIT.x,
        y: THREE.MathUtils.clamp(event.clientX / innerWidth * 2 - 1, -1, 1) * ROTATION_LIMIT.y,
      };
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
    updatePreference();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    preference.addEventListener("change", updatePreference);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
      preference.removeEventListener("change", updatePreference);
    };
  }, []);

  useFrame((_, delta) => {
    if (!pivot.current) return;
    if (reducedMotion.current) {
      pivot.current.rotation.set(0, 0, 0);
      pivot.current.position.y = 0;
      idle.current.blend = 0;
      return;
    }
    // Clamp resumed frames so returning to a backgrounded tab never causes a jump.
    const step = Math.min(delta, 0.05);
    const motion = idle.current;
    motion.time += step;
    motion.sincePointer += step;
    const resting = motion.sincePointer >= IDLE_MOTION.delay;
    motion.blend = THREE.MathUtils.lerp(motion.blend, resting ? 1 : 0,
      1 - Math.exp(-(resting ? IDLE_MOTION.blendSpeed : ROTATION_SMOOTHING) * step));
    // Two slow waves keep the turn gentle without a mechanical left/right rhythm.
    const turn = IDLE_MOTION.turnAngle * (0.75 * Math.sin(motion.time * 0.48)
      + 0.25 * Math.sin(motion.time * 0.27));
    const alpha = 1 - Math.exp(-ROTATION_SMOOTHING * step);
    pivot.current.rotation.x = THREE.MathUtils.lerp(pivot.current.rotation.x, target.current.x * (1 - motion.blend), alpha);
    pivot.current.rotation.y = THREE.MathUtils.lerp(pivot.current.rotation.y,
      THREE.MathUtils.lerp(target.current.y, turn, motion.blend), alpha);
    pivot.current.position.y = IDLE_MOTION.floatHeight * Math.sin(motion.time * 1.05) * motion.blend;
  });

  return (
    <group ref={pivot} name="avatar-pivot">
      <group position={MODEL_OFFSET}>
        <group position={model.position} scale={model.scale}>
          <primitive object={model.clone} dispose={null} />
        </group>
      </group>
    </group>
  );
}

export default function AvatarCanvas() {
  const { active } = useProgress();
  const marker = useRef<HTMLSpanElement>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => setReady(true), []);
  // Stop rendering while an ancestor [data-pause-scope] is marked [data-paused] (the hero covered by the sand).
  // Kept as state so the Canvas prop itself says "never"; re-renders cannot switch the loop back on.
  useEffect(() => {
    const scope = marker.current?.closest("[data-pause-scope]");
    if (!scope) return;
    const update = () => setPaused(scope.hasAttribute("data-paused"));
    const observer = new MutationObserver(update);
    observer.observe(scope, { attributes: true, attributeFilter: ["data-paused"] });
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <span ref={marker} hidden />
      {/* Fades and rises in on its own a moment after the model loads. */}
      <div className={`${styles.entrance} ${ready ? styles.entranceReady : ""}`}>
      <Canvas frameloop={paused ? "never" : "always"} camera={{ position: [0, 0, 6], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <hemisphereLight args={["#ffffff", "#b4c6d5", 2]} />
        <directionalLight position={[3, 4, 5]} intensity={3} />
        <directionalLight position={[-3, 1, 3]} intensity={1} />
        <Suspense fallback={null}><Avatar3D onReady={reveal} /></Suspense>
      </Canvas>
      </div>
      {active && <p className={styles.status} role="status">얼굴 모델을 불러오는 중입니다.</p>}
    </>
  );
}

useGLTF.preload(MODEL_URL);
