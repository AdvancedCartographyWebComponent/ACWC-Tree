import React, { Component } from 'react';
import './leaflet-sidebar.css'
import './info.css'
import { CSSTransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import actions from '../../action/action';
//import * as actions from '../action/action'
import { bindActionCreators } from 'redux';

class Info extends Component {
  constructor(props){
    super(props);
    this.state = {
      isShow : false
    };
    //this.hideSideBar.bind(this);
  }

  componentDidUpdate(prevProps,prevState){

  }

  render(){
    console.log("isShow",this.state.isShow,"this.props.isInfo",this.props.isInfo,"info", this.props.Info);
    var classNameParent = "test";
    if(this.props.isInfo){
      classNameParent = classNameParent.concat(" show");
    }
    return (
      (
        <div className = {classNameParent}>
            <div className="sidebar-content sidebar-right">
                <div className="sidebar-pane" id="home">
                    <h1 className="sidebar-header">
                        Info of POI
                        <span className="sidebar-close"  onClick = {()=>this.props.actions.closeSideBar()}><i className="fa fa-caret-right"></i></span>
                    </h1>
                    {
                      this.props.Info?Object.keys(this.props.Info.properties).map((key, index)=>{
                        return (<p key = {key}>{key+"\t:\t"+this.props.Info.properties[key]}</p>)
                      }):null
                    }
                </div>
            </div>
      </div>):null

      );
  };
}
const mapStateToProps = state => ({
  isInfo:state.isInfo,
  Info:state.Info
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Info)
