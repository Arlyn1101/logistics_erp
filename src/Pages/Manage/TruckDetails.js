import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import {
  getTruckDetails,
  updateTruck,
  getTruckAttachments,
  downloadTruckAttachment,
  deleteTruckAttachment,
} from "../../Helpers/apiCalls/Manage/truckApi";
import { validateTruck } from "../../Helpers/Validation/Manage/truckValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import { DatePicker as AntDatePicker } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { BASE_URL } from "../../Helpers/apiCalls/axiosMethodCalls";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

const empty_form = {
  unit_code: "",
  plate_number: "",
  truck_type: "",
  color: "",
  capacity: "",
  or_expiry: "",
  km_per_liter: "",
  status: "active",
  remarks: "",
};

function ReadValue({ value, placeholder = "—" }) {
  return (
    <div className="detail-value">
      {value ? value : <span className="detail-empty">{placeholder}</span>}
    </div>
  );
}

export default function TruckDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inactive, set_inactive] = useState(false);
  const [is_edit_mode, set_is_edit_mode] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [is_loading, set_is_loading] = useState(true);
  const [form, set_form] = useState({ ...empty_form });
  const [original_form, set_original_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    unit_code: false,
    plate_number: false,
  });

  const [saved_attachments, set_saved_attachments] = useState([]);
  const [new_or_attachments, set_new_or_attachments] = useState([]);
  const [new_cr_attachments, set_new_cr_attachments] = useState([]);
  const [or_editing, set_or_editing] = useState(false);
  const [cr_editing, set_cr_editing] = useState(false);
  const [pending_delete_or_id, set_pending_delete_or_id] = useState(null);
  const [pending_delete_cr_id, set_pending_delete_cr_id] = useState(null);

  async function fetch_attachments() {
    const response = await getTruckAttachments(id);
    if (response.data && response.data.data) {
      set_saved_attachments(response.data.data);
    } else {
      set_saved_attachments([]);
    }
  }

  useEffect(() => {
    async function fetch_truck() {
      set_is_loading(true);
      const response = await getTruckDetails(id);
      if (response.data && response.data.data) {
        const data = response.data.data;
        const mapped = { ...empty_form, ...data };
        set_form(mapped);
        set_original_form(mapped);
      } else {
        toast.error("Failed to load truck details.", { style: toastStyle() });
        navigate("/trucks");
      }
      set_is_loading(false);
    }
    fetch_truck();
    fetch_attachments();
  }, [id]);

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  function handle_cancel_edit() {
    set_form({ ...original_form });
    set_is_error({ unit_code: false, plate_number: false });
    set_new_or_attachments([]);
    set_new_cr_attachments([]);
    set_or_editing(false);
    set_cr_editing(false);
    set_pending_delete_or_id(null);
    set_pending_delete_cr_id(null);
    set_is_edit_mode(false);
  }

  async function handle_save() {
    if (validateTruck(form, set_is_error)) {
      set_is_clicked(true);
      if (pending_delete_or_id) {
        await deleteTruckAttachment(pending_delete_or_id);
        set_pending_delete_or_id(null);
      }
      if (pending_delete_cr_id) {
        await deleteTruckAttachment(pending_delete_cr_id);
        set_pending_delete_cr_id(null);
      }
      const response = await updateTruck(form, new_or_attachments, new_cr_attachments);
      if (response.data && response.data.status === "success") {
        toast.success("Truck updated successfully!", { style: toastStyle() });
        set_original_form({ ...form });
        set_new_or_attachments([]);
        set_new_cr_attachments([]);
        set_or_editing(false);
        set_cr_editing(false);
        fetch_attachments();
        set_is_edit_mode(false);
      } else {
        toast.error("Failed to update truck.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  if (is_loading) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"TRUCKS"} />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <div className="details-loading">Loading truck details…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(v) => set_inactive(v)} active={"TRUCKS"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/trucks")}>
            Trucks
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{form.unit_code || "Truck Details"}</span>
        </div>

        <div className="add-customer-header">
          <div>
            <h1 className="page-title">{form.unit_code || "Truck Details"}</h1>
            <p className="page-subtitle">
              {is_edit_mode ? "Edit the truck details below" : "Viewing truck information"}
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
                ✏ Edit Truck
              </button>
            )}
          </div>
        </div>

        <div className="biodata-card">

          <div className="biodata-section-label">Truck Information</div>
          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">TRUCK TYPE</div>
              {is_edit_mode ? (
                <Form.Select name="truck_type" value={form.truck_type} className="nc-modal-custom-select" onChange={handle_change}>
                  <option value="">Select</option>
                  <option value="Wing Van">Wing Van</option>
                  <option value="Closed Van">Closed Van</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Dump Truck">Dump Truck</option>
                  <option value="Tractor Head">Tractor Head</option>
                </Form.Select>
              ) : <ReadValue value={form.truck_type} />}
            </Col>
            <Col xs={4}>
              <div className="field-label">OR EXPIRY</div>
              {is_edit_mode ? (
                <AntDatePicker
                  value={form.or_expiry ? dayjs(form.or_expiry) : null}
                  onChange={(date) => set_form((prev) => ({ ...prev, or_expiry: date ? date.format("YYYY-MM-DD") : "" }))}
                  format="YYYY-MM-DD"
                  placeholder="Select expiry date"
                  style={{ width: "100%" }}
                  className="nc-modal-custom-input"
                  getPopupContainer={(trigger) => trigger.parentElement}
                />
              ) : <ReadValue value={form.or_expiry} />}
            </Col>
            <Col xs={4}>
              <div className="field-label">PLATE NUMBER <span className="required-icon">*</span></div>
              {is_edit_mode ? (
                <>
                  <Form.Control type="text" name="plate_number" placeholder="e.g. ABC 1234" value={form.plate_number} className="nc-modal-custom-input" onChange={handle_change} />
                  <InputError isValid={is_error.plate_number} message="Plate number is required" />
                </>
              ) : <ReadValue value={form.plate_number} />}
            </Col>
          </Row>

          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">UNIT CODE <span className="required-icon">*</span></div>
              {is_edit_mode ? (
                <>
                  <Form.Control type="text" name="unit_code" placeholder="e.g. Unit 01" value={form.unit_code} className="nc-modal-custom-input" onChange={handle_change} />
                  <InputError isValid={is_error.unit_code} message="Unit code is required" />
                </>
              ) : <ReadValue value={form.unit_code} />}
            </Col>
            <Col xs={4}>
              <div className="field-label">COLOR</div>
              {is_edit_mode ? (
                <Form.Control type="text" name="color" placeholder="e.g. White" value={form.color} className="nc-modal-custom-input" onChange={handle_change} />
              ) : <ReadValue value={form.color} />}
            </Col>
            <Col xs={4}>
              <div className="field-label">CAPACITY</div>
              {is_edit_mode ? (
                <div className="input-suffix-wrap">
                  <Form.Control type="number" name="capacity" placeholder="e.g. 10" value={form.capacity} className="nc-modal-custom-input" onChange={handle_change} />
                  <span className="input-suffix">tons</span>
                </div>
              ) : <ReadValue value={form.capacity ? `${form.capacity} tons` : ""} />}
            </Col>
          </Row>

          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">STATUS</div>
              {is_edit_mode ? (
                <div className="status-select-wrap">
                  <span className={`status-dot ${form.status}`}></span>
                  <Form.Select name="status" value={form.status} className="nc-modal-custom-select" onChange={handle_change}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="maintenance">Maintenance</option>
                  </Form.Select>
                </div>
              ) : <span className={`status-badge ${form.status}`}>{form.status}</span>}
            </Col>
          </Row>

          <div className="biodata-section-label" style={{ marginTop: "18px" }}>Fuel Details</div>
          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">KM PER LITER</div>
              {is_edit_mode ? (
                <div className="input-suffix-wrap">
                  <Form.Control type="number" name="km_per_liter" placeholder="e.g. 4.5" value={form.km_per_liter} className="nc-modal-custom-input" onChange={handle_change} />
                  <span className="input-suffix">km/L</span>
                </div>
              ) : <ReadValue value={form.km_per_liter ? `${form.km_per_liter} km/L` : ""} />}
              {is_edit_mode && <small className="field-hint">For reference only — fuel surcharge is based on contract</small>}
            </Col>
          </Row>

          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">REMARKS</div>
              {is_edit_mode ? (
                <Form.Control as="textarea" rows={2} name="remarks" placeholder="Optional notes about this truck..." value={form.remarks} className="nc-modal-custom-input" onChange={handle_change} />
              ) : <ReadValue value={form.remarks} />}
            </Col>
          </Row>

          <div className="biodata-section-label" style={{ marginTop: "18px" }}>Documents</div>

          {saved_attachments.length === 0 && !is_edit_mode && (
            <p style={{ color: "#8a9ab0", fontSize: "13px" }}>No files attached.</p>
          )}

          {["OR", "CR"].map((type) => {
            const files = saved_attachments.filter((a) => a.file_type === type);
            if (files.length === 0 && !is_edit_mode) return null;
            const is_editing = type === "OR" ? or_editing : cr_editing;
            const set_editing = type === "OR" ? set_or_editing : set_cr_editing;
            const set_pending = type === "OR" ? set_pending_delete_or_id : set_pending_delete_cr_id;
            const set_new = type === "OR" ? set_new_or_attachments : set_new_cr_attachments;

            return (
              <div key={type} className="mb-3">
                <small className="field-hint mb-1 d-block">
                  {type === "OR" ? "OR (Official Receipt)" : "CR (Certificate of Registration)"}
                </small>
                {files.length > 0 && !is_editing && files.map((att, i) => (
                  <div className="attachment-row" key={i}>
                    <span className="attachment-name">{att.file_name}</span>
                    <div className="attachment-actions">
                      <button className="attachment-btn" title="Download"
                        onClick={() => downloadTruckAttachment(att.file_path, att.file_name)}>
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <a href={`${BASE_URL}/${att.file_path}`} target="_blank" rel="noreferrer"
                        className="attachment-btn" title="View">
                        <FontAwesomeIcon icon={faEye} />
                      </a>
                      {is_edit_mode && (
                        <>
                          <button className="attachment-btn" title="Replace"
                            onClick={() => { set_pending(att.id); set_editing(true); }}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="attachment-btn attachment-remove" title="Delete"
                            onClick={async () => {
                              const res = await deleteTruckAttachment(att.id);
                              if (res.data && res.data.status === "success") {
                                set_saved_attachments((prev) => prev.filter((_, idx) => idx !== i));
                              } else {
                                toast.error("Failed to remove attachment.", { style: toastStyle() });
                              }
                            }}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {is_edit_mode && (files.length === 0 || is_editing) && (
                  <>
                    <Form.Control type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                      className="nc-modal-custom-input"
                      onChange={(e) => set_new(Array.from(e.target.files))} />
                    <small className="field-hint">Accepted: PDF, JPG, PNG</small>
                  </>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}