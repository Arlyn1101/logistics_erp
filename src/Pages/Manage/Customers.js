import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import DeleteModal from "../../Components/Modals/DeleteModal";
import InputError from "../../Components/InputError/InputError";
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateCustomer } from "../../Helpers/Validation/Manage/customerValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Customers() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [customer_data, set_customer_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);
  const [show_delete_modal, set_show_delete_modal] = useState(false);

  const empty_form = {
    name: "",
    contact_person: "",
    contact_number: "",
    email: "",
    address: "",
  };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({ name: false });

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
    if (e.target.value === "edit-customer") set_show_edit_modal(true);
    else if (e.target.value === "view-customer") set_show_view_modal(true);
    else if (e.target.value === "delete-customer") set_show_delete_modal(true);
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
        <option value="view-customer" className="color-options">View</option>
        <option value="edit-customer" className="color-options">Edit</option>
        <option value="delete-customer" className="color-red">Delete</option>
      </Form.Select>
    );
  }

  async function fetch_customers() {
    set_show_loader(true);
    const response = await getAllCustomers(search_text);
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        action_btn: ActionBtn(a),
      }));
      set_customer_data(result);
    } else {
      set_customer_data([]);
    }
    set_show_loader(false);
  }

  async function handle_create() {
    if (validateCustomer(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createCustomer(add_form);
      if (response.data && response.data.status === "success") {
        toast.success("Customer added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        fetch_customers();
      } else {
        toast.error("Failed to add customer.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validateCustomer(edit_form, set_is_error)) {
      set_is_clicked(true);
      const response = await updateCustomer(edit_form);
      if (response.data && response.data.status === "success") {
        toast.success("Customer updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_customers();
      } else {
        toast.error("Failed to update customer.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_delete() {
    const response = await deleteCustomer(selected_row.id);
    if (response.data && response.data.status === "success") {
      toast.success("Customer deleted.", { style: toastStyle() });
      set_show_delete_modal(false);
      fetch_customers();
    } else {
      toast.error("Failed to delete customer.", { style: toastStyle() });
    }
  }

  React.useEffect(() => {
    fetch_customers();
  }, []);

  // ─── Add / Edit form ───────────────────────────────────────────────────────
  const form_fields = (form, handle_change) => (
    <div className="mt-3">
      {/* ── Customer Information ── */}
      <div className="form-section-label">Customer Information</div>
      <Row className="nc-modal-custom-row">
        <Col>
          NAME <span className="required-icon">*</span>
          <Form.Control
            type="text"
            name="name"
            value={form.name}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
          <InputError isValid={is_error.name} message="Customer name is required" />
        </Col>
        <Col>
          CONTACT PERSON
          <Form.Control
            type="text"
            name="contact_person"
            value={form.contact_person}
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
            name="address"
            value={form.address}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>

      {/* ── Contact Details ── */}
      <div className="form-section-label">Contact Details</div>
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
    </div>
  );

  // ─── View modal record card ────────────────────────────────────────────────
  function view_content(form) {
    return (
      <div className="view-wrapper">
        {/* Header */}
        <div className="view-header">
          <div className="view-header-left">
            <span className="view-title">{form.name || "—"}</span>
            <span className="view-subtitle">{form.contact_person || "No contact person"}</span>
          </div>
        </div>

        {/* Spec strip */}
        <div className="spec-strip">
          <div className="spec-card">
            <span className="spec-value">{form.contact_person || "—"}</span>
            <span className="spec-label">Contact Person</span>
          </div>
          <div className="spec-card">
            <span className="spec-value">{form.contact_number || "—"}</span>
            <span className="spec-label">Contact No.</span>
          </div>
          <div className="spec-card">
            <span className="spec-value" style={{ fontSize: "14px" }}>{form.email || "—"}</span>
            <span className="spec-label">Email</span>
          </div>
        </div>

        {/* Detail rows */}
        <div className="view-details">
          <div className="view-detail-row">
            <span className="view-detail-label">ADDRESS</span>
            <span className={form.address ? "view-detail-value" : "view-empty-value"}>
              {form.address || "No address on record"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(is_inactive) => set_inactive(is_inactive)} active={"CUSTOMERS"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Manage customer accounts and contact details</p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              name="search"
              placeholder="Search customer..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => { if (e.key === "Enter") fetch_customers(); }}
            />
            <button className="add-btn" onClick={() => set_show_add_modal(true)}>Add</button>
          </Col>
        </Row>

        <div className="tab-content">
          <Table
            tableHeaders={["CUSTOMER NAME", "CONTACT PERSON", "CONTACT NO.", "EMAIL", "ADDRESS", "ACTIONS"]}
            headerSelector={["name", "contact_person", "contact_number", "email", "address", "action_btn"]}
            tableData={customer_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <AddModal
        title="CUSTOMER"
        size="lg"
        show={show_add_modal}
        onHide={() => { set_show_add_modal(false); set_add_form({ ...empty_form }); }}
        onSave={handle_create}
        isClicked={is_clicked}
      >
        {form_fields(add_form, handle_add_change)}
      </AddModal>

      <EditModal
        title="CUSTOMER"
        size="lg"
        show={show_edit_modal}
        onHide={() => set_show_edit_modal(false)}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(edit_form, handle_edit_change)}
      </EditModal>

      <ViewModal
        title="CUSTOMER DETAILS"
        size="lg"
        withButtons
        show={show_view_modal}
        onHide={() => set_show_view_modal(false)}
        onEdit={() => { set_show_edit_modal(true); set_show_view_modal(false); }}
      >
        {view_content(edit_form)}
      </ViewModal>

      <DeleteModal
        text="customer"
        show={show_delete_modal}
        onHide={() => set_show_delete_modal(false)}
        onDelete={handle_delete}
      />
    </div>
  );
}