import { Modal } from "react-bootstrap";
import React from "react";
import "./Modal.css";

function DeleteModal(props) {
  return (
    <div>
      <Modal show={props.show} onHide={props.onHide} size="md" centered>
        <Modal.Header closeButton />
        <Modal.Body>
          <div className="text">
            <h1>WARNING!</h1>
            <div className="text-wrapper">
              <div className="text-group">
                <h2>Are you sure you want to delete this {props.text}?</h2>
                <h3>The {props.text}'s details will be deleted immediately.</h3>
                <h3>You can't undo this action.</h3>
              </div>
            </div>
            <div className="col-sm-12 mt-3 d-flex justify-content-end">
              <button className="button-warning me-3" onClick={props.onHide}>
                Cancel
              </button>
              <button className="button-warning-fill" onClick={props.onDelete}>
                Delete
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

DeleteModal.defaultProps = {
  text: "",
  show: false,
  onHide: () => {},
  onDelete: () => {},
};

export default DeleteModal;
