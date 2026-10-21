import React from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, Metric, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

const stack = ["ხელფასები", "პენსია", "ბიუჯეტი", "კომპენსაცია", "აუდიტი", "GDPR / ISO"];

export const SceneFinanceSecurity: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: 110, top: 110, width: 820 }}>
        <Kicker delay={0}>ფინანსები + უსაფრთხოება</Kicker>
        <div style={{ color: colors.white, fontFamily: font, fontSize: 88, lineHeight: 1.04, fontWeight: 950 }}>კონტროლი,<br />შესაბამისობა,<br />გამჭვირვალობა</div>
        <div style={{ color: colors.ink, fontFamily: font, fontSize: 31, lineHeight: 1.35, fontWeight: 700, marginTop: 34 }}>ქართული ფინანსური ლოგიკა, აუდიტის ისტორია, როლებზე დაფუძნებული წვდომა და მონაცემთა დაცვა.</div>
      </div>
      <div style={{ position: "absolute", right: 92, top: 112 }}><RealScreen src="payroll-real.png" delay={10} width={780} height={520} title="Payroll & Security" rotateX={4} rotateY={-16} depth={800} /></div>
      <div style={{ position: "absolute", right: 115, top: 635, width: 710, height: 260 }}>
        {stack.map((sLabel, i) => {
          const s = spring({ frame: frame - 16 - i * 6, fps: 30, config: { damping: 18, stiffness: 120 } });
          return <div key={sLabel} style={{ height: 64, borderRadius: 18, background: "rgba(255,255,255,.94)", marginBottom: 14, transform: `translateX(${(1 - s) * 90}px)`, opacity: s, display: "flex", alignItems: "center", padding: "0 24px", gap: 18, boxShadow: "0 24px 65px rgba(0,0,0,.18)", fontFamily: font }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: [colors.indigo, colors.green, colors.amber, colors.cyan, colors.violet, "#E65A77"][i] }} />
            <div style={{ color: colors.navy, fontSize: 24, fontWeight: 950 }}>{sLabel}</div>
          </div>;
        })}
      </div>
      <Metric value="RLS" label="წვდომის დაცვა" delay={54} x={1110} y={760} />
      <Metric value="AI" label="ანომალიების აღმოჩენა" delay={66} x={1450} y={760} />
    </AbsoluteFill>
  );
};
