import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { Background } from "../components/Primitives";
import { colors, font } from "../theme";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 8, fps: 30, config: { damping: 18, stiffness: 120 } });
  const fade = interpolate(frame, [115, 145], [1, 0.88], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: fade }}>
        <div style={{ textAlign: "center", fontFamily: font }}>
          <div style={{ margin: "0 auto 36px", width: 118, height: 118, borderRadius: 34, background: `linear-gradient(135deg, ${colors.indigo}, ${colors.violet})`, color: colors.white, display: "grid", placeItems: "center", fontSize: 72, fontWeight: 900, transform: `scale(${s})`, boxShadow: "0 30px 90px rgba(62,73,201,.42)" }}>T</div>
          <div style={{ color: colors.white, fontSize: 116, fontWeight: 950, lineHeight: 1 }}>TalentOS</div>
          <div style={{ color: colors.ink, fontSize: 38, fontWeight: 700, marginTop: 28 }}>HR მართვა, რომელიც მუშაობს თქვენთან ერთად</div>
          <div style={{ color: colors.cyan, fontSize: 30, fontWeight: 900, marginTop: 62 }}>www.talentos.ge</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
