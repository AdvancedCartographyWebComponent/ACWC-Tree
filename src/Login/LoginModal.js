import React from 'react';
import{
  Modal,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';
export default class loginModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isRegister : false
    };
    this.handleRegisterClick = this.handleRegisterClick.bind(this);
    this.handleRegisterClose = this.handleRegisterClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRegisterCancel = this.handleRegisterCancel.bind(this);
  }
  handleRegisterClick(){
    this.setState({
      isRegister : true
    });
  }
  handleRegisterClose(){
    this.setState({
      isRegister : false
    });
  }
  handleSubmit(){
    this.setState({
      isRegister : false
    });
  }
  handleRegisterCancel(){
    this.setState({
      isRegister : false
    });
  }
  render() {
    let close = this.props.close;
    let username = this.props.username;
    let password = this.props.password;
    let login = this.props.login;
    let isRestoring = this.props.isRestoring;
    const restoreSessionTextStyle={
      "width": "30%",
      "marginLeft": "35%",
      "fontSize": "40px"
    };
    const restoreSessionIconStyle={
      "marginLeft": "40%",
      "width": "20%"
    };
    return (
      isRestoring?
      <div
        className="modal-container">
        <Modal
          show={this.props.show}
          style={{height: "400px",top : "20%"}}>
          <Modal.Header>
            <Modal.Title id="contained-modal-title">Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={restoreSessionTextStyle}>Loading...</div>
            <div style={restoreSessionIconStyle}>
              <i className="fa fa-spinner fa-pulse fa-5x fa-fw "></i>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={this.handleRegisterClick} disabled>Register</Button>
            <Button bsStyle="primary" onClick={login}>Login</Button>
          </Modal.Footer>
        </Modal>
      </div>:<div
        className="modal-container">
        <Modal
          show={this.props.show}
          style={{height: "400px",top : "20%"}}>
          <Modal.Header>
            <Modal.Title id="contained-modal-title">Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="formControlsSelect" validationState={this.props.isLoginFailed?"error":null}>
              {this.props.isLoginFailed?<HelpBlock hidden>Invalid Account Name or Incorrect Password</HelpBlock>:null}
              <ControlLabel>Account</ControlLabel>
              <FormControl
                type="Email"
                placeholder="Enter Your Email/Account"
                inputRef={username}
              />
              <ControlLabel>Password</ControlLabel>
              <FormControl
                type="password"
                placeholder="Password"
                inputRef={password}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={this.handleRegisterClick} disabled>Register</Button>
            <Button bsStyle="primary" onClick={login}>Login</Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.isRegister}
          onHide={this.handleRegisterClose}
          style={{top : "20%"}}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>Account</ControlLabel>
              <FormControl
                type="Email"
                placeholder="Enter Your Email"
                inputRef={ref => { this.accountRegister = ref; }}
              />
              <ControlLabel>Password</ControlLabel>
              <FormControl
                type="password"
                placeholder="Enter Admin Key"
                inputRef={ref => { this.passwordRegister = ref; }}
              />
              <ControlLabel>Confirm Your Password</ControlLabel>
              <FormControl
                type="password"
                placeholder="Confirm Your Password"
                inputRef={ref => { this.passwordConfirmRegister = ref; }}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleRegisterCancel} disabled>Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleSubmit}>Submit</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
