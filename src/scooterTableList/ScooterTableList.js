import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
class ScooterTableList extends React.Component{
  constructor(props){
    super(props);
    this.selectedRowKeys = [];
    this.handleSelectClick = this.handleSelectClick.bind(this);
    this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
  }
  handleSelectClick(row, isSelected, e){
    if(isSelected){
      if(this.selectedRowKeys.indexOf(row["name"])===-1){
        this.selectedRowKeys.push(row["name"]);
      }
    }else{
      if(this.selectedRowKeys.indexOf(row["name"])!==-1){
        this.selectedRowKeys.splice(this.selectedRowKeys.indexOf(row["name"]), 1);
      }
    }
    console.log("this.selectedRowKeys",this.selectedRowKeys);
    this.props.actions.sendCheckedList(this.selectedRowKeys);
  }
  handleSelectAllClick(isSelected, rows){
    this.selectedRowKeys = [];
    if (isSelected) {
      for (var i = 0; i < rows.length; i++) {
        this.selectedRowKeys.push(rows[i]["name"]);
      }
    }
    console.log("this.selectedRowKeys",this.selectedRowKeys);
    this.props.actions.sendCheckedList(this.selectedRowKeys);
  }
  render(){
    const selectRow = {
      mode: 'checkbox',  // multi select
      bgColor: '#a5a5de',
      onSelect : this.handleSelectClick,
      onSelectAll:this.handleSelectAllClick
    };
    const tableHeight = window.screen.height;
    return(<BootstrapTable
            data={ this.props.scooterTableList }
            selectRow = {selectRow}
            headerStyle = { { "background-color" : "rgb(142, 194, 231)" } }
            height = {tableHeight*0.80}
            ref='table'>
              <TableHeaderColumn
                dataField="name"
                isKey
                dataSort
                width="70px"
                >
                Name
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="status"
                dataSort
                width="70px">
                Status
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="updateTime"
                dataSort
                width="120px">
                UpdateTime
              </TableHeaderColumn>
            </BootstrapTable>

    );
  }
}
const mapStateToProps = state => ({
  scooterTableList : state.scooterTableList,
  mapRef : state.mapRef
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScooterTableList)
