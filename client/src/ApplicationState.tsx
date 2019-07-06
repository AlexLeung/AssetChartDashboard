import {Direction} from './enums';
import {observable,computed,useStrict,action} from 'mobx';
import {ServerSynced} from './ServerSynchronization';
useStrict(true);

export class ChartDisplay {

    private static registeredIds = 0;

    @observable markedForDeletion: boolean = false;
    @observable tradingViewSymbol: string = "";
    private _id;
    get id() { return this._id; }

    constructor() {
        this._id = ChartDisplay.registeredIds++;
    }

    @ServerSynced @action updateSymbol(symbol) {
        if(symbol != this.tradingViewSymbol) {
            this.tradingViewSymbol = symbol;
        }
    }
}

export class Division {
    @observable direction: Direction = Direction.Vertical;
    @observable percent: number = 50;
    @observable first: Division = null;
    @observable second: Division = null;
    @observable currentChartDisplay: ChartDisplay;
    @observable parent: Division;

    @computed get sibling() {
        if(!this.parent) throw new Error("Tying to get sibling when there is no parent");
        return this.parent.first == this ? this.parent.second : this.parent.first;
    }
    
    constructor(parent: Division, chartDisplay: ChartDisplay) {
        this.parent = parent;
        this.currentChartDisplay = chartDisplay;
    }

    @computed get notSplit() {
        return this.second == null && this.first == null;
    }

    @ServerSynced @action changeDirection(direction: Direction) {
        if(direction==Direction.Horizontal) this.direction=Direction.Horizontal;
        else this.direction=Direction.Vertical;
    }

    @ServerSynced @action split() {
        this.first = new Division(this, this.currentChartDisplay);
        this.currentChartDisplay = null;
        this.second = new Division(this, new ChartDisplay());
    }

    @ServerSynced @action unsplit(divisionToDestroy: Division) {
        const divisionToInherit = divisionToDestroy.sibling;
        this.currentChartDisplay = divisionToInherit.currentChartDisplay;
        this.direction = divisionToInherit.direction;
        this.percent = divisionToInherit.percent;
        this.first = divisionToInherit.first;
        if(this.first) this.first.parent = this;
        this.second = divisionToInherit.second;
        if(this.second) this.second.parent = this;
        divisionToDestroy.destroy();
    }

    @ServerSynced @action setPercent(newPercent) {
        this.percent = newPercent;
    }

    private destroy() {
        if(!this.notSplit) throw new Error("logically a division being destroyed should not be split.");
        this.currentChartDisplay.markedForDeletion = true;
        this.currentChartDisplay = null;
        this.parent = null;
    }
}

class ApplicationState {
  @observable topLevelDivision: Division = new Division(null, new ChartDisplay());
}
export const applicationState = new ApplicationState();