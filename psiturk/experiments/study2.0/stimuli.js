// Each page of instructions is separated into a "Phase".

const Phase1 = ({ subcategory }) => {
    const wrapper = document.createElement("div");

    const imagine = document.createElement("p");

    // pluralize produces the correct plural form of the subcategory 
    //   (but it's not necessary given the current phrasing)
    // const plural = pluralize(subcategory)

    // indefinite produces the correct "a"/"an" for the leading word
    const prefix = indefinite(
        subcategory,
        { articleOnly: true, numbers: "colloquial", caseInsensitive: true, }
    )
    imagine.innerHTML = `Think of ${prefix} <strong>${subcategory}</strong> that you consider to be a 9/10.`
    wrapper.appendChild(imagine)

    const hold_on = document.createElement("p");
    hold_on.innerHTML = "Once you have thought of one, please press <strong>next</strong>."
    wrapper.appendChild(hold_on)
    return wrapper.innerHTML;
}

const Phase2 = ({ subcategory, past_tense, probe }) => {
    const wrapper = document.createElement("div");

    const new_probe = document.createElement("p");
    new_probe.innerHTML = `There is a new <strong>${subcategory}</strong> called "<strong><i>${probe}</i></strong>", and you haven't ${past_tense} it yet. <p> Your friends have, and they rate it as a 3/10.</p><p> They know that <strong>you will also</strong> rate it as a 3/10.</p>`
    wrapper.appendChild(new_probe)

    return wrapper.innerHTML;
}

const Phase3 = ({ subcategory, duration = "12 hours"}) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("mb-5")

    const rating = document.createElement("p");
    const plural = pluralize(subcategory)
    rating.innerHTML = `How would you like to split the next <strong>${duration}</strong> between the two ${plural}?`
    wrapper.appendChild(rating)

    return wrapper.innerHTML;
}

const Stimulus = (stimulus) => {
    const trial_instructions = {
        type: jsPsychInstructions,
        pages: [Phase1(stimulus), Phase2(stimulus)],
        show_clickable_nav: true,
        allow_backward: false,
    }

    const trial_slider = {
        type: jsPsychHtmlSliderResponse,
        stimulus: Phase3(stimulus),
        slider_number: true,
        total_time: 43200,
        step: 0.1,
        selected_item: `Your selected ${stimulus.subcategory}`,
        item: stimulus.probe,
        slider_start: 50,
        require_movement: true,
        labels: [""],
        subcategory: stimulus.subcategory,
    }
    return [trial_instructions, trial_slider];
}