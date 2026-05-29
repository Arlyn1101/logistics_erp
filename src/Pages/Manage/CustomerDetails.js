import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import { 
  getCustomerDetails, 
  updateCustomer, 
  getCustomerAttachments, 
  downloadCustomerAttachment, 
  deleteCustomerAttachment 
} from "../../Helpers/apiCalls/Manage/customerApi";
import { validateCustomer } from "../../Helpers/Validation/Manage/customerValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import { Upload } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faDownload, faEye } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../Helpers/apiCalls/axiosMethodCalls";
import "antd/dist/reset.css";
import "../Manage/AddCustomer.css";
import "../Manage/CustomerDetails.css";
import "../../Components/Navbar/Navbar.css";

const { Dragger } = Upload;

const CONTACT_ROLES = ["Accounting", "Admin", "Purchasing", "HR", "Others"];

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
  trade_name: "",
  bir_name: "",
  business_type: "",
  tin: "",
  email: "",
  bir_region: "",
  bir_province: "",
  bir_city: "",
  bir_barangay: "",
  bir_street: "",
  trade_region: "",
  trade_province: "",
  trade_city: "",
  trade_barangay: "",
  trade_street: "",
  same_as_bir: false,
  term: "",
  credit_limit: "",
  vat_type: "",
  bir_2307: "",
  contacts: [{ ...empty_contact }],
};

function ReadValue({ value, placeholder = "—" }) {
  return (
    <div className="detail-value">
      {value ? value : <span className="detail-empty">{placeholder}</span>}
    </div>
  );
}

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inactive, set_inactive] = useState(false);
  const [is_edit_mode, set_is_edit_mode] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [is_loading, set_is_loading] = useState(true);
  const [form, set_form] = useState({ ...empty_form });
  const [original_form, set_original_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    first_name: false,
    last_name: false,
    contact_email: false,
    contact_number: false,
    contact_role: false,
  });
  const [saved_attachments, set_saved_attachments] = useState([]);
  const [attachments, set_attachments] = useState([]);

  // ── PSGC state ──
  const [psgc, set_psgc] = useState({
    regions: [],
    bir_provinces: [], bir_cities: [], bir_barangays: [],
    trade_provinces: [], trade_cities: [], trade_barangays: [],
  });

  // Load regions once
  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/regions/")
      .then((r) => r.json())
      .then((data) => set_psgc((p) => ({ ...p, regions: data })))
      .catch(() => {});
  }, []);

  async function fetch_attachments() {
    const response = await getCustomerAttachments(id);
    if (response.data && response.data.data) {
      set_saved_attachments(response.data.data);
    } else {
      set_saved_attachments([]);
    }
  }

  // Load customer
  useEffect(() => {
    async function fetch_customer() {
      set_is_loading(true);
      const response = await getCustomerDetails(id);
      if (response.data && response.data.data) {
        const data = response.data.data;
        const raw_contacts = data.contacts ?? [];

        const raw_signatory = raw_contacts.find((c) => c.role === "Authorized Signatory");
        const raw_general_contacts = raw_contacts.filter((c) => c.role !== "Authorized Signatory");

        const mapped = {
          ...empty_form,
          ...data,
          same_as_bir: false,

          signatory: raw_signatory ? {
            first_name:  raw_signatory.first_name   ?? "",
            middle_name: raw_signatory.middle_name  ?? "",
            last_name:   raw_signatory.last_name    ?? "",
            suffix:      raw_signatory.suffix       ?? "",
            position:    raw_signatory.position     ?? "",
            number:      raw_signatory.contact_number ?? "",
            email:       raw_signatory.email        ?? "",
            role:        "Authorized Signatory",
          } : { ...empty_form.signatory },

          contacts: raw_general_contacts.map((c) => ({
            first_name:  c.first_name      ?? "",
            middle_name: c.middle_name     ?? "",
            last_name:   c.last_name       ?? "",
            suffix:      c.suffix          ?? "",
            number:      c.contact_number  ?? "",
            email:       c.email           ?? "",
            role:        CONTACT_ROLES.includes(c.role) ? c.role : (c.role ? "Others" : ""),
            other_role:  CONTACT_ROLES.includes(c.role) ? "" : (c.role ?? ""),
          })),
        };

        if (!mapped.contacts.length) mapped.contacts = [{ ...empty_contact }];

        set_form(mapped);
        set_original_form(mapped);

        if (data.bir_region)   load_provinces(data.bir_region,   "bir",   true);
        if (data.bir_province) load_cities(data.bir_province,    "bir",   true);
        if (data.bir_city)     { load_barangays(data.bir_city,     "bir",   true); }
        if (data.trade_region)   load_provinces(data.trade_region,   "trade", true);
        if (data.trade_province) load_cities(data.trade_province,    "trade", true);
        if (data.trade_city)     { load_barangays(data.trade_city,     "trade", true); }
      } else {
        toast.error("Failed to load customer details.", { style: toastStyle() });
        navigate("/customers");
      }
      set_is_loading(false);
    }
    fetch_customer();
    fetch_attachments();
  }, [id]);

  // ── PSGC loaders ──
  // silent=true means don't reset downstream (used on initial load)
  const load_provinces = async (region_code, prefix, silent = false) => {
    const r = await fetch(`https://psgc.gitlab.io/api/regions/${region_code}/provinces/`);
    const data = await r.json();
    set_psgc((p) => ({
      ...p,
      [`${prefix}_provinces`]: data,
      ...(silent ? {} : { [`${prefix}_cities`]: [], [`${prefix}_barangays`]: [] }),
    }));
  };

  const load_cities = async (province_code, prefix, silent = false) => {
    const r = await fetch(`https://psgc.gitlab.io/api/provinces/${province_code}/cities-municipalities/`);
    const data = await r.json();
    set_psgc((p) => ({
      ...p,
      [`${prefix}_cities`]: data,
      ...(silent ? {} : { [`${prefix}_barangays`]: [] }),
    }));
  };

  const load_barangays = async (city_code, prefix) => {
    const r = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${city_code}/barangays/`);
    const data = await r.json();
    set_psgc((p) => ({ ...p, [`${prefix}_barangays`]: data }));
  };

  // ── Handlers ──
  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_same_as_bir = (checked) => {
    set_form((prev) => ({
      ...prev,
      same_as_bir:    checked,
      trade_region:   checked ? prev.bir_region   : "",
      trade_province: checked ? prev.bir_province : "",
      trade_city:     checked ? prev.bir_city     : "",
      trade_barangay: checked ? prev.bir_barangay : "",
      trade_street:   checked ? prev.bir_street   : "",
    }));
    if (checked) {
      set_psgc((p) => ({
        ...p,
        trade_provinces: p.bir_provinces,
        trade_cities:    p.bir_cities,
        trade_barangays: p.bir_barangays,
      }));
    }
  };

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
      const ok = file.size / 1024 / 1024 < 10;
      if (!ok) {
        toast.error(`${file.name} exceeds the 10MB limit.`, { style: toastStyle() });
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList }) => set_attachments(fileList),
  };

  function handle_cancel_edit() {
    set_form({ ...original_form });
    set_is_error({ first_name: false, last_name: false, contact_email: false, contact_number: false, contact_role: false });
    set_attachments([]);
    set_is_edit_mode(false);
  }

  async function handle_save() {
    if (validateCustomer(form, set_is_error)) {
      set_is_clicked(true);

      const formatted_signatory = {
        ...form.signatory,
        contact_number: form.signatory.number,
      };

      const formatted_general_contacts = (form.contacts || []).map(c => ({
        ...c,
        contact_number: c.number,
      }));

      const combined_contacts = [
        formatted_signatory,
        ...formatted_general_contacts
      ];

      const payload = {
        ...form,
        id: id, 
        contacts: combined_contacts 
      };

      const response = await updateCustomer(payload, attachments);

      if (response.data && response.data.response) {
        toast.success("Customer updated successfully!", { style: toastStyle() });
        set_original_form({ ...form });
        set_attachments([]);
        fetch_attachments();
        set_is_edit_mode(false);
      } else {
        toast.error("Failed to update customer.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  function resolve_name(list, code) {
    if (!code) return "";
    const found = list.find((i) => i.code === code);
    return found ? found.name : code;
  }

  function format_address(prefix) {
    const parts = [
      resolve_name(psgc[`${prefix}_barangays`], form[`${prefix}_barangay`]),
      form[`${prefix}_street`],
      resolve_name(psgc[`${prefix}_cities`],    form[`${prefix}_city`]),
      resolve_name(psgc[`${prefix}_provinces`], form[`${prefix}_province`]),
      resolve_name(psgc.regions,                form[`${prefix}_region`]),
    ].filter(Boolean);
    return parts.join(", ");
  }

  const full_name = [form.first_name, form.last_name].filter(Boolean).join(" ");

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
            {form.trade_name || full_name || "Customer Details"}
          </span>
        </div>

        {/* Header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">{form.trade_name || full_name || "Customer Details"}</h1>
            <p className="page-subtitle">
              {is_edit_mode ? "Edit the customer details below" : "Viewing customer information"}
            </p>
          </div>
          <div className="add-customer-actions">
            {is_edit_mode ? (
              <>
                <button className="cancel-btn" onClick={handle_cancel_edit} disabled={is_clicked}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handle_save} disabled={is_clicked}>
                  {is_clicked ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => set_is_edit_mode(true)}>
                ✏ Edit Customer
              </button>
            )}
          </div>
        </div>

        <div className="biodata-card">

          {/* ── Company Information ── */}
          <div className="biodata-section-label">Company Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TRADE NAME</div>
              {is_edit_mode ? (
                <Form.Control type="text" name="trade_name" value={form.trade_name}
                  className="nc-modal-custom-input" onChange={handle_change} placeholder="Trade name" />
              ) : <ReadValue value={form.trade_name} />}
            </Col>
            <Col>
              <div className="field-label">BIR REGISTERED NAME</div>
              {is_edit_mode ? (
                <Form.Control type="text" name="bir_name" value={form.bir_name}
                  className="nc-modal-custom-input" onChange={handle_change} placeholder="BIR registered name" />
              ) : <ReadValue value={form.bir_name} />}
            </Col>
            <Col>
              <div className="field-label">BUSINESS TYPE</div>
              {is_edit_mode ? (
                <Form.Control as="select" name="business_type" value={form.business_type}
                  className="nc-modal-custom-input" onChange={handle_change}>
                  <option value="">Select type</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                </Form.Control>
              ) : <ReadValue value={form.business_type} />}
            </Col>
            <Col>
              <div className="field-label">TIN</div>
              {is_edit_mode ? (
                <Form.Control type="text" name="tin" value={form.tin}
                  className="nc-modal-custom-input" onChange={handle_change} placeholder="000-000-000-000" />
              ) : <ReadValue value={form.tin} />}
            </Col>
            <Col>
              <div className="field-label">COMPANY EMAIL</div>
              {is_edit_mode ? (
                <Form.Control type="email" name="email" value={form.email}
                  className="nc-modal-custom-input" onChange={handle_change} placeholder="e.g. email@example.com" />
              ) : <ReadValue value={form.email} />}
            </Col>
          </Row>

          {/* ── Authorized Contract Signatory Section ── */}
          <div className="biodata-section-label mt-4">Authorized Contract Signatory</div>
          <p className="text-muted" style={{ fontSize: 12, marginTop: -4, marginBottom: 12 }}>
            The individual legally authorized to sign corporate agreements (e.g., Owner, CEO, Managing Director).
          </p>

          {is_edit_mode ? (
            <>
              <Row className="nc-modal-custom-row">
                <Col xs={3}>
                  <div className="field-label">FIRST NAME <span className="required-icon">*</span></div>
                  <Form.Control
                    type="text"
                    value={form.signatory?.first_name || ""}
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
                    value={form.signatory?.middle_name || ""}
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
                    value={form.signatory?.last_name || ""}
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
                    value={form.signatory?.suffix || ""}
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
                    value={form.signatory?.position || ""}
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
                    value={form.signatory?.number || ""}
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
                    value={form.signatory?.email || ""}
                    className="nc-modal-custom-input"
                    placeholder="email@example.com"
                    onChange={(e) => set_form(prev => ({
                      ...prev,
                      signatory: { ...prev.signatory, email: e.target.value }
                    }))}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <Row className="nc-modal-custom-row">
              <Col xs={4}>
                <div className="field-label">FULL NAME</div>
                <ReadValue value={
                  [form.signatory?.first_name, form.signatory?.middle_name, form.signatory?.last_name]
                    .filter(Boolean)
                    .join(" ") + (form.signatory?.suffix ? `, ${form.signatory.suffix}` : "")
                } />
              </Col>
              <Col xs={4}>
                <div className="field-label">POSITION / JOB TITLE</div>
                <ReadValue value={form.signatory?.position} />
              </Col>
              <Col xs={2}>
                <div className="field-label">CONTACT NUMBER</div>
                <ReadValue value={form.signatory?.number} />
              </Col>
              <Col xs={2}>
                <div className="field-label">EMAIL ADDRESS</div>
                <ReadValue value={form.signatory?.email} />
              </Col>
            </Row>
          )}

          {/* ── Address ── */}
          <div className="biodata-section-label">Address</div>

          {/* BIR Address */}
          <div className="address-block-label">BIR Registered Address</div>
          {is_edit_mode ? (
            <>
              <Row className="nc-modal-custom-row">
                <Col xs={3}>
                  <div className="field-label">REGION</div>
                  <Form.Control as="select" name="bir_region" value={form.bir_region}
                    className="nc-modal-custom-input"
                    onChange={(e) => {
                      handle_change(e);
                      load_provinces(e.target.value, "bir");
                      set_form((p) => ({ ...p, bir_province: "", bir_city: "", bir_barangay: "" }));
                    }}>
                    <option value="">Select Region</option>
                    {psgc.regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                  </Form.Control>
                </Col>
                <Col xs={3}>
                  <div className="field-label">PROVINCE</div>
                  <Form.Control as="select" name="bir_province" value={form.bir_province}
                    className="nc-modal-custom-input"
                    onChange={(e) => {
                      handle_change(e);
                      load_cities(e.target.value, "bir");
                      set_form((p) => ({ ...p, bir_city: "", bir_barangay: "" }));
                    }}>
                    <option value="">Select Province</option>
                    {psgc.bir_provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </Form.Control>
                </Col>
                <Col xs={3}>
                  <div className="field-label">CITY / MUNICIPALITY</div>
                  <Form.Control as="select" name="bir_city" value={form.bir_city}
                    className="nc-modal-custom-input"
                    onChange={(e) => {
                      handle_change(e);
                      load_barangays(e.target.value, "bir");
                      set_form((p) => ({ ...p, bir_barangay: "" }));
                    }}>
                    <option value="">Select City</option>
                    {psgc.bir_cities.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </Form.Control>
                </Col>
                <Col xs={3}>
                  <div className="field-label">BARANGAY</div>
                  <Form.Control as="select" name="bir_barangay" value={form.bir_barangay}
                    className="nc-modal-custom-input" onChange={handle_change}>
                    <option value="">Select Barangay</option>
                    {psgc.bir_barangays.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                  </Form.Control>
                </Col>
              </Row>
              <Row className="nc-modal-custom-row mt-1">
                <Col>
                  <div className="field-label">STREET / UNIT / BUILDING</div>
                  <Form.Control type="text" name="bir_street" value={form.bir_street}
                    className="nc-modal-custom-input" onChange={handle_change}
                    placeholder="e.g. Unit 4B, 123 Rizal St." />
                </Col>
              </Row>
            </>
          ) : (
            <ReadValue value={format_address("bir")} />
          )}

          {/* Trade Address */}
          <div className="address-block-label mt-3"
            style={{ display: "flex", alignItems: "center", gap: 12 }}>
            Trade Address
            {is_edit_mode && (
              <label style={{ fontSize: 12, fontWeight: 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={form.same_as_bir}
                  onChange={(e) => handle_same_as_bir(e.target.checked)}
                  style={{ cursor: "pointer" }} />
                Same as BIR Address
              </label>
            )}
          </div>
          {is_edit_mode ? (
            <>
              <Row className="nc-modal-custom-row">
                <Col xs={3}>
                  <div className="field-label">REGION</div>
                  <Form.Control as="select" name="trade_region" value={form.trade_region}
                    className="nc-modal-custom-input" disabled={form.same_as_bir}
                    onChange={(e) => {
                      handle_change(e);
                      load_provinces(e.target.value, "trade");
                      set_form((p) => ({ ...p, trade_province: "", trade_city: "", trade_barangay: "" }));
                    }}>
                    <option value="">Select Region</option>
                    {psgc.regions.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                  </Form.Control>
                </Col>
                <Col xs={3}>
                  <div className="field-label">PROVINCE</div>
                  <Form.Control as="select" name="trade_province" value={form.trade_province}
                    className="nc-modal-custom-input" disabled={form.same_as_bir}
                    onChange={(e) => {
                      handle_change(e);
                      load_cities(e.target.value, "trade");
                      set_form((p) => ({ ...p, trade_city: "", trade_barangay: "" }));
                    }}>
                    <option value="">Select Province</option>
                    {psgc.trade_provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </Form.Control>
                </Col>
                <Col xs={3}>
                  <div className="field-label">CITY / MUNICIPALITY</div>
                  <Form.Control as="select" name="trade_city" value={form.trade_city}
                    className="nc-modal-custom-input" disabled={form.same_as_bir}
                    onChange={(e) => {
                      handle_change(e);
                      load_barangays(e.target.value, "trade");
                      set_form((p) => ({ ...p, trade_barangay: "" }));
                    }}>
                    <option value="">Select City</option>
                    {psgc.trade_cities.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </Form.Control>
                </Col>
                <Col xs={3}>
                  <div className="field-label">BARANGAY</div>
                  <Form.Control as="select" name="trade_barangay" value={form.trade_barangay}
                    className="nc-modal-custom-input" disabled={form.same_as_bir}
                    onChange={handle_change}>
                    <option value="">Select Barangay</option>
                    {psgc.trade_barangays.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                  </Form.Control>
                </Col>
              </Row>
              <Row className="nc-modal-custom-row mt-1">
                <Col>
                  <div className="field-label">STREET / UNIT / BUILDING</div>
                  <Form.Control type="text" name="trade_street" value={form.trade_street}
                    className="nc-modal-custom-input" disabled={form.same_as_bir}
                    onChange={handle_change} placeholder="e.g. Unit 4B, 123 Rizal St." />
                </Col>
              </Row>
            </>
          ) : (
            <ReadValue value={format_address("trade")} />
          )}

          {/* ── Terms and Tax ── */}
          <div className="biodata-section-label">Terms and Tax</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">TERM (DAYS)</div>
              {is_edit_mode ? (
                <Form.Control type="number" name="term" value={form.term}
                  className="nc-modal-custom-input" onChange={handle_change}
                  placeholder="e.g. 30" min={0} />
              ) : <ReadValue value={form.term ? `${form.term} days` : ""} />}
            </Col>
            <Col>
              <div className="field-label">CREDIT LIMIT</div>
              {is_edit_mode ? (
                <Form.Control type="number" name="credit_limit" value={form.credit_limit}
                  className="nc-modal-custom-input" onChange={handle_change}
                  placeholder="0.00" min={0} />
              ) : <ReadValue value={form.credit_limit} />}
            </Col>
            <Col>
              <div className="field-label">VAT TYPE</div>
              {is_edit_mode ? (
                <div className="bir-option-group">
                  {["VAT", "NVAT"].map((v) => (
                    <label key={v} className={`bir-option ${form.vat_type === v ? "selected" : ""}`}>
                      <input type="radio" name="vat_type" value={v}
                        checked={form.vat_type === v} onChange={handle_change} />
                      {v}
                    </label>
                  ))}
                </div>
              ) : <ReadValue value={form.vat_type} />}
            </Col>
            <Col>
              <div className="field-label">BIR 2307</div>
              {is_edit_mode ? (
                <div className="bir-option-group">
                  {["1%", "2%"].map((v) => (
                    <label key={v} className={`bir-option ${form.bir_2307 === v ? "selected" : ""}`}>
                      <input type="radio" name="bir_2307" value={v}
                        checked={form.bir_2307 === v} onChange={handle_change} />
                      {v}
                    </label>
                  ))}
                </div>
              ) : <ReadValue value={form.bir_2307} />}
            </Col>
          </Row>

          {/* ── Contact Details ── */}
          <div className="d-flex justify-content-between align-items-center mt-4" style={{ marginBottom: 8 }}>
            <div className="biodata-section-label mb-0">Contact Details</div>
            {is_edit_mode && (
              <button className="add-btn" onClick={add_contact}>
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Add Contact
              </button>
            )}
          </div>

          {form.contacts.map((contact, index) => (
            <div key={index} className="contact-entry mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#2d3e4e" }}>
                  Contact {index + 1}
                </span>
                {is_edit_mode && form.contacts.length > 1 && (
                  <button className="button-warning"
                    style={{ width: "auto", padding: "2px 10px", fontSize: 12 }}
                    onClick={() => remove_contact(index)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>

              {/* Row 1: Name */}
              <Row className="nc-modal-custom-row">
                <Col xs={3}>
                  <div className="field-label">FIRST NAME {is_edit_mode && <span className="required-icon">*</span>}</div>
                  {is_edit_mode ? (
                    <Form.Control type="text" value={contact.first_name} className="nc-modal-custom-input"
                      onChange={(e) => handle_contact_change(index, "first_name", e.target.value)}
                      placeholder="First name" />
                  ) : <ReadValue value={contact.first_name} />}
                  {index === 0 && <InputError isValid={is_error.first_name} message="First name is required" />}
                </Col>
                <Col xs={3}>
                  <div className="field-label">MIDDLE NAME</div>
                  {is_edit_mode ? (
                    <Form.Control type="text" value={contact.middle_name} className="nc-modal-custom-input"
                      onChange={(e) => handle_contact_change(index, "middle_name", e.target.value)}
                      placeholder="Middle name" />
                  ) : <ReadValue value={contact.middle_name} />}
                </Col>
                <Col xs={3}>
                  <div className="field-label">LAST NAME {is_edit_mode && <span className="required-icon">*</span>}</div>
                  {is_edit_mode ? (
                    <Form.Control type="text" value={contact.last_name} className="nc-modal-custom-input"
                      onChange={(e) => handle_contact_change(index, "last_name", e.target.value)}
                      placeholder="Last name" />
                  ) : <ReadValue value={contact.last_name} />}
                  {index === 0 && <InputError isValid={is_error.last_name} message="Last name is required" />}
                </Col>
                <Col xs={3}>
                  <div className="field-label">SUFFIX</div>
                  {is_edit_mode ? (
                    <Form.Control type="text" value={contact.suffix} className="nc-modal-custom-input"
                      onChange={(e) => handle_contact_change(index, "suffix", e.target.value)}
                      placeholder="e.g. Jr., Sr." />
                  ) : <ReadValue value={contact.suffix} />}
                </Col>
              </Row>

              {/* Row 2: Email, Number, Role */}
              <Row className="nc-modal-custom-row mt-2">
                <Col xs={4}>
                  <div className="field-label">EMAIL {is_edit_mode && <span className="required-icon">*</span>}</div>
                  {is_edit_mode ? (
                    <Form.Control type="email" value={contact.email} className="nc-modal-custom-input"
                      onChange={(e) => handle_contact_change(index, "email", e.target.value)}
                      placeholder="email@example.com" />
                  ) : <ReadValue value={contact.email} />}
                  {index === 0 && <InputError isValid={is_error.contact_email} message="Email is required" />}
                </Col>
                <Col xs={4}>
                  <div className="field-label">CONTACT NUMBER {is_edit_mode && <span className="required-icon">*</span>}</div>
                  {is_edit_mode ? (
                    <Form.Control type="text" value={contact.number} className="nc-modal-custom-input"
                      onChange={(e) => handle_contact_change(index, "number", e.target.value)}
                      placeholder="09XX-XXX-XXXX" />
                  ) : <ReadValue value={contact.number} />}
                  {index === 0 && <InputError isValid={is_error.contact_number} message="Contact number is required" />}
                </Col>
                <Col xs={4}>
                  <div className="field-label">ROLE {is_edit_mode && <span className="required-icon">*</span>}</div>
                  {is_edit_mode ? (
                    <>
                      <Form.Control as="select"
                        value={contact.role === "Others" || (contact.role && !CONTACT_ROLES.includes(contact.role)) ? "Others" : contact.role}
                        className="nc-modal-custom-input"
                        onChange={(e) => handle_contact_change(index, "role", e.target.value)}>
                        <option value="">Select Role</option>
                        {CONTACT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </Form.Control>
                      {contact.role === "Others" && (
                        <Form.Control type="text" value={contact.other_role || ""}
                          className="nc-modal-custom-input mt-1" placeholder="Please specify"
                          onChange={(e) => handle_contact_change(index, "other_role", e.target.value)} />
                      )}
                    </>
                  ) : <ReadValue value={contact.role === "Others" ? contact.other_role || "Others" : contact.role} />}
                  {index === 0 && <InputError isValid={is_error.contact_role} message="Role is required" />}
                </Col>
              </Row>
            </div>
          ))}

          {/* ── Attachments ── */}
          <div className="biodata-section-label">Attachments</div>
          
          {saved_attachments.length === 0 && (
            <p style={{ color: "#8a9ab0", fontSize: "13px" }}>No files attached.</p>
          )}

          {saved_attachments.map((att) => (
            <div key={att.id} className="attachment-row">
              <span className="attachment-name">{att.file_name}</span>
              <div className="attachment-actions">
                <button
                  className="attachment-btn"
                  title="Download"
                  onClick={() => downloadCustomerAttachment(att.file_path, att.file_name)}
                  type="button"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <a
                  className="attachment-btn"
                  title="View"
                  href={`${BASE_URL.replace("/api", "")}/${att.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon icon={faEye} />
                </a>
                {is_edit_mode && (
                  <button
                    className="attachment-btn attachment-remove"
                    title="Delete"
                    type="button"
                    onClick={async () => {
                      await deleteCustomerAttachment(att.id);
                      fetch_attachments();
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {is_edit_mode && (
            <div className="mt-3">
              <Dragger {...upload_props}>
                <p className="attach-icon">📎</p>
                <p className="attach-main-text">Click, drag, or paste files here</p>
                <p className="attach-sub-text">Any file type accepted · Max 10MB per file</p>
              </Dragger>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}