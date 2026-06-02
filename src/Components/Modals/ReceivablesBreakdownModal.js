import React from "react";
import { Modal } from "react-bootstrap";
import "./Modal.css";

const fmt = (val) =>
  `₱ ${parseFloat(val || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  })}`;

function ReceivablesBreakdownModal({ show, onHide, title, data }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="custom-modal-body-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1a2e40" }}>
                {["BILLING NO.", "BILLING DATE", "DUE DATE", "BALANCE"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      color: "#fff",
                      fontFamily: "var(--primary-font-bold)",
                      fontSize: 12,
                      textTransform: "uppercase",
                      textAlign: h === "BALANCE" ? "right" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: "16px 12px", textAlign: "center", color: "#aaa", fontSize: 13 }}
                  >
                    No breakdown available.
                  </td>
                </tr>
              ) : (
                data.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{b.billing_number}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{b.billing_date}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{b.due_date}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{fmt(b.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="cancel-btn" onClick={onHide}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}

ReceivablesBreakdownModal.defaultProps = {
  show: false,
  onHide: () => {},
  title: "",
  data: [],
};

export default ReceivablesBreakdownModal;