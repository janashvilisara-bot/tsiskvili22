import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, BigTitle, Kicker, RealScreen, SeriousChip } from "../components/Primitives";
import { colors, font } from "../theme";

export const SceneRecruiting: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <div style={{ position: "absolute", left: 90, top: 100, width: 720 }}>
      <Kicker delay={0}>რეკრუტინგი + jobly.ge</Kicker>
      <BigTitle delay={10} lines={["კანდიდატები", "რეალურ სისტემაში"]} />
      <div style={{ marginTop: 30, color: colors.ink, fontFamily: font, fontSize: 31, fontWeight: 700, lineHeight: 1.35 }}>ვაკანსიაზე მიღებული განაცხადი პირდაპირ ჩნდება კანდიდატებში — CV-ით, წყაროთი და დეტალებით.</div>
    </div>
    <div style={{ position: "absolute", right: 78, top: 212 }}><RealScreen src="candidates-full-real.png" delay={18} width={850} height={560} title="Candidates" rotateX={5} rotateY={-14} depth={820} /></div>
    <SeriousChip delay={48} x={980} y={135} tone={colors.green}>jobly.ge ინტეგრაცია</SeriousChip>
    <SeriousChip delay={58} x={1190} y={800} tone={colors.cyan}>CV და დეტალები</SeriousChip>
  </AbsoluteFill>
);
