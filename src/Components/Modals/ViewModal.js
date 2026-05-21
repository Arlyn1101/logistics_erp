import { Modal, Container } from "react-bootstrap";
import React from "react";
import "./Modal.css";

function ViewModal(props) {
  return (
    <div>
      <Modal show={props.show} onHide={props.onHide} size={props.size} centered>
        <Modal.Header closeButton />
        <Modal.Body>
          <div className="col-sm-12">
            <p className="custom-modal-body-title"> VIEW {props.title} </p>
            <Container fluid className="modal-cont justify-content-center">
              {props.children}
            </Container>
            <div className="col-sm-12 mt-4 d-flex justify-content-end">
              <button className="button-secondary me-3" onClick={props.onHide}>
                Close
              </button>
              {props.withButtons && (
                <button className="button-primary" onClick={props.onEdit}>
                  Edit
                </button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

ViewModal.defaultProps = {
  title: "",
  size: "lg",
  show: false,
  onHide: () => {},
  onEdit: () => {},
  withButtons: false,
};

export default ViewModal;
