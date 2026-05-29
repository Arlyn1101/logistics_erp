import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";
import { Select as AntSelect } from "antd";
import {
  getAllUsers,
  createUser,
  updateUser,
  getUserSuggestions,
} from "../../Helpers/apiCalls/Manage/userApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Users() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [user_data, set_user_data] = useState([]);
  const [user_data_filtered, set_user_data_filtered] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);
  const [suggestions, set_suggestions] = useState([]);
  const [suggestion_loading, set_suggestion_loading] = useState(false);
  const [active_filter, set_active_filter] = useState(null);
  const [search_value, set_search_value] = useState(null);
  const [active_role_filter, set_active_role_filter] = useState("");

  const empty_form = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "viewer",
  };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    name: false,
    username: false,
    password: false,
  });

  const handle_add_change = (e) => {
    const { name, value } = e.target;
    set_add_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_edit_change = (e) => {
    const { name, value } = e.target;
    set_edit_form((prev) => ({ ...prev, [name]: value }));
  };

  function validate_user(data, for_edit = false) {
    var is_valid = true;
    var error = {
      first_name: false,
      last_name: false,
      email: false,
      password: false,
    };
    if (!data.first_name) {
      error.first_name = true;
      is_valid = false;
    }
    if (!data.last_name) {
      error.last_name = true;
      is_valid = false;
    }
    if (!data.email) {
      error.email = true;
      is_valid = false;
    }
    if (!for_edit && !data.password) {
      error.password = true;
      is_valid = false;
    }
    set_is_error(error);
    return is_valid;
  }

  function ActionBtn(row) {
    return (
      <Form.Select
        name="action"
        className="PO-select-action form-select"
        value={""}
      >
        <option defaultValue selected hidden>
          Select
        </option>
        <option value="edit-user" className="color-options">
          Edit
        </option>
        <option value="delete-user" className="color-red">
          Delete
        </option>
      </Form.Select>
    );
  }

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  async function fetch_users() {
    set_show_loader(true);
    const response = await getAllUsers();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        name: `${a.first_name} ${a.last_name}`,
        username: a.email,
        type: a.role,
        status_badge: StatusBadge(a.role),
      }));
      set_user_data(result);
      set_user_data_filtered(result);
    } else {
      set_user_data([]);
    }
    set_show_loader(false);
  }

  async function handle_create() {
    if (validate_user(add_form)) {
      set_is_clicked(true);
      const response = await createUser(add_form);
      if (response.data && response.data.status === "success") {
        toast.success("User added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        fetch_users();
      } else {
        toast.error("Failed to add user.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validate_user(edit_form, true)) {
      set_is_clicked(true);
      const response = await updateUser(edit_form);
      if (response.data && response.data.status === "success") {
        toast.success("User updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_users();
      } else {
        toast.error("Failed to update user.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  React.useEffect(() => {
    fetch_users();
  }, []);

  async function handle_suggestion_search(keyword) {
    if (!keyword || keyword.trim().length < 1) {
      set_suggestions([]);
      return;
    }
    set_suggestion_loading(true);
    const res = await getUserSuggestions(keyword);
    if (res.data?.data?.users) {
      const options = res.data.data.users.map((item) => ({
        value: `user_id::${item.id}`,
        label: `👤 ${item.label}`,
        sublabel: "User",
      }));
      set_suggestions(options);
    }
    set_suggestion_loading(false);
  }

  function handle_suggestion_select(value, option) {
    const [type, id] = value.split("::");
    set_active_filter({ type, id, label: option.label });
    let filtered = user_data.filter((row) => String(row.id) === String(id));
    if (active_role_filter)
      filtered = filtered.filter((row) => row.role === active_role_filter);
    set_user_data_filtered(filtered);
  }

  function handle_reset_filter() {
    set_active_filter(null);
    set_suggestions([]);
    set_search_value(null);
    set_active_role_filter("");
    set_user_data_filtered(user_data);
  }

  function handle_role_filter(role) {
    set_active_role_filter(role);
    const base = active_filter
      ? user_data.filter((row) => String(row.id) === String(active_filter.id))
      : user_data;
    const filtered = role ? base.filter((row) => row.role === role) : base;
    set_user_data_filtered(filtered);
  }

  const form_fields = (form, handle_change, for_edit = false) => (
    <div className="mt-3">
      <div className="form-section-label">User Information</div>
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
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          EMAIL <span className="required-icon">*</span>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
          <InputError isValid={is_error.email} message="Email is required" />
        </Col>
        <Col>
          TYPE
          <Form.Select
            name="role"
            value={form.role}
            className="nc-modal-custom-select"
            onChange={handle_change}
          >
            <option value="admin">Admin</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="viewer">Viewer</option>
          </Form.Select>
        </Col>
      </Row>
      <div className="form-section-label">Security</div>
      <Row className="nc-modal-custom-row">
        <Col xs={6}>
          PASSWORD {!for_edit && <span className="required-icon">*</span>}
          {for_edit && (
            <span className="field-hint">
              Leave blank to keep current password
            </span>
          )}
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            className="nc-modal-custom-input"
            onChange={handle_change}
            placeholder={for_edit ? "Leave blank to keep current" : ""}
          />
          <InputError
            isValid={is_error.password}
            message="Password is required"
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"USERS"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Users</h1>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <Form.Select
              value={active_role_filter}
              onChange={(e) => handle_role_filter(e.target.value)}
              className="nc-modal-custom-select"
              style={{ width: 160, marginRight: 8 }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="viewer">Viewer</option>
            </Form.Select>
            <AntSelect
              showSearch
              allowClear
              value={search_value}
              onChange={(val) => set_search_value(val ?? null)}
              style={{ width: 280, marginRight: 8 }}
              placeholder="🔍 Search name, email, role..."
              filterOption={false}
              onSearch={handle_suggestion_search}
              onSelect={handle_suggestion_select}
              onClear={handle_reset_filter}
              loading={suggestion_loading}
              options={suggestions.map((s) => ({
                value: s.value,
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{s.label}</span>
                    <span
                      style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}
                    >
                      {s.sublabel}
                    </span>
                  </div>
                ),
              }))}
              notFoundContent={
                suggestion_loading ? "Searching..." : "No results"
              }
            />
            <button
              type="button"
              className="add-btn"
              onClick={() => set_show_add_modal(true)}
            >
              Add
            </button>
          </Col>
        </Row>
        <div className="tab-content">
          <Table
            onRowClick={(row) => {
              set_selected_row(row);
              set_edit_form({
                ...row,
                first_name: row.first_name || "",
                last_name: row.last_name || "",
                password: "",
              });
              set_show_view_modal(true);
            }}
            tableHeaders={["NAME", "EMAIL", "ROLE"]}
            headerSelector={["name", "email", "role"]}
            tableData={user_data_filtered}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <AddModal
        title="USER"
        size="lg"
        show={show_add_modal}
        onHide={() => set_show_add_modal(false)}
        onSave={handle_create}
        isClicked={is_clicked}
      >
        {form_fields(add_form, handle_add_change)}
      </AddModal>
      <EditModal
        title="USER"
        size="lg"
        show={show_edit_modal}
        onHide={() => set_show_edit_modal(false)}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(edit_form, handle_edit_change, true)}
      </EditModal>
      <ViewModal
        title="USER DETAILS"
        size="lg"
        withButtons
        show={show_view_modal}
        onHide={() => set_show_view_modal(false)}
        onEdit={() => {
          set_show_edit_modal(true);
          set_show_view_modal(false);
        }}
      >
        <div className="view-wrapper">
          <div className="view-header">
            <div className="view-header-left">
              <span className="view-title">
                {`${selected_row.first_name || ""} ${selected_row.last_name || ""}`.trim() ||
                  "—"}
              </span>
              <span className="view-subtitle">{selected_row.email || "—"}</span>
            </div>
          </div>
          <div className="view-details">
            <div className="view-detail-row">
              <span className="view-detail-label">NAME</span>
              <span
                className={
                  selected_row.first_name
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {`${selected_row.first_name || ""} ${selected_row.last_name || ""}`.trim() ||
                  "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">EMAIL</span>
              <span
                className={
                  selected_row.email ? "view-detail-value" : "view-empty-value"
                }
              >
                {selected_row.email || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">ROLE</span>
              <span
                className={
                  selected_row.role ? "view-detail-value" : "view-empty-value"
                }
              >
                {selected_row.role || "—"}
              </span>
            </div>
          </div>
        </div>
      </ViewModal>
    </div>
  );
}
