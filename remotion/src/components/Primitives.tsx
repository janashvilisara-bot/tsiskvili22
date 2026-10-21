import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, font } from "../theme";

export const ease = (frame: number, input: [number, number], output: [number, number]) =>
  interpolate(frame, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const Background: React.FC<{ mood?: "dark" | "light" }> = ({ mood = "dark" }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 58) * 24;
  const bg = mood === "dark"
    ? `linear-gradient(135deg, ${colors.navy} 0%, #111A30 44%, #22305C 100%)`
    : `linear-gradient(135deg, ${colors.soft} 0%, #ECF1FA 48%, #DDE6F8 100%)`;
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 760, height: 760, borderRadius: 760, background: colors.indigo, opacity: mood === "dark" ? 0.22 : 0.12, filter: "blur(70px)", left: -180 + drift, top: -220 }} />
      <div style={{ position: "absolute", width: 560, height: 560, borderRadius: 560, background: colors.cyan, opacity: mood === "dark" ? 0.16 : 0.14, filter: "blur(80px)", right: -120 - drift, bottom: -120 }} />
      <div style={{ position: "absolute", inset: 0, opacity: mood === "dark" ? 0.16 : 0.28, backgroundImage: "linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px)", backgroundSize: "64px 64px", transform: `translate(${drift / 3}px, ${-drift / 4}px)` }} />
    </div>
  );
};

export const Kicker: React.FC<{ children: React.ReactNode; delay?: number; dark?: boolean }> = ({ children, delay = 0, dark = true }) => {
  const frame = useCurrentFrame();
  const y = ease(frame, [delay, delay + 18], [24, 0]);
  const opacity = ease(frame, [delay, delay + 16], [0, 1]);
  return <div style={{ transform: `translateY(${y}px)`, opacity, color: dark ? colors.cyan : colors.indigo, fontFamily: font, fontSize: 28, fontWeight: 700, letterSpacing: 0, marginBottom: 22 }}>{children}</div>;
};

export const BigTitle: React.FC<{ lines: string[]; delay?: number; dark?: boolean }> = ({ lines, delay = 0, dark = true }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ fontFamily: font, color: dark ? colors.white : colors.navy, fontWeight: 900, lineHeight: 1.04, letterSpacing: 0 }}>
      {lines.map((line, i) => {
        const s = spring({ frame: frame - delay - i * 7, fps: 30, config: { damping: 22, stiffness: 120 } });
        const y = interpolate(s, [0, 1], [70, 0]);
        return <div key={line} style={{ fontSize: i === 0 ? 104 : 94, transform: `translateY(${y}px)`, opacity: s }}>{line}</div>;
      })}
    </div>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; x?: number; y?: number; delay?: number; tone?: string }> = ({ children, x = 0, y = 0, delay = 0, tone = colors.indigo }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - delay, fps: 30, config: { damping: 18, stiffness: 120 } });
  return <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, opacity: s, borderRadius: 20, padding: "18px 26px", background: `linear-gradient(135deg, ${tone}, ${colors.violet})`, color: colors.white, fontFamily: font, fontWeight: 800, fontSize: 27, boxShadow: "0 24px 70px rgba(16,26,52,.22)" }}>{children}</div>;
};

export const Metric: React.FC<{ value: string; label: string; delay: number; x: number; y: number }> = ({ value, label, delay, x, y }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - delay, fps: 30, config: { damping: 20, stiffness: 130 } });
  return <div style={{ position: "absolute", left: x, top: y, width: 300, padding: 28, borderRadius: 28, background: "rgba(255,255,255,.92)", boxShadow: "0 26px 80px rgba(16,26,52,.18)", transform: `translateY(${(1 - s) * 50}px)`, opacity: s, fontFamily: font }}><div style={{ fontSize: 56, lineHeight: 1, fontWeight: 900, color: colors.indigo }}>{value}</div><div style={{ marginTop: 12, color: colors.navy, fontSize: 24, fontWeight: 700 }}>{label}</div></div>;
};


export const RealScreen: React.FC<{ src: string; delay?: number; width?: number; height?: number; title?: string; rotateX?: number; rotateY?: number; rotateZ?: number; depth?: number }> = ({ src, delay = 0, width = 980, height = 610, title = "TalentOS", rotateX = 0, rotateY = 0, rotateZ = 0, depth = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 105 } });
  const y = (1 - s) * 70 + Math.sin((frame - delay) / 45) * 8;
  const yaw = rotateY + Math.sin((frame - delay) / 80) * 2.2;
  const pitch = rotateX + Math.cos((frame - delay) / 88) * 1.4;
  return (
    <div style={{ width, height, borderRadius: 28, overflow: "hidden", background: colors.white, boxShadow: "0 54px 150px rgba(0,0,0,.38), 36px 28px 80px rgba(62,73,201,.16)", transform: `perspective(${depth}px) translateY(${y}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${rotateZ}deg) scale(${0.9 + s * 0.1})`, transformStyle: "preserve-3d", opacity: s, border: "1px solid rgba(255,255,255,.32)" }}>
      <div style={{ height: 46, background: colors.navy, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", fontFamily: font }}>
        <span style={{ width: 12, height: 12, borderRadius: 12, background: "#FF6B6B" }} />
        <span style={{ width: 12, height: 12, borderRadius: 12, background: colors.amber }} />
        <span style={{ width: 12, height: 12, borderRadius: 12, background: colors.green }} />
        <strong style={{ color: colors.ink, marginLeft: 14, fontSize: 17 }}>{title}</strong>
      </div>
      <Img src={staticFile(src)} style={{ width: "100%", height: height - 46, objectFit: "cover", objectPosition: "center top" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(255,255,255,.28), rgba(255,255,255,0) 38%, rgba(32,184,200,.10) 72%, rgba(255,255,255,.18))", opacity: 0.42, pointerEvents: "none" }} />
    </div>
  );
};

export const SeriousChip: React.FC<{ children: React.ReactNode; delay?: number; x: number; y: number; tone?: string }> = ({ children, delay = 0, x, y, tone = colors.indigo }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - delay, fps: 30, config: { damping: 22, stiffness: 120 } });
  return <div style={{ position: "absolute", left: x, top: y, opacity: s, transform: `translateY(${(1 - s) * 36}px)`, borderRadius: 14, padding: "14px 20px", background: "rgba(255,255,255,.96)", color: colors.navy, fontFamily: font, fontSize: 23, fontWeight: 950, boxShadow: "0 24px 70px rgba(0,0,0,.20)", borderLeft: `7px solid ${tone}` }}>{children}</div>;
};

