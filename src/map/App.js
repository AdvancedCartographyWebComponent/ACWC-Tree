import React, { Component } from 'react';
import Map from './Map';
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';

// App component
class App extends Component {
  render() {
    var urlList = this.props.location.search.split("&&");
    console.log("urls",this.props.location);
    var urlForMap = [];
    for (var obj in urlList){
      //console.log(urlList[obj]);
      if(urlList[obj].slice(1,5)=="view") {
        var isTrajetFromUrl=urlList[obj].slice(6);
        console.log("isTrajetFromUrl",isTrajetFromUrl);
        switch (isTrajetFromUrl) {
          case "points":
            this.props.actions.isTrajet(false);
            break;
          case "points":
            this.props.actions.isTrajet(true);
            break;
          default:
            this.props.actions.isTrajet(true);
        }
      }
      if(urlList[obj].slice(1,4)=="geo"||urlList[obj].slice(1,4)=="sql") urlForMap.push(urlList[obj]);
    }
    return <Map isServer={this.props.isServer} urlQuery={urlForMap.length>0?urlForMap[0]:null}/>;
  }
}
const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
