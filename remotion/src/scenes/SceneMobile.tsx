import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, BigTitle, Kicker, Pill, RealScreen } from "../components/Primitives";
import { colors, font } from "../theme";

export const SceneMobile: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <div style={{ position: "absolute", left: 118, top: 122, width: 780 }}>
      <Kicker delay={0}>მობილური გამოცდილება</Kicker>
      <BigTitle delay={8} lines={["გუნდი ყველგან", "ერთ სისტემაში"]} />
      <div style={{ marginTop: 34, color: colors.ink, fontFamily: font, fontSize: 33, fontWeight: 650, lineHeight: 1.35 }}>მობილური დასწრება, თანამშრომლის პორტალი და სწრაფი მოთხოვნები ოფისიდან თუ დისტანციურად.</div>
    </div>
    <div style={{ position: "absolute", right: 105, top: 205 }}><RealScreen delay={18} src="dashboard-real.png" width={760} height={520} title="TalentOS Mobile / PWA" rotateX={5} rotateY={-15} depth={780} /></div>
    <div style={{ position: "absolute", right: 445, top: 650 }}><RealScreen delay={38} src="business-trip-real.png" width={430} height={270} title="Employee Portal" rotateX={-5} rotateY={18} rotateZ={-3} depth={720} /></div>
    <Pill delay={46} x={1010} y={745} tone={colors.green}>GPS ვერიფიკაცია</Pill>
  </AbsoluteFill>
);
