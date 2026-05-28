import React, { useState } from "react";
import { Modal, Row, Col, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity, faDownload, faTrash, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import moment from "moment";
import {
  createPayment,
  uploadPaymentAttachments,
  getPaymentAttachments,
  deletePaymentAttachment,
  downloadPaymentAttachment,
} from "../../Helpers/apiCalls/Finance/paymentApi";
import { toastStyle } from "../../Helpers/Utils/Common";

const BANKS = [
  { name: "BDO",           logo: "https://www.google.com/s2/favicons?domain=bdo.com.ph&sz=64" },
  { name: "BPI",           logo: "https://www.google.com/s2/favicons?domain=bpi.com.ph&sz=64" },
  { name: "Metrobank",     logo: "https://www.google.com/s2/favicons?domain=metrobank.com.ph&sz=64" },
  { name: "UnionBank",     logo: "https://www.google.com/s2/favicons?domain=unionbankph.com&sz=64" },
  { name: "Security Bank", logo: "https://www.google.com/s2/favicons?domain=securitybank.com&sz=64" },
  { name: "Land Bank",     logo: "https://www.google.com/s2/favicons?domain=landbank.com&sz=64" },
  { name: "PNB",           logo: "https://www.google.com/s2/favicons?domain=pnb.com.ph&sz=64" },
  { name: "GCash",         logo: "https://www.google.com/s2/favicons?domain=gcash.com&sz=64" },
  { name: "Maya",          logo: "https://www.google.com/s2/favicons?domain=maya.ph&sz=64" },
  { name: "Others",        logo: null },
];

export default function PaymentModal({ show, onHide, billing, on_success }) {
  const empty_form = {
    billing_id:       billing?.id || "",
    payment_date:     moment().format("YYYY-MM-DD"),
    payment_method:   "cash",
    amount:           billing?.grand_total || "",
    reference_number: "",
    check_number:     "",
    check_date:       "",
    bank_name:        "",
    deposit_date:     "",
    deposited_to:     "",
    transfer_date:    "",
    remarks:          "",
  };

  const [form, set_form]         = useState({ ...empty_form });
  const [is_clicked, set_is_clicked] = useState(false);
  const [is_error, set_is_error]           = useState({});
  const [new_attachments, set_new_attachments] = useState([]);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_method_change = (method) => {
    set_form((prev) => ({
      ...prev,
      payment_method:   method,
      reference_number: "",
      check_number:     "",
      check_date:       "",
      bank_name:        "",
      deposit_date:     "",
      deposited_to:     "",
      transfer_date:    "",
    }));
    set_is_error({});
  };

  const handle_bank_select = (bank_name) => {
    set_form((prev) => ({ ...prev, bank_name }));
  };

  function validate() {
    const errors = {};
    if (!form.payment_date)   errors.payment_date   = true;
    if (!form.amount)         errors.amount         = true;

    if (form.payment_method === "cash") {
      if (!form.deposit_date)  errors.deposit_date  = true;
      if (!form.deposited_to)  errors.deposited_to  = true;
    }

    if (form.payment_method === "check") {
      if (!form.check_number)  errors.check_number  = true;
      if (!form.check_date)    errors.check_date    = true;
      if (!form.bank_name)     errors.bank_name     = true;
      if (!form.deposit_date)  errors.deposit_date  = true;
      if (!form.deposited_to)  errors.deposited_to  = true;
    }

    if (form.payment_method === "bank_transfer") {
      if (!form.bank_name)        errors.bank_name        = true;
      if (!form.reference_number) errors.reference_number = true;
      if (!form.transfer_date)    errors.transfer_date    = true;
    }

    set_is_error(errors);
    return Object.keys(errors).length === 0;
  }

  async function handle_save() {
    if (!validate()) {
      toast.error("Please fill in all required fields.", { style: toastStyle() });
      return;
    }
    set_is_clicked(true);
    const response = await createPayment({ ...form, billing_id: billing.id });
    if (response.data && response.data.status === "success") {
      const payment_id = response.data.payment_id;
      if (new_attachments.length > 0 && payment_id) {
        await uploadPaymentAttachments(payment_id, new_attachments);
      }
      toast.success("Payment recorded successfully!", { style: toastStyle() });
      on_success();
      onHide();
    } else {
      toast.error("Failed to record payment.", { style: toastStyle() });
    }
    set_is_clicked(false);
  }

  function handle_close() {
    set_form({ ...empty_form });
    set_is_error({});
    set_new_attachments([]);
    onHide();
  }

  return (
    <Modal show={show} onHide={handle_close} size="lg" centered>
      <Modal.Header closeButton>
        <span className="page-title">Add Payment</span>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">

        {/* Billing Info — read only */}
        <div className="form-section-label">Billing Information</div>
        <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">BILLING NO.</div>
            <Form.Control
              className="nc-modal-custom-input"
              value={billing?.billing_number || ""}
              disabled
            />
          </Col>
          <Col xs={6}>
            <div className="field-label">CUSTOMER</div>
            <Form.Control
              className="nc-modal-custom-input"
              value={billing?.customer_name || ""}
              disabled
            />
          </Col>
        </Row>
        <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">CONTRACT NO.</div>
            <Form.Control
              className="nc-modal-custom-input"
              value={billing?.contract_number || ""}
              disabled
            />
          </Col>
          <Col xs={6}>
            <div className="field-label">BILLING PERIOD</div>
            <Form.Control
              className="nc-modal-custom-input"
              value={
                billing
                  ? `${moment(billing.billing_period_start).format("MMM D")} – ${moment(billing.billing_period_end).format("MMM D, YYYY")}`
                  : ""
              }
              disabled
            />
          </Col>
        </Row>
        <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">AMOUNT DUE</div>
            <Form.Control
              className="nc-modal-custom-input"
              value={fmt(billing?.grand_total)}
              disabled
            />
          </Col>
        </Row>

        {/* Payment Details */}
        <div className="form-section-label mt-3">Payment Details</div>
        <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">
              PAYMENT DATE <span className="required-icon">*</span>
            </div>
            <Form.Control
              type="date"
              name="payment_date"
              value={form.payment_date}
              className="nc-modal-custom-input"
              onChange={handle_change}
              style={{ borderColor: is_error.payment_date ? "red" : "" }}
            />
            {is_error.payment_date && (
              <small style={{ color: "red" }}>Payment date is required</small>
            )}
          </Col>
          <Col xs={6}>
            <div className="field-label">
              AMOUNT <span className="required-icon">*</span>
            </div>
            <Form.Control
              type="number"
              name="amount"
              value={form.amount}
              className="nc-modal-custom-input"
              disabled
            />
          </Col>
        </Row>

        {/* Payment Method */}
        <div className="form-section-label mt-3">Payment Method</div>
        <Row className="nc-modal-custom-row">
          <Col>
            <div className="d-flex gap-3">
              {["cash", "check", "bank_transfer"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handle_method_change(method)}
                  className={`nc-modal-custom-input`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    fontWeight: form.payment_method === method ? "700" : "400",
                    border: form.payment_method === method
                      ? "2px solid var(--primary-color, #3b82f6)"
                      : "1px solid #dee2e6",
                    borderRadius: "8px",
                    background: form.payment_method === method
                      ? "var(--primary-light, #eff6ff)"
                      : "#fff",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {method === "bank_transfer" ? "Bank Transfer" : method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </Col>
        </Row>

        {/* Cash Fields */}
        {form.payment_method === "cash" && (
          <>
            <Row className="nc-modal-custom-row mt-2">
              <Col xs={6}>
                <div className="field-label">
                  DEPOSIT DATE <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="date"
                  name="deposit_date"
                  value={form.deposit_date}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  style={{ borderColor: is_error.deposit_date ? "red" : "" }}
                />
                {is_error.deposit_date && (
                  <small style={{ color: "red" }}>Deposit date is required</small>
                )}
              </Col>
              <Col xs={6}>
                <div className="field-label">
                  DEPOSITED TO <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="text"
                  name="deposited_to"
                  value={form.deposited_to}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Bank account name"
                  style={{ borderColor: is_error.deposited_to ? "red" : "" }}
                />
                {is_error.deposited_to && (
                  <small style={{ color: "red" }}>Deposited to is required</small>
                )}
              </Col>
            </Row>
          </>
        )}

        {/* Check Fields */}
        {form.payment_method === "check" && (
          <>
            <Row className="nc-modal-custom-row mt-2">
              <Col xs={6}>
                <div className="field-label">
                  CHECK NUMBER <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="text"
                  name="check_number"
                  value={form.check_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  style={{ borderColor: is_error.check_number ? "red" : "" }}
                />
                {is_error.check_number && (
                  <small style={{ color: "red" }}>Check number is required</small>
                )}
              </Col>
              <Col xs={6}>
                <div className="field-label">
                  CHECK DATE <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="date"
                  name="check_date"
                  value={form.check_date}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  style={{ borderColor: is_error.check_date ? "red" : "" }}
                />
                {is_error.check_date && (
                  <small style={{ color: "red" }}>Check date is required</small>
                )}
              </Col>
            </Row>
            <Row className="nc-modal-custom-row">
              <Col xs={6}>
                <div className="field-label">
                  BANK NAME <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="text"
                  name="bank_name"
                  value={form.bank_name}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Issuing bank"
                  style={{ borderColor: is_error.bank_name ? "red" : "" }}
                />
                {is_error.bank_name && (
                  <small style={{ color: "red" }}>Bank name is required</small>
                )}
              </Col>
              <Col xs={6}>
                <div className="field-label">
                  DEPOSIT DATE <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="date"
                  name="deposit_date"
                  value={form.deposit_date}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  style={{ borderColor: is_error.deposit_date ? "red" : "" }}
                />
                {is_error.deposit_date && (
                  <small style={{ color: "red" }}>Deposit date is required</small>
                )}
              </Col>
            </Row>
            <Row className="nc-modal-custom-row">
              <Col xs={6}>
                <div className="field-label">
                  DEPOSITED TO <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="text"
                  name="deposited_to"
                  value={form.deposited_to}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Bank account name"
                  style={{ borderColor: is_error.deposited_to ? "red" : "" }}
                />
                {is_error.deposited_to && (
                  <small style={{ color: "red" }}>Deposited to is required</small>
                )}
              </Col>
            </Row>
          </>
        )}

        {/* Bank Transfer Fields */}
        {form.payment_method === "bank_transfer" && (
          <>
            <div className="field-label mt-3">
              BANK / PLATFORM <span className="required-icon">*</span>
            </div>
            <div
              className="d-flex flex-wrap gap-2 mt-1 mb-2"
              style={{ borderColor: is_error.bank_name ? "red" : "" }}
            >
              {BANKS.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => handle_bank_select(bank.name)}
                  style={{
                    display:        "flex",
                    flexDirection:  "column",
                    alignItems:     "center",
                    justifyContent: "center",
                    width:          "80px",
                    height:         "70px",
                    borderRadius:   "10px",
                    border:         form.bank_name === bank.name
                      ? "2px solid var(--primary-color, #3b82f6)"
                      : "1px solid #dee2e6",
                    background:     form.bank_name === bank.name
                      ? "var(--primary-light, #eff6ff)"
                      : "#fff",
                    cursor:         "pointer",
                    padding:        "6px",
                    gap:            "4px",
                  }}
                >
                  {bank.logo ? (
                    <>
                      <img
                        src={bank.logo}
                        alt={bank.name}
                        style={{ width: "36px", height: "36px", objectFit: "contain", display: "block" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <FontAwesomeIcon
                        icon={faUniversity}
                        style={{ fontSize: "24px", color: "#8a9ab0", display: "none" }}
                      />
                    </>
                  ) : (
                    <FontAwesomeIcon
                      icon={faUniversity}
                      style={{ fontSize: "24px", color: "#8a9ab0" }}
                    />
                  )}
                  <span style={{ fontSize: "9px", color: "#555", textAlign: "center" }}>
                    {bank.name}
                  </span>
                </button>
              ))}
            </div>
            {is_error.bank_name && (
              <small style={{ color: "red" }}>Please select a bank or platform</small>
            )}

            <Row className="nc-modal-custom-row mt-2">
              <Col xs={6}>
                <div className="field-label">
                  REFERENCE NUMBER <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="text"
                  name="reference_number"
                  value={form.reference_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  style={{ borderColor: is_error.reference_number ? "red" : "" }}
                />
                {is_error.reference_number && (
                  <small style={{ color: "red" }}>Reference number is required</small>
                )}
              </Col>
              <Col xs={6}>
                <div className="field-label">
                  TRANSFER DATE <span className="required-icon">*</span>
                </div>
                <Form.Control
                  type="date"
                  name="transfer_date"
                  value={form.transfer_date}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  style={{ borderColor: is_error.transfer_date ? "red" : "" }}
                />
                {is_error.transfer_date && (
                  <small style={{ color: "red" }}>Transfer date is required</small>
                )}
              </Col>
            </Row>
          </>
        )}

        {/* Supporting Documents */}
        <div className="form-section-label mt-3">Supporting Documents</div>
        <Row className="nc-modal-custom-row">
          <Col>
            <div className="field-label">
              ATTACH FILES <span className="edit-optional px-1">(Optional)</span>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="nc-modal-custom-input"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                set_new_attachments((prev) => [...prev, ...files]);
                e.target.value = "";
              }}
            />
            <small style={{ color: "#8a9ab0" }}>
              Accepted: PDF, JPG, PNG — e.g. deposit slip, transfer screenshot, check photo
            </small>
            {new_attachments.length > 0 && (
              <div className="mt-2">
                {new_attachments.map((file, i) => (
                  <div key={i} className="attachment-row">
                    <span className="attachment-name">
                      <FontAwesomeIcon icon={faPaperclip} className="me-1" />
                      {file.name}
                    </span>
                    <div className="attachment-actions">
                      <button
                        type="button"
                        className="attachment-btn attachment-remove"
                        onClick={() =>
                          set_new_attachments((prev) => prev.filter((_, idx) => idx !== i))
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>

        {/* Remarks */}
        <Row className="nc-modal-custom-row mt-2">
          <Col>
            <div className="field-label">REMARKS <span className="edit-optional px-1">(Optional)</span></div>
            <Form.Control
              as="textarea"
              rows={2}
              name="remarks"
              value={form.remarks}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
        </Row>

      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          className="button-secondary"
          onClick={handle_close}
          disabled={is_clicked}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={handle_save}
          disabled={is_clicked}
        >
          {is_clicked ? "Saving..." : "Record Payment"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}