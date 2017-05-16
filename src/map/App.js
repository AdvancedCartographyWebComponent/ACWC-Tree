import React, { Component } from 'react';
import Map from './Map';


// App component
class App extends Component {
  render() {
    var urlList = this.props.location.search.split("&&");
    var urlForMap = [];
    for (var obj in urlList){
      //console.log(urlList[obj]);
      if(urlList[obj].slice(1,4)==="geo"||urlList[obj].slice(1,4)==="sql") urlForMap.push(urlList[obj]);
    }
    return <Map isServer={this.props.isServer} urlQuery={urlForMap.length>0?urlForMap[0]:null}/>;
  }
}
export default App;
