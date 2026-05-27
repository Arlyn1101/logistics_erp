import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import { createCustomer } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateCustomer } from "../../Helpers/Validation/Manage/customerValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import { Upload } from "antd";
import "antd/dist/reset.css";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";

const { Dragger } = Upload;

export default function AddCustomer() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);

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

  async function handle_save() {
    if (validateCustomer(form, set_is_error)) {
      set_is_clicked(true);
      const response = await createCustomer(form, attachments);
      if (response.data && response.data.response) {
        toast.success("Customer added successfully!", { style: toastStyle() });
        navigate("/customers");
      } else {
        toast.error("Failed to add customer.", { style: toastStyle() });
        set_is_clicked(false);
      }
    }
  }

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"CUSTOMERS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/customers")}>
            Customers
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Add New Customer</span>
        </div>

        {/* Sticky header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">Add New Customer</h1>
            <p className="page-subtitle">Fill in the customer details below</p>
          </div>
          <div className="add-customer-actions">
            <button className="cancel-btn" onClick={() => navigate("/customers")} disabled={is_clicked}>
              Cancel
            </button>
            <button className="save-btn" onClick={handle_save} disabled={is_clicked}>
              {is_clicked ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>

        {/* Single biodata card */}
        <div className="biodata-card">

          {/* ── Company Information ── */}
          <div className="biodata-section-label">Company Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TRADE NAME</div>
              <Form.Control
                type="text"
                name="trade_name"
                value={form.trade_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="Trade name"
              />
            </Col>
            <Col>
              <div className="field-label">BIR REGISTERED NAME</div>
              <Form.Control
                type="text"
                name="bir_name"
                value={form.bir_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="BIR registered name"
              />
            </Col>
            <Col>
              <div className="field-label">TIN</div>
              <Form.Control
                type="text"
                name="tin"
                value={form.tin}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="000-000-000-000"
              />
            </Col>
            <Col>
              <div className="field-label">PAYEE</div>
              <Form.Control
                type="text"
                name="payee"
                value={form.payee}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="Payee name"
              />
            </Col>
          </Row>

          {/* ── Address ── */}
          <div className="biodata-section-label">Address</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TRADE ADDRESS</div>
              <Form.Control
                as="textarea"
                rows={2}
                name="trade_address"
                value={form.trade_address}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="Trade address"
              />
            </Col>
            <Col>
              <div className="field-label">BIR REGISTERED ADDRESS</div>
              <Form.Control
                as="textarea"
                rows={2}
                name="bir_address"
                value={form.bir_address}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="BIR registered address"
              />
            </Col>
          </Row>

          {/* ── Terms and Tax ── */}
          <div className="biodata-section-label">Terms and Tax</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TERM (DAYS)</div>
              <Form.Control
                type="number"
                name="term"
                value={form.term}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="e.g. 30"
                min={0}
              />
            </Col>
            <Col>
              <div className="field-label">CREDIT LIMIT</div>
              <Form.Control
                type="number"
                name="credit_limit"
                value={form.credit_limit}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="0.00"
                min={0}
              />
            </Col>
            <Col>
              <div className="field-label">VAT TYPE</div>
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
            </Col>
            <Col>
              <div className="field-label">BIR 2307</div>
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
            </Col>
          </Row>

          {/* ── Contact Person ── */}
          <div className="biodata-section-label">Contact Person</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">FIRST NAME <span className="required-icon">*</span></div>
              <Form.Control
                type="text"
                name="first_name"
                value={form.first_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="First name"
              />
              <InputError isValid={is_error.first_name} message="First name is required" />
            </Col>
            <Col>
              <div className="field-label">MIDDLE NAME</div>
              <Form.Control
                type="text"
                name="middle_name"
                value={form.middle_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="Middle name"
              />
            </Col>
            <Col>
              <div className="field-label">LAST NAME <span className="required-icon">*</span></div>
              <Form.Control
                type="text"
                name="last_name"
                value={form.last_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="Last name"
              />
              <InputError isValid={is_error.last_name} message="Last name is required" />
            </Col>
            <Col xs={2}>
              <div className="field-label">SUFFIX</div>
              <Form.Control
                type="text"
                name="suffix"
                value={form.suffix}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="e.g. Jr."
              />
            </Col>
          </Row>
          <Row className="nc-modal-custom-row mt-2">
            <Col>
              <div className="field-label">CONTACT NUMBER</div>
              <Form.Control
                type="text"
                name="contact_number"
                value={form.contact_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="09XX-XXX-XXXX"
              />
            </Col>
            <Col>
              <div className="field-label">EMAIL</div>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="email@example.com"
              />
            </Col>
            <Col>
              <div className="field-label">CONTACT PERSON ROLE</div>
              <Form.Control
                type="text"
                name="contact_person"
                value={form.contact_person}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="e.g. Purchasing Officer"
              />
            </Col>
          </Row>

          {/* ── Attachments ── */}
          <div className="biodata-section-label">Attachments</div>
          <Dragger {...upload_props}>
            <p className="attach-icon">📎</p>
            <p className="attach-main-text">Click, drag, or paste files here</p>
            <p className="attach-sub-text">Any file type accepted · Max 10MB per file</p>
          </Dragger>

        </div>

      </div>
    </div>
  );
}