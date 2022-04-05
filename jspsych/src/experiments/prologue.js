import React from "react";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";
import ConsentPlugin from "../plugins/consent";
import Consent from "./consent.mdx";

const Timeline = [];

const startFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: true,
};

let prolificID;
export const prolificNodeID = () => prolificID;

const prolificIDPrompt = `<div style="text-align: center";>Before we begin, please enter your <strong>Prolific ID</strong>. Thank you!</div>`;
const queryProlificID = {
  type: SurveyTextPlugin,
  questions: [
    { required: true, name: "prolific_id", prompt: prolificIDPrompt },
  ],
};

const consentForm = {
  type: ConsentPlugin,
  component: () => <Consent />,
  redirect_url: "https://google.com",
};

export function timeline(jsPsych) {
  Timeline.push(consentForm);
  Timeline.push(startFullscreen);

  queryProlificID.on_load = () => {
    prolificID = jsPsych.getCurrentTimelineNodeID();
  };
  Timeline.push(queryProlificID);

  return Timeline;
}
