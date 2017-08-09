import React, { Component } from 'react';
import './leaflet-sidebar.css'
import './info.css'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';

import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
class Info extends Component {
  constructor(props){
    super(props);
    this.formatDataForTable = this.formatDataForTable.bind(this);
  }
  formatDataForTable(){
    let tableData = [];
    console.log(this.props.infoKeyForPanel);
    if(this.props.infoKeyForPanel,this.props.Info){
      this.props.infoKeyForPanel.map((value,index)=>{
        if (value.key==="Address") {
          let addressString = this.props.Info.properties[value.key];
          let addressSplit = addressString?addressString.split(','):[];
          let addressFormatted = "";
          for (var i = 0; i < addressSplit.length; i++) {
            addressFormatted=addressFormatted.concat(addressSplit[i],'\r\n');
          }
          let template = {
            "attributes":value.displayValue,
            "value":addressFormatted
          };
          tableData.push(template);
        }else {
          let template = {
            "attributes":value.displayValue,
            "value":this.props.Info.properties[value.key]
          };
          tableData.push(template);
        }
      })
    }
    return tableData;
  }
  render(){
    const overStyle={
    	"border": "1px solid gainsboro"
    }
    const leftStyle={
    	"border-right": "1px solid gainsboro"
    }
    var classNameParent = "test";
    if(this.props.isInfo){
      classNameParent = classNameParent.concat(" show");
      document.getElementById('sidebar').style.zIndex=1;
    }else{
      document.getElementById('carte').style.width="74%";
      document.getElementById('sidebar').style.zIndex=-1;
    }
    let data = this.formatDataForTable();
    return (
      (
        <div className={classNameParent}>
            <div className="sidebar-content sidebar-right">
                <div className="sidebar-pane" id="home">
                    <h1 className="sidebar-header">
                        Info
                        <span className="sidebar-close"  onClick={()=>this.props.actions.closeSideBar()}><i className="fa fa-caret-right"></i></span>
                    </h1>
                    <div className="row">
                      <BootstrapTable
                        data={ data }
                        ref='table'>
                        <TableHeaderColumn
                          dataField="attributes"
                          isKey
                          dataSort
                          width="70px">
                          Attributes
                        </TableHeaderColumn>
                        <TableHeaderColumn
                          dataField="value"
                          dataSort
                          tdStyle={ { whiteSpace: 'pre-line' } }
                          width="120px">
                          Value
                        </TableHeaderColumn>
                      </BootstrapTable>
                    </div>
                </div>
            </div>
      </div>)

      );
  };
}
const mapStateToProps = state => ({
  isInfo:state.isInfo,
  Info:state.Info,
  mapRef : state.mapRef
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Info)
