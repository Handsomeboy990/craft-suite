import type { ComponentType } from "react";
import { CounterFixture } from "./counter";
import { DialogFixture } from "./dialog";
import { GradientBackdropFixture } from "./gradient-backdrop";
import { MagneticFixture } from "./magnetic";
import { MarqueeFixture } from "./marquee";
import { RevealFixture } from "./reveal";
import { StackedCardsFixture } from "./stacked-cards";
import { StaggerFixture } from "./stagger";
import { TiltFixture } from "./tilt";
import { TooltipFixture } from "./tooltip";

/** One page per component, served at /<name>. */
export const fixtures = {
  counter: CounterFixture,
  dialog: DialogFixture,
  "gradient-backdrop": GradientBackdropFixture,
  magnetic: MagneticFixture,
  marquee: MarqueeFixture,
  reveal: RevealFixture,
  "stacked-cards": StackedCardsFixture,
  stagger: StaggerFixture,
  tilt: TiltFixture,
  tooltip: TooltipFixture,
} satisfies Record<string, ComponentType>;

export type FixtureName = keyof typeof fixtures;
