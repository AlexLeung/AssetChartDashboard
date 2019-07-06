import React from 'react';
import {Division} from '../ApplicationState';
import { observer } from 'mobx-react';
import {unselectableText} from '../utils';
import {divisionConfigState,draggingWidthChangeState} from './ConfigState';


@observer
export class ExitButton extends React.Component<{divisionToClose: Division},{}> {
    constructor(props) {
        super(props);
        this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);
        this.onMouseOutHandler = this.onMouseOutHandler.bind(this);
        this.unsplit = this.unsplit.bind(this);
    }

    onMouseMoveHandler(e){
        divisionConfigState.setConsideringClosingChild(this.props.divisionToClose);
    }
    onMouseOutHandler(e){
        divisionConfigState.setConsideringClosingChild(null);
    }

    unsplit() {
        draggingWidthChangeState.stopChangingWidthFor(draggingWidthChangeState.targetDivision);
        const {divisionToClose} = this.props;
        divisionToClose.parent.unsplit(divisionToClose);
        divisionConfigState.setConsideringClosingChild(null);
    }

    render() {
        
        const style: React.CSSProperties = {position:"absolute",top:5,right:5,height:30,width:30,lineHeight:30+'px',textAlign:'center',color:"white",...unselectableText};
        return (
            <div style={style} onClick={this.unsplit} onMouseMove={this.onMouseMoveHandler} onMouseOut={this.onMouseOutHandler}>
                &#10060;
            </div>
        );
    }
}