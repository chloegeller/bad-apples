import React from "react";
import { Stimulus as stimulus } from "./stimulus";
import Stage0 from "./instructions/stage0.mdx";
import config from "./config.yaml";

export const Config = config;
export const Stimulus = stimulus;
export const Instructions = {
  Stage0: (props) => <Stage0 {...props} />,
};
