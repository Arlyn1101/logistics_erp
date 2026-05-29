import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllTrucks,
  searchTrucks,
  createTruck,
  updateTruck,
  getTruckAttachments,
  downloadTruckAttachment,
  deleteTruckAttachment,
  getTruckSuggestions,
} from "../../Helpers/apiCalls/Manage/truckApi";
import { Select as AntSelect, DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
import { BASE_URL } from "../../Helpers/apiCalls/axiosMethodCalls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { validateTruck } from "../../Helpers/Validation/Manage/truckValidation";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Trucks() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
const [suggestions, set_suggestions] = useState([]);
const [suggestion_loading, set_suggestion_loading] = useState(false);
const [active_filter, set_active_filter] = useState(null);
const [search_value, set_search_value] = useState(null);
  const [active_tab, set_active_tab] = useState("all");
  const [truck_data, set_truck_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);

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

  const [add_form, set_add_form] = useState({ ...empty_form });
  const [add_or_attachments, set_add_or_attachments] = useState([]);
  const [add_cr_attachments, set_add_cr_attachments] = useState([]);
  const [edit_or_attachments, set_edit_or_attachments] = useState([]);
  const [edit_cr_attachments, set_edit_cr_attachments] = useState([]);
  const [saved_attachments, set_saved_attachments] = useState([]);
  const [or_editing, set_or_editing] = useState(false);
  const [cr_editing, set_cr_editing] = useState(false);
  const [pending_delete_or_id, set_pending_delete_or_id] = useState(null);
  const [pending_delete_cr_id, set_pending_delete_cr_id] = useState(null);
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    unit_code: false,
    plate_number: false,
  });

  const handle_add_change = (e) => {
    const { name, value } = e.target;
    set_add_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_edit_change = (e) => {
    const { name, value } = e.target;
    set_edit_form((prev) => ({ ...prev, [name]: value }));
  };

  function handle_select_change(e, row) {
    set_selected_row(row);
    set_edit_form(row);
    if (e.target.value === "edit-truck") {
      fetch_attachments(row.id);
      set_show_edit_modal(true);
    } else if (e.target.value === "view-truck") {
      fetch_attachments(row.id);
      set_show_view_modal(true);
    }
    e.target.value = "";
  }

  function ActionBtn(row) {
    return (
      <Form.Select
        name="action"
        className="PO-select-action form-select"
        onChange={(e) => handle_select_change(e, row)}
        value={""}
      >
        <option defaultValue selected hidden>
          Select
        </option>
        <option value="view-truck" className="color-options">
          View
        </option>
        <option value="edit-truck" className="color-options">
          Edit
        </option>
      </Form.Select>
    );
  }

  function StatusBadge(status) {
    const label = status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "—";
    return <span className={`status-badge ${status}`}>{label}</span>;
  }

  function ExpiryBadge(expiry) {
    if (!expiry) return <span className="view-empty-value">—</span>;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp_date = new Date(expiry);
    const diff_days = Math.ceil((exp_date - today) / (1000 * 60 * 60 * 24));
    if (diff_days < 0) {
      return (
        <span className="status-badge" style={{ background: "#c0392b", color: "#fff", borderRadius: "12px", padding: "3px 10px", fontSize: "12px" }}>
          {dateFormat(expiry)} (Expired)
        </span>
      );
    }
    if (diff_days <= 30) {
      return (
        <span className="status-badge" style={{ background: "#e0a030", color: "#fff", borderRadius: "12px", padding: "3px 10px", fontSize: "12px" }}>
          {dateFormat(expiry)} (Expiring)
        </span>
      );
    }
    return <span style={{ color: "#2d3e4e", fontFamily: "var(--primary-font-medium)" }}>{expiry}</span>;
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((row) => row.status === tab);
  }

  async function handle_suggestion_search(keyword) {
  if (!keyword || keyword.trim().length < 1) {
    set_suggestions([]);
    return;
  }
  set_suggestion_loading(true);
  const res = await getTruckSuggestions(keyword);
  if (res.data?.data?.trucks) {
    const options = res.data.data.trucks.map((item) => ({
      value: `truck_id::${item.id}`,
      label: `🚛 ${item.label}`,
      sublabel: "Truck",
    }));
    set_suggestions(options);
  }
  set_suggestion_loading(false);
}

function handle_suggestion_select(value, option) {
  const [type, id] = value.split("::");
  set_active_filter({ type, id, label: option.label });
  const filtered = truck_data.filter((row) =>
    String(row.id) === String(id)
  );
  set_filtered_data(apply_tab_filter(filtered, active_tab));
}

function handle_reset_filter() {
  set_active_filter(null);
  set_suggestions([]);
  set_search_value(null);
  set_filtered_data(apply_tab_filter(truck_data, active_tab));
}

async function fetch_trucks(filters = {}) {
    set_show_loader(true);
    const has_filter = Object.values(filters).some((v) => v !== "" && v !== null);
    const response = has_filter
      ? await searchTrucks(filters.unit_code || null, filters.plate_number || null, filters.status || null, filters.truck_id || null)
      : await getAllTrucks();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        status_badge: StatusBadge(a.status),
        expiry_badge: ExpiryBadge(a.or_expiry),
        action_btn: ActionBtn(a),
      }));
      set_truck_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_truck_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  async function fetch_attachments(truck_id) {
    const response = await getTruckAttachments(truck_id);
    if (response.data && response.data.data) {
      set_saved_attachments(response.data.data);
    } else {
      set_saved_attachments([]);
    }
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(truck_data, tab));
  }

  function get_tab_count(tab) {
    if (tab === "all") return truck_data.length;
    return truck_data.filter((row) => row.status === tab).length;
  }

  async function handle_create() {
    if (validateTruck(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createTruck(
        add_form,
        add_or_attachments,
        add_cr_attachments,
      );
      if (response.data && response.data.status === "success") {
        toast.success("Truck added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        set_add_or_attachments([]);
        set_add_cr_attachments([]);
        fetch_trucks();
      } else {
        toast.error("Failed to add truck.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validateTruck(edit_form, set_is_error)) {
      set_is_clicked(true);
      if (pending_delete_or_id) {
        await deleteTruckAttachment(pending_delete_or_id);
        set_pending_delete_or_id(null);
      }
      if (pending_delete_cr_id) {
        await deleteTruckAttachment(pending_delete_cr_id);
        set_pending_delete_cr_id(null);
      }
      const response = await updateTruck(
        edit_form,
        edit_or_attachments,
        edit_cr_attachments,
      );
      if (response.data && response.data.status === "success") {
        toast.success("Truck updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        set_edit_or_attachments([]);
        set_edit_cr_attachments([]);
        set_or_editing(false);
        set_cr_editing(false);
        fetch_attachments(edit_form.id);
        fetch_trucks();
      } else {
        toast.error("Failed to update truck.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  React.useEffect(() => {
    fetch_trucks();
  }, []);

  /* ── FORM FIELDS — Add and Edit modals ── */
  const form_fields = (
    form,
    handle_change,
    is_edit = false,
    set_or = set_add_or_attachments,
    set_cr = set_add_cr_attachments,
  ) => (
    <div className="mt-3">
      <div className="biodata-section-label">Truck Information</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">TRUCK TYPE</div>
          <Form.Select
            name="truck_type"
            value={form.truck_type}
            className="nc-modal-custom-select"
            onChange={handle_change}
          >
            <option value="">Select</option>
            <option value="Wing Van">Wing Van</option>
            <option value="Closed Van">Closed Van</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Dump Truck">Dump Truck</option>
            <option value="Tractor Head">Tractor Head</option>
          </Form.Select>
        </Col>
        <Col>
          <div className="field-label">OR EXPIRY</div>
          <AntDatePicker
            value={form.or_expiry ? dayjs(form.or_expiry) : null}
            onChange={(date) => {
              const val = date ? date.format("YYYY-MM-DD") : "";
              if (is_edit) {
                set_edit_form((prev) => ({ ...prev, or_expiry: val }));
              } else {
                set_add_form((prev) => ({ ...prev, or_expiry: val }));
              }
            }}
            format="YYYY-MM-DD"
            placeholder="Select expiry date"
            style={{ width: "100%" }}
            className="nc-modal-custom-input"
            getPopupContainer={(trigger) => trigger.parentElement}
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">UNIT CODE <span className="required-icon">*</span></div>
          <Form.Control
            type="text"
            name="unit_code"
            placeholder="e.g. Unit 01"
            value={form.unit_code}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
          <InputError
            isValid={is_error.unit_code}
            message="Unit code is required"
          />
        </Col>
        <Col>
          <div className="field-label">PLATE NUMBER <span className="required-icon">*</span></div>
          <Form.Control
            type="text"
            name="plate_number"
            placeholder="e.g. ABC 1234"
            value={form.plate_number}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
          <InputError
            isValid={is_error.plate_number}
            message="Plate number is required"
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">COLOR</div>
          <Form.Control
            type="text"
            name="color"
            placeholder="e.g. White"
            value={form.color}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
        <Col>
          <div className="field-label">CAPACITY</div>
          <div className="input-suffix-wrap">
            <Form.Control
              type="number"
              name="capacity"
              placeholder="e.g. 10"
              value={form.capacity}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
            <span className="input-suffix">tons</span>
          </div>
        </Col>
      </Row>

      {is_edit && (
        <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">STATUS</div>
            <div className="status-select-wrap">
              <span className={`status-dot ${form.status}`}></span>
              <Form.Select
                name="status"
                value={form.status}
                className="nc-modal-custom-select"
                onChange={handle_change}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="dispatched">Dispatched</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </div>
          </Col>
        </Row>
      )}

      <div className="biodata-section-label" style={{ marginTop: "18px" }}>Fuel Details</div>
      <Row className="nc-modal-custom-row">
        <Col xs={6}>
          <div className="field-label">KM PER LITER</div>
          <div className="input-suffix-wrap">
            <Form.Control
              type="number"
              name="km_per_liter"
              placeholder="e.g. 4.5"
              value={form.km_per_liter}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
            <span className="input-suffix">km/L</span>
          </div>
          <small className="field-hint">
            Used for fuel surcharge billing calculation
          </small>
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">REMARKS</div>
          <Form.Control
            as="textarea"
            rows={2}
            name="remarks"
            placeholder="Optional notes about this truck..."
            value={form.remarks}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>

      <div className="biodata-section-label" style={{ marginTop: "18px" }}>Documents</div>
      {is_edit && saved_attachments.length > 0 && (
        <Row className="nc-modal-custom-row">
          <Col>
            <small className="field-hint mb-1 d-block">Already uploaded:</small>
            {["OR", "CR"].map((type) => {
              const files = saved_attachments.filter(
                (a) => a.file_type === type,
              );
              if (files.length === 0) return null;
              const is_editing = type === "OR" ? or_editing : cr_editing;
              const set_editing =
                type === "OR" ? set_or_editing : set_cr_editing;
              const set_pending =
                type === "OR"
                  ? set_pending_delete_or_id
                  : set_pending_delete_cr_id;
              return (
                <div key={type} className="mb-2">
                  <small className="field-hint mb-1 d-block">
                    {type === "OR"
                      ? "OR (Official Receipt)"
                      : "CR (Certificate of Registration)"}
                  </small>
                  {!is_editing &&
                    files.map((att, i) => (
                      <div className="attachment-row" key={i}>
                        <span className="attachment-name">{att.file_name}</span>
                        <div className="attachment-actions">
                          <button
                            className="attachment-btn"
                            title="Download"
                            onClick={() =>
                              downloadTruckAttachment(
                                att.file_path,
                                att.file_name,
                              )
                            }
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <a
                            href={`${BASE_URL}/${att.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="attachment-btn"
                            title="View"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </a>
                          <button
                            className="attachment-btn"
                            title="Replace"
                            onClick={() => {
                              set_pending(att.id);
                              set_editing(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="attachment-btn attachment-remove"
                            title="Delete"
                            onClick={async () => {
                              const res = await deleteTruckAttachment(att.id);
                              if (res.data && res.data.status === "success") {
                                set_saved_attachments((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                );
                              } else {
                                toast.error("Failed to remove attachment.", {
                                  style: toastStyle(),
                                });
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {is_editing && (
                    <>
                      <Form.Control
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="nc-modal-custom-input"
                        onChange={(e) =>
                          type === "OR"
                            ? set_or(Array.from(e.target.files))
                            : set_cr(Array.from(e.target.files))
                        }
                      />
                      <small className="field-hint">
                        Accepted: PDF, JPG, PNG
                      </small>
                    </>
                  )}
                </div>
              );
            })}
          </Col>
        </Row>
      )}

      {(!is_edit ||
        saved_attachments.filter((a) => a.file_type === "OR").length === 0) && (
        <Row className="nc-modal-custom-row">
          <Col>
            OR{" "}
            <span style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}>
              (Official Receipt)
            </span>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="nc-modal-custom-input"
              onChange={(e) => set_or(Array.from(e.target.files))}
            />
            <small className="field-hint">Accepted: PDF, JPG, PNG</small>
          </Col>
        </Row>
      )}
      {(!is_edit ||
        saved_attachments.filter((a) => a.file_type === "CR").length === 0) && (
        <Row className="nc-modal-custom-row">
          <Col>
            CR{" "}
            <span style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}>
              (Certificate of Registration)
            </span>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="nc-modal-custom-input"
              onChange={(e) => set_cr(Array.from(e.target.files))}
            />
            <small className="field-hint">Accepted: PDF, JPG, PNG</small>
          </Col>
        </Row>
      )}
    </div>
  );

  /* ── VIEW CONTENT — fleet record card ── */
  const view_content = (form) => (
    <div className="view-wrapper">
      <div className="view-header">
        <div className="view-header-left">
          <div className="view-title">{form.unit_code || "—"}</div>
          <div className="view-subtitle">{form.plate_number || "—"}</div>
        </div>
        <span className={`status-badge ${form.status}`}>{form.status}</span>
      </div>

      <div className="view-details">
        <div className="view-detail-row">
          <span className="view-detail-label">TRUCK TYPE</span>
          <span
            className={
              form.truck_type ? "view-detail-value" : "view-empty-value"
            }
          >
            {form.truck_type || "—"}
          </span>
        </div>
        <div className="view-detail-row">
          <span className="view-detail-label">COLOR</span>
          <span
            className={form.color ? "view-detail-value" : "view-empty-value"}
          >
            {form.color || "—"}
          </span>
        </div>
        <div className="view-detail-row">
          <span className="view-detail-label">CAPACITY</span>
          <span
            className={form.capacity ? "view-detail-value" : "view-empty-value"}
          >
            {form.capacity ? `${form.capacity} tons` : "—"}
          </span>
        </div>
        <div className="view-detail-row">
          <span className="view-detail-label">OR EXPIRY</span>
          <span
            className={
              form.or_expiry ? "view-detail-value" : "view-empty-value"
            }
          >
            {form.or_expiry || "—"}
          </span>
        </div>
        <div className="view-detail-row">
          <span className="view-detail-label">KM PER LITER</span>
          <span
            className={
              form.km_per_liter ? "view-detail-value" : "view-empty-value"
            }
          >
            {form.km_per_liter ? `${form.km_per_liter} km/L` : "—"}
          </span>
        </div>
        <div className="view-detail-row">
          <span className="view-detail-label">STATUS</span>
          <span className={`status-badge ${form.status}`}>{form.status}</span>
        </div>
        <div className="view-detail-row">
          <span className="view-detail-label">REMARKS</span>
          <span
            className={form.remarks ? "view-detail-value" : "view-empty-value"}
          >
            {form.remarks || "No remarks"}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="form-section-label">Documents</div>
        {saved_attachments.length === 0 ? (
          <small className="field-hint">No files attached.</small>
        ) : (
          <div className="view-details">
            {["OR", "CR"].map((type) => {
              const files = saved_attachments.filter(
                (a) => a.file_type === type,
              );
              if (files.length === 0) return null;
              return (
                <div key={type} className="mb-2">
                  <small className="field-hint mb-1 d-block">
                    {type === "OR"
                      ? "OR (Official Receipt)"
                      : "CR (Certificate of Registration)"}
                  </small>
                  {files.map((att, i) => (
                    <div className="attachment-row" key={i}>
                      <span className="attachment-name">{att.file_name}</span>
                      <div className="attachment-actions">
                        <button
                          className="attachment-btn"
                          title="Download"
                          onClick={() =>
                            downloadTruckAttachment(
                              att.file_path,
                              att.file_name,
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <a
                          href={`${BASE_URL}/${att.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="attachment-btn"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"TRUCKS"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Trucks</h1>
            <p className="page-subtitle">Manage your fleet</p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <AntSelect
              showSearch
              allowClear
              value={search_value}
              onChange={(val) => set_search_value(val ?? null)}
              style={{ width: 280, marginRight: 8 }}
              placeholder="🔍 Search unit code, plate, type..."
              filterOption={false}
              onSearch={handle_suggestion_search}
              onSelect={handle_suggestion_select}
              onClear={handle_reset_filter}
              loading={suggestion_loading}
              options={suggestions.map((s) => ({
                value: s.value,
                label: (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{s.label}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{s.sublabel}</span>
                  </div>
                ),
              }))}
              notFoundContent={suggestion_loading ? "Searching..." : "No results"}
            />
            <button
              className="add-btn"
              onClick={() => set_show_add_modal(true)}
            >
              Add
            </button>
          </Col>
        </Row>

        <div className="filter-tabs mb-3">
          {["all", "active", "dispatched", "maintenance", "inactive"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab-btn ${active_tab === tab ? "active" : ""}`}
              onClick={() => handle_tab_change(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">{get_tab_count(tab)}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          <Table
            onRowClick={(row) => {
              set_selected_row(row);
              set_edit_form(row);
              fetch_attachments(row.id);
              set_show_view_modal(true);
            }}
            tableHeaders={[
              "UNIT CODE",
              "PLATE NO.",
              "TRUCK TYPE",
              "COLOR",
              "CAPACITY (tons)",
              "OR EXPIRY",
              "STATUS",
            ]}
            headerSelector={[
              "unit_code",
              "plate_number",
              "truck_type",
              "color",
              "capacity",
              "expiry_badge",
              "status_badge",
            ]}
            tableData={filtered_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <AddModal
        title="TRUCK"
        size="lg"
        show={show_add_modal}
        onHide={() => {
          set_show_add_modal(false);
          set_add_form({ ...empty_form });
        }}
        onSave={handle_create}
        isClicked={is_clicked}
      >
        {form_fields(add_form, handle_add_change)}
      </AddModal>

      <EditModal
        title="TRUCK"
        size="lg"
        show={show_edit_modal}
        onHide={() => {
          set_show_edit_modal(false);
          set_or_editing(false);
          set_cr_editing(false);
          set_pending_delete_or_id(null);
          set_pending_delete_cr_id(null);
        }}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(
          edit_form,
          handle_edit_change,
          true,
          set_edit_or_attachments,
          set_edit_cr_attachments,
        )}
      </EditModal>

      <ViewModal
        title="TRUCK DETAILS"
        size="lg"
        withButtons
        show={show_view_modal}
        onHide={() => set_show_view_modal(false)}
        onEdit={() => {
          set_show_edit_modal(true);
          set_show_view_modal(false);
        }}
      >
        {view_content(edit_form)}
      </ViewModal>
    </div>
  );
}
