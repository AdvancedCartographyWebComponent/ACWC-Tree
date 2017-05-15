import React, { Component } from 'react';
import Map from './Map';


// App component
class App extends Component {
  render() {
    console.log("app url search",this.props);
    return <Map isServer={this.props.isServer} urlQuery={(this.props.location.search.slice(1,4)==="map")?this.props.location.search:null}/>;
  }
}
export default App;
