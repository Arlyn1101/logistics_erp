import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import { createCustomer } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateCustomer } from "../../Helpers/Validation/Manage/customerValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import { Upload } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import "antd/dist/reset.css";
import "../Manage/Manage.css";
import "../Manage/AddCustomer.css";
import "../../Components/Modals/Modal.css";
import "../../Components/Navbar/Navbar.css";

const { Dragger } = Upload;

export default function AddCustomer() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);

  const empty_contact = {
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    number: "",
    role: "",
    other_role: "",
    email: "",
  };

  const empty_form = {
    trade_name: '', 
    bir_name: '', 
    business_type: '',
    tin: '', 
    email: '',
    bir_region: '', bir_province: '', bir_city: '',
    bir_barangay: '', bir_street: '',
    trade_region: '', trade_province: '', trade_city: '',
    trade_barangay: '', trade_street: '',
    same_as_bir: false,         
    term: '', 
    credit_limit: '',
    vat_type: '', 
    bir_2307: '',
    contacts: [{ ...empty_contact }],

    signatory: {
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      number: "",
      email: "",
      position: "",
      role: "Authorized Signatory", 
    },

    contacts: [],
  };

  const [form, set_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    first_name: false,
    last_name: false,
    contact_email: false,
    contact_number: false,
    contact_role: false,
    tin_duplicate: false,
  });
  const [attachments, set_attachments] = useState([]);

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  async function handle_tin_blur(tin_value) {
    if (!tin_value.trim()) {
      set_is_error((prev) => ({ ...prev, tin_duplicate: false }));
      return;
    }
    // fetch all customers and check for duplicate TIN
    const { getAllCustomers } = await import("../../Helpers/apiCalls/Manage/customerApi");
    const response = await getAllCustomers();
    if (response.data && response.data.data) {
      const existing = response.data.data.find(
        (c) => c.tin && c.tin.trim() === tin_value.trim()
      );
      set_is_error((prev) => ({ ...prev, tin_duplicate: !!existing }));
      if (existing) {
        toast.error("A customer with this TIN already exists.", { style: toastStyle() });
      }
    }
  }

  const CONTACT_ROLES = ["Accounting", "Admin", "Purchasing", "HR", "Others"];

  const handle_contact_change = (index, field, value) => {
    set_form((prev) => {
      const updated = [...prev.contacts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contacts: updated };
    });
  };

  const add_contact = () => {
    set_form((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { ...empty_contact }],
    }));
  };

  const remove_contact = (index) => {
    set_form((prev) => {
      const updated = prev.contacts.filter((_, i) => i !== index);
      return { ...prev, contacts: updated.length ? updated : [{ ...empty_contact }] };
    });
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
    if (is_error.tin_duplicate) return;
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

  const [psgc, set_psgc] = useState({
  regions: [], bir_provinces: [], bir_cities: [], bir_barangays: [],
  trade_provinces: [], trade_cities: [], trade_barangays: [],
});

// Load regions once on mount
useEffect(() => {
  fetch('https://psgc.gitlab.io/api/regions/')
    .then(r => r.json())
    .then(data => set_psgc(p => ({ ...p, regions: data })))
    .catch(() => {});
}, []);

  const load_provinces = async (region_code, prefix) => {
    const r = await fetch(`https://psgc.gitlab.io/api/regions/${region_code}/provinces/`);
    const data = await r.json();
    set_psgc(p => ({ ...p, [`${prefix}_provinces`]: data, [`${prefix}_cities`]: [], [`${prefix}_barangays`]: [] }));
  };

  const load_cities = async (province_code, prefix) => {
    const r = await fetch(`https://psgc.gitlab.io/api/provinces/${province_code}/cities-municipalities/`);
    const data = await r.json();
    set_psgc(p => ({ ...p, [`${prefix}_cities`]: data, [`${prefix}_barangays`]: [] }));
  };

  const load_barangays = async (city_code, prefix) => {
    const r = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${city_code}/barangays/`);
    const data = await r.json();
    set_psgc(p => ({ ...p, [`${prefix}_barangays`]: data }));
  };

  const handle_same_as_bir = (checked) => {
    set_form(prev => ({
      ...prev,
      same_as_bir:     checked,
      trade_region:    checked ? prev.bir_region    : '',
      trade_province:  checked ? prev.bir_province  : '',
      trade_city:      checked ? prev.bir_city      : '',
      trade_barangay:  checked ? prev.bir_barangay  : '',
      trade_street:    checked ? prev.bir_street    : '',
    }));
    if (checked) {
      // mirror the already-loaded province/city/barangay lists
      set_psgc(p => ({
        ...p,
        trade_provinces: p.bir_provinces,
        trade_cities:    p.bir_cities,
        trade_barangays: p.bir_barangays,
      }));
    }
  };

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
                <Form.Control type="text" name="trade_name" value={form.trade_name}
                  className="nc-modal-custom-input" onChange={handle_change} placeholder="Trade name" />
              </Col>
              <Col>
                <div className="field-label">BIR REGISTERED NAME</div>
                <Form.Control type="text" name="bir_name" value={form.bir_name}
                  className="nc-modal-custom-input" onChange={handle_change} placeholder="BIR registered name" />
              </Col>
              <Col>
                <div className="field-label">BUSINESS TYPE</div>
                <Form.Control as="select" name="business_type" value={form.business_type}
                  className="nc-modal-custom-input" onChange={handle_change}>
                  <option value="">Select type</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                </Form.Control>
              </Col>
              <Col>
                <div className="field-label">TIN</div>
                <Form.Control type="text" name="tin" value={form.tin}
                  className="nc-modal-custom-input"
                  onChange={(e) => { handle_change(e); set_is_error(p => ({ ...p, tin_duplicate: false })); }}
                  onBlur={(e) => handle_tin_blur(e.target.value)}
                  placeholder="000-000-000-000" />
                <InputError isValid={is_error.tin_duplicate} message="A customer with this TIN already exists" />
              </Col>
              <Col>
                <div className="field-label">COMPANY EMAIL</div>
                <Form.Control type="email" name="email" value={form.email}
                  className="nc-modal-custom-input" onChange={handle_change}
                  placeholder="e.g. email@example.com" />
              </Col>
            </Row>

            {/* ── Authorized Contract Signatory Section ── */}
            <div className="biodata-section-label mt-4">Authorized Contract Signatory</div>
            <p className="text-muted" style={{ fontSize: 12, marginTop: -4, marginBottom: 12 }}>
              The individual legally authorized to sign corporate agreements (e.g., Owner, CEO, Managing Director).
            </p>

            <Row className="nc-modal-custom-row">
              <Col xs={3}>
                <div className="field-label">FIRST NAME <span className="required-icon">*</span></div>
                <Form.Control
                  type="text"
                  value={form.signatory.first_name}
                  className="nc-modal-custom-input"
                  placeholder="First name"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, first_name: e.target.value }
                  }))}
                />
              </Col>
              <Col xs={3}>
                <div className="field-label">MIDDLE NAME</div>
                <Form.Control
                  type="text"
                  value={form.signatory.middle_name}
                  className="nc-modal-custom-input"
                  placeholder="Middle name"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, middle_name: e.target.value }
                  }))}
                />
              </Col>
              <Col xs={3}>
                <div className="field-label">LAST NAME <span className="required-icon">*</span></div>
                <Form.Control
                  type="text"
                  value={form.signatory.last_name}
                  className="nc-modal-custom-input"
                  placeholder="Last name"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, last_name: e.target.value }
                  }))}
                />
              </Col>
              <Col xs={3}>
                <div className="field-label">SUFFIX</div>
                <Form.Control
                  type="text"
                  value={form.signatory.suffix}
                  className="nc-modal-custom-input"
                  placeholder="e.g. Jr., III"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, suffix: e.target.value }
                  }))}
                />
              </Col>
            </Row>

            <Row className="nc-modal-custom-row mt-2">
              <Col xs={4}>
                <div className="field-label">JOB TITLE / POSITION <span className="required-icon">*</span></div>
                <Form.Control
                  type="text"
                  value={form.signatory.position}
                  className="nc-modal-custom-input"
                  placeholder="e.g., Chief Executive Officer"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, position: e.target.value }
                  }))}
                />
              </Col>
              <Col xs={4}>
                <div className="field-label">CONTACT NUMBER <span className="required-icon">*</span></div>
                <Form.Control
                  type="text"
                  value={form.signatory.number}
                  className="nc-modal-custom-input"
                  placeholder="09XX-XXX-XXXX"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, number: e.target.value }
                  }))}
                />
              </Col>
              <Col xs={4}>
                <div className="field-label">EMAIL ADDRESS <span className="required-icon">*</span></div>
                <Form.Control
                  type="email"
                  value={form.signatory.email}
                  className="nc-modal-custom-input"
                  placeholder="email@example.com"
                  onChange={(e) => set_form(prev => ({
                    ...prev,
                    signatory: { ...prev.signatory, email: e.target.value }
                  }))}
                />
              </Col>
            </Row>

            {/* ── Address ── */}
            <div className="biodata-section-label">Address</div>

            {/* BIR Address */}
            <div className="address-block-label">BIR Registered Address</div>
            <Row className="nc-modal-custom-row">
              <Col xs={3}>
                <div className="field-label">REGION</div>
                <Form.Control as="select" name="bir_region" value={form.bir_region}
                  className="nc-modal-custom-input"
                  onChange={(e) => {
                    handle_change(e);
                    load_provinces(e.target.value, 'bir');
                    set_form(p => ({ ...p, bir_province: '', bir_city: '', bir_barangay: '' }));
                  }}>
                  <option value="">Select Region</option>
                  {psgc.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                </Form.Control>
              </Col>
              <Col xs={3}>
                <div className="field-label">PROVINCE</div>
                <Form.Control as="select" name="bir_province" value={form.bir_province}
                  className="nc-modal-custom-input"
                  onChange={(e) => {
                    handle_change(e);
                    load_cities(e.target.value, 'bir');
                    set_form(p => ({ ...p, bir_city: '', bir_barangay: '' }));
                  }}>
                  <option value="">Select Province</option>
                  {psgc.bir_provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </Form.Control>
              </Col>
              <Col xs={3}>
                <div className="field-label">CITY / MUNICIPALITY</div>
                <Form.Control as="select" name="bir_city" value={form.bir_city}
                  className="nc-modal-custom-input"
                  onChange={(e) => {
                    handle_change(e);
                    load_barangays(e.target.value, 'bir');
                    set_form(p => ({ ...p, bir_barangay: '' }));
                  }}>
                  <option value="">Select City</option>
                  {psgc.bir_cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Form.Control>
              </Col>
              <Col xs={3}>
                <div className="field-label">BARANGAY</div>
                <Form.Control as="select" name="bir_barangay" value={form.bir_barangay}
                  className="nc-modal-custom-input" onChange={handle_change}>
                  <option value="">Select Barangay</option>
                  {psgc.bir_barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </Form.Control>
              </Col>
            </Row>
            <Row className="nc-modal-custom-row mt-1">
              <Col>
                <div className="field-label">STREET / UNIT / BUILDING</div>
                <Form.Control type="text" name="bir_street" value={form.bir_street}
                  className="nc-modal-custom-input" onChange={handle_change}
                  placeholder="e.g. Unit 4B, 123 Rizal St., Brgy. San Jose" />
              </Col>
            </Row>

            {/* Trade Address */}
            <div className="address-block-label mt-3" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              Trade Address
              <label style={{ fontSize: 12, fontWeight: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={form.same_as_bir}
                  onChange={(e) => handle_same_as_bir(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Same as BIR Address
              </label>
            </div>
            <Row className="nc-modal-custom-row">
              <Col xs={3}>
                <div className="field-label">REGION</div>
                <Form.Control as="select" name="trade_region" value={form.trade_region}
                  className="nc-modal-custom-input"
                  disabled={form.same_as_bir}
                  onChange={(e) => {
                    handle_change(e);
                    load_provinces(e.target.value, 'trade');
                    set_form(p => ({ ...p, trade_province: '', trade_city: '', trade_barangay: '' }));
                  }}>
                  <option value="">Select Region</option>
                  {psgc.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                </Form.Control>
              </Col>
              <Col xs={3}>
                <div className="field-label">PROVINCE</div>
                <Form.Control as="select" name="trade_province" value={form.trade_province}
                  className="nc-modal-custom-input"
                  disabled={form.same_as_bir}
                  onChange={(e) => {
                    handle_change(e);
                    load_cities(e.target.value, 'trade');
                    set_form(p => ({ ...p, trade_city: '', trade_barangay: '' }));
                  }}>
                  <option value="">Select Province</option>
                  {psgc.trade_provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </Form.Control>
              </Col>
              <Col xs={3}>
                <div className="field-label">CITY / MUNICIPALITY</div>
                <Form.Control as="select" name="trade_city" value={form.trade_city}
                  className="nc-modal-custom-input"
                  disabled={form.same_as_bir}
                  onChange={(e) => {
                    handle_change(e);
                    load_barangays(e.target.value, 'trade');
                    set_form(p => ({ ...p, trade_barangay: '' }));
                  }}>
                  <option value="">Select City</option>
                  {psgc.trade_cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Form.Control>
              </Col>
              <Col xs={3}>
                <div className="field-label">BARANGAY</div>
                <Form.Control as="select" name="trade_barangay" value={form.trade_barangay}
                  className="nc-modal-custom-input"
                  disabled={form.same_as_bir}
                  onChange={handle_change}>
                  <option value="">Select Barangay</option>
                  {psgc.trade_barangays.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </Form.Control>
              </Col>
            </Row>
            <Row className="nc-modal-custom-row mt-1">
              <Col>
                <div className="field-label">STREET / UNIT / BUILDING</div>
                <Form.Control type="text" name="trade_street" value={form.trade_street}
                  className="nc-modal-custom-input"
                  disabled={form.same_as_bir}
                  onChange={handle_change}
                  placeholder="e.g. Unit 4B, 123 Rizal St., Brgy. San Jose" />
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
        
          {/* ── Contact Details ── */}
          <div
            className="d-flex justify-content-between align-items-center mt-4"
            style={{ marginBottom: 8 }}
          >
            <div className="biodata-section-label mb-0">Contact Details</div>
            <button className="add-btn" onClick={add_contact}>
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add Contact
            </button>
          </div>

          {form.contacts.map((contact, index) => (
            <div key={index} className="contact-entry mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#2d3e4e" }}>
                  Contact {index + 1}
                </span>
                {form.contacts.length > 1 && (
                  <button
                    className="button-warning"
                    style={{ width: "auto", padding: "2px 10px", fontSize: 12 }}
                    onClick={() => remove_contact(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>

              {/* Row 1: Name */}
              <Row className="nc-modal-custom-row">
                <Col xs={3}>
                  <div className="field-label">FIRST NAME <span className="required-icon">*</span></div>
                  <Form.Control
                    type="text"
                    value={contact.first_name}
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "first_name", e.target.value)}
                    placeholder="First name"
                  />
                  {index === 0 && <InputError isValid={is_error.first_name} message="First name is required" />}
                </Col>
                <Col xs={3}>
                  <div className="field-label">MIDDLE NAME</div>
                  <Form.Control
                    type="text"
                    value={contact.middle_name}
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "middle_name", e.target.value)}
                    placeholder="Middle name"
                  />
                </Col>
                <Col xs={3}>
                  <div className="field-label">LAST NAME <span className="required-icon">*</span></div>
                  <Form.Control
                    type="text"
                    value={contact.last_name}
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "last_name", e.target.value)}
                    placeholder="Last name"
                  />
                  {index === 0 && <InputError isValid={is_error.last_name} message="Last name is required" />}
                </Col>
                <Col xs={3}>
                  <div className="field-label">SUFFIX</div>
                  <Form.Control
                    type="text"
                    value={contact.suffix}
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "suffix", e.target.value)}
                    placeholder="e.g. Jr., Sr."
                  />
                </Col>
              </Row>

              {/* Row 2: Email, Number, Role */}
              <Row className="nc-modal-custom-row mt-2">
                <Col xs={4}>
                  <div className="field-label">EMAIL <span className="required-icon">*</span></div>
                  <Form.Control
                    type="email"
                    value={contact.email}
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "email", e.target.value)}
                    placeholder="email@example.com"
                  />
                  {index === 0 && <InputError isValid={is_error.contact_email} message="Email is required" />}
                </Col>
                <Col xs={4}>
                  <div className="field-label">CONTACT NUMBER <span className="required-icon">*</span></div>
                  <Form.Control
                    type="text"
                    value={contact.number}
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "number", e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                  />
                  {index === 0 && <InputError isValid={is_error.contact_number} message="Contact number is required" />}
                </Col>
                <Col xs={4}>
                  <div className="field-label">ROLE <span className="required-icon">*</span></div>
                  <Form.Control
                    as="select"
                    value={
                      contact.role === "Others" ||
                      (contact.role !== "" && !CONTACT_ROLES.includes(contact.role))
                        ? "Others"
                        : contact.role
                    }
                    className="nc-modal-custom-input"
                    onChange={(e) => handle_contact_change(index, "role", e.target.value)}
                  >
                    <option value="">Select Role</option>
                    {CONTACT_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Form.Control>
                  {contact.role === "Others" && (
                    <Form.Control
                      type="text"
                      value={contact.other_role || ""}
                      className="nc-modal-custom-input mt-1"
                      placeholder="Please specify"
                      onChange={(e) => handle_contact_change(index, "other_role", e.target.value)}
                    />
                  )}
                  {index === 0 && <InputError isValid={is_error.contact_role} message="Role is required" />}
                </Col>
              </Row>

            </div>
          ))}

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