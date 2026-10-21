import React from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, RealScreen, SeriousChip } from "../components/Primitives";
import { colors, font } from "../theme";

const steps = [
  ["მივლინების მოთხოვნა", "დანიშნულება, თარიღები, ბიუჯეტი"],
  ["სასტუმროს დაჯავშნა", "დაჯავშნა პროგრამიდანვე"],
  ["eSIM შეკვეთა", "GlobalCell eSIM მოგზაურობისთვის"],
  ["დამტკიცება", "მენეჯერი / HR / ადმინისტრატორი"],
];

export const SceneBusinessTrip: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background mood="light" />
      <div style={{ position: "absolute", left: 98, top: 98, width: 780 }}>
        <Kicker delay={0} dark={false}>მივლინებები</Kicker>
        <div style={{ color: colors.navy, fontFamily: font, fontSize: 84, lineHeight: 1.05, fontWeight: 950 }}>მოგზაურობის<br />მართვა პროგრამიდან</div>
        <div style={{ color: "#58637A", fontFamily: font, fontSize: 30, lineHeight: 1.35, fontWeight: 750, marginTop: 30 }}>სასტუმროს დაჯავშნა, eSIM, ბიუჯეტი და დამტკიცება — ერთიან კონტროლირებად პროცესში.</div>
      </div>
      <div style={{ position: "absolute", right: 92, top: 92 }}><RealScreen src="business-trip-real.png" delay={8} width={830} height={560} title="Business Trips" rotateX={5} rotateY={-14} depth={820} /></div>
      <div style={{ position: "absolute", right: 110, top: 620, width: 820, height: 300, borderRadius: 28, background: "rgba(255,255,255,.96)", boxShadow: "0 34px 100px rgba(16,26,52,.16)", padding: 30, fontFamily: font }}>
        <div style={{ color: colors.navy, fontSize: 34, fontWeight: 950, marginBottom: 34 }}>Business Trip Workflow</div>
        {steps.map(([title, desc], i) => {
          const s = spring({ frame: frame - 14 - i * 12, fps: 30, config: { damping: 21, stiffness: 120 } });
          return <div key={title} style={{ height: 54, borderRadius: 16, background: "#F5F8FC", marginBottom: 10, padding: "0 20px", display: "flex", alignItems: "center", gap: 18, opacity: s, transform: `translateX(${(1 - s) * 70}px)` }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: [colors.indigo, colors.amber, colors.cyan, colors.green][i], color: colors.white, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 950 }}>{i + 1}</div>
            <div><div style={{ color: colors.navy, fontSize: 20, fontWeight: 950 }}>{title}</div><div style={{ color: "#68738A", fontSize: 14, fontWeight: 800 }}>{desc}</div></div>
          </div>;
        })}
      </div>
      <SeriousChip delay={70} x={1060} y={810} tone={colors.amber}>Hotel + eSIM ერთ მოთხოვნაში</SeriousChip>
    </AbsoluteFill>
  );
};
