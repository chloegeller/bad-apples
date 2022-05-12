import {JsPsych, JsPsychPlugin, ParameterType, TrialType} from "jspsych";
// @ts-ignore
import React from "react";
// @ts-ignore
import ReactDOM from "react-dom";
import ReactDOMClient from "react-dom/client"
import _ from "lodash";

const info = <const>{
  name: "MDXSurveyPlugin",
  parameters: {
    component: {
      type: ParameterType.FUNCTION,
      required: true,
    },
  },
};

type Info = typeof info;

class MDXSurveyPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private startTime: number;
  
  constructor(private jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }
  
  trial(container: HTMLElement, trial: TrialType<Info>) {
    const root: ReactDOMClient = this.jsPsych.extensions.react.getRoot()
    root.render(trial.component(trial), container);
    
    this.startTime = performance.now();
    
    let nextBtn = document.getElementById("next");
    nextBtn.addEventListener("click", () => {
      this.endTrial(container, trial);
    });
  }
  
  gatherResponses(container: HTMLElement) {
    const results = {
      rt: performance.now() - this.startTime,
    };
    container.querySelectorAll("input").forEach((input) => {
      if (input.required && _.isEmpty(input.value)) {
        input.classList.add("is-invalid");
        return;
      }
      results[input.id] = input.value;
    });
    return results;
  }
  
  endTrial(container: HTMLElement, trial: TrialType<Info>) {
    const results = this.gatherResponses(container);
    if (!_.isEmpty(_.omit(results, "rt"))) {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.finishTrial(results);
    }
  }
}

export default MDXSurveyPlugin;
