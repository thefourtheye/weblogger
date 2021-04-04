import { Component } from "react";

const name = "Sakthi";

export class App extends Component {
    render() {
        return (<div><h1> Hello, {name} at {new Date().toString()}</h1></div>);
    }
};
