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
          var half_thumb_width = 7.5;
          var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
          html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + "</div>";
          html +=
              '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
          if (trial.slider_width !== null) {
              html += "width:" + trial.slider_width + "px;";
          }
          else {
              html += "width:auto;";
          }
          html += '">';
          html +=
              '<input type="range" class="jspsych-slider" value="' +
                  trial.slider_start +
                  '" min="' +
                  trial.min +
                  '" max="' +
                  trial.max +
                  '" step="' +
                  trial.step +
                  '" id="jspsych-html-slider-response-response"></input>';
          html += "<div>";
          for (var j = 0; j < trial.labels.length; j++) {
              var label_width_perc = 100 / (trial.labels.length - 1);
              var percent_of_range = j * (100 / (trial.labels.length - 1));
              var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
              var offset = (percent_dist_from_center * half_thumb_width) / 100;
              html +=
                  '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
                      "left:calc(" +
                      percent_of_range +
                      "% - (" +
                      label_width_perc +
                      "% / 2) - " +
                      offset +
                      "px); text-align: center; width: " +
                      label_width_perc +
                      '%;">';
              html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
              html += "</div>";
          }
          html += "</div>";
          html += "</div>";
          html += "</div>";
          if(trial.slider_number){
            html += '<div class="font-weight-bold ml-2 valueSpanA" style="width: 100%;text-align: left;position: relative;top: 30px;right: 75px;z-index: -1;color: cornflowerblue;"></div>';
            html += '<div class="font-weight-bold ml-2 valueSpanB" style="vertical-align: top; width: 100%; text-align: right; position: relative; bottom: 30px;left: 75px; z-index: -1; color: darkgreen;"></div>';
          }
          
          if (trial.prompt !== null) {
              html += trial.prompt;
          }
          // add submit button
          html +=
              '<button id="jspsych-html-slider-response-next" class="jspsych-btn" ' +
                  (trial.require_movement ? "disabled" : "") +
                  ">" +
                  trial.button_label +
                  "</button>";
          display_element.innerHTML = html;

          function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
        
            var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
            var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
            return hDisplay + mDisplay + sDisplay; 
          }

        //   check here for percentage of hours
          $(document).ready(function() {

            const $valueSpanA = $('.valueSpanA');
            const $valueSpanB = $('.valueSpanB');
            const $value = $('#jspsych-html-slider-response-response');

            // figure out how to get these to align
            $valueSpanA.html("<p>" + trial.item + "</p>");
            $valueSpanB.html("<p>" + trial.selected_item + "</p>");

            $value.on('input change', () => {
                const itemA = trial.total_time * ($value.val() / 100)
                // $valueSpanA.html("Item A");
                $valueSpanA.html("<p>" + trial.item + "</p>" + secondsToHms(itemA));
                // $valueSpanB.html("Item B");
                $valueSpanB.html("<p>" + trial.selected_item + "</p>" + secondsToHms(trial.total_time - itemA));
            });
          });

          var response = {
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
              var trialdata = {
                  subcategory: trial.subcategory,
                  rt: response.rt,
                //   stimulus: trial.stimulus,
                //   slider_start: trial.slider_start,
                  response: response.response,
                //   subcategory: trial.subcategory,
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
