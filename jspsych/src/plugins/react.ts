import {JsPsych, JsPsychPlugin, ParameterType, TrialType} from "jspsych";
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
    providesSubmit: {
      type: ParameterType.BOOL,
      required: false,
      default: false,
    },
  },
};

type ReactInfo = typeof info;


class ReactPlugin<T extends ReactInfo> implements JsPsychPlugin<T> {
  static info = info;
  
  constructor(private readonly jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }
  
  trial(container: HTMLElement, trial: TrialType<ReactInfo>) {
    this.jsPsych.extensions.react.render(
      trial.component, {trial}
    )
    
    if (!trial.providesSubmit) {
      let nextBtn = document.getElementById("next");
      
      nextBtn.addEventListener("click", () => {
        this.jsPsych.pluginAPI.clearAllTimeouts();
        this.jsPsych.finishTrial();
      });
    }
  }
}

export default ReactPlugin;
