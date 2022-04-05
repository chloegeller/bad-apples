import React from "react";
import ReactDom from "react";
import _ from "lodash";

export const CardHeader = ({ children }) => {
  return (
    <div className={"card-header"}>
      <h4 className={"card-title"}>{children}</h4>
    </div>
  );
};

export const CardFooter = ({ children }) => {
  return (
    <div className={"card-footer"}>
      <div className={"card-footer-body"}>{children}</div>
    </div>
  );
};

export const CardBody = ({ klass, children, ...rest }) => {
  klass = _.isNil(klass) ? "instructions" : klass;
  return (
    <div className={`${klass} card-body`} {...rest}>
      {children}
    </div>
  );
};

export const Alert = ({ kind, klass, children, ...rest }) => {
  return (
    <div className={`alert alert-${kind} ${klass}`} {...rest}>
      {children}
    </div>
  );
};

export const Button = ({ klass, children, ...rest }) => {
  const buttonType = rest.type || "button";
  return (
    <button type={buttonType} className={`btn ${klass}`} {...rest}>
      {children}
    </button>
  );
};
Button.Next = (props) => {
  return (
    <Button klass={"btn-next"} id={"next"} type={"submit"} {...props}>
      Continue
    </Button>
  );
};

export const Card = ({ klass, children, ...rest }) => {
  return (
    <div className={`${klass} card`} {...rest}>
      {children}
    </div>
  );
};
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default {
  Card,
  Alert,
};
