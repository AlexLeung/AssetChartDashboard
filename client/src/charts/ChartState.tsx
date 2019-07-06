import React from 'react';
import {ChartDisplay} from '../ApplicationState';
import invert from 'invert-color';
import {renderToStaticMarkup} from 'react-dom/server';
import {centeredContentContainerStyling} from '../utils';
import { autorun, computed, observable } from 'mobx';

export class ChartState {
    private static knownChartDisplays: {[key: string]: ChartState} = {}; // Maps ChartDisplay ids to ChartState.
    public static getChartState(displayRef: ChartDisplay): ChartState {
        if(!ChartState.knownChartDisplays[displayRef.id]) {
            const chartState = new ChartState(displayRef);
            ChartState.knownChartDisplays[displayRef.id] = chartState;
            return chartState;
        } else {
            return ChartState.knownChartDisplays[displayRef.id];
        }
    }

    private static boundChartStates: {[key: string]: ChartState} = {}; //  Maps ChartContainer div ids to ChartState.

    @observable private currentSymbolLoaded = "";
    @computed get loading() {
        return this.currentSymbolLoaded != this.chartDisplay.tradingViewSymbol;
    }
    private chartDisplay: ChartDisplay;
    getBoundChartDisplay() { return this.chartDisplay; }
    private idToRenderTradingView:string;
    private boundDisplayId:string = "";

    private ContainerNode:HTMLElement;
    private LoadingNode:HTMLElement;
    private NoChartChosenNode:HTMLElement;
    private LocationToRenderTradingView:HTMLElement;
    private constructor(boundData: ChartDisplay) {
        this.chartDisplay = boundData;
        this.idToRenderTradingView = "chart-"+this.chartDisplay.id;

        const [backgroundColor, fontColor] = this.genColors();

        const DisplayContainer = (
            <div style={{height:"100%",width:"100%",backgroundColor,...centeredContentContainerStyling}}>
                <div style={{fontSize:24,color:fontColor,textAlign:'center',display:"none"}}>
                    {"Loading..."}
                </div>
                <div style={{fontSize:24,color:fontColor,textAlign:'center',display:"none"}}>
                    {"No Chart Chosen"}
                </div>
                <div style={{height:"100%",width:"100%"}} id={this.idToRenderTradingView}/>
            </div>
        );
        this.ContainerNode = this.generateDOMElement(DisplayContainer) as HTMLElement;
        this.LoadingNode = this.ContainerNode.children[0] as HTMLElement;
        this.NoChartChosenNode = this.ContainerNode.children[1] as HTMLElement;
        this.LocationToRenderTradingView = this.ContainerNode.children[2] as HTMLElement;
        //console.log("    constructor   end.",this.info());
        autorun(() => {
            //console.log("        autorun start.",this.info());
            // set all to hidden.
            this.LoadingNode.style.display = "none";
            this.NoChartChosenNode.style.display = "none";
            this.LocationToRenderTradingView.style.display = "none";
            if(!this.chartDisplay.tradingViewSymbol) {
                this.NoChartChosenNode.style.display = "block";
            } else if(this.loading) {
                this.LoadingNode.style.display = "block";
            } else {
                this.LocationToRenderTradingView.style.display = "block";
            }
            //console.log("        autorun   end.",this.info());
        });
    }

    // Random background and foreground colors.
    private genColors() {
        function genColorWithinRange() { return Math.floor(Math.random()*256); }
        const rgb: [number, number, number] = [0,0,0];
        for(let i = 0; i < 3; ++i) {
            rgb[i] = genColorWithinRange();
        }
        const backgroundColor = "rgb("+rgb.join(",")+")";
        const fontColor = invert(rgb, true);
        return [backgroundColor, fontColor];
    }

    private generateDOMElement(description: JSX.Element):Element {
        const htmlString = renderToStaticMarkup(description);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlString;
        return wrapper.firstElementChild;
    }

    performDeletion() {
        //console.log("performDeletion start.",this.info());
        this.chartDisplay = null;
        this.ContainerNode = null;
        this.LoadingNode = null;
        this.NoChartChosenNode = null;
        this.LocationToRenderTradingView = null;
        //console.log("performDeletion   end.",this.info());
    }
  
    performDetach() {
        //console.log("  performDetach start.",this.info());
        if(this.boundDisplayId) {
            document.getElementById(this.boundDisplayId).removeChild(this.ContainerNode);
            delete ChartState.boundChartStates[this.boundDisplayId];
            this.boundDisplayId = "";
        } else {
            throw new Error("Trying to detach when there is nothing to detach from");
        }
        if(this.chartDisplay.markedForDeletion) {
            this.performDeletion();
        }
        //console.log("  performDetach   end.",this.info());
    }
  
    performAttach(newParentId:string) {
        //console.log("  performAttach start. newParentId="+newParentId,this.info());
        if(this.boundDisplayId) throw new Error("Trying to attach when already bound to existing parent");
        if(!newParentId) throw new Error("Trying to attach to a parent without an id.");
        if(ChartState.boundChartStates[newParentId]) {
            const existingChartState = ChartState.boundChartStates[newParentId];
            throw new Error(
                "There already exists a chart state "
                +existingChartState.chartDisplay.id + " bound to parent " + newParentId
            );
        }
        document.getElementById(newParentId).appendChild(this.ContainerNode);
        this.boundDisplayId = newParentId;
        //console.log("  performAttach   end. newParentId="+newParentId,this.info());
    }

    /* FOR LOGGING */
    private info():string {
        return "info="+JSON.stringify({
            currentSymbolLoaded: this.currentSymbolLoaded,
            loading: this.loading,
            chartDisplayId: (this.chartDisplay?this.chartDisplay.id:null),
            idToRenderTradingView: this.idToRenderTradingView,
            boundDisplayId: this.boundDisplayId
        });
    }
};