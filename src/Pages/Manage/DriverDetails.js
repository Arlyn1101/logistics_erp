import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import {
  getDriverDetails,
  updateDriver,
  getDriverAttachments,
  downloadDriverAttachment,
  deleteDriverAttachment,
} from "../../Helpers/apiCalls/Manage/driverApi";
import { BASE_URL } from "../../Helpers/apiCalls/axiosMethodCalls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faTrash,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { validateDriver } from "../../Helpers/Validation/Manage/driverValidation";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";

export default function DriverDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inactive, set_inactive] = useState(false);
  const [is_edit_mode, set_is_edit_mode] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [is_loading, set_is_loading] = useState(true);
  const [is_error, set_is_error] = useState({
    first_name: false,
    last_name: false,
  });

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

  const [form, set_form] = useState({ ...empty_form });
  const [original_form, set_original_form] = useState({ ...empty_form });
  const [saved_attachments, set_saved_attachments] = useState([]);
  const [new_attachment, set_new_attachment] = useState(null);
  const [replacing, set_replacing] = useState(false);
  const [pending_delete_id, set_pending_delete_id] = useState(null);

  useEffect(() => {
    async function fetch_driver() {
      set_is_loading(true);
      const response = await getDriverDetails(id);
      if (response.data && response.data.data) {
        const data = response.data.data;
        const sanitized = { ...empty_form };
        Object.keys(empty_form).forEach((key) => {
          sanitized[key] = data[key] ?? "";
        });
        
        sanitized.id = data.id;

        set_form(sanitized);
        set_original_form(sanitized);
      } else {
        toast.error("Failed to load driver details.", { style: toastStyle() });
        navigate("/drivers");
      }
      set_is_loading(false);
    }
    fetch_driver();
    fetch_attachments();
  }, [id]);

  async function fetch_attachments() {
    const response = await getDriverAttachments(id);
    if (response.data && response.data.data) {
      set_saved_attachments(response.data.data);
    } else {
      set_saved_attachments([]);
    }
  }

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

  function handle_cancel_edit() {
    set_form({ ...original_form });
    set_is_error({ first_name: false, last_name: false });
    set_new_attachment(null);
    set_replacing(false);
    set_pending_delete_id(null);
    set_is_edit_mode(false);
  }

  async function handle_save() {
    if (!validateDriver(form, set_is_error)) return;
    set_is_clicked(true);

    if (pending_delete_id) {
      await deleteDriverAttachment(pending_delete_id);
      set_pending_delete_id(null);
    }

    const attachments_to_upload = new_attachment ? [new_attachment] : [];
    const response = await updateDriver(form, attachments_to_upload);

    if (response.data && response.data.response) {
      toast.success("Driver updated successfully!", { style: toastStyle() });
      set_original_form({ ...form });
      set_new_attachment(null);
      set_replacing(false);
      set_is_edit_mode(false);
      fetch_attachments();
    } else {
      toast.error("Failed to update driver.", { style: toastStyle() });
    }
    set_is_clicked(false);
  }

  function ReadValue({ value }) {
    return (
      <div className="detail-value">
        {value ? value : <span className="detail-empty">—</span>}
      </div>
    );
  }

  const full_name = [
    form.first_name,
    form.middle_name,
    form.last_name,
    form.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  if (is_loading) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"DRIVERS"} />
        </div>
        <div
          className={`manager-container ${inactive ? "inactive" : "active"}`}
        >
          <div className="details-loading">Loading driver details…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(v) => set_inactive(v)} active={"DRIVERS"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <div className="add-customer-breadcrumb">
          <span
            className="breadcrumb-link"
            onClick={() => navigate("/drivers")}
          >
            Drivers
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">
            {full_name || "Driver Details"}
          </span>
        </div>

        <div className="add-customer-header">
          <div>
            <h1 className="page-title">{full_name || "Driver Details"}</h1>
            <p className="page-subtitle">
              {is_edit_mode
                ? "Edit driver information below"
                : "Viewing driver information"}
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
                ✏ Edit Driver
              </button>
            )}
          </div>
        </div>

        <div className="biodata-card">
          <div className="biodata-section-label">Driver Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">
                FIRST NAME{" "}
                {is_edit_mode && <span className="required-icon">*</span>}
              </div>
              {is_edit_mode ? (
                <>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    className="nc-modal-custom-input"
                    onChange={handle_change}
                  />
                  <InputError
                    isValid={is_error.first_name}
                    message="First name is required"
                  />
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
                />
              ) : (
                <ReadValue value={form.middle_name} />
              )}
            </Col>
            <Col>
              <div className="field-label">
                LAST NAME{" "}
                {is_edit_mode && <span className="required-icon">*</span>}
              </div>
              {is_edit_mode ? (
                <>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    className="nc-modal-custom-input"
                    onChange={handle_change}
                  />
                  <InputError
                    isValid={is_error.last_name}
                    message="Last name is required"
                  />
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
                />
              ) : (
                <ReadValue value={form.suffix} />
              )}
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">CONTACT NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="contact_number"
                  value={form.contact_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
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
                />
              ) : (
                <ReadValue value={form.email} />
              )}
            </Col>
            <Col>
              <div className="field-label">STATUS</div>
              {is_edit_mode ? (
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
              ) : (
                <ReadValue value={form.status} />
              )}
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">ADDRESS</div>
              {is_edit_mode ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={form.address}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.address} />
              )}
            </Col>
          </Row>

          <div className="biodata-section-label">Personal Information</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">BIRTHDATE</div>
              {is_edit_mode ? (
                <ReactDatePicker
                  selected={form.birthdate ? new Date(form.birthdate) : null}
                  onChange={(date) => handle_date_change("birthdate", date)}
                  dateFormat="yyyy-MM-dd"
                  className="nc-modal-custom-input w-100"
                  placeholderText="Select date"
                />
              ) : (
                <ReadValue
                  value={form.birthdate ? dateFormat(form.birthdate) : ""}
                />
              )}
            </Col>
            <Col>
              <div className="field-label">GENDER</div>
              {is_edit_mode ? (
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
              ) : (
                <ReadValue value={form.gender} />
              )}
            </Col>
            <Col>
              <div className="field-label">CIVIL STATUS</div>
              {is_edit_mode ? (
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
              ) : (
                <ReadValue value={form.civil_status} />
              )}
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">NATIONALITY</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="nationality"
                  value={form.nationality}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.nationality} />
              )}
            </Col>
            <Col>
              <div className="field-label">RELIGION</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="religion"
                  value={form.religion}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.religion} />
              )}
            </Col>
          </Row>

          <div className="biodata-section-label">Emergency Contact</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">NAME</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="emergency_contact_name"
                  value={form.emergency_contact_name}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.emergency_contact_name} />
              )}
            </Col>
            <Col>
              <div className="field-label">CONTACT NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="emergency_contact_number"
                  value={form.emergency_contact_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.emergency_contact_number} />
              )}
            </Col>
            <Col>
              <div className="field-label">RELATIONSHIP</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="emergency_contact_relationship"
                  value={form.emergency_contact_relationship}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.emergency_contact_relationship} />
              )}
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">ADDRESS</div>
              {is_edit_mode ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="emergency_contact_address"
                  value={form.emergency_contact_address}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.emergency_contact_address} />
              )}
            </Col>
          </Row>

          <div className="biodata-section-label">License Details</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">LICENSE NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="license_number"
                  value={form.license_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                />
              ) : (
                <ReadValue value={form.license_number} />
              )}
            </Col>
            <Col>
              <div className="field-label">LICENSE EXPIRY</div>
              {is_edit_mode ? (
                <>
                  <ReactDatePicker
                    selected={
                      form.license_expiry ? new Date(form.license_expiry) : null
                    }
                    onChange={(date) =>
                      handle_date_change("license_expiry", date)
                    }
                    dateFormat="yyyy-MM-dd"
                    className="nc-modal-custom-input w-100"
                    placeholderText="Select date"
                  />
                  <small className="truck-field-hint">
                    Alert shown in table if expiring within 30 days
                  </small>
                </>
              ) : (
                <ReadValue
                  value={
                    form.license_expiry ? dateFormat(form.license_expiry) : ""
                  }
                />
              )}
            </Col>
          </Row>

          <div className="biodata-section-label">Government Benefits</div>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">SSS NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="sss_number"
                  value={form.sss_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="XX-XXXXXXX-X"
                />
              ) : (
                <ReadValue value={form.sss_number} />
              )}
            </Col>
            <Col>
              <div className="field-label">PAG-IBIG NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="pagibig_number"
                  value={form.pagibig_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="XXXX-XXXX-XXXX"
                />
              ) : (
                <ReadValue value={form.pagibig_number} />
              )}
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">PHILHEALTH NUMBER</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="philhealth_number"
                  value={form.philhealth_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="XX-XXXXXXXXX-X"
                />
              ) : (
                <ReadValue value={form.philhealth_number} />
              )}
            </Col>
            <Col>
              <div className="field-label">TIN</div>
              {is_edit_mode ? (
                <Form.Control
                  type="text"
                  name="tin_number"
                  value={form.tin_number}
                  className="nc-modal-custom-input"
                  onChange={handle_change}
                  placeholder="XXX-XXX-XXX"
                />
              ) : (
                <ReadValue value={form.tin_number} />
              )}
            </Col>
          </Row>

          {/* ── Documents ── */}
          <div className="biodata-section-label">Documents</div>
          {saved_attachments.length === 0 && !replacing && (
            <p style={{ color: "#8a9ab0", fontSize: "13px" }}>
              No files attached.
            </p>
          )}
          {saved_attachments.map((att) => (
            <div key={att.id} className="attachment-row">
              <span className="attachment-name">{att.file_name}</span>
              <div className="attachment-actions">
                <button
                  className="attachment-btn"
                  title="Download"
                  onClick={() =>
                    downloadDriverAttachment(att.file_path, att.file_name)
                  }
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
                  <>
                    <button
                      className="attachment-btn"
                      title="Replace"
                      type="button"
                      onClick={() => {
                        set_replacing(true);
                        set_pending_delete_id(att.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                    </button>
                    <button
                      className="attachment-btn attachment-remove"
                      title="Delete"
                      type="button"
                      onClick={async () => {
                        await deleteDriverAttachment(att.id);
                        fetch_attachments();
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {is_edit_mode && (saved_attachments.length === 0 || replacing) && (
            <div className="mt-2">
              <div className="field-label">
                {replacing ? "UPLOAD REPLACEMENT FILE" : "LICENSE FILE"}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="nc-modal-custom-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) set_new_attachment(file);
                }}
              />
              {new_attachment && (
                <div className="attachment-row mt-2">
                  <span className="attachment-name">{new_attachment.name}</span>
                  <div className="attachment-actions">
                    <button
                      className="attachment-btn attachment-remove"
                      type="button"
                      onClick={() => {
                        set_new_attachment(null);
                        if (replacing) {
                          set_replacing(false);
                          set_pending_delete_id(null);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
