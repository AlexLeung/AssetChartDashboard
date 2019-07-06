import React from 'react';
import {Direction,DirectionEnumProvider} from '../enums';
import {Division} from '../ApplicationState';
import { observer } from 'mobx-react';
import {centeredContentContainerStyling} from '../utils';
import {ExitButton} from './ExitButton';
import {draggingWidthChangeState,divisionConfigState} from './ConfigState';
import { computed } from 'mobx';

@observer
export class DivisionConfig extends React.Component<{division: Division, height:number,width:number},{}> {
    static padding = 0;
    static borderStyle = "1px solid black";

    constructor(props) {
        super(props);
        this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);
        this.onMouseDownHandler = this.onMouseDownHandler.bind(this);
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
        this.unclaim = this.unclaim.bind(this);
        this.initiateSplit = this.initiateSplit.bind(this);
    }

    @computed get successfullyClaimedChangeWidthController() {
        return draggingWidthChangeState.targetDivision == this.props.division;
    }

    @computed get ownDivisionOffsetIsChanging() {
        return this.successfullyClaimedChangeWidthController && draggingWidthChangeState.widthChangeInProgress;
    }

    private getBoundingBoxInfo(el:HTMLElement) {
        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { 
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            width: rect.width,
            height: rect.height
        };
    }

    unclaim() {
        draggingWidthChangeState.stopChangingWidthFor(this.props.division);
    }

    onMouseUpHandler(e: React.MouseEvent<HTMLDivElement>) {
        this.unclaim();
        this.testIfShouldMakeClaim(e);
    }

    onMouseMoveHandler(e: React.MouseEvent<HTMLDivElement>) {
        const {division} = this.props;
        if(!division.notSplit) {
            if(this.ownDivisionOffsetIsChanging) {
                this.updateOffset(e);
            } else {
                this.testIfShouldMakeClaim(e);
            }
        }
    }

    testIfShouldMakeClaim(e: React.MouseEvent<HTMLDivElement>) {
        const {division} = this.props;
        const splitHorizontal = division.direction == Direction.Horizontal;
        const ownElement = e.currentTarget;
        const locationAndSize = this.getBoundingBoxInfo(ownElement);
        const percentLocation = (splitHorizontal? locationAndSize.height : locationAndSize.width) * (division.percent/100.0);
        const cursorLocation = splitHorizontal ? (e.clientY - locationAndSize.top) : (e.clientX - locationAndSize.left);
        if(Math.abs(percentLocation - cursorLocation) < 5) {
            draggingWidthChangeState.targetWidthChangeFor(division);
        } else {
            this.unclaim();
        }
    }

    updateOffset(e: React.MouseEvent<HTMLDivElement>) {
        const {division} = this.props;
        const splitHorizontal = division.direction == Direction.Horizontal;
        const ownElement = e.currentTarget;
        const locationAndSize = this.getBoundingBoxInfo(ownElement);
        const containerSize = (splitHorizontal? locationAndSize.height : locationAndSize.width);
        const percentLocation = containerSize * (division.percent/100.0);
        const cursorLocation = splitHorizontal ? (e.clientY - locationAndSize.top) : (e.clientX - locationAndSize.left);
        let newOffset = Math.floor(((cursorLocation - percentLocation)/containerSize)*100);
        const lowerBound = 20;
        const upperBound = 80;
        if(newOffset+division.percent < lowerBound) {
            newOffset = (lowerBound - division.percent)
        } else if(newOffset+division.percent > upperBound) {
            newOffset = (upperBound - division.percent);
        }
        draggingWidthChangeState.setOffset(newOffset);
    }

    onMouseDownHandler(e: React.MouseEvent<HTMLDivElement>) {
        const {division} = this.props;
        if(this.successfullyClaimedChangeWidthController) {
            draggingWidthChangeState.beginWidthChange();
        }
    }

    initiateSplit() {
        draggingWidthChangeState.stopChangingWidthFor(draggingWidthChangeState.targetDivision);
        this.props.division.split();
    }

    private genLinearGradient(direction:string, childDivision: Division) {
        const {division} = this.props;
        const defaultColor = "rgba(0,0,0,0)";
        const colorBehindGradient = (
            divisionConfigState.consideringClosingChild ? ( // We know one of the Xs is being hovered over.
                divisionConfigState.consideringClosingChild.parent == division ? ( // We know that the X being hovered over is a child of the current division.
                    divisionConfigState.consideringClosingChild == childDivision ? 'rgba(255,0,0,.6)' : 'rgba(0,0,255,.6)'
                )
                :
                defaultColor // Assume that if some x is being hovered over, then no division line could be hovered over.
            )
            :
            this.successfullyClaimedChangeWidthController ? 'rgb(230,230,230)'
            :
            defaultColor
        );
        return (this.successfullyClaimedChangeWidthController ? `linear-gradient(to ${direction}, ${draggingWidthChangeState.widthChangeInProgress?"#888":"#bbb"} 0, ${colorBehindGradient} 7px, ${colorBehindGradient} 100%)` : colorBehindGradient);
    }

    render() {
        const {division, height, width} = this.props;
        
        const percentWidth = division.percent + (this.ownDivisionOffsetIsChanging ? draggingWidthChangeState.offset : 0);
        const firstChildStyle: React.CSSProperties = division.direction == Direction.Horizontal ?
            {
                height: `${percentWidth}%`,
                width: "100%",
                display: "block",
                borderBottom: DivisionConfig.borderStyle,
                background: this.genLinearGradient("top", division.first)
            }
            :
            {
                height: "100%",
                width: `${percentWidth}%`,
                display: "inline-block",
                borderRight: DivisionConfig.borderStyle,
                background: this.genLinearGradient("left", division.first)
            };
        const secondChildStyle: React.CSSProperties = division.direction == Direction.Horizontal ?
            {
                height: `${100-percentWidth}%`,
                width: "100%",
                display: "block",
                borderTop: DivisionConfig.borderStyle,
                background: this.genLinearGradient("bottom", division.second)
            }
            :
            {
                height: "100%",
                width: `${100-percentWidth}%`,
                display: "inline-block",
                borderLeft: DivisionConfig.borderStyle,
                background: this.genLinearGradient("right", division.second)
            };
        return (
            <div style={{height:height+"%",width:width+"%",boxSizing:'border-box',padding:DivisionConfig.padding,position:"relative"}} onMouseMove={this.onMouseMoveHandler} onMouseUp={this.unclaim} onMouseDown={this.onMouseDownHandler} onMouseLeave={this.unclaim}>
                {division.notSplit?
                    <div style={{height:"100%",width:"100%",...centeredContentContainerStyling}}>
                        {division.parent && <ExitButton divisionToClose={division} />}
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                    Current Symbol: <input type="text" value={division.currentChartDisplay?division.currentChartDisplay.tradingViewSymbol:""} onChange={(e)=>division.currentChartDisplay.updateSymbol(e.target.value)}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <select onChange={(e)=>division.changeDirection(Number(e.target.value))} value={division.direction}>
                                            {DirectionEnumProvider.keys.map(k =>
                                                <option value={k} key={k}>{DirectionEnumProvider.getFromKey(k)}</option>
                                            )}
                                        </select>
                                        <input type="button" value="Split" onClick={this.initiateSplit} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    :
                    <div  style={{height:"100%",width:"100%"}}>
                        <div style={{verticalAlign:'top',boxSizing:'border-box',...firstChildStyle}}>
                            <DivisionConfig division={division.first} width={100} height={100}/>
                        </div>
                        <div style={{verticalAlign:'top',boxSizing:'border-box',...secondChildStyle}}>
                            <DivisionConfig division={division.second} width={100} height={100}/>
                        </div>
                    </div>
                }
            </div>
        );
    }
}