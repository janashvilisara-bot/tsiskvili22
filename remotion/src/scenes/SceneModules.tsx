import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

const modules = ["თანამშრომლები", "დასწრება", "შვებულებები", "ხელფასები", "რეკრუტინგი", "დოკუმენტები", "ანალიტიკა", "უსაფრთხოება"];
const tones = [colors.indigo, colors.green, colors.cyan, colors.amber, colors.violet, "#E65A77", "#4C7EE8", "#22305C"];

export const SceneModules: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background mood="light" />
      <div style={{ position: "absolute", left: 105, top: 105, width: 760 }}>
        <Kicker delay={0} dark={false}>მოდულები მუშაობს ერთად</Kicker>
        <div style={{ fontFamily: font, fontSize: 86, lineHeight: 1.06, fontWeight: 900, color: colors.navy }}>HR პროცესები<br />აღარ იკარგება</div>
        <div style={{ marginTop: 32, fontFamily: font, fontSize: 32, lineHeight: 1.35, color: "#536079", fontWeight: 700 }}>ყველა მონაცემი მოძრაობს ერთ ლოგიკურ ნაკადში — მოთხოვნიდან რეპორტამდე.</div>
      </div>
      <div style={{ position: "absolute", right: 95, top: 128 }}><RealScreen src="dashboard-real.png" delay={10} width={830} height={565} title="HR Dashboard" rotateX={5} rotateY={-13} depth={820} /></div>
      <div style={{ position: "absolute", right: 455, top: 678 }}><RealScreen src="candidates-full-real.png" delay={42} width={470} height={295} title="Recruitment" rotateX={-4} rotateY={18} rotateZ={-3} depth={740} /></div>
      <div style={{ position: "absolute", right: 120, top: 130, width: 810, height: 760, opacity: 0.86 }}>
        {modules.map((m, i) => {
          const s = spring({ frame: frame - i * 5 - 12, fps: 30, config: { damping: 20, stiffness: 120 } });
          const angle = (i / modules.length) * Math.PI * 2 + frame / 190;
          const r = 245 + (i % 2) * 70;
          const x = 370 + Math.cos(angle) * r;
          const y = 335 + Math.sin(angle) * r;
          return <div key={m} style={{ position: "absolute", left: x, top: y, width: 230, height: 86, borderRadius: 22, background: colors.white, boxShadow: "0 24px 70px rgba(16,26,52,.12)", transform: `translate(-50%, -50%) scale(${s})`, opacity: s * 0.92, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", fontFamily: font, fontSize: 22, fontWeight: 900, color: colors.navy }}><span style={{ width: 28, height: 28, borderRadius: 10, background: tones[i] }} />{m}</div>;
        })}
        <div style={{ position: "absolute", left: 405, top: 378, transform: "translate(-50%, -50%)", width: 210, height: 210, borderRadius: 60, background: `linear-gradient(135deg, ${colors.indigo}, ${colors.violet})`, boxShadow: "0 36px 90px rgba(62,73,201,.35)", display: "grid", placeItems: "center", color: colors.white, fontFamily: font, fontWeight: 900, fontSize: 42, opacity: interpolate(frame, [22, 45], [0, 1], { extrapolateRight: "clamp" }) }}>TalentOS</div>
      </div>
    </AbsoluteFill>
  );
};
