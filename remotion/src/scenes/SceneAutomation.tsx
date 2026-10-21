import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, Metric, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

const flow = ["დასწრება", "შეტყობინება", "დამტკიცება", "რეპორტი"];

export const SceneAutomation: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background mood="light" />
      <div style={{ position: "absolute", left: 108, top: 100, width: 780 }}>
        <Kicker delay={0} dark={false}>AI და ავტომატიზაცია</Kicker>
        <div style={{ fontFamily: font, fontSize: 88, lineHeight: 1.06, fontWeight: 900, color: colors.navy }}>ნაკლები ხელით<br />სამუშაო</div>
      </div>
      <div style={{ position: "absolute", right: 84, top: 90 }}><RealScreen src="dashboard-real.png" delay={8} width={850} height={570} title="AI Automation" rotateX={5} rotateY={-15} depth={820} /></div>
      <div style={{ position: "absolute", left: 130, top: 600, height: 160, display: "flex", alignItems: "center", gap: 18 }}>
        {flow.map((f, i) => {
          const s = spring({ frame: frame - 16 - i * 10, fps: 30, config: { damping: 18, stiffness: 115 } });
          const line = interpolate(frame, [38 + i * 10, 58 + i * 10], [0, 1], { extrapolateRight: "clamp" });
          return <React.Fragment key={f}><div style={{ width: 210, height: 88, borderRadius: 22, background: colors.white, boxShadow: "0 24px 70px rgba(16,26,52,.12)", transform: `translateY(${(1-s)*40}px)`, opacity: s, display: "grid", placeItems: "center", color: colors.navy, fontFamily: font, fontSize: 22, fontWeight: 900 }}>{f}</div>{i < flow.length - 1 && <div style={{ width: 62 * line, height: 6, borderRadius: 6, background: colors.indigo }} />}</React.Fragment>;
        })}
      </div>
      <Metric value="24/7" label="AI ასისტენტი" delay={30} x={1180} y={150} />
      <Metric value="PDF" label="რეპორტები" delay={44} x={1450} y={430} />
      <Metric value="SMS" label="შეტყობინებები" delay={58} x={1080} y={710} />
    </AbsoluteFill>
  );
};
