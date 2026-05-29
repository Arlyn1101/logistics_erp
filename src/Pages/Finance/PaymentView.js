import React, { useState, useEffect } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  getPaymentDetails,
  getPaymentAttachments,
  deletePaymentAttachment,
  downloadPaymentAttachment,
} from "../../Helpers/apiCalls/Finance/paymentApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

const METHOD_LABEL = {
  cash:          "Cash",
  check:         "Check",
  bank_transfer: "Bank Transfer",
};

export default function PaymentView() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed   = location.state?.payment || null;

  const [inactive, set_inactive]       = useState(false);
  const [payment, set_payment]         = useState(null);
  const [attachments, set_attachments] = useState([]);
  const [is_loading, set_is_loading]   = useState(true);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  async function fetch_payment() {
    if (!passed) {
      navigate("/payments");
      return;
    }
    set_is_loading(true);
    const response = await getPaymentDetails(passed.id);
    if (response.data && response.data.data) {
      set_payment(response.data.data);
    } else {
      toast.error("Failed to load payment details.", { style: toastStyle() });
      navigate("/payments");
    }
    set_is_loading(false);
  }

  async function fetch_attachments() {
    if (!passed) return;
    const response = await getPaymentAttachments(passed.id);
    if (response.data && response.data.data) {
      set_attachments(response.data.data);
    } else {
      set_attachments([]);
    }
  }

  useEffect(() => {
    fetch_payment();
    fetch_attachments();
  }, []);

  async function handle_delete_attachment(attachment_id) {
    if (!window.confirm("Remove this attachment?")) return;
    const response = await deletePaymentAttachment(attachment_id);
    if (response.data && response.data.status === "success") {
      toast.success("Attachment removed.", { style: toastStyle() });
      fetch_attachments();
    } else {
      toast.error("Failed to remove attachment.", { style: toastStyle() });
    }
  }

  function get_ref_label() {
    if (!payment) return { label: null, value: null };
    if (payment.payment_method === "check")
      return { label: "CHECK NO.",        value: payment.check_number     || "—" };
    if (payment.payment_method === "bank_transfer")
      return { label: "REFERENCE NO.",    value: payment.reference_number || "—" };
    return { label: null, value: null };
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (is_loading) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"FINANCE"} />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <div className="details-loading">Loading payment details…</div>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const ref       = get_ref_label();
  const is_cash   = payment.payment_method === "cash";
  const is_check  = payment.payment_method === "check";
  const is_bank   = payment.payment_method === "bank_transfer";

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(v) => set_inactive(v)} active={"FINANCE"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/payments")}>
            Payments
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">
            Payment #{payment.id}
          </span>
        </div>

        {/* Header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">Payment #{payment.id}</h1>
            <p className="page-subtitle">
              {payment.customer_name} — {payment.billing_number}
            </p>
          </div>
          <div className="add-customer-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/payments")}
            >
              Back
            </button>
            <button
              type="button"
              className="edit-btn"
              onClick={() =>
                navigate("/billings/view", {
                  state: {
                    billing: {
                      id:               payment.billing_id,
                      billing_number:   payment.billing_number,
                      customer_name:    payment.customer_name,
                      contract_number:  payment.contract_number,
                    },
                  },
                })
              }
            >
              View Billing
            </button>
          </div>
        </div>

        {/* Section 1 — Payment Information */}
        <div className="biodata-card mb-3">
          <div className="biodata-section-label">Payment Information</div>

          {/* Row 1 — Who & What */}
          <Row className="nc-modal-custom-row">
            <Col xs={12} md={4}>
              <div className="field-label">CUSTOMER</div>
              <div className="detail-value">{payment.customer_name || "—"}</div>
            </Col>
            <Col xs={12} md={4}>
              <div className="field-label">BILLING NO.</div>
              <div
                className="detail-value"
                style={{ color: "#5ac8e1", cursor: "pointer" }}
                onClick={() =>
                  navigate("/billings/view", {
                    state: {
                      billing: {
                        id:              payment.billing_id,
                        billing_number:  payment.billing_number,
                        customer_name:   payment.customer_name,
                        contract_number: payment.contract_number,
                      },
                    },
                  })
                }
              >
                {payment.billing_number || "—"}
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="field-label">CONTRACT NO.</div>
              <div className="detail-value">{payment.contract_number || "—"}</div>
            </Col>
          </Row>

          {/* Row 2 — Payment core */}
          <Row className="nc-modal-custom-row">
            <Col xs={12} md={4}>
              <div className="field-label">PAYMENT DATE</div>
              <div className="detail-value">
                {payment.payment_date
                  ? moment(payment.payment_date).format("MMM D, YYYY")
                  : "—"}
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="field-label">METHOD</div>
              <div className="detail-value">
                {METHOD_LABEL[payment.payment_method] || payment.payment_method}
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="field-label">AMOUNT</div>
              <div
                className="detail-value"
                style={{ color: "#27ae60", fontFamily: "var(--primary-font-bold)" }}
              >
                {fmt(payment.amount)}
              </div>
            </Col>
          </Row>

          {/* Row 3 — Method-specific details */}
          {(is_check || is_cash || is_bank) && (
            <Row className="nc-modal-custom-row">
              {is_check && (
                <>
                  <Col xs={12} md={3}>
                    <div className="field-label">CHECK NO.</div>
                    <div className="detail-value">{payment.check_number || "—"}</div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div className="field-label">CHECK DATE</div>
                    <div className="detail-value">
                      {payment.check_date
                        ? moment(payment.check_date).format("MMM D, YYYY")
                        : "—"}
                    </div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div className="field-label">ISSUING BANK</div>
                    <div className="detail-value">{payment.bank_name || "—"}</div>
                  </Col>
                  <Col xs={12} md={3}>
                    <div className="field-label">DEPOSIT DATE</div>
                    <div className="detail-value">
                      {payment.deposit_date
                        ? moment(payment.deposit_date).format("MMM D, YYYY")
                        : "—"}
                    </div>
                  </Col>
                </>
              )}
              {is_cash && (
                <>
                  <Col xs={12} md={4}>
                    <div className="field-label">DEPOSIT DATE</div>
                    <div className="detail-value">
                      {payment.deposit_date
                        ? moment(payment.deposit_date).format("MMM D, YYYY")
                        : "—"}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="field-label">DEPOSITED TO</div>
                    <div className="detail-value">{payment.deposited_to || "—"}</div>
                  </Col>
                </>
              )}
              {is_bank && (
                <>
                  <Col xs={12} md={4}>
                    <div className="field-label">REFERENCE NO.</div>
                    <div className="detail-value">{payment.reference_number || "—"}</div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="field-label">BANK / PLATFORM</div>
                    <div className="detail-value">{payment.bank_name || "—"}</div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="field-label">TRANSFER DATE</div>
                    <div className="detail-value">
                      {payment.transfer_date
                        ? moment(payment.transfer_date).format("MMM D, YYYY")
                        : "—"}
                    </div>
                  </Col>
                </>
              )}
            </Row>
          )}

          {/* Row 4 — Deposited To (check only, kept separate so it doesn't crowd row 3) */}
          {is_check && (
            <Row className="nc-modal-custom-row">
              <Col xs={12} md={4}>
                <div className="field-label">DEPOSITED TO</div>
                <div className="detail-value">{payment.deposited_to || "—"}</div>
              </Col>
            </Row>
          )}

          {/* Remarks */}
          {payment.remarks && (
            <Row className="nc-modal-custom-row">
              <Col xs={12}>
                <div className="field-label">REMARKS</div>
                <div className="detail-value">{payment.remarks}</div>
              </Col>
            </Row>
          )}
        </div>

        {/* Section 2 — Supporting Documents */}
        <div className="biodata-card mb-3">
          <div className="biodata-section-label">
            Supporting Documents ({attachments.length})
          </div>

          {attachments.length === 0 ? (
            <p className="page-subtitle mt-2">No attachments uploaded.</p>
          ) : (
            <div className="mt-2">
              {attachments.map((att) => (
                <div className="attachment-row" key={att.id}>
                  <span className="attachment-name">{att.file_name}</span>
                  <div className="attachment-actions">
                    <button
                      type="button"
                      className="attachment-btn"
                      title="Download"
                      onClick={() =>
                        downloadPaymentAttachment(att.file_path, att.file_name)
                      }
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button
                      type="button"
                      className="attachment-btn attachment-remove"
                      title="Delete"
                      onClick={() => handle_delete_attachment(att.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}