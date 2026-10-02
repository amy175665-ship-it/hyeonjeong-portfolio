"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import styles from "./GrowthScene.module.css";

// Keep the cactus scene available for reuse; the avatar occupies its slot for now.
const SHOW_CACTUS = false;

function Cactus({ near, reduced }: { near: React.MutableRefObject<boolean>; reduced: boolean }) {
  const plant = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!plant.current) return;
    const blend = reduced ? 1 : 1 - Math.exp(-4 * Math.min(delta, .05));
    plant.current.rotation.z = THREE.MathUtils.lerp(plant.current.rotation.z, near.current && !reduced ? -.1 : 0, blend);
    const size = near.current && !reduced ? 1.045 : 1;
    plant.current.scale.lerp(new THREE.Vector3(size, size, size), blend);
  });
  return <group rotation={[0, -.3, 0]} position={[0, -.7, 0]}>
    <mesh position={[0, -.38, 0]}><cylinderGeometry args={[.48, .31, .65, 7]} /><meshStandardMaterial color="#b36e52" flatShading roughness={.95} /></mesh>
    <mesh position={[0, -.05, 0]}><cylinderGeometry args={[.52, .49, .16, 7]} /><meshStandardMaterial color="#c88665" flatShading roughness={.9} /></mesh>
    <mesh position={[0, .04, 0]}><cylinderGeometry args={[.43, .43, .03, 7]} /><meshStandardMaterial color="#514138" roughness={1} /></mesh>
    <group ref={plant} name="growth-cactus">
      <group rotation={[0, 0, -.14]}>
        <mesh position={[0, 1.12, 0]}><cylinderGeometry args={[.13, .23, 2.2, 6]} /><meshStandardMaterial color="#818d80" flatShading roughness={.9} /></mesh>
        <mesh position={[0, 2.23, 0]} scale={[.14, .2, .14]}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#9caa92" flatShading /></mesh>
        <mesh position={[-.19, 1.32, 0]} rotation={[0, 0, .9]}><cylinderGeometry args={[.08, .12, .42, 5]} /><meshStandardMaterial color="#9caa92" flatShading /></mesh>
        {[.4, .8, 1.2, 1.6, 2].map((y, i) => <mesh key={y} position={[i % 2 ? -.16 : .16, y, .1]} rotation={[0, 0, i % 2 ? .9 : -.9]}><coneGeometry args={[.016, .11, 3]} /><meshStandardMaterial color="#e2d8be" /></mesh>)}
      </group>
    </group>
  </group>;
}

// Split a word so every character, including the period, reacts to hover on its own.
// The outer span stays put as the hover target; only the inner glyph twists.
// `data-sand-letter` lets SandStream read letter boxes (the first one, ABSORB.'s A, is where the sand starts).
function HoverLetters({ text }: { text: string }) {
  const word = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let active = true;
    // Transforms need inline-block, which drops kerning. Measure the kerned inline layout first,
    // then switch to inline-block and restore each letter's position with an em margin.
    document.fonts.ready.then(() => {
      const box = word.current;
      if (!active || !box) return;
      const chars = Array.from(box.children) as HTMLElement[];
      const holder = box.parentElement as HTMLElement;
      const left = (char: HTMLElement) => char.getBoundingClientRect().left;
      // Measure unrotated for sub-pixel accuracy, then restore the word's own transform.
      holder.style.transform = "none";
      const natural = chars.map(left);
      const size = parseFloat(getComputedStyle(box).fontSize);
      box.classList.add(styles.loose);
      chars.forEach((char, index) => { char.style.marginLeft = `${(natural[index] - left(char)) / size}em`; });
      holder.style.transform = "";
    });
    return () => { active = false; };
  }, []);
  return <span ref={word}>{text.split("").map((char, index) => <span key={index} className={styles.char} data-sand-letter=""><span className={styles.glyph}>{char}</span></span>)}</span>;
}

export default function GrowthScene() {
  const [desktop, setDesktop] = useState(false);
  const [reduced, setReduced] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const pot = useRef<HTMLDivElement>(null);
  const near = useRef(false);
  useEffect(() => {
    const media = matchMedia("(min-width: 1024px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motion.matches);
    const update = () => setDesktop(media.matches);
    update(); updateMotion(); media.addEventListener("change", update); motion.addEventListener("change", updateMotion);
    return () => { media.removeEventListener("change", update); motion.removeEventListener("change", updateMotion); };
  }, []);
  useEffect(() => {
    if (!desktop) return;
    const cover = root.current?.parentElement;
    if (!cover) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = cover.getBoundingClientRect();
      const inside = event.clientY >= rect.top && event.clientY <= rect.bottom && !document.querySelector('button[aria-controls="site-navigation"][aria-expanded="true"]');
      const plantRect = pot.current?.getBoundingClientRect();
      near.current = !!(inside && plantRect && event.clientX > plantRect.left && event.clientX < plantRect.right && event.clientY > plantRect.top && event.clientY < plantRect.bottom);
    };
    // The water-drop pointer and click drop that lived here moved to the site-wide CustomCursor.
    const leave = () => { near.current = false; };
    const scroll = () => root.current?.style.setProperty("--drift", `${reduced ? 0 : Math.min(scrollY, innerHeight) * .08}px`);
    if (reduced) leave();
    window.addEventListener("pointermove", move, { passive: true });
    cover.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => { window.removeEventListener("pointermove", move); cover.removeEventListener("pointerleave", leave); window.removeEventListener("scroll", scroll); };
  }, [desktop, reduced]);
  if (!desktop) return null;
  return <div ref={root} className={styles.scene}>
    <div className={styles.sunlight} aria-hidden="true" />
    <div className={styles.shadow} aria-hidden="true"><i /><i /><i /></div>
    <div className={styles.absorb} aria-hidden="true"><HoverLetters text="ABSORB." /></div>
    <div className={styles.build} aria-hidden="true"><HoverLetters text="BUILD." /></div>
    <div className={styles.grow} aria-hidden="true"><HoverLetters text="GROW." /></div>
    {SHOW_CACTUS && <div className={styles.plant} ref={pot} role="img" aria-label="테라코타 화분에서 비스듬히 자라는 로우폴리 선인장">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1, 6], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        <hemisphereLight intensity={1.4} args={["#fff7df", "#778a99", 1.4]} />
        <directionalLight position={[4, 5, 3]} intensity={3} color="#fff0cc" />
        <Cactus near={near} reduced={reduced} />
      </Canvas>
    </div>}
  </div>;
}
