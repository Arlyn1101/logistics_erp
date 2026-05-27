import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import {
  createDriver,
  updateDriver,
  getDriverDetails,
} from "../../Helpers/apiCalls/Manage/driverApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { validateDriver } from "../../Helpers/Validation/Manage/driverValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function DriverForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed_driver = location.state?.driver || null;
  const is_edit = !!passed_driver;

  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [is_error, set_is_error] = useState({ first_name: false, last_name: false });

  const empty_form = {
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    contact_number: "",
    address: "",
    status: "active",
    birthdate: "",
    gender: "",
    civil_status: "",
    nationality: "",
    religion: "",
    email: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_contact_relationship: "",
    emergency_contact_address: "",
    license_number: "",
    license_expiry: "",
    sss_number: "",
    pagibig_number: "",
    philhealth_number: "",
    tin_number: "",
  };

  const safe_date = (val) => {
  if (!val || val === "0000-00-00" || val === "0000-00-00 00:00:00") return null;
  const d = moment(val, "YYYY-MM-DD", true);
  return d.isValid() ? d.toDate() : null;
};

const [form, set_form] = useState({ ...empty_form });
  const [attachments, set_attachments] = useState([]);

  async function load_driver() {
    if (!is_edit) return;
    const response = await getDriverDetails(passed_driver.id);
    if (response.data && response.data.data) {
      const data = response.data.data;
      set_form({
        id: data.id,
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        suffix: data.suffix || "",
        contact_number: data.contact_number || "",
        address: data.address || "",
        status: data.status || "active",
        birthdate: data.birthdate && data.birthdate !== "0000-00-00" ? data.birthdate : "",
        gender: data.gender || "",
        civil_status: data.civil_status || "",
        nationality: data.nationality || "",
        religion: data.religion || "",
        email: data.email || "",
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_number: data.emergency_contact_number || "",
        emergency_contact_relationship: data.emergency_contact_relationship || "",
        emergency_contact_address: data.emergency_contact_address || "",
        license_number: data.license_number || "",
        license_expiry: data.license_expiry && data.license_expiry !== "0000-00-00" ? data.license_expiry : "",
        sss_number: data.sss_number || "",
        pagibig_number: data.pagibig_number || "",
        philhealth_number: data.philhealth_number || "",
        tin_number: data.tin_number || "",
      });
    }
  }

  useEffect(() => {
    load_driver();
  }, []);

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_date_change = (field, date) => {
    set_form((prev) => ({
      ...prev,
      [field]: date ? moment(date).format("YYYY-MM-DD") : "",
    }));
  };

  async function handle_save() {
    if (!validateDriver(form, set_is_error)) return;
    set_is_clicked(true);
    const response = is_edit
      ? await updateDriver(form, attachments)
      : await createDriver(form, attachments);
    if (response.data && response.data.response) {
      toast.success(
        is_edit ? "Driver updated successfully!" : "Driver added successfully!",
        { style: toastStyle() }
      );
      navigate("/drivers");
    } else {
      toast.error(
        is_edit ? "Failed to update driver." : "Failed to add driver.",
        { style: toastStyle() }
      );
    }
    set_is_clicked(false);
  }

  const status_dot_class =
    form.status === "active" ? "status-dot active" : "status-dot inactive";

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"DRIVERS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/drivers")}>
            Drivers
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">
            {is_edit ? "Edit Driver" : "Add New Driver"}
          </span>
        </div>

        {/* Sticky header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">
              {is_edit ? "Edit Driver" : "Add New Driver"}
            </h1>
            <p className="page-subtitle">
              {is_edit
                ? "Update driver information and license details"
                : "Fill in driver information and license details"}
            </p>
          </div>
          <div className="add-customer-actions">
            <button
              className="cancel-btn"
              onClick={() => navigate("/drivers")}
              disabled={is_clicked}
            >
              Cancel
            </button>
            <button
              className="save-btn"
              onClick={handle_save}
              disabled={is_clicked}
            >
              {is_clicked ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </div>

        <div className="biodata-card">

          {/* ── Section 1: Driver Information ── */}
          <div className="biodata-section-label">Driver Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">FIRST NAME <span className="required-icon">*</span></div>
              <Form.Control
                type="text"
                name="first_name"
                value={form.first_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
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
              />
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">CONTACT NUMBER</div>
              <Form.Control
                type="text"
                name="contact_number"
                value={form.contact_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
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
              />
            </Col>
            {is_edit && (
              <Col>
                <div className="field-label">STATUS</div>
                <div className="truck-status-select-wrap">
                  <span className={`truck-status-dot ${form.status}`}></span>
                  <Form.Select
                    name="status"
                    value={form.status}
                    className="nc-modal-custom-input"
                    onChange={handle_change}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </div>
              </Col>
            )}
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">ADDRESS</div>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={form.address}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
          </Row>

          {/* ── Section 2: Personal Information ── */}
          <div className="biodata-section-label">Personal Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">BIRTHDATE</div>
              <ReactDatePicker
                selected={safe_date(form.birthdate)}
                onChange={(date) => handle_date_change("birthdate", date)}
                dateFormat="yyyy-MM-dd"
                className="nc-modal-custom-input w-100"
                placeholderText="Select date"
              />
            </Col>
            <Col>
              <div className="field-label">GENDER</div>
              <Form.Select
                name="gender"
                value={form.gender}
                className="nc-modal-custom-input"
                onChange={handle_change}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Form.Select>
            </Col>
            <Col>
              <div className="field-label">CIVIL STATUS</div>
              <Form.Select
                name="civil_status"
                value={form.civil_status}
                className="nc-modal-custom-input"
                onChange={handle_change}
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">NATIONALITY</div>
              <Form.Control
                type="text"
                name="nationality"
                value={form.nationality}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
            <Col>
              <div className="field-label">RELIGION</div>
              <Form.Control
                type="text"
                name="religion"
                value={form.religion}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
          </Row>

          {/* ── Section 3: Emergency Contact ── */}
          <div className="biodata-section-label">Emergency Contact</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">NAME</div>
              <Form.Control
                type="text"
                name="emergency_contact_name"
                value={form.emergency_contact_name}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
            <Col>
              <div className="field-label">CONTACT NUMBER</div>
              <Form.Control
                type="text"
                name="emergency_contact_number"
                value={form.emergency_contact_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
            <Col>
              <div className="field-label">RELATIONSHIP</div>
              <Form.Control
                type="text"
                name="emergency_contact_relationship"
                value={form.emergency_contact_relationship}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">ADDRESS</div>
              <Form.Control
                as="textarea"
                rows={2}
                name="emergency_contact_address"
                value={form.emergency_contact_address}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
          </Row>

          {/* ── Section 4: License Details ── */}
          <div className="biodata-section-label">License Details</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">LICENSE NUMBER</div>
              <Form.Control
                type="text"
                name="license_number"
                value={form.license_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
              />
            </Col>
            <Col>
              <div className="field-label">LICENSE EXPIRY</div>
              <ReactDatePicker
                selected={safe_date(form.license_expiry)}
                onChange={(date) => handle_date_change("license_expiry", date)}
                dateFormat="yyyy-MM-dd"
                className="nc-modal-custom-input w-100"
                placeholderText="Select date"
              />
            </Col>
          </Row>

          {/* ── Section 5: Government Benefits ── */}
          <div className="biodata-section-label">Government Benefits</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">SSS NUMBER</div>
              <Form.Control
                type="text"
                name="sss_number"
                value={form.sss_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="XX-XXXXXXX-X"
              />
            </Col>
            <Col>
              <div className="field-label">PAG-IBIG NUMBER</div>
              <Form.Control
                type="text"
                name="pagibig_number"
                value={form.pagibig_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="XXXX-XXXX-XXXX"
              />
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">PHILHEALTH NUMBER</div>
              <Form.Control
                type="text"
                name="philhealth_number"
                value={form.philhealth_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="XX-XXXXXXXXX-X"
              />
            </Col>
            <Col>
              <div className="field-label">TIN</div>
              <Form.Control
                type="text"
                name="tin_number"
                value={form.tin_number}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="XXX-XXX-XXX"
              />
            </Col>
          </Row>

        {/* ── Section 6: Documents ── */}
          <div className="biodata-section-label">Documents</div>
          <div className="field-label">LICENSE FILE</div>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="nc-modal-custom-input"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) set_attachments([file]);
            }}
          />
          {attachments.length > 0 && (
            <div className="attachment-row mt-2">
              <span className="attachment-name">{attachments[0].name}</span>
              <div className="attachment-actions">
                <button
                  className="attachment-btn attachment-remove"
                  onClick={() => set_attachments([])}
                  type="button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          )}

        </div>{/* end biodata-card */}

      </div>
    </div>
  );
}