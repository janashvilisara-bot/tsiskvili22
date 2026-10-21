import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, BigTitle, Kicker, RealScreen, SeriousChip } from "../components/Primitives";
import { colors, font } from "../theme";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 120 } });
  const rotate = interpolate(frame, [0, 105], [-5, 3], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: 110, top: 122, width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 58, transform: `scale(${mark})`, opacity: mark }}>
          <div style={{ width: 82, height: 82, borderRadius: 24, background: `linear-gradient(135deg, ${colors.indigo}, ${colors.violet})`, color: colors.white, display: "grid", placeItems: "center", fontFamily: font, fontSize: 50, fontWeight: 900, boxShadow: "0 24px 70px rgba(62,73,201,.35)" }}>T</div>
          <div style={{ color: colors.white, fontFamily: font, fontSize: 46, fontWeight: 900 }}>TalentOS</div>
        </div>
        <Kicker delay={12}>HR & CRM პლატფორმა</Kicker>
        <BigTitle delay={22} lines={["ერთი სისტემა", "მთელი გუნდისთვის"]} />
        <div style={{ marginTop: 34, color: colors.ink, fontFamily: font, fontSize: 34, fontWeight: 600, lineHeight: 1.35, opacity: interpolate(frame, [55, 78], [0, 1], { extrapolateRight: "clamp" }) }}>პერსონალი, დასწრება, რეკრუტინგი, ფინანსები და AI ავტომატიზაცია ერთ სივრცეში.</div>
      </div>
      <div style={{ position: "absolute", right: 88, top: 218, transform: `rotate(${rotate}deg)` }}><RealScreen src="dashboard-real.png" delay={32} width={880} height={560} title="TalentOS Dashboard" rotateX={4} rotateY={-12} depth={820} /></div>
      <div style={{ position: "absolute", right: 360, top: 735 }}><RealScreen src="analytics-real.png" delay={56} width={520} height={330} title="Analytics" rotateX={-5} rotateY={18} rotateZ={-2} depth={760} /></div>
      <SeriousChip delay={74} x={1135} y={168} tone={colors.green}>რეალური TalentOS ინტერფეისი</SeriousChip>
    </AbsoluteFill>
  );
};
