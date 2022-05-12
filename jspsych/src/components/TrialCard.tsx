import { Card } from "./bootstrap"
// @ts-ignore
import React from "react"

const Page = ({jsPsych, klass, Header, Body, Footer, ...rest}) => {
    return <Card klass={klass.card}>
        <Card.Header klass={klass.header}>
            <Header />
        </Card.Header>
        <Card.Body klass={klass.body}>
            <Body />
        </Card.Body>
        <Card.Footer klass={klass.footer}>
            <Footer />
        </Card.Footer>
    </Card>
}

export default Page