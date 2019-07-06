import React from 'react';
import * as ReactDOM from 'react-dom';
import {observable, action} from 'mobx';
import {observer} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import {DivisionConfig} from "./config/DivisionConfig";
import {DivisionChart} from './charts/DivisionChart';
import {applicationState} from './ApplicationState';

enum Page {
    Configuration,
    ViewCharts
}
class FauxApplicationState {
    @observable currentPage = Page.ViewCharts;
    @action changeView(newView: Page) {
        this.currentPage = newView;
    }
}

const fauxAppState = new FauxApplicationState();

@observer
class ViewButton extends React.Component<{page: Page}, {}> {
    render() {
        const {currentPage} = fauxAppState;
        const {page} = this.props;
        const color = page == currentPage ? "yellow" : "white";
        return (
            <div style={{display: "inline-block", marginRight: 10, padding: 10, backgroundColor: color}} onClick={()=>fauxAppState.changeView(page)}>
                {Page[page]+""}
            </div>
        )
    }
}

@observer
class MainView extends React.Component<{}, {}> {
    render() {
        const {topLevelDivision} = applicationState;
        const {currentPage} = fauxAppState;
        const curPage = currentPage;
        const showViewChartsPage = currentPage == Page.ViewCharts;
        return (
            <div style={{boxSizing:"border-box",width:"100%",height:"100%",display:"flex",flexFlow:"column"}}>
                <div style={{borderBottom: "1px solid black"}}>
                    <ViewButton page={Page.Configuration} />
                    <ViewButton page={Page.ViewCharts} />
                </div>
                <div style={{flex:"1 1 auto",display:showViewChartsPage?"block":"none"}}>
                    <DivisionChart division={topLevelDivision} height={100} width={100} />
                </div>
                <div style={{flex:"1 1 auto",display:showViewChartsPage?"none":"block",padding:DivisionConfig.padding}}>
                    <DivisionConfig division={topLevelDivision} height={100} width={100}/>
                </div>
                <DevTools />
            </div>
        );
     }
};
ReactDOM.render(<MainView />, document.getElementById('root'));

console.log("hello world!");

const webSocket = new WebSocket(`ws://${location.host}`);
webSocket.onopen = function() {
    console.log("socket open");
    webSocket.send(JSON.stringify({message:"hello world"}));
    console.log("websocket sent");
}
webSocket.onmessage = function(message) {
    console.log("recerved message from server");
    console.log(message);
    console.log("specific content is \""+message.data+"\"");
}
/*
function f(target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("f(): called");
    console.log("target",target);
    console.log("propertyKey",propertyKey);
    console.log("descriptor",descriptor);
    console.log("classname",target.constructor.name)
    const originalMethod = descriptor.value;
    descriptor.value = function() {
        const context = this;
        const args = arguments;
        console.log("preemptive f call");
        originalMethod.apply(context, args);
    }
}

function g(target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("g(): called");
    console.log("target",target);
    console.log("propertyKey",propertyKey);
    console.log("descriptor",descriptor);
    const originalMethod = descriptor.value;
    descriptor.value = function() {
        const context = this;
        const args = arguments;
        console.log("preemptive g call");
        originalMethod.apply(context, args);
    }
}

class Hooplah {

    private name = "stan"

    constructor() {
        console.log("Test constructed");
    }

    @f
    @g
    test(friend: string) {
        console.log("test() called. My name is",this.name,"and my friend's name is",friend);
    }
}

const t = new Hooplah();
t.test("doug");
*/