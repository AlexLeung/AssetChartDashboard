import {observable, action} from 'mobx';
import {Division} from '../ApplicationState';
import {Direction} from '../enums';

class DraggingWidthChangeState {
    @observable targetDivision: Division = null;
    @observable widthChangeInProgress: boolean = false;
    @observable offset: number = 0;

    @action stopChangingWidthFor(division: Division) {
        if(this.targetDivision == division) {
            this.targetDivision = null;
            if(division) {
                division.setPercent(division.percent + this.offset);
                this.setOffset(0);
            }
            this.widthChangeInProgress = false;
            document.body.style.cursor = "";
        }
    }

    @action targetWidthChangeFor(division: Division) {
        if(!this.targetDivision) {
            this.targetDivision = division;
            document.body.style.cursor = division.direction == Direction.Horizontal ? "n-resize" : "e-resize";
        }
    }

    @action beginWidthChange() {
        this.widthChangeInProgress = true;
    }

    @action setOffset(offset) {
        this.offset = offset;
    }
}
export const draggingWidthChangeState = new DraggingWidthChangeState();

class DivisionConfigState {
    @observable consideringClosingChild: Division = null;
    @action setConsideringClosingChild(childToClose: Division) {
        this.consideringClosingChild = childToClose;
        document.body.style.cursor = childToClose ? 'pointer' : '';
    }
}
export const divisionConfigState = new DivisionConfigState();