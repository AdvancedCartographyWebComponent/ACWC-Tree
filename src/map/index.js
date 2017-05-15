import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import './index.css'; // postCSS import of CSS module
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import Reducer from '../reducer/reducer'
const Provider=require('react-redux').Provider;
const createStore=require('redux').createStore;
var store=createStore(Reducer);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route component={(props) => <App isServer={'false'} {...props}/>}/>
    </Router>
  </Provider>,
  document.getElementById('root')
);
