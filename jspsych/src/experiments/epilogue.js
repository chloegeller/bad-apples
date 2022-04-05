import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";

const Timeline = [];

let attentionCheckID;
export const attentionCheckNodeID = () => attentionCheckID;

const attentionCheck = {
  type: SurveyTextPlugin,
  questions: [
    {
      prompt:
        '<div style="text-align: center;">What was <strong>your task</strong> in this study?</div>',
      required: true,
      name: "attn_check",
    },
  ],
};

let commentsID;
export const commentsNodeID = () => commentsID;

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
};

const endFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: false,
};

export function timeline(jsPsych) {
  attentionCheck.on_load = () => {
    attentionCheckID = jsPsych.getCurrentTimelineNodeID();
  };
  Timeline.push(attentionCheck);

  comments.on_load = () => {
    commentsID = jsPsych.getCurrentTimelineNodeID();
  };
  Timeline.push(comments);

  Timeline.push(endFullscreen);

  return Timeline;
}
