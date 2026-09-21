"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function Vinyl({ playing }: { playing: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-[clamp(3.25rem,20cqw,6.5rem)] w-[clamp(3.25rem,20cqw,6.5rem)] shrink-0 items-center justify-center rounded-full border border-ink/70 bg-ink p-1 shadow-[0_3px_5px_color-mix(in_srgb,var(--ink)_35%,transparent),inset_0_1px_2px_color-mix(in_srgb,var(--paper)_60%,transparent)]"
    >
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full border border-paper/30 bg-ink motion-safe:animate-[spin_3s_linear_infinite]"
        style={{
          animationPlayState: playing ? "running" : "paused",
          backgroundImage: "conic-gradient(from 25deg, transparent, color-mix(in srgb, var(--paper) 22%, transparent) 45deg, transparent 85deg, transparent 180deg, color-mix(in srgb, var(--paper) 15%, transparent) 230deg, transparent 275deg)",
        }}
      >
        <div className="absolute inset-[7%] rounded-full border border-paper/20" />
        <div className="absolute inset-[14%] rounded-full border border-paper/15" />
        <div className="absolute inset-[22%] rounded-full border border-paper/20" />
        <div className="relative flex h-[30%] w-[30%] items-center justify-center rounded-full border border-paper/30 bg-forest shadow-[0_1px_3px_var(--ink),inset_0_1px_2px_color-mix(in_srgb,var(--paper)_40%,transparent)]">
          <span className="absolute top-[15%] h-1 w-1 rounded-full bg-paper/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-paper shadow-inner" />
        </div>
      </div>
    </div>
  );
}

export default function VoiceIntro() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playRequested = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => {
      const total = Number.isFinite(audio.duration) ? Math.max(0, audio.duration) : 0;
      const current = Number.isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0;
      setDuration(total);
      setCurrentTime(current);
      setProgress(total > 0 ? Math.min(1, current / total) : 0);
    };
    const onPlaying = () => { setPlaying(true); setUnavailable(false); };
    const onPause = () => { playRequested.current = false; setPlaying(false); };
    const onWaiting = () => setPlaying(false);
    const onEnded = () => { onPause(); syncTime(); };
    const onError = () => {
      onPause();
      setUnavailable(true);
      syncTime();
    };
    const listeners: [string, () => void][] = [
      ["loadedmetadata", syncTime], ["durationchange", syncTime],
      ["timeupdate", syncTime], ["emptied", syncTime],
      ["playing", onPlaying], ["pause", onPause],
      ["waiting", onWaiting], ["ended", onEnded], ["error", onError],
    ];
    listeners.forEach(([event, listener]) => audio.addEventListener(event, listener));
    syncTime();
    return () => {
      listeners.forEach(([event, listener]) => audio.removeEventListener(event, listener));
      playRequested.current = false;
      audio.pause();
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playRequested.current || !audio.paused) {
      playRequested.current = false;
      audio.pause();
      return;
    }
    playRequested.current = true;
    setUnavailable(false);
    try {
      await audio.play();
    } catch (error) {
      // A pause while play() is pending is intentional, not a missing-file error.
      if (error instanceof DOMException && error.name === "AbortError") return;
      playRequested.current = false;
      setPlaying(false);
      setUnavailable(true);
      console.warn("Voice intro audio is not available yet.", error);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    const position = Math.max(0, Math.min(1, value));
    audio.currentTime = position * duration;
    setCurrentTime(audio.currentTime);
    setProgress(position);
  };

  return (
    <div className="mt-8 w-full max-w-lg [container-type:inline-size]">
      <div
        role="group"
        aria-label="음성 자기소개 플레이어"
        className="flex min-h-40 items-center justify-center gap-[clamp(0.5rem,3cqw,1.25rem)] rounded-full border border-ink/10 bg-paper px-[clamp(0.75rem,6cqw,2rem)] py-6 text-ink"
        style={{
          backgroundImage: "linear-gradient(165deg, color-mix(in srgb, var(--paper) 98%, var(--ink)), color-mix(in srgb, var(--paper) 88%, var(--ink)))",
          boxShadow: "0 14px 24px -10px color-mix(in srgb, var(--ink) 35%, transparent), 0 5px 0 color-mix(in srgb, var(--paper) 72%, var(--ink)), inset 0 2px 2px var(--paper), inset 0 -3px 5px color-mix(in srgb, var(--ink) 12%, transparent)",
        }}
      >
        <audio ref={audioRef} src="/audio/intro.mp3" preload="none" />
        <Vinyl playing={playing} />
        <div className="min-w-0 max-w-44 flex-1 rounded-2xl border border-ink/5 bg-paper/50 px-[clamp(0.375rem,2cqw,0.75rem)] py-3 text-center shadow-[inset_0_1px_3px_color-mix(in_srgb,var(--ink)_10%,transparent),0_1px_0_color-mix(in_srgb,var(--paper)_80%,transparent)]">
          <p className="text-[clamp(0.625rem,2.5cqw,0.75rem)] font-medium leading-relaxed text-forest">목소리로 전하는 소개</p>
          <div className="relative mt-1 flex h-6 items-center rounded-full focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-forest">
            <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-ink/25 shadow-[inset_0_2px_3px_color-mix(in_srgb,var(--ink)_35%,transparent),0_1px_0_var(--paper)]">
              <div className="h-full rounded-full bg-forest" style={{ width: `${progress * 100}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              disabled={duration <= 0 || unavailable}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="음성 재생 위치"
              aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
            />
          </div>
          <p className="flex justify-between gap-2 text-[10px] tabular-nums text-ink/70 sm:text-xs">
            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
          </p>
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={playing ? "음성 소개 일시정지" : "음성 소개 재생"}
            className="mx-auto mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-forest text-paper shadow-[0_3px_0_color-mix(in_srgb,var(--forest)_70%,var(--ink)),0_5px_8px_color-mix(in_srgb,var(--ink)_25%,transparent),inset_0_1px_1px_color-mix(in_srgb,var(--paper)_35%,transparent)]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
            </svg>
          </button>
        </div>
        <Vinyl playing={playing} />
      </div>
      <p role="status" className="mt-2 text-center text-xs text-ink/70">
        {unavailable ? "음성 소개를 아직 재생할 수 없습니다. 잠시 후 다시 시도해 주세요." : ""}
      </p>
    </div>
  );
}
