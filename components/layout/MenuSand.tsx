"use client";

import { useEffect, useRef } from "react";
import styles from "./MenuSand.module.css";

type Point = {
  x: number;
  from: number;
  to: number;
};

type Grain = {
  x: number;
  y: number;
  vy: number;
  size: number;
  color: string;
};

const COLORS = ["#c4955a", "#b8864c", "#a8763f", "#d9b27e"];
const GRAVITY = 0.32; // 60fps 기준 프레임당 가속도
const PER_FRAME = 4; // 60fps 기준 프레임당 생성 개수
const SPREAD = 7;

export default function MenuSand({ point }: { point: Point | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(point);
  target.current = point;
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");

    if (!element || !context) {
      return;
    }

    const grains: Grain[] = [];
    let frame = 0;
    let debt = 0;
    let then = 0;
    let last = { x: 0, to: 0 };

    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      element.width = element.clientWidth * ratio;
      element.height = element.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const tick = (now: number) => {
      frame = 0;
      // 프레임 간격이 달라도 같은 속도로 떨어지도록 보정합니다.
      const step = then ? Math.min((now - then) / (1000 / 60), 3) : 1;
      then = now;
      const aim = target.current;

      if (aim) {
        last = aim;

        for (debt += PER_FRAME * step; debt >= 1; debt--) {
          grains.push({
            x: aim.x + (Math.random() - 0.5) * SPREAD,
            y: aim.from + Math.random() * 4,
            vy: 1.2 + Math.random() * 1.4,
            size: 2 + Math.random() * 1.6,
            color: COLORS[(Math.random() * COLORS.length) | 0],
          });
        }
      }

      context.clearRect(0, 0, element.clientWidth, element.clientHeight);
      // 호버가 끝나도 이미 떨어지던 모래는 마지막 목적지까지 내려갑니다.
      const floor = aim ? aim.to : last.to;

      for (let i = grains.length - 1; i >= 0; i--) {
        const grain = grains[i];
        grain.vy += GRAVITY * step;
        grain.y += grain.vy * step;

        if (grain.y >= floor) {
          grains.splice(i, 1);
          continue;
        }

        context.fillStyle = grain.color;
        context.fillRect(grain.x, grain.y, grain.size, grain.size);
      }

      if (aim || grains.length) {
        frame = requestAnimationFrame(tick);
      } else {
        then = 0;
      }
    };

    wake.current = () => {
      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      wake.current = () => {};
    };
  }, []);

  useEffect(() => {
    if (point) {
      wake.current();
    }
  }, [point]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={styles.canvas}
    />
  );
}
