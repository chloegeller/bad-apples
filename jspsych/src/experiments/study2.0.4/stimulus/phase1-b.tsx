import {Alert, Button, Card} from "../../../components/bootstrap";
// @ts-ignore
import React, {useRef, useState} from "react"
// @ts-ignore
import ReactDOM from "react-dom"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"
import {Form, Field} from "react-final-form"
import {JsPsych} from "jspsych";
import {FormApi} from "final-form";


const Error = (meta) => {
  const components = {
    p: (props) => <div className={"invalid-feedback mb-0"} {...props} />
  }
  const error = meta.error ?? ""
  return <ReactMarkdown children={error} remarkPlugins={[gfm]} components={components}/>
}

const InputItem = ({name, placeholder = "", prompt = "", type = "text", validate = undefined, ...rest}) => {
  return <Field name={name} validate={validate}>
    {({input, meta}) => {
      const actuallyErrored = meta.error && meta.touched
      
      const inputClasses = ["form-control", (actuallyErrored ? "is-invalid" : undefined)]
        .filter((s: string) => s)
        .join(" ")
      
      return <div className={`input-group has-validation`}>
        {prompt.length > 0 && <span className="input-group-text">{prompt}</span>}
        <input type={type} {...input} {...rest} className={inputClasses} required placeholder={placeholder}/>
        <Error {...meta} />
      </div>
    }}
  </Field>
}

const required = (value: any): string | undefined => value ? undefined : "**Required**"

const wrapSubmit = (jsPsych: JsPsych) => {
  // console.log(jsPsych)
  return (values: any, api: FormApi, callback: any) => {
    jsPsych.finishTrial(values)
    return undefined
  }
}

const composeValidators = (...validators) => (value, allValues) =>
  validators.reduce((error, validator) => error || validator(value, allValues), undefined)

const Page = ({jsPsych, sub_cat, subcategory, ...props}) => {
  
  const formConfig = {onSubmit: wrapSubmit(jsPsych)}
  // console.log(sub_cat)
  return <Form {...formConfig}>
    {({handleSubmit, values, invalid, ...rest}) => {
      return <form onSubmit={handleSubmit}>
        <Card klass="stimulus">
          <Card.Header> <span className={"familiar"}> <strong> FAMILIAR ITEM </strong> </span></Card.Header>
          <Card.Body klass="stimulus-body">
            <p>
              Please think of a <span className="familiar"><strong>FAMILIAR {subcategory}</strong></span> that
              you consider to be a <span className="familiar"><strong> 9 out of 10</strong></span> (on a scale where
              10 is the most preferable, and 1 is the least preferable).
            </p>
            <p>
              Please enter the name of the <strong>{subcategory}</strong> in the text box below, then
              press <span className="btn-next btn-demo btn-sm">Continue</span> below.
            </p>
            <InputItem name="participant_item" validate={composeValidators(required)}
                       placeholder={`Please provide a familiar ${subcategory}`}/>
            
            <InputItem name={"sub_cat"} type={"hidden"} value={sub_cat} readOnly/>
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