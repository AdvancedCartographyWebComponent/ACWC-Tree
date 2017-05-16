import React, { Component } from 'react';
import Tree from './App';


// App component
class App2 extends Component {
  render() {
    //console.log("App 2 tree url search",this.props.location.search.split("&&"));
    var urlList = this.props.location.search.split("&&");
    var urlForTree = [];
    for (var obj in urlList){
      //console.log(urlList[obj]);
      if(urlList[obj].slice(1,4)==="sko") urlForTree.push(urlList[obj]);
    }
    //console.log("urlForTree",urlForTree);
    return <Tree urlQuery={
        urlForTree.length>0?urlForTree[0]:null
      }/>;
  }
}
export default App2;
