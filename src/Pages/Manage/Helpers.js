import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllHelpers,
  searchHelpers,
  createHelper,
  updateHelper,
} from "../../Helpers/apiCalls/Manage/helperApi";
import { validateHelper } from "../../Helpers/Validation/Manage/helperValidation";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Helpers() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [active_tab, set_active_tab] = useState("all");
  const [helper_data, set_helper_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);

  const empty_form = {
    first_name: "",
    last_name: "",
    contact_number: "",
    address: "",
    status: "active",
    middle_name: "",
    suffix: "",
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
  };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    first_name: false,
    last_name: false,
  });

  const handle_add_change = (e) => {
    const { name, value } = e.target;
    set_add_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_edit_change = (e) => {
    const { name, value } = e.target;
    set_edit_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_add_birthdate_change = (date) => {
    set_add_form((prev) => ({
      ...prev,
      birthdate: moment(date).format("YYYY-MM-DD"),
    }));
  };

  const handle_edit_birthdate_change = (date) => {
    set_edit_form((prev) => ({
      ...prev,
      birthdate: moment(date).format("YYYY-MM-DD"),
    }));
  };

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((d) => d.status === tab);
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(helper_data, tab));
  }

  function get_tab_count(tab) {
    if (tab === "all") return helper_data.length;
    return helper_data.filter((d) => d.status === tab).length;
  }

  async function fetch_helpers() {
    set_show_loader(true);
    const response = search_text
      ? await searchHelpers(search_text)
      : await getAllHelpers();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        full_name: `${a.first_name} ${a.last_name}`,
        status_badge: StatusBadge(a.status),
      }));
      set_helper_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_helper_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  function handle_row_click(row) {
    set_selected_row(row);
    set_edit_form(row);
    set_show_view_modal(true);
  }

  async function handle_create() {
    if (validateHelper(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createHelper(add_form);
      if (response.data && response.data.response) {
        toast.success("Helper added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        fetch_helpers();
      } else {
        toast.error("Failed to add helper.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validateHelper(edit_form, set_is_error)) {
      set_is_clicked(true);
      const response = await updateHelper(edit_form);
      if (response.data && response.data.response) {
        toast.success("Helper updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_helpers();
      } else {
        toast.error("Failed to update helper.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  React.useEffect(() => {
    fetch_helpers();
  }, []);

  // ─── Add / Edit form ───────────────────────────────────────────────────────
  const form_fields = (form, handle_change, is_edit = false) => {
    const status_dot_class =
      form.status === "active"
        ? "status-dot active"
        : form.status === "inactive"
          ? "status-dot inactive"
          : "status-dot";

    return (
      <div className="mt-3">
        <div className="form-section-label">Helper Information</div>
        <Row className="nc-modal-custom-row">
          <Col>
            FIRST NAME <span className="required-icon">*</span>
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
          </Col>
          <Col>
            MIDDLE NAME
            <Form.Control
              type="text"
              name="middle_name"
              value={form.middle_name}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
          <Col>
            LAST NAME <span className="required-icon">*</span>
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
          </Col>
          <Col xs={2}>
            SUFFIX
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
            CONTACT NUMBER
            <Form.Control
              type="text"
              name="contact_number"
              value={form.contact_number}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
          {is_edit && (
            <Col>
              STATUS
              <div className="status-select-wrap">
                <span className={status_dot_class}></span>
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
          )}
        </Row>
        <Row className="nc-modal-custom-row">
          <Col>
            ADDRESS
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

        {/* ── Personal Info ── */}
        <div className="form-section-label">Personal Information</div>
        <Row className="nc-modal-custom-row">
          <Col>
            <div>BIRTHDATE</div>
            <ReactDatePicker
              selected={form.birthdate ? new Date(form.birthdate) : null}
              onChange={
                form === add_form
                  ? handle_add_birthdate_change
                  : handle_edit_birthdate_change
              }
              dateFormat="yyyy-MM-dd"
              className="nc-modal-custom-input w-100"
              placeholderText="Select date"
            />
          </Col>
          <Col>
            <div>GENDER</div>
            <Form.Select
              name="gender"
              value={form.gender}
              className="nc-modal-custom-select"
              onChange={handle_change}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Form.Select>
          </Col>
          <Col>
            <div>CIVIL STATUS</div>
            <Form.Select
              name="civil_status"
              value={form.civil_status}
              className="nc-modal-custom-select"
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
            NATIONALITY
            <Form.Control
              type="text"
              name="nationality"
              value={form.nationality}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
          <Col>
            RELIGION
            <Form.Control
              type="text"
              name="religion"
              value={form.religion}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
          <Col>
            EMAIL
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
        </Row>

        {/* ── Emergency Contact ── */}
        <div className="form-section-label">Emergency Contact</div>
        <Row className="nc-modal-custom-row">
          <Col>
            NAME
            <Form.Control
              type="text"
              name="emergency_contact_name"
              value={form.emergency_contact_name}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
          <Col>
            CONTACT NUMBER
            <Form.Control
              type="text"
              name="emergency_contact_number"
              value={form.emergency_contact_number}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
          <Col>
            RELATIONSHIP
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
            ADDRESS
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
      </div>
    );
  };

  // ─── View modal record card ────────────────────────────────────────────────
  function view_content(form) {
    const full_name = [
      form.first_name,
      form.middle_name,
      form.last_name,
      form.suffix,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="view-wrapper">
        {/* Header */}
        <div className="view-header">
          <div className="view-header-left">
            <span className="view-title">{full_name || "—"}</span>
            <span className="view-subtitle">
              {form.contact_number || "No contact number"}
            </span>
          </div>
          <span
            className={`status-badge ${form.status}`}
            style={{ alignSelf: "center" }}
          >
            {form.status}
          </span>
        </div>

        <div className="view-details">
          <div className="form-section-label">Helper Information</div>
          <div className="view-detail-row">
            <span className="view-detail-label">CONTACT NO.</span>
            <span
              className={
                form.contact_number ? "view-detail-value" : "view-empty-value"
              }
            >
              {form.contact_number || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">ADDRESS</span>
            <span
              className={
                form.address ? "view-detail-value" : "view-empty-value"
              }
            >
              {form.address || "No address on record"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">STATUS</span>
            <span className={`status-badge ${form.status}`}>{form.status}</span>
          </div>

          <div className="form-section-label mt-3">Personal Information</div>
          <div className="view-detail-row">
            <span className="view-detail-label">BIRTHDATE</span>
            <span
              className={
                form.birthdate ? "view-detail-value" : "view-empty-value"
              }
            >
              {form.birthdate ? dateFormat(form.birthdate) : "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">GENDER</span>
            <span
              className={form.gender ? "view-detail-value" : "view-empty-value"}
            >
              {form.gender || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">CIVIL STATUS</span>
            <span
              className={
                form.civil_status ? "view-detail-value" : "view-empty-value"
              }
            >
              {form.civil_status || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">NATIONALITY</span>
            <span
              className={
                form.nationality ? "view-detail-value" : "view-empty-value"
              }
            >
              {form.nationality || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">RELIGION</span>
            <span
              className={
                form.religion ? "view-detail-value" : "view-empty-value"
              }
            >
              {form.religion || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">EMAIL</span>
            <span
              className={form.email ? "view-detail-value" : "view-empty-value"}
            >
              {form.email || "—"}
            </span>
          </div>

          <div className="form-section-label mt-3">Emergency Contact</div>
          <div className="view-detail-row">
            <span className="view-detail-label">NAME</span>
            <span
              className={
                form.emergency_contact_name
                  ? "view-detail-value"
                  : "view-empty-value"
              }
            >
              {form.emergency_contact_name || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">CONTACT NO.</span>
            <span
              className={
                form.emergency_contact_number
                  ? "view-detail-value"
                  : "view-empty-value"
              }
            >
              {form.emergency_contact_number || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">RELATIONSHIP</span>
            <span
              className={
                form.emergency_contact_relationship
                  ? "view-detail-value"
                  : "view-empty-value"
              }
            >
              {form.emergency_contact_relationship || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">ADDRESS</span>
            <span
              className={
                form.emergency_contact_address
                  ? "view-detail-value"
                  : "view-empty-value"
              }
            >
              {form.emergency_contact_address || "—"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"HELPERS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Helpers</h1>
            <p className="page-subtitle">Manage helper personnel records</p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              placeholder="Search helper..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => {
                if (e.key === "Enter") fetch_helpers();
              }}
            />
            <button
              className="add-btn"
              onClick={() => set_show_add_modal(true)}
            >
              Add
            </button>
          </Col>
        </Row>

        {/* Filter tabs */}
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
            tableHeaders={["NAME", "CONTACT NO.", "ADDRESS", "STATUS"]}
            headerSelector={[
              "full_name",
              "contact_number",
              "address",
              "status_badge",
            ]}
            tableData={filtered_data}
            showLoader={show_loader}
            withActionData={true}
            onRowClick={handle_row_click}
          />
        </div>
      </div>

      <AddModal
        title="HELPER"
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
        title="HELPER"
        size="lg"
        show={show_edit_modal}
        onHide={() => set_show_edit_modal(false)}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(edit_form, handle_edit_change, true)}
      </EditModal>

      <ViewModal
        title="HELPER DETAILS"
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
