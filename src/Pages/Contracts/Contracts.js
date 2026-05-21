import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import DeleteModal from "../../Components/Modals/DeleteModal";
import InputError from "../../Components/InputError/InputError";
import { getAllContracts, createContract, updateContract, deleteContract } from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateContract } from "../../Helpers/Validation/Contracts/contractValidation";
import { toastStyle, formatAmount } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Contracts() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [contract_data, set_contract_data] = useState([]);
  const [customer_options, set_customer_options] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);
  const [show_delete_modal, set_show_delete_modal] = useState(false);

  const empty_form = {
    customer_id: "",
    monthly_rate: "",
    included_trips: "",
    excess_trip_charge: "",
    fuel_price_per_liter: "",
    start_date: "",
    end_date: "",
    status: "active",
    remarks: "",
  };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({});

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
    if (e.target.value === "edit-contract") set_show_edit_modal(true);
    else if (e.target.value === "view-contract") set_show_view_modal(true);
    else if (e.target.value === "delete-contract") set_show_delete_modal(true);
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
        <option value="view-contract" className="color-options">View</option>
        <option value="edit-contract" className="color-options">Edit</option>
        <option value="delete-contract" className="color-red">Delete</option>
      </Form.Select>
    );
  }

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  async function fetch_customers() {
    const response = await getAllCustomers();
    if (response.data && response.data.data) {
      set_customer_options(response.data.data);
    }
  }

  async function fetch_contracts() {
    set_show_loader(true);
    const response = await getAllContracts(search_text);
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        monthly_rate_fmt: `₱ ${formatAmount(a.monthly_rate)}`,
        fuel_price_fmt: `₱ ${formatAmount(a.fuel_price_per_liter)}`,
        excess_fmt: `₱ ${formatAmount(a.excess_trip_charge)}`,
        status_badge: StatusBadge(a.status),
        action_btn: ActionBtn(a),
      }));
      set_contract_data(result);
    } else {
      set_contract_data([]);
    }
    set_show_loader(false);
  }

  async function handle_create() {
    if (validateContract(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createContract(add_form);
      if (response.data && response.data.status === "success") {
        toast.success("Contract added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        fetch_contracts();
      } else {
        toast.error("Failed to add contract.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validateContract(edit_form, set_is_error)) {
      set_is_clicked(true);
      const response = await updateContract(edit_form);
      if (response.data && response.data.status === "success") {
        toast.success("Contract updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_contracts();
      } else {
        toast.error("Failed to update contract.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_delete() {
    const response = await deleteContract(selected_row.id);
    if (response.data && response.data.status === "success") {
      toast.success("Contract deleted.", { style: toastStyle() });
      set_show_delete_modal(false);
      fetch_contracts();
    } else {
      toast.error("Failed to delete contract.", { style: toastStyle() });
    }
  }

  useEffect(() => {
    fetch_customers();
    fetch_contracts();
  }, []);

  const form_fields = (form, handle_change, disabled = false) => (
    <div className="mt-3">
      <Row className="nc-modal-custom-row">
        <Col>
          CUSTOMER <span className="required-icon">*</span>
          {disabled ? (
            <Form.Control
              type="text"
              value={customer_options.find((c) => String(c.id) === String(form.customer_id))?.name || form.customer_name || ""}
              className="nc-modal-custom-input-edit"
              disabled
            />
          ) : (
            <Form.Select
              name="customer_id"
              value={form.customer_id}
              className="nc-modal-custom-select"
              onChange={handle_change}
            >
              <option value="">-- Select Customer --</option>
              {customer_options.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          )}
          <InputError isValid={is_error.customer_id} message="Customer is required" />
        </Col>
        <Col>
          STATUS
          {disabled ? (
            <Form.Control type="text" value={form.status} className="nc-modal-custom-input-edit" disabled />
          ) : (
            <Form.Select
              name="status"
              value={form.status}
              className="nc-modal-custom-select"
              onChange={handle_change}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </Form.Select>
          )}
        </Col>
      </Row>

      <Row className="nc-modal-custom-row">
        <Col>
          MONTHLY RATE (₱) <span className="required-icon">*</span>
          <Form.Control
            type="number"
            name="monthly_rate"
            value={form.monthly_rate}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
            placeholder="e.g. 10000"
          />
          <InputError isValid={is_error.monthly_rate} message="Monthly rate is required" />
        </Col>
        <Col>
          INCLUDED TRIPS / MONTH <span className="required-icon">*</span>
          <Form.Control
            type="number"
            name="included_trips"
            value={form.included_trips}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
            placeholder="e.g. 4"
          />
          <InputError isValid={is_error.included_trips} message="Included trips is required" />
        </Col>
      </Row>

      <Row className="nc-modal-custom-row">
        <Col>
          EXCESS TRIP CHARGE (₱) <span className="required-icon">*</span>
          <Form.Control
            type="number"
            name="excess_trip_charge"
            value={form.excess_trip_charge}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
            placeholder="Charge per trip beyond included"
          />
          <InputError isValid={is_error.excess_trip_charge} message="Excess trip charge is required" />
        </Col>
        <Col>
          AGREED FUEL PRICE / LITER (₱) <span className="required-icon">*</span>
          <Form.Control
            type="number"
            name="fuel_price_per_liter"
            value={form.fuel_price_per_liter}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
            placeholder="e.g. 50"
          />
          <InputError isValid={is_error.fuel_price_per_liter} message="Fuel price is required" />
        </Col>
      </Row>

      <Row className="nc-modal-custom-row">
        <Col>
          START DATE <span className="required-icon">*</span>
          <Form.Control
            type="date"
            name="start_date"
            value={form.start_date}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
          />
          <InputError isValid={is_error.start_date} message="Start date is required" />
        </Col>
        <Col>
          END DATE <span style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}>(leave blank if open-ended)</span>
          <Form.Control
            type="date"
            name="end_date"
            value={form.end_date || ""}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row className="nc-modal-custom-row">
        <Col>
          REMARKS
          <Form.Control
            as="textarea"
            rows={2}
            name="remarks"
            value={form.remarks || ""}
            className={disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"}
            onChange={handle_change}
            disabled={disabled}
          />
        </Col>
      </Row>

      {!disabled && (
        <div style={{
          background: "#f0fbfd",
          border: "1px solid #c0eaf4",
          borderRadius: 8,
          padding: "10px 14px",
          marginTop: 4,
          fontSize: 12,
          color: "#2a7a8c",
          fontFamily: "var(--primary-font-medium)",
        }}>
          💡 <strong>Note:</strong> If actual fuel price exceeds the agreed rate, the difference will be billed to the customer based on the route distance and truck's km/liter.
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(is_inactive) => set_inactive(is_inactive)} active={"CONTRACTS"} />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}><h1 className="page-title">Contracts</h1></Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              placeholder="Search contract..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => { if (e.key === "Enter") fetch_contracts(); }}
            />
            <button className="add-btn" onClick={() => set_show_add_modal(true)}>Add</button>
          </Col>
        </Row>
        <div className="tab-content">
          <Table
            tableHeaders={["CUSTOMER", "MONTHLY RATE", "TRIPS INCL.", "EXCESS/TRIP", "FUEL PRICE", "START DATE", "END DATE", "STATUS", "ACTIONS"]}
            headerSelector={["customer_name", "monthly_rate_fmt", "included_trips", "excess_fmt", "fuel_price_fmt", "start_date", "end_date", "status_badge", "action_btn"]}
            tableData={contract_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <AddModal title="CONTRACT" size="lg" show={show_add_modal} onHide={() => set_show_add_modal(false)} onSave={handle_create} isClicked={is_clicked}>
        {form_fields(add_form, handle_add_change)}
      </AddModal>
      <EditModal title="CONTRACT" size="lg" show={show_edit_modal} onHide={() => set_show_edit_modal(false)} onSave={handle_update} isClicked={is_clicked}>
        {form_fields(edit_form, handle_edit_change)}
      </EditModal>
      <ViewModal title="CONTRACT" size="lg" withButtons show={show_view_modal} onHide={() => set_show_view_modal(false)} onEdit={() => { set_show_edit_modal(true); set_show_view_modal(false); }}>
        {form_fields(edit_form, () => {}, true)}
      </ViewModal>
      <DeleteModal text="contract" show={show_delete_modal} onHide={() => set_show_delete_modal(false)} onDelete={handle_delete} />
    </div>
  );
}
