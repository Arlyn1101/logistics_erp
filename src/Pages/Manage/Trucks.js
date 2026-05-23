import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import DeleteModal from "../../Components/Modals/DeleteModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllTrucks,
  searchTrucks,
  createTruck,
  updateTruck,
  deleteTruck,
} from "../../Helpers/apiCalls/Manage/truckApi";
import { validateTruck } from "../../Helpers/Validation/Manage/truckValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Trucks() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [active_tab, set_active_tab] = useState("all");
  const [truck_data, set_truck_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);
  const [show_delete_modal, set_show_delete_modal] = useState(false);

  const empty_form = {
    unit_code: "",
    plate_number: "",
    color: "",
    capacity: "",
    km_per_liter: "",
    status: "active",
    remarks: "",
  };

  const [add_form, set_add_form] = useState({ ...empty_form });
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
    if (e.target.value === "edit-truck") set_show_edit_modal(true);
    else if (e.target.value === "view-truck") set_show_view_modal(true);
    else if (e.target.value === "delete-truck") set_show_delete_modal(true);
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
        <option value="delete-truck" className="color-red">
          Delete
        </option>
      </Form.Select>
    );
  }

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((row) => row.status === tab);
  }

  async function fetch_trucks() {
    set_show_loader(true);
    const response = search_text
      ? await searchTrucks(search_text)
      : await getAllTrucks();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        status_badge: StatusBadge(a.status),
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
      const response = await createTruck(add_form);
      if (response.data && response.data.status === "success") {
        toast.success("Truck added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
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
      const response = await updateTruck(edit_form);
      if (response.data && response.data.status === "success") {
        toast.success("Truck updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_trucks();
      } else {
        toast.error("Failed to update truck.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_delete() {
    const response = await deleteTruck(selected_row.id);
    if (response.data && response.data.status === "success") {
      toast.success("Truck deleted.", { style: toastStyle() });
      set_show_delete_modal(false);
      fetch_trucks();
    } else {
      toast.error("Failed to delete truck.", { style: toastStyle() });
    }
  }

  React.useEffect(() => {
    fetch_trucks();
  }, []);

  /* ── FORM FIELDS — Add and Edit modals ── */
  const form_fields = (form, handle_change) => (
    <div className="mt-3">
      <p className="form-section-label">Truck Information</p>
      <Row className="nc-modal-custom-row">
        <Col>
          UNIT CODE <span className="required-icon">*</span>
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
          PLATE NUMBER <span className="required-icon">*</span>
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
          COLOR
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
          CAPACITY
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

      <p className="form-section-label" style={{ marginTop: "18px" }}>
        Fuel Details
      </p>
      <Row className="nc-modal-custom-row">
        <Col xs={6}>
          KM PER LITER
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
        <Col xs={6}>
          STATUS
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
            </Form.Select>
          </div>
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          REMARKS
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
            <input
              type="search"
              placeholder="Search truck..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => {
                if (e.key === "Enter") fetch_trucks();
              }}
            />
            <button
              className="add-btn"
              onClick={() => set_show_add_modal(true)}
            >
              Add Truck
            </button>
          </Col>
        </Row>

        <div className="filter-tabs mb-3">
          {["all", "active", "inactive"].map((tab) => (
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
            tableHeaders={[
              "UNIT CODE",
              "PLATE NO.",
              "COLOR",
              "CAPACITY (tons)",
              "KM/LITER",
              "STATUS",
              "ACTIONS",
            ]}
            headerSelector={[
              "unit_code",
              "plate_number",
              "color",
              "capacity",
              "km_per_liter",
              "status_badge",
              "action_btn",
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
        onHide={() => set_show_edit_modal(false)}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(edit_form, handle_edit_change)}
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

      <DeleteModal
        text="truck"
        show={show_delete_modal}
        onHide={() => set_show_delete_modal(false)}
        onDelete={handle_delete}
      />
    </div>
  );
}
