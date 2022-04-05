import React from "react";
import Phase1 from "./phase1.mdx";
import Phase2 from "./phase2.mdx";
import Phase3 from "./phase3.mdx";
import MDXSurveyPlugin from "../../../plugins/mdx-survey";
import SliderPlugin from "../../../plugins/slider";
import ReactPlugin from "../../../plugins/react";

const pluralize = require("pluralize");

export const Stimulus = (stimulus, jsPsych) => {
  const choiceTrial = {
    type: MDXSurveyPlugin,
    component: (trialProps) => <Phase1 {...stimulus} />,
  };

  const instructionsTrial = {
    type: ReactPlugin,
    component: (trialProps) => <Phase2 {...stimulus} />,
  };

  const slider = {
    defaultValue: 21600, // slider_start
    step: 5,
    min: 0,
    max: 43200,
  };

  const sliderTrial = {
    type: SliderPlugin,
    slider,
    total_time: 43200,
    sub_cat: stimulus.sub_cat,
    item: stimulus.probe,
    selected_item: () => {
      const choice = jsPsych.data.get().last(2).values()[0][
        "participant-choice"
      ];
      return `${choice}`;
    },
    component: (trialProps) => (
      <Phase3
        duration={stimulus.duration || "12 hours"}
        pluralSubcategory={pluralize(stimulus.subcategory)}
        {...trialProps}
      />
    ),
  };

  return [choiceTrial, instructionsTrial, sliderTrial];
};
