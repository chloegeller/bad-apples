import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
// @ts-ignore
import React from "react";
import ReactDOM from "react-dom";

const pluralize = require("pluralize");

const info = <const>{
  name: "BASlider",
  parameters: {
    component: {
      type: ParameterType.FUNCTION,
      required: true,
    },
    total_time: {
      type: ParameterType.INT,
      required: true,
    },
    slider: {
      type: ParameterType.COMPLEX,
      parameters: {
        defaultValue: {
          type: ParameterType.INT,
          default: 50,
        },
        step: {
          type: ParameterType.INT,
          default: 1,
        },
        min: {
          type: ParameterType.INT,
          default: 0,
        },
        max: {
          type: ParameterType.INT,
          default: 100,
        },
      },
    },
    labels: {
      type: ParameterType.HTML_STRING,
      default: [],
      array: true,
    },
    sub_cat: {
      type: ParameterType.STRING,
      required: true,
    },
    selected_item: {
      type: ParameterType.STRING,
      required: true,
    },
    item: {
      type: ParameterType.STRING,
      required: true,
    },
  },
};

type Info = typeof info;

type HMSResult = {
  h: number;
  m: number;
  s: number;
  raw: number;
  item?: string;
};

class SliderPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private total_time: number;
  private results: {
    resultA: HMSResult;
    resultB: HMSResult;
  };
  private slider: HTMLInputElement;
  private start_time: number;

  constructor(private jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(container: HTMLElement, trial: TrialType<Info>) {
    this.total_time = trial.total_time;

    try {
      ReactDOM.unmountComponentAtNode(container);
    } catch (e) {}
    ReactDOM.render(trial.component(trial), container);

    this.slider = document.getElementById(
      "jspsych-html-slider-response-response"
    ) as HTMLInputElement;

    this.start_time = performance.now();

    this.results = this.updateRatio();

    this.slider.addEventListener("input", () => {
      this.results = this.updateRatio();
    });

    const enableNext = () => {
      nextBtn.disabled = false;
    };
    this.slider.addEventListener("mousedown", enableNext);
    this.slider.addEventListener("touchstart", enableNext);
    this.slider.addEventListener("change", enableNext);

    // this.slider.on("resize", () => {
    //     this.results = this.updateRatio();
    // });

    let nextBtn = document.getElementById("next") as HTMLButtonElement;
    nextBtn.addEventListener("click", () => {
      this.endTrial(trial);
    });
  }

  endTrial(trial: TrialType<Info>) {
    this.jsPsych.pluginAPI.clearAllTimeouts();
    this.results.resultA.item = trial.item;
    this.results.resultB.item = trial.selected_item;
    this.jsPsych.finishTrial({
      rt: performance.now() - this.start_time,
      sub_cat: trial.sub_cat,
      ...this.results,
    });
  }

  updateRatio() {
    const timeA = document.getElementById("slider-value-a-time");
    const timeB = document.getElementById("slider-value-b-time");
    const sliderA = document.getElementById(
      "slider-response-ratioA"
    ) as HTMLElement;

    const total_time = parseInt(this.slider.max);
    const itemATime = parseInt(this.slider.value);

    sliderA.style.width = `${
      (this.slider.offsetWidth * itemATime) / total_time
    }px`;

    const { results: resultA, html: htmlA } = this.secondsToHMS(itemATime);
    const { results: resultB, html: htmlB } = this.secondsToHMS(
      total_time - itemATime
    );

    timeA.innerHTML = htmlA;
    timeB.innerHTML = htmlB;

    return { resultA, resultB };
  }

  secondsToHMS(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    const results = { h, m, s, raw: d };

    const hText = h ? `<span> ${pluralize("hour", h, true)} </span>` : "";
    const mText = m ? `<span> ${pluralize("minute", m, true)} </span>` : "";
    const sText = s ? `<span> ${pluralize("second", s, true)} </span>` : "";
    return { results, html: hText + mText + sText };
  }
}

export default SliderPlugin;
