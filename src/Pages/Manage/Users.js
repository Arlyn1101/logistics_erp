import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import DeleteModal from "../../Components/Modals/DeleteModal";
import InputError from "../../Components/InputError/InputError";
import { getAPICall, postAPICall, BASE_URL } from "../../Helpers/apiCalls/axiosMethodCalls";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../Helpers/apiCalls/Manage/userApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Users() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [user_data, set_user_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_delete_modal, set_show_delete_modal] = useState(false);

  const empty_form = { name: "", username: "", password: "", type: "staff", status: "active" };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({ name: false, username: false, password: false });

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
    var error = { first_name: false, last_name: false, email: false, password: false };
    if (!data.first_name) { error.first_name = true; is_valid = false; }
    if (!data.last_name)  { error.last_name  = true; is_valid = false; }
    if (!data.email)      { error.email      = true; is_valid = false; }
    if (!for_edit && !data.password) { error.password = true; is_valid = false; }
    set_is_error(error);
    return is_valid;
  }

  function handle_select_change(e, row) {
    set_selected_row(row);
    set_edit_form({ ...row, password: "" });
    if (e.target.value === "edit-user") set_show_edit_modal(true);
    else if (e.target.value === "delete-user") set_show_delete_modal(true);
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
        <option defaultValue selected hidden>Select</option>
        <option value="edit-user" className="color-options">Edit</option>
        <option value="delete-user" className="color-red">Delete</option>
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
        full_name: `${a.first_name} ${a.last_name}`,
        role_badge: StatusBadge(a.role),
        action_btn: ActionBtn(a),
      }));
      set_user_data(result);
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

  async function handle_delete() {
    const response = await deleteUser(selected_row.id);
    if (response.data && response.data.status === "success") {
      toast.success("User deleted.", { style: toastStyle() });
      set_show_delete_modal(false);
      fetch_users();
    } else {
      toast.error("Failed to delete user.", { style: toastStyle() });
    }
  }

  React.useEffect(() => { fetch_users(); }, []);

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
          <InputError isValid={is_error.first_name} message="First name is required" />
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
          <InputError isValid={is_error.last_name} message="Last name is required" />
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
          ROLE
          <div className="status-select-wrap">
            <span className={`status-dot ${form.role === "admin" ? "active" : form.role === "dispatcher" ? "active" : "inactive"}`}></span>
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
          </div>
        </Col>
      </Row>
      <div className="form-section-label">Security</div>
      <Row className="nc-modal-custom-row">
        <Col xs={6}>
          PASSWORD {!for_edit && <span className="required-icon">*</span>}
          {for_edit && <span className="field-hint">Leave blank to keep current password</span>}
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            className="nc-modal-custom-input"
            onChange={handle_change}
            placeholder={for_edit ? "Leave blank to keep current" : ""}
          />
          <InputError isValid={is_error.password} message="Password is required" />
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(is_inactive) => set_inactive(is_inactive)} active={"USERS"} />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}><h1 className="page-title">Users</h1></Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              placeholder="Search user..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => { if (e.key === "Enter") fetch_users(); }}
            />
            <button className="add-btn" onClick={() => set_show_add_modal(true)}>Add</button>
          </Col>
        </Row>
        <div className="tab-content">
          <Table
            tableHeaders={["NAME", "EMAIL", "ROLE", "ACTIONS"]}
            headerSelector={["full_name", "email", "role_badge", "action_btn"]}
            tableData={user_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <AddModal title="USER" size="lg" show={show_add_modal} onHide={() => set_show_add_modal(false)} onSave={handle_create} isClicked={is_clicked}>
        {form_fields(add_form, handle_add_change)}
      </AddModal>
      <EditModal title="USER" size="lg" show={show_edit_modal} onHide={() => set_show_edit_modal(false)} onSave={handle_update} isClicked={is_clicked}>
        {form_fields(edit_form, handle_edit_change, true)}
      </EditModal>
      <DeleteModal text="user" show={show_delete_modal} onHide={() => set_show_delete_modal(false)} onDelete={handle_delete} />
    </div>
  );
}
