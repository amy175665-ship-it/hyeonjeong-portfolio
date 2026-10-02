// Story ranges (0..1 progress of the concept story).
// cover: the sand rises over the hero, holds while the backdrop swaps to the desert stage, then sinks to the horizon.
// "cover" follows the scroll; build → adapt → grow then play on their own (see COVER_SCROLL, PLAY_SECONDS).
export const SCENES = {
  cover: [0, 0.27],
  build: [0.27, 0.54],
  adapt: [0.54, 0.76],
  grow: [0.76, 1],
} as const;

// Inside "cover": rise until this local point, hold (backdrop swaps at the middle), then sink from COVER.sink.
export const COVER = { risen: 0.45, swap: 0.5, sink: 0.55 };

// The track is 3.8 screens tall (ConceptScenes.module.css .track), so it scrolls 2.8 screens while pinned.
// "cover" uses the first 2 screens; at its end the page is held while the other scenes play over PLAY_SECONDS,
// then the last 0.8 screen lets the dunes melt into the next section.
export const COVER_SCROLL = 2 / 2.8;
export const PLAY_SECONDS = 11;

export type SceneName = keyof typeof SCENES;

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const ramp = (value: number, from: number, to: number) => clamp((value - from) / (to - from));

// 0..1 progress inside one scene.
export function sceneProgress(progress: number, scene: SceneName) {
  const [start, end] = SCENES[scene];
  return clamp((progress - start) / (end - start));
}

// Time of day across SCENE 3 (and the return of daylight at the start of SCENE 4).
// Each value is how strongly that sky shows (0..1); sunAngle is the light direction in degrees (60 = day).
export function skyAt(progress: number) {
  const adapt = sceneProgress(progress, "adapt");
  const grow = sceneProgress(progress, "grow");
  const sunset = Math.min(ramp(adapt, 0.05, 0.25), 1 - ramp(adapt, 0.3, 0.5));
  const night = Math.min(ramp(adapt, 0.35, 0.5), 1 - ramp(adapt, 0.7, 0.85));
  const dawn = Math.min(ramp(adapt, 0.7, 0.9), 1 - ramp(grow, 0, 0.15));
  const sunAngle = 60 + 300 * adapt + 60 * ramp(grow, 0, 0.15);
  return { sunset, night, dawn, sunAngle };
}

// Shared wind between the gust particles and the cactus: base gust + pointer push. Positive blows to the right.
export type Wind = { value: number };
