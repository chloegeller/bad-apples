import _ from "lodash";
import { prolificNodeID } from "./experiments/prologue";
import { attentionCheckNodeID, commentsNodeID } from "./experiments/epilogue";
import Papa from "papaparse";

function JSONtoCSV(data, { prolificID, studyID }) {
  const sliderParticipantItem = _.filter(data, {
    trial_type: "MDXSurveyPlugin",
  });
  const sliderResponses = _.filter(data, { trial_type: "BASlider" });
  const itemsAndResponses = _.zip(sliderParticipantItem, sliderResponses);

  const CSV = _.map(itemsAndResponses, ([item, response]) => {
    const { resultA: RA, resultB: RB } = response; // sugar

    RA.asString = `${RA.h}h ${RA.m}m ${RA.s}sec`;
    const resultA = {};
    _.map(RA, (value, key) => {
      resultA[`A.${key}`] = value;
    });

    RB.asString = `${RB.h}h ${RB.m}m ${RB.s}sec`;
    const resultB = {};
    _.map(RB, (value, key) => {
      resultB[`B.${key}`] = value;
    });

    return {
      prolificID,
      studyID,
      ...resultA,
      ...resultB,
      sliderRT: response.rt,
      itemRT: item.rt,
      sub_cat: response.sub_cat,
    };
  });

  return Papa.unparse(CSV);
}

export function finishStudy(jsPsych, environment) {
  const data = jsPsych.data;
  const totalTime = jsPsych.getTotalTime();

  const prolificTaskID = prolificNodeID();
  const attentionCheckID = attentionCheckNodeID();
  const commentsID = commentsNodeID();

  const prolificTaskNode = data.getDataByTimelineNode(prolificTaskID);
  const attentionCheckNode = data.getDataByTimelineNode(attentionCheckID);
  const commentsNode = data.getDataByTimelineNode(commentsID);

  const surveyText = {
    ...prolificTaskNode.trials[0].response,
    ...attentionCheckNode.trials[0].response,
    ...commentsNode.trials[0].response,
  };

  const IDs = _.pick(data.dataProperties, [
    "studyID",
    "sessionID",
    "prolificID",
  ]);
  IDs.prolificID =
    IDs.prolificID === -1 ? surveyText.prolific_id : IDs.prolificID;

  const CSV = JSONtoCSV(data.get().trials, IDs);
  const filename = `prolificID=${IDs.prolificID}-studyID=${IDs.studyID}`;

  const error = document.createElement("div");
  error.classList.add("alert", "alert-danger");
  error.innerText = "Something went wrong. Please contact us on Prolific.";

  try {
    jatos
      .uploadResultFile(CSV, `${filename}.csv`)
      .then(() => console.log("Successfully uploaded CSV."))
      .catch(() => console.error("Failed to upload CSV."));
    jatos
      .uploadResultFile(data.get().json(), `${filename}.json`)
      .then(() => console.log("Successfully uploaded JSON."))
      .catch(() => console.error("Failed to upload JSON."));
    jatos
      .submitResultData({
        jatos: {
          workerID: jatos.workerId,
          responseID: jatos.studyResultId,
        },
        ...IDs,
        totalTime,
        surveyText,
        data: data.get().json(),
      })
      .then(() => console.log("Successfully submitted data."))
      .then(jatos.endStudyAjax)
      .then(() => {
        window.location.href = jatos.batchJsonInput.prolificURL;
      })
      .catch(() => {
        jsPsych.getDisplayElement().clear();
        jsPsych.getDisplayElement().appendChild(error);
        console.error("Something went horribly wrong.");
      });
  } catch (e) {
    if (environment === "development") jsPsych.data.displayData();
    else {
      jsPsych.getDisplayElement().clear();
      jsPsych.getDisplayElement().appendChild(error);
    }
    console.log(e, e.message);
    console.log(jsPsych.data.get().json());
    console.log(jsPsych.data);
  }
}

export function addJatosAbort(condition) {
  if (document.getElementById("quit-study")) return;
  try {
    let abortBtn = document.createElement("button");
    abortBtn.id = "quit-study";
    abortBtn.type = "button";
    abortBtn.innerText = "Quit Study";
    abortBtn.addEventListener("click", () => {
      let abort = confirm(
        "Are you sure you want to quit? You will not be compensated for this study if you do."
      );
      jatos.batchSession
        .add("/conditions/-", condition)
        .then(() => {
          console.log(
            `Successfully re-added condition ${condition} to BatchSession.`
          );
        })
        .catch(() => {
          abort = false;
          alert("Failed to abort study. Please try again.");
        });
      abort && jatos.abortStudy("Aborted");
    });
    document.body.appendChild(abortBtn);
  } catch (e) {
    console.warn("Failed to add abort button.");
  }
}
