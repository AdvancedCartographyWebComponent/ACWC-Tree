/* eslint max-len: 0 */
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
const activeStatus = [
  {
  value: '0',
  text: 'Y'
  },
  {
  value: '1',
  text: 'N'
  }
];
class ParentTable extends React.Component{
  constructor(props){
    super(props);
    this.createCustomButtonGroup = this.createCustomButtonGroup.bind(this);
    this.expandComponent = this.expandComponent.bind(this);
  }
  groupDataFormatter(data){
    let GroupData = [];
    let GroupList = [];
    console.log("groupDataFormatter",data);
    data.map((value,key)=>{
      if(GroupList.indexOf(value["Group"])===-1){
        GroupList.push(value["Group"]);
        GroupData.push({
          Group : value["Group"],
          Scooters : [value]
        });
      }else{
        GroupData[GroupList.indexOf(value["Group"])]["Scooters"].push(value);
      }
    })
    return GroupData;
  }
  createCustomButtonGroup = props => {
    const style = {
      left:"65%"
    };
    if(this.props.isExit){
      return (
        <ButtonGroup style={style} sizeClass='btn-group-md'>
          <button type='button'
            className={ `btn btn-primary` }
            onClick={()=>this.props.actions.toggleTable(false,"2")}>
            Back to Map
          </button>
        </ButtonGroup>
      );
    }else {
      return null;
    }

  }
  isExpandableRow(row) {
    return true;
  }
  expandComponent(row) {
    let cur = this;
    return (
      <Table tableData={row.Scooters} infoKeyForTable={cur.props.infoKeyForTable}/>
    );
  }
  expandColumnComponent({ isExpandableRow, isExpanded }) {
    let content = '';

    if (isExpandableRow) {
      content = (isExpanded ? '(-)' : '(+)' );
    } else {
      content = ' ';
    }
    return (
      <div> { content } </div>
    );
  }
  render(){
    //console.log('tableData',this.props.tableData);
    let groupData = this.groupDataFormatter(this.props.tableData);
    //console.log('groupData',groupData);
    const options = {
      page: 1,  // which page you want to show as default
      sizePerPageList: this.props.isExit?[ {
        text: '15 Record Per Page', value: 15
      },{
        text: 'All', value: this.props.tableData.length
      }]:[ {
        text: '5 Record Per Page', value: 5
      },{
        text: 'All', value: this.props.tableData.length
      }], // you can change the dropdown list for size per page
      sizePerPage: this.props.isExit?15:5,  // which size per page you want to locate as default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 5,  // the pagination bar size.
      prePage: '<', // Previous page button text
      nextPage: '>', // Next page button text
      firstPage: '<<', // First page button text
      lastPage: '>>', // Last page button text
      prePageTitle: 'Previous', // Previous page button title
      nextPageTitle: 'Next', // Next page button title
      firstPageTitle: 'First', // First page button title
      lastPageTitle: 'Last', // Last page button title
      paginationPosition: 'bottom',  // default is bottom, top and both is all available
      btnGroup: this.createCustomButtonGroup
    }
    return(
      <BootstrapTable
        data={ groupData }
        maxHeight={this.props.isExit?"645px":"300px"}
        options = {options}
        headerStyle = { { "background-color" : "rgb(142, 194, 231)" } }
        bodyStyle={ { background: 'rgb(152, 216, 178)' } }
        expandableRow={ this.isExpandableRow }
        expandComponent = {this.expandComponent}
        expandColumnOptions={ {
          expandColumnVisible: true,
          expandColumnComponent: this.expandColumnComponent,
          columnWidth: 50
        } }>
        <TableHeaderColumn
          dataField="Group"
          isKey
          filter={ { type: 'TextFilter', placeholder: 'Please enter a value' } }
          dataSort>
          Group
        </TableHeaderColumn>
      </BootstrapTable>);
  }
}
class Table extends React.Component {
  constructor(props) {
    super(props);
    ////console.log("this.props.data",this.props.data,this.props.data.length);
    ////console.log("this.props",this.props);
    this.handleGestionButtonClick = this.handleGestionButtonClick.bind(this);
    this.iconFormatter = this.iconFormatter.bind(this);
    this.ActionFormatter = this.ActionFormatter.bind(this);
  }
  handleGestionButtonClick(event,args,row){
    ////console.log("gestion click",event.target.value,args);
    if(args==="Activer"){
      //console.log("Activer Scooter"," row data",row);
    }
    else if(args==="Blocker"){
      //console.log("Blocker Scooter"," row data",row);
    }
  }
  iconFormatter(cell){
    ////console.log("iconFormatter cell",cell);
    let iconString = '';
    cell?cell.map((value,index)=>{
      ////console.log('map cell value',value);
      value.icon==="number"?null:iconString = iconString.concat(`<i class='fa fa-${value.icon}' style='color :${value.color};font-size:18px'></i>`);
    }):iconString='No Icons Info in the Data Set!'
    return iconString;
  }
  ActionFormatter(cell,row,formatExtraData,rowIdx){
    if(cell==='0'){
      return (
        <button className='btn btn-sm btn-success btn-block' onClick = {(e)=>this.handleGestionButtonClick(e,"Activer",row)}>Activer</button>
      );
    }else {
      return (
        <button className='btn btn-sm btn-danger btn-block' onClick = {(e)=>this.handleGestionButtonClick(e,"Blocker",row)}>Blocker</button>
      );
    }
  }
  render() {
    //console.log("render table",this.props.infoKeyForTable);
    //console.log("table data",this.props.tableData);
    return (
      <div>
        <BootstrapTable
          data={ this.props.tableData }
          search
          >
          {
            this.props.infoKeyForTable?this.props.infoKeyForTable.map((value,index)=>{
              ////console.log("value",value,"index",index);
              if(value.key==="markerAndIcons"){
                return (
                  <TableHeaderColumn
                    dataField={value.key}
                    isKey={index===0?true:false}
                    dataSort
                    dataFormat={this.iconFormatter}
                    thStyle = { { "background-color" : "rgb(188, 173, 230)" } }
                    tdStyle = { { "background-color" : "#f7d099" } }
                    ref = {value.key}>
                    {value.displayValue}
                  </TableHeaderColumn>);
              }else if (value.key==="ActiveList") {
                return (
                  <TableHeaderColumn
                    dataField={value.key}
                    isKey={index===0?true:false}
                    dataSort
                    dataFormat={this.ActionFormatter}
                    thStyle = { { "background-color" : "rgb(188, 173, 230)" } }
                    tdStyle = { { "background-color" : "#f7d099" } }
                    ref = {value.key}>
                    {value.displayValue}
                  </TableHeaderColumn>);
              }
              else{
                return (
                  <TableHeaderColumn
                    dataField={value.key}
                    isKey={index===0?true:false}
                    filter={ { type: 'TextFilter', placeholder: 'Please enter a value' } }
                    dataSort
                    width={value.config?(value.config.width?value.config.width:"100px"):"100px"}
                    thStyle = { { "background-color" : "rgb(188, 173, 230)" } }
                    tdStyle = { { "background-color" : "#f7d099" } }
                    ref = {value.key}
                    hidden={value.config?(value.config.hidden?value.config.hidden:false):false}>
                    {value.displayValue}
                  </TableHeaderColumn>);
              }
            })
            :null
          }

        </BootstrapTable>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  tableData : state.tableData,
  mapRef : state.mapRef
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ParentTable)
