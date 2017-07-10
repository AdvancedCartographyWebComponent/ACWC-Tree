import React, { Component } from 'react';
import Table from './table';
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
import {
  Panel
}from 'react-bootstrap'

// App component
class App extends Component {
  render() {
    //console.log("this.props.isTable",this.props.isTable,this.props.tableData);
    if(this.props.isTable){
      console.log("this.props.isTable",this.props.tableType);
      if(this.props.tableType==="1"){
        document.getElementById('table').style.top=null;
        document.getElementById('table').style.bottom="29px";
        document.getElementById('carte').style.display="inline-block";
      }else {
        document.getElementById('table').style.bottom=null;
        document.getElementById('table').style.top="10px";
        document.getElementById('carte').style.display="none";
      }
      return <Table isExit={this.props.tableType==="2"?true:false} actions = {this.props.actions}/>;
    }else {
      if(this.props.tableType===1){
      }else {
        document.getElementById('carte').style.display="inline-block";
      }
      return null;
    }
  }
}
const mapStateToProps = state => ({
  isTable : state.isTable,
  tableData : state.tableData,
  tableType : state.tableType
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
