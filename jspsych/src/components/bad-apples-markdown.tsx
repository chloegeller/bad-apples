//@ts-ignore
import React from "react"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BadApplesMD = ({children, ...rest}) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} {...rest}>
    {children}
  </ReactMarkdown>
}

export default BadApplesMD
