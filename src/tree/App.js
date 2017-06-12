var React = require('react'),
  TreeMenu = require('../../tree'),
  Immutable = require('immutable'),
  _ = require('lodash');
var ReactRedux = require('react-redux');
var actions = require('../../action/action');
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import 'font-awesome/css/font-awesome.min.css'
import { Scrollbars } from 'react-custom-scrollbars';
import md5 from 'MD5';
var isQuery = false;
var App = React.createClass({
  getInitialState: function() {
    return {
    };
  },
  componentDidUpdate: function(prevProps, prevState){
    this.props.urlQuery&&md5(JSON.stringify(this.props.urlQuery))!=md5(JSON.stringify(prevProps.urlQuery))?this._getUrlData(this.props.urlQuery):null;
  },
  render: function() {
    if(!this.props.urlQuery&&!isQuery){
      this.props.actions.useDefaultTreeData();
      isQuery = true;
    }
    var dynamicExample = this._getExamplePanel(this._getDynamicTreeExample());
    return <div className="container">
      <div className="input-group margin-bottom-sm">
        <span className="fa fa-search"></span>
        <input className="global-search" type="text" placeholder="Search" onChange={(e)=>this.props.actions.globalSearch(e.target.value)}/>
      </div>
      <div className="row">
        <div className="col-lg-3">
          <Scrollbars style={{ width: "100%", height: "90vh" }}>{dynamicExample}</Scrollbars>

        </div>
      </div>


    </div>;

  },
  _getLastActionNode: function () {

    var lastActionNode = <div className="text-center alert alert-success tree-event-alert">{"Waiting for interaction"}</div>;


    var action = this.props.lastChange;
    if (action) {
      lastActionNode = (
        <div className="text-center alert alert-success tree-event-alert" key={"lastAction_" + "_" + action.time}>
          <h3>Event Received:</h3>
          <div><strong>{action.event}</strong></div>
          <h3><code>{"<TreeNode/>"}</code> Affected: </h3>
          <div><strong>{action.node}</strong></div>
        </div>);
    } else {

    }

    return lastActionNode;

  },

  _getUrlData: function(url){
    var cur = this;
    console.log("Tree _getUrlData",url.slice(5));
    this.geoCollection = {
      "type": "FeatureCollection",
      "features": []
    };
    if(1){
      axios({
      method: 'get',
      url: url.slice(5),
      headers: {
          'Accept': 'application/ld+json, application/json',
          'Content-Type': 'application/ld+json, application/json'
      }
    }).then(function(res) {
        isQuery=true;
        cur.props.actions.getDataFromUrlForTree(res.data);
    });}
  },


  _getDynamicTreeExample: function () {

    return _.size(this.props.treeData)>0?
    (
      <TreeMenu
        expandIconClass="fa fa-angle-double-right"
        collapseIconClass="fa fa-angle-double-down"
        onTreeNodeClick={this._setLastActionState.bind(this, "clicked")}
        onTreeNodeCollapseChange={this._handleDynamicObjectTreeNodePropChange.bind(this,"collapsed")}
        onTreeNodeCheckChange={this._handleDynamicObjectTreeNodePropChange.bind(this,"checked")}
        data={this.props.treeData} />
    ):
    (<div><i className="fa fa-circle-o-notch fa-spin fa-fw"></i>Loading...</div>);


  },



  _getExamplePanel: function (treeMenuNode) {
    return <div>
      <div className="panel-thesaurus">
        <div className="panel-body">
          {treeMenuNode}
        </div>
      </div>
    </div>;
  },


  _handleDynamicObjectTreeNodePropChange: function (propName, lineage) {

    this._setLastActionState(propName, lineage);

    function getNodePath(nodeKey) {
      console.log("nodeKey",nodeKey);
      if (nodeKey.length === 1) return nodeKey;
      return _(nodeKey).zip(nodeKey.map(function () {
        return "children";
      })).flatten().initial().value();

    }
    function getSiblingNodePath(nodeKey) {
      if (nodeKey.length === 1) return [];
      return _(nodeKey).zip(nodeKey.map(function () {
        return "children";
      })).flatten().initial().initial().initial().value();

    }
    var oldState = Immutable.fromJS(this.props.treeData);
    var nodePath = getNodePath(lineage),
      nodeSiblingPath = getSiblingNodePath(lineage),
      keyPaths = [nodePath.concat([propName])],
      keySiblingPaths = [nodeSiblingPath.concat([propName])];

    function addChildKeys(state, parentPath) {

      var childrenPath = parentPath.concat('children'),
        children = state.getIn(childrenPath);

      //console.log({children});
      if (!children || children.size === 0) return;

      children.map(function (value, key) {
        keyPaths.push(childrenPath.concat([key, propName]))
        addChildKeys(state, childrenPath.concat([key]));
      });
    }


    //Build a list of key paths for all siblings
    function findSiblingKeys(state, parentPath) {

      var siblingPath = parentPath.concat('children'),
        sibling = state.getIn(siblingPath);
      //console.log({sibling});
      if(!sibling) return;
      sibling.map(function (value, key) {
        keySiblingPaths.push(siblingPath.concat([key, propName]))
      });
    }

    //get new keySiblingPaths
    //keySiblingPaths[0] is parent node
    if(propName!=="collapsed") findSiblingKeys(oldState,nodeSiblingPath);

    //get new keyPaths
    //keyPaths[0] is the parent node and change all the children nodes with the parent's value
    if(propName!=="collapsed") addChildKeys(oldState, nodePath);

    function getParentPropState(keySiblingPaths){
      var state = !oldState.getIn(keyPaths[0]);
      keySiblingPaths.forEach((val,index)=>{
        if(index >0&&val[val.length-2]!== keyPaths[0][keyPaths[0].length-2]) {
          //console.log(oldState.getIn(keyPaths[0]));
          state = state && oldState.getIn(val);

        }
      });
      return state;

    }
    //Get the new prop state
    var newPropState = !oldState.getIn(keyPaths[0]);
    //Get the new prop state for parent's node
    var newParentPropState = getParentPropState(keySiblingPaths);

    //Now create a new map w/ all the changes
    var newState = oldState.withMutations(function(state) {
      keyPaths.forEach(function (keyPath) {
        state.setIn(keyPath, newPropState);
      });
      if(keySiblingPaths.length>1){state.setIn(keySiblingPaths[0], newParentPropState);}
    });

    newState.toJS();
    console.log("newState",newState.toJS());
    this.props.actions.updateTreeData(newState.toJS());

  },

  _setLastActionState: function (action, node) {

    var toggleEvents = ["collapsed", "checked", "selected"];

    if (toggleEvents.indexOf(action) >= 0) {
      action += "Changed";
    }

    var mutation = {
      event: action,
      node: node.join(" > "),
      time: new Date().getTime()
    };
    this.props.actions.setLastChangeState(mutation);
  }
});

const mapStateToProps = state => ({
  treeData:state.treeData,
  lastChange:state.lastChange,
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
module.exports = withRouter(ReactRedux.connect(
mapStateToProps,mapDispatchToProps
)(App));
