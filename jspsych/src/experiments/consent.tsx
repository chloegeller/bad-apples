// @ts-ignore
import React from "react"
import { JsPsych} from "jspsych";
import { Card, Button } from "../components/bootstrap"
import TrialCard from "../components/TrialCard"
import Consent from "./consent-body.mdx"

const providesConsent = (jsPsych: JsPsych) => {
  return () => jsPsych.finishTrial({
    consent: true,
  })
}

const redirect = (redirectURL: string) => {
  return () => {
    // https://stackoverflow.com/a/60730879/2714651
    window.location.replace(redirectURL);
  }
}

const Page = ({jsPsych, redirectURL, ...rest}) => {
  const Header = () => "Consent Statement"
  const Body = Consent
  const Footer = () => {
    return <>
      <Button klass="btn-consent-disagree" onClick={redirect(redirectURL)}>I <strong>do not</strong> agree</Button>
      <Button klass="btn-consent-agree" onClick={providesConsent(jsPsych)}><strong>I agree</strong></Button>
    </>
  }
  const klass = {card: "consent-statement", body: "consent-body", footer: null, header: null}
  
  const props = {
    Header, Body, Footer, klass, jsPsych
  }
  
  return <TrialCard {...props} />
}

export default Page