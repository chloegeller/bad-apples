import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
// @ts-ignore
import React from "react";
// @ts-ignore
import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";

const info = <const>{
  name: "React",
  parameters: {
    component: {
      type: ParameterType.FUNCTION,
      required: true,
    },
  },
};

type Info = typeof info;

class ReactPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(container: HTMLElement, trial: TrialType<Info>) {
    try {
      ReactDOM.unmountComponentAtNode(container);
    } catch (e) {}
    ReactDOM.render(trial.component(trial), container);

    let nextBtn = document.getElementById("next");

    nextBtn.addEventListener("click", () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.finishTrial();
    });
  }
}

export default ReactPlugin;
