import React from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

const items = [
  ["პერსონალის სრული პროფილი", "კონტრაქტები, დოკუმენტები, საბანკო და საკონტაქტო ინფორმაცია"],
  ["ორგანიზაციული სტრუქტურა", "დეპარტამენტები, პოზიციები, მენეჯერები და იერარქია"],
  ["შვებულებები და მოთხოვნები", "დამტკიცების ნაკადები, ბალანსები და სტატისტიკა"],
  ["Onboarding / Training", "ტრენინგები, ვიდეო ტუტორიალები და ადაპტაციის პროცესი"],
];

export const SceneCoreHR: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background mood="light" />
      <div style={{ position: "absolute", left: 110, top: 105, width: 720 }}>
        <Kicker delay={0} dark={false}>Core HR</Kicker>
        <div style={{ fontFamily: font, fontSize: 82, lineHeight: 1.06, fontWeight: 950, color: colors.navy }}>თანამშრომლის<br />სრული ციკლი</div>
      </div>
      <div style={{ position: "absolute", right: 94, top: 110 }}><RealScreen src="dashboard-real.png" delay={8} width={910} height={610} title="Employee Lifecycle" rotateX={5} rotateY={-14} depth={820} /></div>
      <div style={{ position: "absolute", right: 96, top: 725, width: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {items.map(([title, body], i) => {
          const s = spring({ frame: frame - 12 - i * 8, fps: 30, config: { damping: 18, stiffness: 115 } });
          return <div key={title} style={{ minHeight: 126, borderRadius: 20, padding: 22, background: "rgba(255,255,255,.96)", boxShadow: "0 20px 60px rgba(16,26,52,.14)", transform: `translateY(${(1 - s) * 55}px)`, opacity: s, fontFamily: font }}>
            <div style={{ color: colors.navy, fontSize: 24, lineHeight: 1.15, fontWeight: 950 }}>{title}</div>
            <div style={{ color: "#5D6982", fontSize: 17, lineHeight: 1.3, fontWeight: 700, marginTop: 10 }}>{body}</div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
