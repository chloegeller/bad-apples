// @ts-ignore
import React from "react";
import {JsPsych} from "jspsych";

import TrialCard from "../../components/TrialCard";
import {Button} from "../../components/bootstrap";
import {DefaultFooter} from "./instructions";

import ReactPlugin from "../../plugins/react";
import FinalFormPlugin from "../../plugins/final-form";
import ReactDOMExtension from "../../extensions/react";

import ParticipantItem from "./stimulus/phase1-b"
import NewItemMDX from "./stimulus/phase1-a.mdx"
import FillInTheBlank from "./stimulus/phase2"

const ParticipantChoice = ({jsPsych, ...rest}) => {
  return <ParticipantItem jsPsych={jsPsych} {...rest} />
}

const NewItem = ({jsPsych, ...rest}) => {
  const Header = () => <span className={"new"}><strong> NEW ITEM </strong></span>
  const Footer = () => <DefaultFooter jsPsych={jsPsych}/>
  const Body = () => <NewItemMDX {...rest}/>
  
  const props = {
    jsPsych, Header, Footer, Body,
    klass: {card: null, header: null, body: null, footer: null}
  }
  return <TrialCard {...props} />
}

const Stimuli = ({jsPsych, ...rest}) => {
  // console.log(jsPsych.data.get().last(2).values()[0]["participant_item"])
  return <FillInTheBlank jsPsych={jsPsych} {...rest} />
}

const buildStimuli = (stimulus, jsPsych) => {
  const extensions = [{type: ReactDOMExtension, params: {}}]
  
  const participantItemTrial = {
    type: FinalFormPlugin,
    component: (props) => <ParticipantChoice {...stimulus} {...props} />,
    extensions,
  }
  
  const newItemTrial = {
    type: ReactPlugin,
    component: (props) => <NewItem {...stimulus} {...props} />,
    extensions,
  }
  
  const choiceTrial = {
    type: FinalFormPlugin,
    component: (props) => <Stimuli {...stimulus} {...props} />,
    extensions,
  }
  
  return [participantItemTrial, newItemTrial, choiceTrial]
}
export default buildStimuli