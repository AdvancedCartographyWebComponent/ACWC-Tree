import React, { Component } from 'react';
import Tree from './App';
import md5 from 'MD5';


// App component
class App2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeUrl : null
    };
  }
  componentDidMount() {
    window.treeUrl = null;
    this.checkDataSource = setInterval(
      () => {
        //console.log("window.testValue",window.testValue);
        if(window.treeUrl&&(!this.state.treeUrl||md5(JSON.stringify(window.treeUrl))!=md5(JSON.stringify(this.state.treeUrl)))){
          console.log("differ");
          this.setState({treeUrl : window.treeUrl});
          //this.getDataFromUrl(window.treeUrl);
        }
      },
      100
    );
  }
  render() {
    //console.log("App 2 tree url search",this.props.location.search.split("&&"));
    var urlList = this.props.location.search.split("&&");
    var urlForTree = [];
    for (var obj in urlList){
      //console.log(urlList[obj]);
      if(urlList[obj].slice(1,4)==="sko") urlForTree.push(urlList[obj]);
    }
    //console.log("urlForTree",urlForTree);
    var url = urlForTree.length>0?urlForTree[0]:window.treeUrl?window.treeUrl:null;
    console.log("tree url",url);
    return <Tree urlQuery={url}/>;
  }
}
export default App2;
