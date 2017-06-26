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
      return <Panel header={<span>Admin</span>}><Table/></Panel>;
    }else {
      //console.log("render nothing");
      return null;
    }
  }
}
const mapStateToProps = state => ({
  isTable : state.isTable,
  tableData : state.tableData
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
