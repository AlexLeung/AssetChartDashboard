import React from 'react';
import {Direction} from '../enums';
import {Division, ChartDisplay} from '../ApplicationState';
import {ChartState} from './ChartState';
import {observer} from 'mobx-react';

@observer
export class DivisionChart extends React.Component<{division: Division, height: number, width: number}, {}> {
    render() {
        const {division, width, height} = this.props;
        const textWidth = 300;
        const textHeight = 300;
        return (
            <div style={{height:height+"%",width:width+"%",boxSizing:'border-box',display:"inline-block",verticalAlign:"top"}}>
                {division.notSplit ?
                    <ChartContainer chartDisplay={division.currentChartDisplay}/>
                    :
                    <div style={{height:"100%",width:"100%"}}>
                        <DivisionChart division={division.first} width={division.direction==Direction.Horizontal?100:division.percent} height={division.direction==Direction.Horizontal?division.percent:100}/>
                        <DivisionChart division={division.second} width={division.direction==Direction.Horizontal?100:(100-division.percent)} height={division.direction==Direction.Horizontal?(100-division.percent):100}/>
                    </div>
                }
            </div>
        )
    }
}

@observer
class ChartContainer extends React.Component<{chartDisplay: ChartDisplay}, {}> {

    private static chartContainerIdsRegistered = 0;
    private chartContainerId: string;
    private currentChartState: ChartState;

    constructor(props) {
        super(props);
        this.currentChartState = ChartState.getChartState(this.props.chartDisplay);
        this.chartContainerId = "chartContainer-"+ChartContainer.chartContainerIdsRegistered++;
        //console.log("ChartContainer          constructed.",this.info());
    }

    private promptChartAttach(chartState: ChartState) {
        chartState.performAttach(this.chartContainerId);
    }

    private promptChartDetach(chartState: ChartState) {
        chartState.performDetach();
    }

    componentDidMount() {
        //console.log("ChartContainer    componentDidMount.",this.info());
        this.promptChartAttach(this.currentChartState);
    }
    componentDidUpdate() {
        const {chartDisplay} = this.props;
        //console.log("ChartContainer   componentDidUpdate.",this.info());
        if(!chartDisplay) {
            throw new Error("ChartContainer still exists even when the current division has no chart display.");
        } else {
            if(chartDisplay != this.currentChartState.getBoundChartDisplay()) {
                this.promptChartDetach(this.currentChartState);
                this.currentChartState = ChartState.getChartState(this.props.chartDisplay);
            }
            this.promptChartAttach(this.currentChartState);
        }
    }
    componentWillUnmount() {
        //console.log("ChartContainer componentWillUnmount.",this.info());
        this.promptChartDetach(this.currentChartState);
    }

    render() {
        return (
            <div 
                style={{height:"100%",width:"100%",position:'relative',overflow:'hidden'}}
                id={this.chartContainerId}
            />
        );
    }

    /* FOR LOGGING */
    private info() {
        const {chartDisplay} = this.props;
        return "info="+JSON.stringify({
            chartContainerId:this.chartContainerId,
            propsChartDisplayId:(chartDisplay?chartDisplay.id:null),
            currentChartDisplayId:(this.currentChartState?this.currentChartState.getBoundChartDisplay().id:null)
        });
    }
}