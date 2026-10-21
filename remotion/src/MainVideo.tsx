import React from "react";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneModules } from "./scenes/SceneModules";
import { SceneCoreHR } from "./scenes/SceneCoreHR";
import { SceneRecruiting } from "./scenes/SceneRecruiting";
import { SceneAutomation } from "./scenes/SceneAutomation";
import { SceneFinanceSecurity } from "./scenes/SceneFinanceSecurity";
import { SceneBusinessTrip } from "./scenes/SceneBusinessTrip";
import { SceneAnalytics } from "./scenes/SceneAnalytics";
import { SceneIntegrations } from "./scenes/SceneIntegrations";
import { SceneMobile } from "./scenes/SceneMobile";
import { SceneOutro } from "./scenes/SceneOutro";

const t = springTiming({ durationInFrames: 24, config: { damping: 200 } });

export const MainVideo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={170}><SceneIntro /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneModules /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneCoreHR /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneRecruiting /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneAutomation /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-top" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneFinanceSecurity /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneBusinessTrip /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneAnalytics /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneIntegrations /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={t} />
    <TransitionSeries.Sequence durationInFrames={165}><SceneMobile /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-top" })} timing={springTiming({ durationInFrames: 21, config: { damping: 200 } })} />
    <TransitionSeries.Sequence durationInFrames={191}><SceneOutro /></TransitionSeries.Sequence>
  </TransitionSeries>
);
