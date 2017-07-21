import React from 'react';
import{
  Modal,
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'react-bootstrap';
export default class CommandModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isConfirm : false,
      key:null
    };
    this.handleSendClick = this.handleSendClick.bind(this);
    this.handleConfirmClose = this.handleConfirmClose.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleConfirmCancel = this.handleConfirmCancel.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
  }
  handleSendClick(){
    this.setState({
      isConfirm : true
    });
  }
  handleConfirmClose(){
    this.setState({
      isConfirm : false
    });
  }
  handleConfirm(){
    this.props.close();
    this.setState({
      isConfirm : false
    });
  }
  handleConfirmCancel(){
    this.props.close();
    this.setState({
      isConfirm : false
    });
  }
  handleKeyChange(e) {
    this.setState({ key: e.target.value });
  }
  render() {
    let close = this.props.close;
    return (
      <div
        className="modal-container">
        <Modal
          show={this.props.show}
          style={{height: "400px",top : "20%"}}>
          <Modal.Header>
            <Modal.Title id="contained-modal-title">Intervention</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="formControlsSelect">
              <ControlLabel>Couper le Service</ControlLabel>
              <FormControl
                type="password"
                placeholder="Enter Admin Key"
                inputRef={ref => { this.input = ref; }}
                onChange={this.handleKeyChange}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={close}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleSendClick} disabled={this.state.key?false:true}>Send the Command</Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.isConfirm}
          style={{top : "20%"}}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Confirm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Attention! You will stop the service of the scooter immediately. Do you really want to do this?
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.handleConfirmCancel}>Cancel</Button>
            <Button bsStyle="danger" onClick={this.handleConfirm}>Confirm</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
