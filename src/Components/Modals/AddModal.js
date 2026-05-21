import { Modal, Container } from "react-bootstrap";
import React from "react";
import ReactLoading from "react-loading";
import "./Modal.css";

function AddModal(props) {
  return (
    <div>
      <Modal show={props.show} onHide={props.onHide} size={props.size} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          <div className="col-sm-12">
            <p className="custom-modal-body-title"> ADD {props.title} </p>
            <Container fluid className="modal-cont justify-content-center">
              {props.children}
            </Container>
            <div className="col-sm-12 mt-4 d-flex justify-content-end">
              <button className="button-secondary me-3" onClick={props.onHide}>
                Cancel
              </button>
              {props.isClicked === true ? (
                <div className="button-primary d-flex justify-content-center">
                  <ReactLoading type="bubbles" color="#FFFFFF" height={36} width={50} />
                </div>
              ) : (
                <button className="button-primary" onClick={props.onSave}>
                  Save
                </button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

AddModal.defaultProps = {
  title: "",
  size: "lg",
  show: false,
  onHide: () => {},
  onSave: () => {},
};

export default AddModal;
