import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import { getCustomerDetails, updateCustomer } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateCustomer } from "../../Helpers/Validation/Manage/customerValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import { Upload } from "antd";
import "antd/dist/reset.css";
import "../Manage/AddCustomer.css";
import "../Manage/CustomerDetails.css";
import "../../Components/Navbar/Navbar.css";

const { Dragger } = Upload;

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inactive, set_inactive] = useState(false);
  const [is_edit_mode, set_is_edit_mode] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [is_loading, set_is_loading] = useState(true);

  const empty_form = {
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    trade_name: "",
    bir_name: "",
    trade_address: "",
    bir_address: "",
    tin: "",
    term: "",
    credit_limit: "",
    payee: "",
    vat_type: "",
    bir_2307: "",
    contact_person: "",
    contact_number: "",
    email: "",
  };

  const [form, set_form] = useState({ ...empty_form });
  const [original_form, set_original_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    first_name: false,
    last_name: false,
  });
  const [attachments, set_attachments] = useState([]);

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  const upload_props = {
    name: "file",
    multiple: true,
    fileList: attachments,
    beforeUpload: (file) => {
      const is_within_limit = file.size / 1024 / 1024 < 10;
      if (!is_within_limit) {
        toast.error(`${file.name} exceeds the 10MB limit.`, { style: toastStyle() });
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList }) => set_attachments(fileList),
  };

  useEffect(() => {
    async function fetch_customer() {
      set_is_loading(true);
      const response = await getCustomerDetails(id);
      if (response.data && response.data.data) {
        const data = response.data.data;
        set_form(data);
        set_original_form(data);
      } else {
        toast.error("Failed to load customer details.", { style: toastStyle() });
        navigate("/customers");
      }
      set_is_loading(false);
    }
    fetch_customer();
  }, [id]);

  function handle_cancel_edit() {
    set_form({ ...original_form });
    set_is_error({ first_name: false, last_name: false });
    set_is_edit_mode(false);
  }

  async function handle_save() {
    if (validateCustomer(form, set_is_error)) {
      set_is_clicked(true);
      const response = await updateCustomer(form);
      if (response.data && response.data.response) {
        toast.success("Customer updated successfully!", { style: toastStyle() });
        set_original_form({ ...form });
        set_is_edit_mode(false);
      } else {
        toast.error("Failed to update customer.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  // Helper: renders a read-only field value
  function ReadValue({ value, placeholder = "—" }) {
    return (
      <div className="detail-value">
        {value ? value : <span className="detail-empty">{placeholder}</span>}
      </div>
    );
  }

  const full_name = [form.first_name, form.middle_name, form.last_name, form.suffix]
    .filter(Boolean)
    .join(" ");

  if (is_loading) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"CUSTOMERS"} />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <div className="details-loading">Loading customer details…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(v) => set_inactive(v)} active={"CUSTOMERS"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/customers")}>
            Customers
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">
            {full_name || "Customer Details"}
          </span>
        </div>

        {/* Sticky header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">
              {full_name || "Customer Details"}
            </h1>
            <p className="page-subtitle">
              {is_edit_mode ? "Edit the customer details below" : "Viewing customer information"}
            </p>
          </div>
          <div className="add-customer-actions">
            {is_edit_mode ? (
              <>
                <button
                  className="cancel-btn"
                  onClick={handle_cancel_edit}
                  disabled={is_clicked}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={handle_save}
                  disabled={is_clicked}
                >
                  {is_clicked ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                className="edit-btn"
                onClick={() => set_is_edit_mode(true)}
              >
                ✏ Edit Customer
              </button>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="biodata-card">

          {/* ── Company Information ── */}
          <div className="biodata-section-label">Company Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TRADE NAME</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="trade_name"
                  value={form.trade_name}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Trade name"
                />
              ) : (
                <ReadValue value={form.trade_name} />
              )}
            </Col>
            <Col>
              <div className="field-label">BIR REGISTERED NAME</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="bir_name"
                  value={form.bir_name}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="BIR registered name"
                />
              ) : (
                <ReadValue value={form.bir_name} />
              )}
            </Col>
            <Col>
              <div className="field-label">TIN</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="tin"
                  value={form.tin}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="000-000-000-000"
                />
              ) : (
                <ReadValue value={form.tin} />
              )}
            </Col>
            <Col>
              <div className="field-label">PAYEE</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="payee"
                  value={form.payee}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Payee name"
                />
              ) : (
                <ReadValue value={form.payee} />
              )}
            </Col>
          </Row>

          {/* ── Address ── */}
          <div className="biodata-section-label">Address</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TRADE ADDRESS</div>
              {is_edit_mode ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="trade_address"
                  value={form.trade_address}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Trade address"
                />
              ) : (
                <ReadValue value={form.trade_address} />
              )}
            </Col>
            <Col>
              <div className="field-label">BIR REGISTERED ADDRESS</div>
              {is_edit_mode ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="bir_address"
                  value={form.bir_address}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="BIR registered address"
                />
              ) : (
                <ReadValue value={form.bir_address} />
              )}
            </Col>
          </Row>

          {/* ── Terms and Tax ── */}
          <div className="biodata-section-label">Terms and Tax</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TERM (DAYS)</div>
              {is_edit_mode ? (
                <Form.Control
                  type="number"
                  name="term"
                  value={form.term}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="e.g. 30"
                  min={0}
                />
              ) : (
                <ReadValue value={form.term ? `${form.term} days` : ""} />
              )}
            </Col>
            <Col>
              <div className="field-label">CREDIT LIMIT</div>
              {is_edit_mode ? (
                <Form.Control
                  type="number"
                  name="credit_limit"
                  value={form.credit_limit}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="0.00"
                  min={0}
                />
              ) : (
                <ReadValue value={form.credit_limit} />
              )}
            </Col>
            <Col>
              <div className="field-label">VAT TYPE</div>
              {is_edit_mode ? (
                <div className="bir-option-group">
                  <label className={`bir-option ${form.vat_type === "VAT" ? "selected" : ""}`}>
                    <input type="radio" name="vat_type" value="VAT" checked={form.vat_type === "VAT"} onChange={handle_change} />
                    VAT
                  </label>
                  <label className={`bir-option ${form.vat_type === "NVAT" ? "selected" : ""}`}>
                    <input type="radio" name="vat_type" value="NVAT" checked={form.vat_type === "NVAT"} onChange={handle_change} />
                    NVAT
                  </label>
                </div>
              ) : (
                <ReadValue value={form.vat_type} />
              )}
            </Col>
            <Col>
              <div className="field-label">BIR 2307</div>
              {is_edit_mode ? (
                <div className="bir-option-group">
                  <label className={`bir-option ${form.bir_2307 === "1%" ? "selected" : ""}`}>
                    <input type="radio" name="bir_2307" value="1%" checked={form.bir_2307 === "1%"} onChange={handle_change} />
                    1%
                  </label>
                  <label className={`bir-option ${form.bir_2307 === "2%" ? "selected" : ""}`}>
                    <input type="radio" name="bir_2307" value="2%" checked={form.bir_2307 === "2%"} onChange={handle_change} />
                    2%
                  </label>
                </div>
              ) : (
                <ReadValue value={form.bir_2307} />
              )}
            </Col>
          </Row>

          {/* ── Contact Person ── */}
          <div className="biodata-section-label">Contact Person</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">
                FIRST NAME {is_edit_mode && <span className="required-icon">*</span>}
              </div>
              {is_edit_mode ? (
                <>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    className="nc-modal-custom-input"
                    onChange={handle_change}
                    placeholder="First name"
                  />
                  <InputError isValid={is_error.first_name} message="First name is required" />
                </>
              ) : (
                <ReadValue value={form.first_name} />
              )}
            </Col>
            <Col>
              <div className="field-label">MIDDLE NAME</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="middle_name"
                  value={form.middle_name}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="Middle name"
                />
              ) : (
                <ReadValue value={form.middle_name} />
              )}
            </Col>
            <Col>
              <div className="field-label">
                LAST NAME {is_edit_mode && <span className="required-icon">*</span>}
              </div>
              {is_edit_mode ? (
                <>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    className="nc-modal-custom-input"
                    onChange={handle_change}
                    placeholder="Last name"
                  />
                  <InputError isValid={is_error.last_name} message="Last name is required" />
                </>
              ) : (
                <ReadValue value={form.last_name} />
              )}
            </Col>
            <Col xs={2}>
              <div className="field-label">SUFFIX</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="suffix"
                  value={form.suffix}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="e.g. Jr."
                />
              ) : (
                <ReadValue value={form.suffix} />
              )}
            </Col>
          </Row>
          <Row className="nc-modal-custom-row mt-2">
            <Col>
              <div className="field-label">CONTACT NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="contact_number"
                  value={form.contact_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="09XX-XXX-XXXX"
                />
              ) : (
                <ReadValue value={form.contact_number} />
              )}
            </Col>
            <Col>
              <div className="field-label">EMAIL</div>
              {is_edit_mode ? (
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="email@example.com"
                />
              ) : (
                <ReadValue value={form.email} />
              )}
            </Col>
            <Col>
              <div className="field-label">CONTACT PERSON ROLE</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="contact_person"
                  value={form.contact_person}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="e.g. Purchasing Officer"
                />
              ) : (
                <ReadValue value={form.contact_person} />
              )}
            </Col>
          </Row>

          {/* ── Attachments ── */}
          <div className="biodata-section-label">Attachments</div>
          {is_edit_mode ? (
            <Dragger {...upload_props}>
              <p className="attach-icon">📎</p>
              <p className="attach-main-text">Click, drag, or paste files here</p>
              <p className="attach-sub-text">Any file type accepted · Max 10MB per file</p>
            </Dragger>
          ) : (
            <div className="detail-attachments-empty">
              {attachments.length === 0
                ? "No attachments"
                : `${attachments.length} file(s) attached`}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}