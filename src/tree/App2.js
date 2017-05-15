import React, { Component } from 'react';
import Tree from './App';


// App component
class App2 extends Component {
  render() {
    //console.log("tree url search",this.props);
    return <Tree urlQuery={(this.props.location.search.slice(1,4)==="tre")?this.props.location.search:null}/>;
  }
}
export default App2;
