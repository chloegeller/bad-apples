import React from "react";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";
import ReactPlugin from "../plugins/react";
import Consent from "./consent";
import ReactDOMExtension from "../extensions/react";
import JATOSExtension from "../extensions/jatos";

const startFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: true,
};

const prolificIDPrompt = `<div style="text-align: center">Before we begin, please enter your <strong>Prolific ID</strong>. Thank you!</div>`;
const queryProlificID = {
  type: SurveyTextPlugin,
  questions: [
    {required: true, name: "prolificID", prompt: prolificIDPrompt},
  ],
  extensions: [
    {type: JATOSExtension, params: {retrieve: ["response.prolificID",]}}
  ]
};

const redirectURL = "https://memegenerator.net/img/instances/72809998/have-a-nice-day.jpg"
const consentForm = {
  type: ReactPlugin,
  component: (props) => <Consent redirectURL={redirectURL} {...props} />,
  extensions: [
    {type: ReactDOMExtension, params: {}}
  ]
};

export const Timeline = [
  consentForm,
  startFullscreen,
  queryProlificID,
]