"use client";

import { useSyncExternalStore } from "react";
import type { StageId } from "@/data/stages";

// What the window (WindowFrame) tells the rest of the page: which story stage is on screen and whether the browser
// window has dissolved into the full-screen layout (the header then floats over the page with the stage word).
export type WindowState = {
  stage: StageId;
  floating: boolean;
};

let state: WindowState = { stage: "absorb", floating: false };
const listeners = new Set<() => void>();

export function setWindowState(next: Partial<WindowState>) {
  const merged = { ...state, ...next };
  if (
    merged.stage === state.stage &&
    merged.floating === state.floating
  )
    return;
  state = merged;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const serverState: WindowState = {
  stage: "absorb",
  floating: false,
};

export function useWindowState() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}
