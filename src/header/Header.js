import React from 'react';
import {
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  ProgressBar,
  Modal
} from 'react-bootstrap';
import Navbar, {Brand} from 'react-bootstrap/lib/Navbar';
import './Header.css'
import axios from 'axios';
import UserProfile from '../UserProfile/UserProfile'
import { connect } from 'react-redux'
import actions from '../../action/action';
import { bindActionCreators } from 'redux';
const logo = require('../imgs/logo_cruisr.png');

class Header extends React.Component {
  constructor(){
    super();
    this.state = {
      logout : false,
      userProfile : false
    }
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleUserProfileClose = this.handleUserProfileClose.bind(this);
    this.handleUserProfileOpen = this.handleUserProfileOpen.bind(this);
  }
  handleUserProfileClose(){
    this.setState({
      userProfile : false
    })
  }
  handleUserProfileOpen(){
    this.setState({
      userProfile : true
    })
  }
  handleLogOut(){
    let cur = this;
    axios.defaults.withCredentials = true;
    this.setState({
      logout : true
    });
    let request = {
      method: 'delete',
      url: "http://vps92599.ovh.net:8082/api/session"
    };
    let step1 = new Promise((resolve, reject) => {
      axios(request).then(function(res) {
        resolve(res.data);
      }).catch(function (error) {
        reject(error);
      });
    });
    step1.then(
      (value)=>{
        window.location.reload();
      }
    ).catch(
      (value)=>{
        alert("log out failed");
      }
    );
  }
  render(){
    const restoreSessionTextStyle={
      "width": "60%",
      "marginLeft": "20%",
      "fontSize": "40px"
    };
    const restoreSessionIconStyle={
      "marginLeft": "40%",
      "width": "20%"
    };
    return(
      <div id="wrapper" className="content">
        <Navbar fluid={true}  style={ {margin: 0} }>
          <Brand>
            <span>
              <img src={logo}/>
              <span>&nbsp;Scooter Admin React - </span>
                <a href="https://www.cruisr.fr/" title="Cruis'R">CruisR</a>
            </span>
          </Brand>
          <ul className="nav navbar-top-links navbar-right">
            <NavDropdown title={<i className="fa fa-user fa-fw"></i> } id = 'navDropdown4'>
              <MenuItem eventKey="1">
                <span onClick = {this.handleUserProfileOpen}> <i className="fa fa-user fa-fw"></i> User Profile </span>
              </MenuItem>
              <MenuItem eventKey="2">
                <span><i className="fa fa-gear fa-fw"></i> Groups </span>
              </MenuItem>
              <MenuItem divider />
              <MenuItem eventKey = "3">
                <span  onClick ={this.handleLogOut}> <i className = "fa fa-sign-out fa-fw" /> Logout </span>
              </MenuItem>
            </NavDropdown>
          </ul>
        </Navbar>
        <Modal
          show={this.state.logout}
          style={{height: "400px",top : "20%"}}>
          <Modal.Header>
            <Modal.Title id="contained-modal-title">Logout</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={restoreSessionTextStyle}>Loggint you out...</div>
            <div style={restoreSessionIconStyle}>
              <i className="fa fa-spinner fa-pulse fa-5x fa-fw "></i>
            </div>
          </Modal.Body>
        </Modal>
        {this.state.userProfile?<UserProfile show = {this.state.userProfile} close={this.handleUserProfileClose} session = {this.props.session}/>:null}
      </div>
    )
  }
}
const mapStateToProps = state => ({
  session : state.session
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
