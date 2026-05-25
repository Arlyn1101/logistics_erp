import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import { useNavigate } from "react-router-dom";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
} from "../../Helpers/apiCalls/Manage/customerApi";
import { validateCustomer } from "../../Helpers/Validation/Manage/customerValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Customers() {
  const [inactive, set_inactive] = useState(false);
  const navigate = useNavigate();
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [customer_data, set_customer_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);

  const empty_form = {
    first_name: "",
    last_name: "",
    middle_name: "",
    suffix: "",
    trade_name: "",
    bir_name: "",
    trade_address: "",
    bir_address: "",
    tin: "",
    term: "",
    credit_limit: "",
    payee: "",
    vat_type: "",
    bir_2307: "",
    contact_person: "",
    contact_number: "",
    email: "",
    address: "",
  };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({ first_name: false, last_name: false });

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
    if (e.target.value === "edit-customer") {
      set_edit_form(row);
      set_show_edit_modal(true);
    } else if (e.target.value === "view-customer") {
      navigate(`/customers/${row.id}`);
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
        <option value="view-customer" className="color-options">
          View
        </option>
        <option value="edit-customer" className="color-options">
          Edit
        </option>
      </Form.Select>
    );
  }

  async function fetch_customers() {
    set_show_loader(true);
    const response = search_text
      ? await searchCustomers(search_text)
      : await getAllCustomers();
    if (response.data && response.data.data) {
      const result = response.data.data.map((c) => ({
          ...c,
          full_name: [c.first_name, c.middle_name, c.last_name, c.suffix]
              .filter(Boolean)
              .join(" "),
      }));
      set_customer_data(result);
    } else {
      set_customer_data([]);
    }
    set_show_loader(false);
  }

  function handle_row_click(row) {
    navigate(`/customers/${row.id}`);
  }

  async function handle_create() {
    if (validateCustomer(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createCustomer(add_form);
      if (response.data && response.data.response) {
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
      if (response.data && response.data.response) {
        toast.success("Customer updated successfully!", {
          style: toastStyle(),
        });
        set_show_edit_modal(false);
        fetch_customers();
      } else {
        toast.error("Failed to update customer.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  React.useEffect(() => {
    fetch_customers();
  }, []);

  // ─── Add / Edit form ───────────────────────────────────────────────────────
  const form_fields = (form, handle_change) => (
    <div className="mt-3">

      {/* Customer Name */}
      <div className="form-section-label">Customer Name</div>
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

      {/* Customer Information */}
      <div className="form-section-label">Customer Information</div>
      <Row className="nc-modal-custom-row">
        <Col>
          TRADE NAME
          <Form.Control
            type="text"
            name="trade_name"
            value={form.trade_name}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
        <Col>
          BIR NAME
          <Form.Control
            type="text"
            name="bir_name"
            value={form.bir_name}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          TRADE ADDRESS
          <Form.Control
            as="textarea"
            rows={2}
            name="trade_address"
            value={form.trade_address}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
        <Col>
          BIR REGISTERED ADDRESS
          <Form.Control
            as="textarea"
            rows={2}
            name="bir_address"
            value={form.bir_address}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          TIN
          <Form.Control
            type="text"
            name="tin"
            value={form.tin}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
        <Col>
          PAYEE
          <Form.Control
            type="text"
            name="payee"
            value={form.payee}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          TERM (DAYS)
          <Form.Control
            type="number"
            name="term"
            value={form.term}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
        <Col>
          CREDIT LIMIT
          <Form.Control
            type="number"
            name="credit_limit"
            value={form.credit_limit}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col>
          VAT TYPE
          <Form.Select
            name="vat_type"
            value={form.vat_type}
            className="nc-modal-custom-input"
            onChange={handle_change}
          >
            <option value="">Select</option>
            <option value="VAT">VAT</option>
            <option value="NVAT">NVAT</option>
          </Form.Select>
        </Col>
        <Col>
          BIR 2307
          <Form.Select
            name="bir_2307"
            value={form.bir_2307}
            className="nc-modal-custom-input"
            onChange={handle_change}
          >
            <option value="">Select</option>
            <option value="1%">1%</option>
            <option value="2%">2%</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Contact Details */}
      <div className="form-section-label">Contact Details</div>
      <Row className="nc-modal-custom-row">
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
      </Row>
      <Row className="nc-modal-custom-row">
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

    </div>
  );

  // ─── View modal record card ────────────────────────────────────────────────
  function view_content(form) {
    return (
      <div className="view-wrapper">
        <div className="view-header">
          <div className="view-header-left">
            <span className="view-title">
              {[form.first_name, form.middle_name, form.last_name, form.suffix]
                .filter(Boolean)
                .join(" ") || "—"}
            </span>
            <span className="view-subtitle">{form.trade_name || "No trade name"}</span>
          </div>
        </div>

        <div className="view-details">
          <div className="view-detail-row">
            <span className="view-detail-label">BIR NAME</span>
            <span className={form.bir_name ? "view-detail-value" : "view-empty-value"}>
              {form.bir_name || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">TIN</span>
            <span className={form.tin ? "view-detail-value" : "view-empty-value"}>
              {form.tin || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">TRADE ADDRESS</span>
            <span className={form.trade_address ? "view-detail-value" : "view-empty-value"}>
              {form.trade_address || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">BIR ADDRESS</span>
            <span className={form.bir_address ? "view-detail-value" : "view-empty-value"}>
              {form.bir_address || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">TERM</span>
            <span className={form.term ? "view-detail-value" : "view-empty-value"}>
              {form.term ? `${form.term} days` : "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">CREDIT LIMIT</span>
            <span className={form.credit_limit ? "view-detail-value" : "view-empty-value"}>
              {form.credit_limit || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">PAYEE</span>
            <span className={form.payee ? "view-detail-value" : "view-empty-value"}>
              {form.payee || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">VAT TYPE</span>
            <span className={form.vat_type ? "view-detail-value" : "view-empty-value"}>
              {form.vat_type || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">BIR 2307</span>
            <span className={form.bir_2307 ? "view-detail-value" : "view-empty-value"}>
              {form.bir_2307 || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">CONTACT PERSON</span>
            <span className={form.contact_person ? "view-detail-value" : "view-empty-value"}>
              {form.contact_person || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">CONTACT NO.</span>
            <span className={form.contact_number ? "view-detail-value" : "view-empty-value"}>
              {form.contact_number || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">EMAIL</span>
            <span className={form.email ? "view-detail-value" : "view-empty-value"}>
              {form.email || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">ADDRESS</span>
            <span className={form.address ? "view-detail-value" : "view-empty-value"}>
              {form.address || "—"}
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
          active={"CUSTOMERS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">
              Manage customer accounts and contact details
            </p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              name="search"
              placeholder="Search customer..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => {
                if (e.key === "Enter") fetch_customers();
              }}
            />
            <button
              className="add-btn"
              onClick={() => navigate("/customers/new")}
            >
              Add
            </button>
          </Col>
        </Row>

        <div className="tab-content">
          <Table
            onRowClick={handle_row_click}   // ← keep only this one
            tableHeaders={["TRADE NAME", "TIN", "CONTACT PERSON", "CONTACT NO.", "EMAIL"]}
            headerSelector={["trade_name", "tin",  "full_name", "contact_number", "email"]}
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
