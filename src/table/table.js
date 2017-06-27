/* eslint max-len: 0 */
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

class Table extends React.Component {
  constructor(props) {
    super(props);
    //console.log("this.props.data",this.props.data,this.props.data.length);
    //console.log("this.props",this.props);
    this.iconFormatter = this.iconFormatter.bind(this);
  }
  iconFormatter(cell){
    console.log("iconFormatter cell",cell);
    let iconString = '';
    cell?cell.map((value,index)=>{
      console.log('map cell value',value);
      iconString = iconString.concat(`<i class='fa fa-${value.icon}' style='color :${value.color};font-size:18px'></i>`);
    }):iconString='No Icons Info in the Data Set!'
    return iconString;
  }
  render() {
    console.log("window.infoKeyForTable",window.infoKeyForTable);
    return (
      <div>
        <BootstrapTable
          data={ this.props.tableData }
          pagination>
          {
            window.infoKeyForTable?(window.infoKeyForTable.map((value,index)=>{
              console.log("value",value,"index",index);
              if(value.key==="markerAndIcons"){
                return (
                  <TableHeaderColumn
                    dataField={value.key}
                    isKey={index===0?true:false}
                    dataSort
                    dataFormat={this.iconFormatter}>
                    {value.displayValue}
                  </TableHeaderColumn>);
              }else{
                return (
                  <TableHeaderColumn
                    dataField={value.key}
                    isKey={index===0?true:false}
                    dataSort>
                    {value.displayValue}
                  </TableHeaderColumn>);
              }
            })):null
          }
        </BootstrapTable>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  tableData : state.tableData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Table)
