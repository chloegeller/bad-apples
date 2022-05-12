import {Alert, Button, Card} from "../../../components/bootstrap";
// @ts-ignore
import React, {useRef, useState} from "react"
// @ts-ignore
import ReactDOM from "react-dom"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"
import {Form, Field} from "react-final-form"

import _ from "lodash"
import createCalculatorDecorator from "final-form-calculate";
import {JsPsych} from "jspsych";
import {Decorator, FormApi} from "final-form";
import {
  formatDuration,
  minutesToSeconds,
  hoursToSeconds,
  intervalToDuration,
  addSeconds,
} from "date-fns"

const pluralize = require("pluralize");


const Error = (meta) => {
  const components = {
    p: (props) => <div className={"invalid-feedback mb-0"} {...props} />
  }
  const error = meta.error ?? ""
  return <ReactMarkdown children={error} remarkPlugins={[gfm]} components={components}/>
}

const InputGroup = ({name, placeholder = "", prompt = "", type = "number", validate = undefined, ...rest}) => {
  return <Field name={name} validate={validate}>
    {({input, meta}) => {
      const actuallyErrored = meta.error && meta.touched
      
      const inputClasses = ["form-control", (actuallyErrored ? "is-invalid" : undefined)]
        .filter((s: string) => s)
        .join(" ")
      
      if (type == "hidden")
        return undefined
      
      if (name == "totalA")
        return <div className={`input-group has-validation has-input-type-${type} col-sm`}>
          {prompt.length > 0 && <span className="input-group-text new"><strong>{prompt}</strong></span>}
          <input type={type} {...input} {...rest} className={inputClasses} required placeholder={placeholder}/>
          <Error {...meta} />
        </div>
      
      if (name == "totalB")
        return <div className={`input-group has-validation has-input-type-${type} col-sm`}>
          {prompt.length > 0 && <span className="input-group-text familiar"><strong>{prompt}</strong></span>}
          <input type={type} {...input} {...rest} className={inputClasses} required placeholder={placeholder}/>
          <Error {...meta} />
        </div>
      
      return <div className={`input-group has-validation has-input-type-${type} col-sm`}>
        {/*{prompt.length > 0 && <span className="input-group-text">{prompt}</span>}*/}
        <input type={type} {...input} {...rest} className={`${inputClasses} text-end`} required
               placeholder={placeholder}/>
        {prompt.length > 0 && <span className="input-group-text">{prompt}</span>}
        <Error {...meta} />
      </div>
    }}
  </Field>
}

const required = (value: any): string | undefined => value ? undefined : "**Required**"

const isBetween = (lo: number, hi: number) => {
  return (value) => lo <= value && value <= hi ? undefined : `Please enter a value between ${lo} and ${hi}.`
}

const clampResponse = (hours: number, minutes: number, seconds: number) => {
  const maxTime = toSeconds(0, {hours, minutes, seconds})
  return (value, allValues) => {
    // console.log(toSeconds(value, allValues), maxTime)
    return toSeconds(value, allValues) <= maxTime ? undefined :
      `Please enter a time that does not exceed ${duration(maxTime)}.`
  }
}

const composeValidators = (...validators) => (value, allValues) =>
  validators.reduce((error, validator) => error || validator(value, allValues), undefined)

const wrapSubmit = (jsPsych: JsPsych) => {
  // console.log(jsPsych)
  return (values: any, api: FormApi, callback: any) => {
    jsPsych.finishTrial(values)
    return undefined
  }
}

const toSeconds = (value: number, {hours = 0, minutes = 0, seconds = 0}) => {
  hours = hoursToSeconds(parseInt(String(hours)))
  minutes = minutesToSeconds(parseInt(String(minutes)))
  seconds = parseInt(String(seconds))
  return hours + minutes + seconds
}

const duration = (seconds: number) => {
  // https://stackoverflow.com/a/65711327/2714651
  const interval = intervalToDuration({start: 0, end: addSeconds(new Date(0), seconds)})
  return formatDuration(interval, {format: ["hours", "minutes", "seconds"]})
}

const extractTime: Decorator = createCalculatorDecorator(
  {field: "hours", updates: {secondsA: toSeconds}},
  {field: "minutes", updates: {secondsA: toSeconds}},
  {field: "seconds", updates: {secondsA: toSeconds}},
  {
    field: "secondsA",
    updates: {
      secondsB: (value) => hoursToSeconds(12) - value,
      totalA: duration,
    },
  },
  {field: "secondsB", updates: {totalB: duration}},
)

const Page = ({jsPsych, ...props}) => {
  const decorators: Decorator[] = [extractTime]
  
  const formConfig = {decorators, onSubmit: wrapSubmit(jsPsych)}
  // console.log(extractTime)
  
  const clamp = clampResponse(12, 0, 0)
  
  return <Form {...formConfig}>
    {({handleSubmit, values, invalid, ...rest}) => {
      const subcat = pluralize(props.subcategory)
      const item = props.probe
      // console.log("probe:", item)
      const choiceItem = jsPsych.data.get().last(2).values()[0]["participant_item"]
      return <form onSubmit={handleSubmit}>
        <Card klass="stimulus">
          <Card.Header>How would like to split the next <strong>12 hours</strong> between the
            two <strong>{subcat}</strong>? <p></p>
            <p>Please enter the <strong>amount of time</strong> you would like to spend trying
              <span className={"new"}><strong> {item}</strong></span>.</p>
            <small>Note: Your answer must be a <i>numeric</i> value.</small>
          </Card.Header>
          <Card.Body klass="stimulus-body">
            <div className={"row g-3"}>
              <InputGroup name="hours"
                          validate={composeValidators(required, isBetween(0, 12), clamp)}
                          placeholder="hours" prompt={"hours"} min={"0"} max={"12"}/>
              <InputGroup name="minutes"
                          validate={composeValidators(required, isBetween(0, 59), clamp)}
                          placeholder="minutes" prompt={"minutes"} min={"0"} max={"59"}/>
              <InputGroup name="seconds"
                          validate={composeValidators(required, isBetween(0, 59), clamp)}
                          placeholder="seconds" prompt={"seconds"} min={"0"} max={"59"}/>
            </div>
            <hr/>
            <div className={"row g-3"}>
              <InputGroup name={"secondsA"} type={"hidden"} readOnly/>
              <InputGroup name={"totalA"} type="text" placeholder={"Total time for " + item}
                          validate={composeValidators(required)} prompt={item}
                          readOnly/>
              <InputGroup name={"secondsB"} type={"hidden"} readOnly/>
              <InputGroup name={"totalB"} type="text" placeholder={"Total Time for " + choiceItem}
                          validate={composeValidators(required)} prompt={choiceItem}
                          readOnly/>
            </div>
            {/*<pre className="chroma">*/}
            {/*  <code>{JSON.stringify(values)}</code>*/}
            {/*</pre>*/}
          </Card.Body>
          <Card.Footer>
            <Button.Next disabled={invalid}/>
          </Card.Footer>
        </Card>
      </form>
    }}
  </Form>
}
export default Page