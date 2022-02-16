/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-ready.html",
	"stage.html",
	"postquestionnaire.html"
];

// In javascript, defining a function as `async` makes it return  a `Promise`
// that will "resolve" when the function completes. Below, `init` is assigned to be the
// *returned value* of immediately executing an anonymous async function.
// This is done by wrapping the async function in parentheses, and following the
// parentheses-wrapped function with `()`.
// Therefore, the code within the arrow function (the code within the curly brackets) immediately
// begins to execute when `init is defined. In the example, the `init` function only
// calls `psiTurk.preloadPages()` -- which, as of psiTurk 3, itself returns a Promise.
//
// The anonymous function is defined using javascript "arrow function" syntax.
const init = (async () => {
    await psiTurk.preloadPages(pages);
})()

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-ready.html"
];

// var sliderTrial = [
// 	"slider.html"
// ]


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

/********************
* STROOP TEST       *
********************/
var StroopExperiment = function() {

	var wordon, // time word is presented
	    listening = false;

	// Stimuli for a basic Stroop experiment
	var stims = [
			["SHIP", "red", "unrelated"],
			["MONKEY", "green", "unrelated"],
			["ZAMBONI", "blue", "unrelated"],
			["RED", "red", "congruent"],
			["GREEN", "green", "congruent"],
			["BLUE", "blue", "congruent"],
			["GREEN", "red", "incongruent"],
			["BLUE", "green", "incongruent"],
			["RED", "blue", "incongruent"]
		];

	stims = _.shuffle(stims);

	var next = function() {
		if (stims.length===0) {
			finish();
		}
		else {
			stim = stims.shift();
			show_word( stim[0], stim[1] );
			wordon = new Date().getTime();
			listening = true;
			d3.select("#query").html('<p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>');
		}
	};
	
	var response_handler = function(e) {
		if (!listening) return;

		var keyCode = e.keyCode,
			response;

		switch (keyCode) {
			case 82:
				// "R"
				response="red";
				break;
			case 71:
				// "G"
				response="green";
				break;
			case 66:
				// "B"
				response="blue";
				break;
			default:
				response = "";
				break;
		}
		if (response.length>0) {
			listening = false;
			var hit = response == stim[1];
			var rt = new Date().getTime() - wordon;

			psiTurk.recordTrialData({'phase':"TEST",
                                     'word':stim[0],
                                     'color':stim[1],
                                     'relation':stim[2],
                                     'response':response,
                                     'hit':hit,
                                     'rt':rt}
                                   );
			remove_word();
			next();
		}
	};

	var finish = function() {
	    $("body").unbind("keydown", response_handler); // Unbind keys
	    currentview = new Questionnaire();
	};
	
	var show_word = function(text, color) {
		d3.select("#stim")
			.append("div")
			.attr("id","word")
			.style("color",color)
			.style("text-align","center")
			.style("font-size","150px")
			.style("font-weight","400")
			.style("margin","20px")
			.text(text);
	};

	var remove_word = function() {
		d3.select("#word").remove();
	};

	
	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Register the response handler that is defined above to handle any
	// key down events.
	$("body").focus().keydown(response_handler); 

	// Start the test
	next();
};


/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 


			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            error: prompt_resubmit});
	});
    
	
};

var SliderTrial = function() {

	const timeline = [];
  
	var out_act = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<div style="text-align: center;">There's a new <strong>outdoor activity</strong> called "<i><b>Bliggintom</b></i>", and it is considered to be a -5/10.</div>
		<p> Think of an <b>outdoor activity</b> that you consider to be a 9/10.</p><br>
		<p>How would you like to split the next <b>12 hours</b> between the two activities?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>ACTIVITY A</p>
			<p>Bliggintom</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>ACTIVITY B</p>
			<p>Your selected activity</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected activity",
		item: "Bliggingtom",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "out_act"
	};

	var in_act = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two activities below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>ACTIVITY A</p>
			<p>Swirling Skates</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>ACTIVITY B</p>
			<p>Your selected activity</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected activity",
		item: "Swirling Skates",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "in_act"
	};

	var sport = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two sports below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>SPORT A</p>
			<p>Belving Ball</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>SPORT B</p>
			<p>Your selected sport</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected sport",
		item: "Belving Ball",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "sport"
	};

	var book = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two books below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>BOOK A</p>
			<p>The Pontifician</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>BOOK B</p>
			<p>Your selected book</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected book",
		item: "The Pontifician",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "book"
	};

	var movie = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two movies below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>MOVIE A</p>
			<p>The Wizard of Titan</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>MOVIE B</p>
			<p>Your selected movie</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected movie",
		item: "The Wizard of Titan",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "movie"
	};

	var show = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two shows below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>SHOW A</p>
			<p>Humpus Poipet</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>SHOW B</p>
			<p>Your selected show</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected show",
		item: "Humpus Poipet",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "show"
	};
	
	var fruit = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two fruits below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>FRUIT A</p>
			<p>Zibeo fruit</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>FRUIT B</p>
			<p>Your selected fruit</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected fruit",
		item: "Zibeo fruit",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "fruit"
	};

	var dish = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two dishes below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>DISH A</p>
			<p>Pie of Delights</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>DISH B</p>
			<p>Your selected dish</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected dish",
		item: "Pie of Delights",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "dish"
	};

	var beverage = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two beverages below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>BEVERAGE A</p>
			<p>Tropical Fizzy Footle</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>BEVERAGE B</p>
			<p>Your selected beverage</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected beverage",
		item: "Tropical Fizzy Footle",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "beverage"
	};

	var board_game = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two board games below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>BOARD GAME A</p>
			<p>Flags of Flembers</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>BOARD GAME B</p>
			<p>Your selected board game</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected board game",
		item: "Flags of Flembers",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "board_game"
	};

	var video_game = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two video games below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>VIDEO GAME A</p>
			<p>The Return of Galoo</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>VIDEO GAME B</p>
			<p>Your selected video game</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected video game",
		item: "The Return of Galoo",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "video_game"
	};

	var lawn_game = {
		type: jsPsychHtmlSliderResponse,
		stimulus: `<div style="width:500px;">
		<p>How would you like to split the next 12 hours between the two lawn games below?</p>
		<div style="width:240px; float: left; color:cornflowerblue;">
			<p>LAWN GAME A</p>
			<p>Hop of the Peach Tower</p>
		</div>
		<div style="width:240px; float: right; color: darkgreen">
			<p>LAWN GAME B</p>
			<p>Your selected lawn game</p>
		</div>
		</div>`,
		slider_number: true,
		total_time: 43200,
		step: 0.1,
		selected_item: "Your selected lawn game",
		item: "Hop of the Peach Tower",
		slider_start: 50,
		require_movement: true,
		labels: ['0%', '50%', '100%'],
		subcategory: "lawn_game"
	};
	
	timeline.push(out_act, in_act, sport, book, show, movie, fruit, dish, beverage, board_game, video_game, lawn_game);
	// timeline.push(survey_page1, trial_1, trial_2)
  
	return timeline;
}

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
 // In this example `task.js file, an anonymous async function is bound to `window.on('load')`.
 // The async function `await`s `init` before continuing with calling `psiturk.doInstructions()`.
 // This means that in `init`, you can `await` other Promise-returning code to resolve,
 // if you want it to resolve before your experiment calls `psiturk.doInstructions()`.

 // The reason that `await psiTurk.preloadPages()` is not put directly into the
 // function bound to `window.on('load')` is that this would mean that the pages
 // would not begin to preload until the window had finished loading -- an unnecessary delay.
$(window).on('load', () => {
    const jsPsych = initJsPsych({
		on_finish: function() {
			jsPsych.data.displayData();
			// psiTurk.saveData({
			// 	success: function() { psiTurk.completeHIT(); },
			// 	error: function() { console.log("error saving data"); }
			// });
		},
		on_data_update: function(data) {
			psiTurk.recordTrialData(data);
		}
	})
	var trial = SliderTrial();

	var prolific_id = {
		type: jsPsychSurveyText,
		questions: [
		  {prompt: '<div style="text-align: center;"><span style="color:#666666;">Before we start, please enter your <strong>Prolific ID</strong>. Thank you!</span></div>', required: true, name: 'prolific_id'},
		],
	  };

	var instruct = {
		type: jsPsychInstructions,
		pages: [
			'<span style="color:#666666;">In this study, we are interested in how long people think it will take them to <strong>"get what something is like"</strong>.<br><br>By "<b>get what something is like</b>", we mean the everyday way people talk about better understanding a novel item or experience. &nbsp;</span><div>&nbsp;</div><div><span style="color:#666666;">You will read about 12 new items or experiences.&nbsp;</span></div><div><span style="color:#666666;"><br></span></div><div><span style="color:#666666;">For each one, we would like you to <strong>give us your best guess for how long it will take you to get what it is like</strong>.&nbsp;</span></div><div><span style="color:#666666;"><br></span></div><div><span style="color:#666666;">Please see the next page for further instructions.&nbsp;</span><br>&nbsp;<ul></ul></div>',
			'<div><span style="color:#666666;">When answering "how long will it take you to get what this is like", we would like your answer to include a </span><span style="color: rgb(230, 126, 34);"><b>numeric amount of time</b></span><span style="color:#666666;">.</span></div><div><br><span style="color:#666666;">This will help us to process the answers later.&nbsp;</span><br>&nbsp;</div><div><span style="color:#666666;"><b>Here are some examples:</b></span></div><ul><li><font color="#666666">If you wish to answer " </font><span style="color:#e67e22;"><strong>20</strong></span><font color="#666666"> seconds", your answer should be the following: "</font><font color="#666666">seconds: </font><strong><span style="color:#e67e22;">20</span></strong><font color="#666666">".</font></li><li><font color="#666666">If you wish to answer " </font><span style="color:#e67e22;"><strong>2 </strong></span><font color="#666666">days </font><strong><span style="color:#e67e22;">5</span></strong><font color="#666666"> hours and&nbsp;</font><span style="color:#e67e22"><strong>20</strong></span><font color="#666666"> seconds", your answer should be the following: "</font><font color="#666666">days: </font><strong><font color="#e67e22">2</font></strong><font color="#666666">, hours: </font><strong><font color="#e67e22">5</font></strong><font color="#666666">, seconds: </font><strong><span style="color:#e67e22">20</span></strong><font color="#666666">"</font></li></ul><div><span style="color:#666666;"><br></span></div><div><span style="color:#666666;">Feel free to fill out any unit of time you think is relevant -- seconds, minutes, hours, days, and so on.&nbsp;</span></div><div>&nbsp;</div><div><span style="color:#666666;"><i>Note:</i> once you answer a question, and click the <i>Next</i> button, you will <b>NOT</b> be able to go back and edit your answers.</span></div>'],
		show_clickable_nav: true,
		allow_backward: false,
	  };

	var timeline = [prolific_id, instruct];
	// timeline = timeline.concat(jsPsych.randomization.shuffle(trial));
	timeline = timeline.concat(trial);
	jsPsych.run(timeline);
});
