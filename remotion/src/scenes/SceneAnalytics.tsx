import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

const reports = ["HR Analytics", "Attendance", "Payroll", "Compliance", "Report Builder"];

export const SceneAnalytics: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background mood="light" />
      <div style={{ position: "absolute", left: 106, top: 92, width: 760 }}>
        <Kicker delay={0} dark={false}>რეპორტები და გადაწყვეტილებები</Kicker>
        <div style={{ fontFamily: font, color: colors.navy, fontSize: 86, lineHeight: 1.06, fontWeight: 950 }}>მონაცემი ხდება<br />ქმედება</div>
      </div>
      <div style={{ position: "absolute", right: 96, top: 96 }}><RealScreen src="analytics-real.png" delay={8} width={850} height={565} title="Analytics" rotateX={5} rotateY={-14} depth={820} /></div>
      <div style={{ position: "absolute", right: 110, top: 640, width: 860, height: 300, borderRadius: 28, background: colors.white, boxShadow: "0 30px 90px rgba(16,26,52,.16)", padding: 30, fontFamily: font }}>
        <div style={{ color: colors.navy, fontSize: 34, fontWeight: 950, marginBottom: 34 }}>ცოცხალი ანალიტიკა</div>
        <div style={{ height: 116, display: "flex", alignItems: "end", gap: 20, padding: "0 10px 25px", borderBottom: "2px solid #E6ECF5" }}>
          {[115, 210, 160, 280, 225, 330, 265, 370].map((h, i) => {
            const grow = interpolate(frame, [20 + i * 5, 58 + i * 5], [0, h * 0.28], { extrapolateRight: "clamp" });
            return <div key={i} style={{ width: 72, height: grow, borderRadius: 18, background: i % 3 === 0 ? colors.indigo : i % 3 === 1 ? colors.cyan : colors.green }} />;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 32 }}>
          {reports.map((r, i) => {
            const s = spring({ frame: frame - 60 - i * 5, fps: 30, config: { damping: 20, stiffness: 130 } });
            return <div key={r} style={{ padding: 22, borderRadius: 18, background: "#F4F7FC", color: colors.navy, fontSize: 23, fontWeight: 900, opacity: s, transform: `scale(${0.94 + s * 0.06})` }}>{r}</div>;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
