// @ts-ignore
import React from "react";
// @ts-ignore
import ReactDom from "react";
import _ from "lodash";

export const CardHeader = ({ klass = undefined, children }) => {
  klass = [klass, "card-header"].filter(s => s).join(" ")
  return (
    <div className={klass}>
      <h4 className={"card-title"}>{children}</h4>
    </div>
  );
};

export const CardFooter = ({ klass = undefined , children }) => {
  klass = [klass, "card-footer"].filter(s => s).join(" ")
  return (
    <div className={klass}>
      <div className={"card-footer-body"}>{children}</div>
    </div>
  );
};

export const CardBody = ({ klass = undefined, children, ...rest }) => {
  klass = [klass, "card-body"].filter(s => s).join(" ")
  return (
    <div className={klass} {...rest}>
      {children}
    </div>
  );
};

export const Alert = ({ kind, klass = undefined, children, ...rest }) => {
  klass = ["alert", `alert-${kind}`, klass].filter(s => s).join(" ")
  return (
    <div className={klass} {...rest}>
      {children}
    </div>
  );
};

export const Button = ({ klass = undefined, children, ...rest }) => {
  const buttonType = rest.type ?? "button";
  klass = ["btn", klass].filter(s => s).join(" ")
  return (
    <button type={buttonType} className={klass} {...rest}>
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
