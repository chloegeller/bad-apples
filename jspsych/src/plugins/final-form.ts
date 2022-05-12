import {JsPsych, JsPsychPlugin, ParameterType, TrialType} from "jspsych";
// @ts-ignore
import React from "react";
// @ts-ignore
import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import ReactPlugin from "./react";
import _ from "lodash";

const info = Object.assign({}, ReactPlugin.info)
// @ts-ignore
info.name = "FinalForm"
// @ts-ignore
info.parameters.providesSubmit.default = true

type Info = typeof info;

class FinalFormPlugin extends ReactPlugin<Info> {
  static info = info;
  
  trial(container: HTMLElement, trial: TrialType<Info>) {
    super.trial(container, trial)
  }
}

export default FinalFormPlugin;
