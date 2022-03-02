var jsPsychHtmlSliderResponse = (function (jspsych) {
  'use strict';

  const info = {
      name: "html-slider-response",
      parameters: {
          /** The HTML string to be displayed */
          stimulus: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Stimulus",
              default: undefined,
          },
          /** Sets the minimum value of the slider. */
          min: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Min slider",
              default: 0,
          },
          /** Sets the maximum value of the slider */
          max: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Max slider",
              default: 100,
          },
          /** Sets the starting value of the slider */
          slider_start: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Slider starting value",
              default: 50,
          },
          /** Sets the step of the slider */
          step: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Step",
              default: 1,
          },
          /** Array containing the labels for the slider. Labels will be displayed at equidistant locations along the slider. */
          labels: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Labels",
              default: [],
              array: true,
          },
          /** Width of the slider in pixels. */
          slider_width: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Slider width",
              default: null,
          },
          slider_number: {
            type: jspsych.ParameterType.BOOL,
            pretty_name:'Slider with number',
            default: false,
            description: 'Include a number with the selected value in the slider.'
          },
          total_time: {
            type: jspsych.ParameterType.INT,
            pretty_name: "Total hours slider",
            default: 0,
          },
          selected_item: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Participant selected item",
            default: "N/A",
            array: false,
          },
          item: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Trial selected item",
            default: "N/A",
            array: false,
          },
          subcategory: {
            type: jspsych.ParameterType.STRING,
            pretty_name: "Trial subcategory",
            default: "N/A",
            array: false,
          },
          /** Label of the button to advance. */
          button_label: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Button label",
              default: "Continue",
              array: false,
          },
          /** If true, the participant will have to move the slider before continuing. */
          require_movement: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Require movement",
              default: false,
          },
          /** Any content here will be displayed below the slider. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** How long to show the stimulus. */
          stimulus_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Stimulus duration",
              default: null,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** If true, trial will end when user makes a response. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
      },
  };
  /**
   * **html-slider-response**
   *
   * jsPsych plugin for showing an HTML stimulus and collecting a slider response
   *
   * @author Josh de Leeuw
   * @see {@link https://www.jspsych.org/plugins/jspsych-html-slider-response/ html-slider-response plugin documentation on jspsych.org}
   */
  class HtmlSliderResponsePlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          // half of the thumb width value from jspsych.css, used to adjust the label positions
          var half_thumb_width = 7.5
          const sliderWrapper = document.createElement("div")
          sliderWrapper.id = "jspsych-html-slider-response-wrapper"
          sliderWrapper.classList.add("my-4")

          const sliderStimulus = document.createElement("div")
          sliderWrapper.appendChild(sliderStimulus)
          sliderStimulus.id = "jspsych-html-slider-response-stimulus"
          sliderStimulus.innerHTML = trial.stimulus

          if (trial.slider_number) {
            const valueContainer = document.createElement("div")
            valueContainer.classList.add("d-flex", "flex-row")

            const valueA = document.createElement("div")
            valueA.classList.add("flex-fill")
            valueA.id = "slider-value-a"
            const valueAText = document.createElement("p")
            valueAText.classList.add("fw-bold")
            valueAText.id = "slider-value-a-text"
            /* uncomment below to flip positions and colors of itemA and itemB */
            // valueAText.innerText = trial.item
            valueAText.innerText = trial.selected_item
            valueA.appendChild(valueAText)
            const valueATime = document.createElement("p")
            valueATime.id = "slider-value-a-time"
            valueA.appendChild(valueATime)
            valueContainer.appendChild(valueA)

            const valueB = document.createElement("div")
            valueB.classList.add("flex-fill")
            valueB.id = "slider-value-b"
            const valueBText = document.createElement("p")
            valueBText.classList.add("fw-bold")
            valueBText.id = "slider-value-b-text"
            valueBText.innerText =  trial.item
            /* uncomment below to flip positions and colors of itemA and itemB */
            // valueBText.innerText = trial.selected_item
            valueB.appendChild(valueBText)
            const valueBTime = document.createElement("p")
            valueBTime.id = "slider-value-b-time"
            valueB.appendChild(valueBTime)
            valueContainer.appendChild(valueB)

            sliderWrapper.appendChild(valueContainer)
          }

          const sliderResponse = document.createElement("div")
          sliderResponse.classList.add(
            "jspsych-html-slider-response-container", "mx-auto", "mb-3"
          )
          if (trial.slider_width !== null) {
            sliderResponse.style.width = `${trial.slider_width}px`
          } else {
            sliderResponse.style.width = `auto`
          }
          const sliderRatio = document.createElement("div");
          sliderRatio.classList.add("slider-response-ratio")

          const sliderRatioA = document.createElement("div");
          sliderRatioA.id = "slider-response-ratioA"
          sliderRatio.appendChild(sliderRatioA)

          const sliderRatioB = document.createElement("div");
          sliderRatioB.id = "slider-response-ratioB"
          sliderRatio.appendChild(sliderRatioB)

          sliderResponse.appendChild(sliderRatio);

          const slider = document.createElement("input")
          slider.type = "range"
          slider.classList.add("jspsych-slider")
          slider.id = "jspsych-html-slider-response-response"
          slider.value = trial.slider_start
          slider.min = trial.min
          slider.max = trial.max
          slider.step = trial.step
          sliderResponse.appendChild(slider)
          sliderWrapper.appendChild(sliderResponse)

          const labelWrapper = document.createElement("div")
          labelWrapper.classList.add("container")
          labelWrapper.id = "label-wrapper"
          const labelContainer = document.createElement("div")
          labelContainer.id = "label-container"
          labelContainer.classList.add("row")
          for (const labelValue of trial.labels) {
            const label = document.createElement("div")
            label.classList.add("col", "fs-6")
            label.innerHTML = labelValue
            labelContainer.appendChild(label)
          }
          labelWrapper.appendChild(labelContainer)
          sliderWrapper.appendChild(labelWrapper)
          for (var j = 0; j < trial.labels.length; j++) {
              var label_width_perc = 100 / (trial.labels.length - 1);
              var percent_of_range = j * (100 / (trial.labels.length - 1));
              var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
              var offset = (percent_dist_from_center * half_thumb_width) / 100;
          }

          const submitButton = document.createElement("button")
          submitButton.classList.add("jspsych-btn")
          submitButton.disabled = trial.require_movement
          submitButton.innerText = trial.button_label
          submitButton.id = "jspsych-html-slider-response-next"
          sliderWrapper.append(submitButton)
          // add submit button
          display_element.innerHTML = sliderWrapper.outerHTML;

          function secondsToHMS(d) {
            d = Number(d);
            const h = Math.floor(d / 3600);
            const m = Math.floor(d % 3600 / 60);
            const s = Math.floor(d % 3600 % 60);

            const results = { h, m, s, raw: d }
        
            const hText = h ? `<span> ${pluralize("hour", h, true)}` : ""
            const mText = m ? `<span> ${pluralize("minute", m, true)}` : ""
            const sText = s ? `<span> ${pluralize("second", s, true)}` : ""
            return {results, html: hText + mText + sText };
          }

          let results = {}
        //   check here for percentage of hours
        // move this so that it's above slider
          function updateRatioAndTime() {
            const $valueATime = $("#slider-value-a-time");
            const $valueBTime = $("#slider-value-b-time");
            const $value = $('#jspsych-html-slider-response-response');
            const $sliderA = $("#slider-response-ratioA")
            const percWidth = $value.val() / 100

            $sliderA.width($value.width() * percWidth);

            const itemB = trial.total_time * percWidth 

            const { results: resultA, html: htmlA } = secondsToHMS(trial.total_time - itemB)
            const { results: resultB, html: htmlB } = secondsToHMS(itemB)
            
            $valueBTime.html(htmlB);
            $valueATime.html(htmlA);

            // uncomment below to swap sides for itemA and itemB
            // const itemA = trial.total_time * percWidth 

            // const { results: resultA, html: htmlA } = secondsToHMS(itemA)
            // const { results: resultB, html: htmlB } = secondsToHMS(trial.total_time - itemA)
            
            // $valueATime.html(htmlA);
            // $valueBTime.html(htmlB);

            return { resultA, resultB }
          }

          $(document).ready(function() {
            const $value = $('#jspsych-html-slider-response-response');
            results = updateRatioAndTime()

            $value.on('input change', () => {
                results = updateRatioAndTime()
            });
            $(window).on("resize", () => {
                results = updateRatioAndTime()
            })
          });

          const response = {
              rt: null,
              response: null,
          };
          if (trial.require_movement) {
              const enable_button = () => {
                  display_element.querySelector("#jspsych-html-slider-response-next").disabled = false;
              };
              display_element
                  .querySelector("#jspsych-html-slider-response-response")
                  .addEventListener("mousedown", enable_button);
              display_element
                  .querySelector("#jspsych-html-slider-response-response")
                  .addEventListener("touchstart", enable_button);
              display_element
                  .querySelector("#jspsych-html-slider-response-response")
                  .addEventListener("change", enable_button);
          }
          const end_trial = () => {
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // save data
              // console.log(results)
              results.resultA.item = trial.item
              results.resultB.item = trial.selected_item

              var trialdata = {
                  rt: response.rt,
                  // stimulus: trial.stimulus,
                  // slider_start: trial.slider_start,
                  // response: response.response,
                  subcategory: trial.subcategory,
                  resultA: results.resultA,
                  resultB: results.resultB,
              };
              display_element.innerHTML = "";
              // next trial
              this.jsPsych.finishTrial(trialdata);
          };
          display_element
              .querySelector("#jspsych-html-slider-response-next")
              .addEventListener("click", () => {
              // measure response time
              var endTime = performance.now();
              response.rt = Math.round(endTime - startTime);
              response.response = display_element.querySelector("#jspsych-html-slider-response-response").valueAsNumber;
              if (trial.response_ends_trial) {
                  end_trial();
              }
              else {
                  display_element.querySelector("#jspsych-html-slider-response-next").disabled = true;
              }
          });
          if (trial.stimulus_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  display_element.querySelector("#jspsych-html-slider-response-stimulus").style.visibility = "hidden";
              }, trial.stimulus_duration);
          }
          // end trial if trial_duration is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
          }
          var startTime = performance.now();
      }
      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      create_simulation_data(trial, simulation_options) {
          const default_data = {
              stimulus: trial.stimulus,
              slider_start: trial.slider_start,
              response: this.jsPsych.randomization.randomInt(trial.min, trial.max),
              rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          this.trial(display_element, trial);
          load_callback();
          if (data.rt !== null) {
              const el = display_element.querySelector("input[type='range']");
              setTimeout(() => {
                  this.jsPsych.pluginAPI.clickTarget(el);
                  el.valueAsNumber = data.response;
              }, data.rt / 2);
              this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("button"), data.rt);
          }
      }
  }
  HtmlSliderResponsePlugin.info = info;

  return HtmlSliderResponsePlugin;

})(jsPsychModule);
