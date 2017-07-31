import React from 'react';
import {
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  ProgressBar,
} from 'react-bootstrap';
import Navbar, {Brand} from 'react-bootstrap/lib/Navbar';
import './Header.css'

const logo = require('../imgs/logo_cruisr.png');

export default class loginModal extends React.Component {
  render(){
    return(
      <div id="wrapper" className="content">
        <Navbar fluid={true}  style={ {margin: 0} }>
          <Brand>
            <span>
              <img src={logo}/>
              <span>&nbsp;SB Admin React - </span>
                <a href="https://www.cruisr.fr/" title="Cruis'R">CruisR</a>
            </span>
          </Brand>
          <ul className="nav navbar-top-links navbar-right">
            <NavDropdown title={<i className="fa fa-user fa-fw"></i> } id = 'navDropdown4'>
              <MenuItem eventKey="1">
                <span> <i className="fa fa-user fa-fw"></i> User Profile </span>
              </MenuItem>
              <MenuItem eventKey="2">
                <span><i className="fa fa-gear fa-fw"></i> Groups </span>
              </MenuItem>
              <MenuItem divider />
              <MenuItem eventKey = "3">
                <span> <i className = "fa fa-sign-out fa-fw" /> Logout </span>
              </MenuItem>
            </NavDropdown>
          </ul>
        </Navbar>
      </div>
    )
  }
}
