import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllContractRoutes,
  createContractRoute,
  updateContractRoute,
} from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllContracts } from "../../Helpers/apiCalls/Contracts/contractApi";
import { validateContractRoute } from "../../Helpers/Validation/Contracts/contractValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function ContractRoutes() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [filter_contract_id, set_filter_contract_id] = useState("");
  const [route_data, set_route_data] = useState([]);
  const [contract_options, set_contract_options] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);

  const empty_form = {
    contract_id: "",
    origin: "",
    destination: "",
    distance_km: "",
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

  async function fetch_contracts() {
    const response = await getAllContracts();
    if (response.data && response.data.data) {
      set_contract_options(response.data.data);
    }
  }

  async function fetch_routes() {
    set_show_loader(true);
    const response = await getAllContractRoutes(
      filter_contract_id || undefined,
    );
    if (response.data && response.data.data) {
      set_route_data(response.data.data);
    } else {
      set_route_data([]);
    }
    set_show_loader(false);
  }

  function handle_row_click(row) {
    set_selected_row(row);
    set_edit_form(row);
    set_show_view_modal(true);
  }

  async function handle_create() {
    if (validateContractRoute(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createContractRoute(add_form);
      if (response.data && response.data.response) {
        toast.success("Route added successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        fetch_routes();
      } else {
        toast.error("Failed to add route.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validateContractRoute(edit_form, set_is_error)) {
      set_is_clicked(true);
      const response = await updateContractRoute(edit_form);
      if (response.data && response.data.response) {
        toast.success("Route updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_routes();
      } else {
        toast.error("Failed to update route.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  useEffect(() => {
    fetch_contracts();
    fetch_routes();
  }, []);

  useEffect(() => {
    fetch_routes();
  }, [filter_contract_id]);

  const form_fields = (form, handle_change, disabled = false) => (
    <div className="mt-3">
      <div className="form-section-label">Route Information</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div>
            CONTRACT <span className="required-icon">*</span>
          </div>
          <Form.Select
            name="contract_id"
            value={form.contract_id}
            className="nc-modal-custom-select"
            onChange={handle_change}
          >
            <option value="">-- Select Contract --</option>
            {contract_options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name
                  ? `${c.customer_name} — ₱${c.monthly_rate}/mo`
                  : `Contract #${c.id}`}
              </option>
            ))}
          </Form.Select>
          <InputError
            isValid={is_error.contract_id}
            message="Contract is required"
          />
        </Col>
      </Row>
      <div className="form-section-label">Route Details</div>
      <Row className="nc-modal-custom-row">
        <Col>
          ORIGIN <span className="required-icon">*</span>
          <Form.Control
            type="text"
            name="origin"
            value={form.origin}
            className={
              disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"
            }
            onChange={handle_change}
            disabled={disabled}
            placeholder="Pickup location"
          />
          <InputError isValid={is_error.origin} message="Origin is required" />
        </Col>
        <Col>
          DESTINATION <span className="required-icon">*</span>
          <Form.Control
            type="text"
            name="destination"
            value={form.destination}
            className={
              disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"
            }
            onChange={handle_change}
            disabled={disabled}
            placeholder="Delivery location"
          />
          <InputError
            isValid={is_error.destination}
            message="Destination is required"
          />
        </Col>
      </Row>
      <Row className="nc-modal-custom-row">
        <Col xs={6}>
          DISTANCE (km)
          <Form.Control
            type="number"
            name="distance_km"
            value={form.distance_km || ""}
            className={
              disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"
            }
            onChange={handle_change}
            disabled={disabled}
            placeholder="One-way km"
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
            className={
              disabled ? "nc-modal-custom-input-edit" : "nc-modal-custom-input"
            }
            onChange={handle_change}
            disabled={disabled}
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
          active={"CONTRACT ROUTES"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={5}>
            <h1 className="page-title">Contract Routes</h1>
          </Col>
          <Col className="d-flex justify-content-end align-items-center gap-2">
            <Form.Select
              className="PO-select-action form-select"
              value={filter_contract_id}
              onChange={(e) => set_filter_contract_id(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="">All Contracts</option>
              {contract_options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name || `Contract #${c.id}`}
                </option>
              ))}
            </Form.Select>
            <button
              className="add-btn"
              onClick={() => set_show_add_modal(true)}
            >
              Add
            </button>
          </Col>
        </Row>
        <div className="tab-content">
          <Table
            tableHeaders={[
              "CONTRACT",
              "ORIGIN",
              "DESTINATION",
              "DISTANCE (km)",
              "REMARKS",
            ]}
            headerSelector={[
              "contract_name",
              "origin",
              "destination",
              "distance_km",
              "remarks",
            ]}
            tableData={route_data}
            showLoader={show_loader}
            withActionData={true}
            onRowClick={handle_row_click}
          />
        </div>
      </div>

      <AddModal
        title="CONTRACT ROUTE"
        size="lg"
        show={show_add_modal}
        onHide={() => set_show_add_modal(false)}
        onSave={handle_create}
        isClicked={is_clicked}
      >
        {form_fields(add_form, handle_add_change)}
      </AddModal>
      <EditModal
        title="CONTRACT ROUTE"
        size="lg"
        show={show_edit_modal}
        onHide={() => set_show_edit_modal(false)}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(edit_form, handle_edit_change)}
      </EditModal>
      <ViewModal
        title="CONTRACT ROUTE DETAILS"
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
                {edit_form.origin} → {edit_form.destination}
              </span>
              <span className="view-subtitle">
                {edit_form.contract_name || `Contract #${edit_form.contract_id}`}
              </span>
            </div>
          </div>
          <div className="view-details">
            <div className="view-detail-row">
              <span className="view-detail-label">CONTRACT</span>
              <span className="view-detail-value">
                {contract_options.find(
                  (c) => String(c.id) === String(edit_form.contract_id),
                )?.customer_name || `Contract #${edit_form.contract_id}`}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">ORIGIN</span>
              <span
                className={
                  edit_form.origin ? "view-detail-value" : "view-empty-value"
                }
              >
                {edit_form.origin || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">DESTINATION</span>
              <span
                className={
                  edit_form.destination
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.destination || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">DISTANCE</span>
              <span
                className={
                  edit_form.distance_km
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.distance_km ? `${edit_form.distance_km} km` : "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">REMARKS</span>
              <span
                className={
                  edit_form.remarks ? "view-detail-value" : "view-empty-value"
                }
              >
                {edit_form.remarks || "No remarks"}
              </span>
            </div>
          </div>
        </div>
      </ViewModal>
    </div>
  );
}
