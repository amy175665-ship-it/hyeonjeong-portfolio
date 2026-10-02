"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import styles from "./HeroAvatar.module.css";

const AvatarCanvas = dynamic(() => import("./AvatarCanvas"), {
  ssr: false,
  loading: () => <p className={styles.status} role="status">얼굴 모델을 불러오는 중입니다.</p>,
});

class AvatarBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p className={styles.status} role="status">얼굴 모델을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>
      : this.props.children;
  }
}

export default function HeroAvatar() {
  return (
    <div className={styles.avatar}>
      <div className={styles.viewer} role="img" aria-label="마우스를 따라 고개를 돌리는 백현정의 3D 얼굴">
        <AvatarBoundary><AvatarCanvas /></AvatarBoundary>
      </div>
    </div>
  );
}
