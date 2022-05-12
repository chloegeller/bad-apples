import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";
import JATOSExtension from "../extensions/jatos";

const attentionCheck = {
  type: SurveyTextPlugin,
  questions: [
    {
      prompt:
        '<div style="text-align: center;">What was <strong>your task</strong> in this study?</div>',
      required: true,
      name: "attnCheck",
    },
  ],
  extensions: [
    {type: JATOSExtension, params: {retrieve: ["response.attnCheck"]}},
  ]
};

const comments = {
  type: SurveyTextPlugin,
  questions: [
    {
      prompt:
        '<div style="text-align: center;"><p><strong>Thank you for completing our study!</strong></p> If you have any comments, please enter them below, we welcome all feedback!</div>',
      required: false,
      name: "comments",
    },
  ],
  extensions: [
    {type: JATOSExtension, params: {retrieve: ["response.comments"]}}
  ]
};

const endFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: false,
};

export const Timeline = [
  attentionCheck,
  comments,
  endFullscreen,
]