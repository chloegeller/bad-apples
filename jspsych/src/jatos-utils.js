import _ from "lodash";
// import {prolificNodeID} from "./experiments/prologue";
// import {attentionCheckNodeID, commentsNodeID} from "./experiments/epilogue";
import Papa from "papaparse";
// import {js} from "prettify/lib/defaults";

// TODO fix this to work with vizzini
function JSONtoCSV(data, {prolificID, studyID}) {
    data = data.filter({ trial_type: "FinalForm", }).values()

    const CSV = data.map((entry) => {
        if (_.keys(entry).includes("participant_item"))
            return undefined

        const omitted = _.omit(entry, ["sessionID", "prolificID", "studyID"])
        // console.log("entry", entry, "omitted", omitted)
        return {
            prolificID,
            studyID,
            ...omitted,
        };
    }).filter(e => e);

    const columns = _.uniq(_.flatMap(CSV, _.keys))
    // console.log("Pre-parsed", CSV)
    return Papa.unparse(CSV, { columns });
}

export async function finishStudy(jsPsych, environment) {
    const error = document.createElement("div");
    error.classList.add("alert", "alert-danger");
    error.innerText = "Something went wrong. Please contact us on Prolific.";
    console.log("Attempting to complete study.")

    try {
        const _CSV = await jsPsych.extensions.jatos.uploadCSV(JSONtoCSV)
        // console.log(_CSV)
        const _JSON = await jsPsych.extensions.jatos.uploadJSON()
        const resultData = await jsPsych.extensions.jatos.uploadResultData()
        await jsPsych.extensions.jatos.endStudy()
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
