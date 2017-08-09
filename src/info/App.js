import React, { Component } from 'react';
import Info from './Info';

// App component
export default class App extends Component {
  render() {
    var paramsString = [
      {"key":"Name","displayValue":"Scooter Id"},
      {"key":"Date","displayValue":"Date"},
      {"key":"Time","displayValue":"Time"},
      {"key":"Speed","displayValue":"Speed"},
      {"key":"Mileage","displayValue":"Mileage"},
      {"key":"Address","displayValue":"Address"},
      {"key":'Group',"displayValue":"Group"},
      {"key":'Phone',"displayValue":"Phone"},
      {"key":'Status',"displayValue":"Status"},
      {"key":'Speed',"displayValue":"Speed"}
    ];
    //console.log("infoKeyForPanel",infoKeyForPanel);
    return <Info infoKeyForPanel={paramsString}/>;
  }
}
