import React from 'react';
import{
  Modal,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';
import axios from 'axios';
export default class UserProfile extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isRegister : false,
      isPasswordMatch : true
    };
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
  }

  handleCancelClick(){
    this.props.close();
  }
  handleSaveClick(){
    //console.log(this.password.value, this.confirmPassword.value);
    let newData = this.props.session;

    if(this.password.value===this.confirmPassword.value){
      newData.password = this.password.value;
      axios.defaults.withCredentials = true;
      let request = {
        method: 'put',
        url: "http://vps92599.ovh.net:8082/api/users/"+newData.id,
        data : newData
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
          //console.log("log success",value);
        }
      ).catch(
        (value)=>{
          console.log("get data failed");
        }
      );
      this.props.close();
    }else {
      this.setState({
        isPasswordMatch : false
      })
    }
    //this.props.close();
  }
  render(){
    console.log("session",this.props.session);
    return(
      <div className="modal-container">
        <Modal
          show={this.props.show}
          style={{height: "500px",top : "20%"}}>
          <Modal.Header>
            <Modal.Title id="contained-modal-title">User Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="formControlsAccount">
              <ControlLabel>Account</ControlLabel>
              <FormControl
                type="Email"
                placeholder="Enter Your Email/Account"
                defaultValue={this.props.session?this.props.session.email:null}
                disabled
              />
            </FormGroup>
            <FormGroup controlId="formControlsPassword" validationState={this.state.isPasswordMatch?null:"error"}>
              {!this.state.isPasswordMatch?<HelpBlock hidden>Password Not Matched</HelpBlock>:null}
              <ControlLabel>New Password</ControlLabel>
              <FormControl
                type="password"
                placeholder="New Password"
                inputRef = {(ref)=>{this.password = ref}}
              />
              <ControlLabel>Confirm Password</ControlLabel>
              <FormControl
                type="password"
                placeholder="Confirm Password"
                inputRef = {(ref)=>{this.confirmPassword = ref}}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={this.handleCancelClick}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleSaveClick}>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
