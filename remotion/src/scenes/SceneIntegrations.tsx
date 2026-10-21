import React from "react";
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { Background, Kicker, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

const integrations = [
  ["jobly.ge", "ვაკანსიები და კანდიდატები"],
  ["Signify", "ელექტრონული ხელმოწერა"],
  ["სასტუმრო", "მივლინების დაჯავშნა"],
  ["GlobalCell eSIM", "eSIM პირდაპირ მოთხოვნიდან"],
  ["CloudSMS", "SMS შეტყობინებები"],
  ["Turnstile", "დასწრების Webhook"],
  ["Google Calendar", ".ics ექსპორტი"],
  ["PWA Mobile", "მობილური პორტალი"],
];

export const SceneIntegrations: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: 96, top: 104, width: 760 }}>
        <Kicker delay={0}>ინტეგრაციები</Kicker>
        <div style={{ fontFamily: font, color: colors.white, fontSize: 84, lineHeight: 1.05, fontWeight: 950 }}>სერვისები,<br />რომლებიც პროცესს<br />ასრულებს</div>
        <div style={{ color: colors.ink, fontFamily: font, fontSize: 30, lineHeight: 1.35, fontWeight: 700, marginTop: 30 }}>ვაკანსია, ხელმოწერა, მივლინება, სასტუმრო, eSIM, SMS და დასწრება — ერთ Enterprise ნაკადში.</div>
      </div>
      <div style={{ position: "absolute", right: 86, top: 86 }}><RealScreen src="signify-real.png" delay={8} width={820} height={540} title="Integrated Services" rotateX={5} rotateY={-13} depth={820} /></div>
      <div style={{ position: "absolute", right: 95, top: 590, width: 815, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {integrations.map(([name, desc], i) => {
          const s = spring({ frame: frame - 12 - i * 5, fps: 30, config: { damping: 20, stiffness: 125 } });
          return <div key={name} style={{ height: 78, borderRadius: 18, background: "rgba(255,255,255,.96)", boxShadow: "0 20px 60px rgba(0,0,0,.20)", transform: `translateY(${(1 - s) * 58}px)`, opacity: s, display: "flex", alignItems: "center", gap: 16, padding: "0 20px", fontFamily: font }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: [colors.indigo, colors.green, colors.amber, colors.cyan][i % 4], flexShrink: 0 }} />
            <div><div style={{ color: colors.navy, fontSize: 21, fontWeight: 950 }}>{name}</div><div style={{ color: "#5E6980", fontSize: 14, fontWeight: 800, marginTop: 3 }}>{desc}</div></div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
