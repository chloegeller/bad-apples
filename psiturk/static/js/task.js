const psiTurk = PsiTurk(uniqueId, adServerLoc)

const buildExperimentTimeline = (data) => {
	data = _.shuffle(data)
	let timeline = _.map(data, Stimulus)
	return _.flatten(timeline)
}

const runExperiment = (data) => {
	let timeline = []
	let post_timeline = []
	var fullscreen_trial = {
		type: jsPsychFullscreen,
		fullscreen_mode: true
	};
	var exit_fullscreen = {
		type: jsPsychFullscreen,
		fullscreen_mode: true
	};
	const experimentTimeline = buildExperimentTimeline(data)
	var prolific_id = {
		type: jsPsychSurveyText,
		questions: [
		  {prompt: '<div style="text-align: center;"><span style="color:#666666;">Before we start, please enter your <strong>Prolific ID</strong>. Thank you!</span></div>', required: true, name: 'prolific_id'},
		],
	};

	var instruct = {
		type: jsPsychInstructions,
		pages: [
			`<span style="color:#666666;">In this study, we are interested in how people will split a certain time window between two items.<br></span><div>&nbsp;</div>

			<div><span style="color:#666666;">You will read about 12 new items or experiences.&nbsp;</span></div><div><span style="color:#666666;"><br></span></div><div><span style="color:#666666;">For each one, we would like you to <strong>give us your best guess for how long you would like to spend with either item</strong>.&nbsp;</span></div><div><br><ul>
			</ul>
			</div><div><i>Note</i>: once you answer a question, and click the arrow button, you will <b>NOT </b>be able to go back and edit your answers.<br></div>`],
		show_clickable_nav: true,
		allow_backward: false,
	};
	var attn_check = {
		type: jsPsychSurveyText,
		questions: [
		  {prompt: '<div style="text-align: center;"><span style="color:#666666;">What was <strong>your task</strong> in this study?</span></div>', required: true, name: 'attn_check'},
		],
	};
	var comments = {
		type: jsPsychSurveyText,
		questions: [
		  {prompt: '<div style="text-align: center;"><span style="color:#666666;">Comments(?)</span></div>', required: false, name: 'comments'},
		],
	};
	post_timeline.push(attn_check, comments, exit_fullscreen)
	timeline.push(fullscreen_trial, prolific_id, instruct)
	timeline = timeline.concat(experimentTimeline).concat(post_timeline)
	// console.log(timeline)

	const jsPsych = initJsPsych({
		show_progress_bar: true,
		message_progress_bar: "Progress Bar",
		timeline: timeline,
		on_finish: () => psiTurk.saveData({
			success: () => psiTurk.completeHIT(),
			error: () => console.log("Error saving data..."),
		}),
		on_data_update: (data) => psiTurk.recordTrialData(data),
	})
	jsPsych.run(timeline)
}

$(window).on("load", () => {
	$.getJSON(
		"/stimuli",
		{ uniqueId, counterbalance, condition, codeversion, },
		runExperiment
	)
})