/**
 * @title Bad Apples
 * @description split your  time between new and familiar
 * @version study2.0.5
 *
 * @assets assets/
 */


// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import {initJsPsych} from "jspsych";

import _ from "lodash";
import {Timeline as pTimeline} from "./experiments/prologue";
import {Timeline as eTimeline} from "./experiments/epilogue";

import bootstrap from "bootstrap";
import ReactPlugin from "./plugins/react";
import React from "react";
import {finishStudy} from "./jatos-utils";
import ReactDOMExtension from "./extensions/react";
import JATOSExtension from "./extensions/jatos";

const DEBUG = false;
const SLICE_STIMULI = false;

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({assetPaths, input = {}, environment, title, version,}) {
  const {default: {Config, Stimulus, Instructions}} = await import(
    `./experiments/${version}/index`
    );
  
  const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: "Completion Progress",
    use_web_audio: false,
    on_finish: async () => {
      await finishStudy(jsPsych, environment)
    },
    extensions: [
      {type: ReactDOMExtension, params: {}},
      {type: JATOSExtension, params: {environment}}
    ]
  });
  
  const prologueT = [...pTimeline, ...Instructions]
  
  let {stimuli} = Config;
  stimuli = _.shuffle(stimuli);
  stimuli = SLICE_STIMULI ? _.slice(stimuli, 0, 2) : stimuli;
  const stimuliT = _.flatten(_.map(stimuli, (s) => Stimulus(s, jsPsych)));
  
  const epilogueT = eTimeline
  
  const timeline = [
    ...(DEBUG ? [] : prologueT),
    ...stimuliT,
    ...(DEBUG ? [] : epilogueT),
  ];
  await jsPsych.run(timeline);
}
