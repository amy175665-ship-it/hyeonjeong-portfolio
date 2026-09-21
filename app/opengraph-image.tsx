import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "백현정 포트폴리오";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF9F1",
          position: "relative",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#58636E" }}>PORTFOLIO</div>
        <div style={{ fontSize: 104, fontWeight: 700, color: "#202731", marginTop: 20 }}>BAEK HYUNJUNG</div>
        <div style={{ fontSize: 36, color: "#202731", marginTop: 16 }}>Web Publisher</div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, backgroundColor: "#B9DBF6" }} />
      </div>
    ),
    { ...size }
  );
}
