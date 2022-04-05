/**
 * @title Bad Apples
 * @description In this study, we are interested in how people choose to spend their time.
 * @version study2.0
 *
 * The following lines specify which media directories will be packaged and preloaded by jsPsych.
 * Modify them to arbitrary paths (or comma-separated lists of paths) within the `media` directory,
 * or just delete them.
 * @imageDir images
 * @audioDir audio
 * @videoDir video
 * @miscDir misc
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import { initJsPsych } from "jspsych";

import _ from "lodash";
import { timeline as pTimeline } from "./experiments/prologue";
import { timeline as eTimeline } from "./experiments/epilogue";

import bootstrap from "bootstrap";
import ReactPlugin from "./plugins/react";
import React from "react";
import ReactDOM from "react-dom";
import { addJatosAbort, finishStudy } from "./jatos-utils";

const DEBUG = false;
const SLICE_STIMULI = false;

/**
 * This method will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @param {object} options Options provided by jsPsych Builder
 * @param {any} [options.input] A custom object that can be specified via the JATOS web interface ("JSON study input").
 * @param {"development"|"production"|"jatos"} options.environment The context in which the experiment is run: `development` for `jspsych run`, `production` for `jspsych build`, and "jatos" if served by JATOS
 * @param {{images: string[]; audio: string[]; video: string[];, misc: string[];}} options.assetPaths An object with lists of file paths for the respective `@...Dir` pragmas
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const { Config, Stimulus, Instructions } = await import(
    `./experiments/${version}/index`
  );

  const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: "Completion Progress",
    use_web_audio: false,
    on_trial_start: () => addJatosAbort(0),
    on_finish: () => finishStudy(jsPsych, environment),
  });

  let urlVars = {
    prolificID: -1,
    studyID: -1,
    sessionID: -1,
  };
  if (environment === "jatos") {
    urlVars = {
      prolificID: _.get(jatos, "urlQueryParameters.prolificID", -1),
      studyID: _.get(jatos, "urlQueryParameters.studyID", -1),
      sessionID: _.get(jatos, "urlQueryParameters.sessionID", -1),
    };
    jatos
      .submitResultData(urlVars)
      .then(() => console.log("Successfully logged Prolific data."));
  }
  jsPsych.data.addProperties(urlVars);

  const prologueT = [
    ...pTimeline(jsPsych),
    ..._.map(Instructions, (component, key) => {
      return { type: ReactPlugin, component };
    }),
  ];

  let { stimuli } = Config;
  stimuli = _.shuffle(stimuli);
  stimuli = SLICE_STIMULI ? _.slice(stimuli, 0, 3) : stimuli;
  const stimuliT = _.flatten(_.map(stimuli, (s) => Stimulus(s, jsPsych)));

  const epilogueT = eTimeline(jsPsych);

  const timeline = [
    ...(DEBUG ? [] : prologueT),
    ...stimuliT,
    ...(DEBUG ? [] : epilogueT),
  ];
  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  // return jsPsych;
}
