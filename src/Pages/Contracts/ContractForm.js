import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import {
  createContract,
  updateContract,
  getContractDetails,
} from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllCustomers, getCustomerContacts } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateContract } from "../../Helpers/Validation/Contracts/contractValidation";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

const empty_route = {
  origin: "",
  destination: "",
  distance_km: "",
  remarks: "",
};

const select_style = {
  control: (base) => ({
    ...base,
    borderRadius: 10,
    borderColor: "#B9B9B9",
    fontFamily: "var(--primary-font-medium)",
    fontSize: 14,
    minHeight: 38,
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  singleValue: (base) => ({ ...base, color: "#2d3e4e" }),
  option: (base, state) => ({
    ...base,
    color: "#2d3e4e",
    backgroundColor: state.isSelected ? "#e8f0fe" : state.isFocused ? "#f5f5f5" : "#fff",
  }),
  input: (base) => ({ ...base, color: "#2d3e4e" }),
};

export default function ContractForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed_contract = location.state?.contract || null;
  const is_edit = !!passed_contract;

  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [customer_options, set_customer_options] = useState([]);
  const [is_error, set_is_error] = useState({});
const [signatory_options, set_signatory_options] = useState([]);

  const empty_form = {
    customer_id: "",
    date_signed: "",
    authorized_representative: "",
    payment_terms_days: "",          // FIX: changed to number input
    monthly_rate: "",
    included_trips: "",
    excess_trip_charge: "",
    fuel_price_per_liter: "",
    start_date: "",
    end_date: "",
    status: "active",
    remarks: "",
  };

  const [form, set_form] = useState({ ...empty_form });
  const [routes, set_routes] = useState([{ ...empty_route }]);
  const [contract_number, set_contract_number] = useState("");

  async function fetch_customers() {
    const response = await getAllCustomers();
    if (response.data && response.data.data) {
      set_customer_options(
        response.data.data.map((c) => ({
          value: c.id,
          label: [c.first_name, c.middle_name, c.last_name, c.suffix]
            .filter(Boolean)
            .join(" "),
        })),
      );
    }
  }

  async function load_contract() {
    if (!is_edit) return;
    const response = await getContractDetails(passed_contract.id);
    if (response.data && response.data.data) {
      const data = response.data.data;
      set_contract_number(data.contract_number || "");

      // FIX: parse payment_terms — strip "Net " prefix and store just the number
      let payment_days = "";
      if (data.payment_terms) {
        const match = data.payment_terms.match(/\d+/);
        payment_days = match ? match[0] : data.payment_terms;
      }

      set_form({
        id: data.id,
        customer_id: data.customer_id,
        date_signed: data.date_signed || "",
        authorized_representative: data.authorized_representative || "",
        payment_terms_days: payment_days,
        monthly_rate: data.monthly_rate,
        included_trips: data.included_trips,
        excess_trip_charge: data.excess_trip_charge,
        fuel_price_per_liter: data.fuel_price_per_liter,
        start_date: data.start_date,
        end_date: data.end_date || "",
        status: data.status,
        remarks: data.remarks || "",
      });
      if (data.routes && data.routes.length > 0) {
        set_routes(
          data.routes.map((r) => ({
            origin: r.origin,
            destination: r.destination,
            distance_km: r.distance_km || "",
            remarks: r.remarks || "",
          })),
        );
      } else {
        set_routes([{ ...empty_route }]);
      }
    }
  }

  useEffect(() => {
    fetch_customers();
    load_contract();
  }, []);

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  const handle_date_change = (field, date) => {
    set_form((prev) => ({
      ...prev,
      [field]: date ? moment(date).format("YYYY-MM-DD") : "",
    }));
  };

  const handle_route_change = (index, e) => {
    const { name, value } = e.target;
    set_routes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const add_route = () => {
    set_routes((prev) => [...prev, { ...empty_route }]);
  };

  const remove_route = (index) => {
    set_routes((prev) => prev.filter((_, i) => i !== index));
  };

  async function handle_save() {
    // Build payment_terms string for backend: "Net X days"
    const payload = {
      ...form,
      payment_terms: form.payment_terms_days
        ? `Net ${form.payment_terms_days} days`
        : "",
    };

    if (!validateContract(payload, set_is_error)) return;
    set_is_clicked(true);

    const valid_routes = routes.filter(
      (r) => r.origin.trim() !== "" && r.destination.trim() !== "",
    );

    const response = is_edit
      ? await updateContract(payload, valid_routes)
      : await createContract(payload, valid_routes);

    if (response.data && response.data.response) {
      toast.success(
        is_edit ? "Contract updated successfully!" : "Contract added successfully!",
        { style: toastStyle() },
      );
      navigate("/contracts");
    } else {
      toast.error(
        is_edit ? "Failed to update contract." : "Failed to add contract.",
        { style: toastStyle() },
      );
    }
    set_is_clicked(false);
  }

  const status_dot_class =
    form.status === "active" ? "status-dot active" : "status-dot inactive";

  const selected_customer =
    customer_options.find(
      (c) => String(c.value) === String(form.customer_id),
    ) || null;

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"CONTRACTS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/contracts")}>
            Contracts
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">
            {is_edit ? "Edit Contract" : "Add New Contract"}
          </span>
        </div>

        {/* Sticky header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">
              {is_edit ? "Edit Contract" : "Add New Contract"}
            </h1>
            <p className="page-subtitle">
              {is_edit
                ? "Update contract details and routes"
                : "Fill in contract details and define routes"}
            </p>
          </div>
          <div className="add-customer-actions">
            <button className="cancel-btn" onClick={() => navigate("/contracts")} disabled={is_clicked}>
              Cancel
            </button>
            <button className="save-btn" onClick={handle_save} disabled={is_clicked}>
              {is_clicked ? "Saving..." : "Save Contract"}
            </button>
          </div>
        </div>

        <div className="biodata-card">
        {/* ── Section 1: Customer ── */}
        <div className="biodata-section-label">Customer</div>
       <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">CUSTOMER <span className="required-icon">*</span></div>
            <Select
              classNamePrefix="react-select"
              options={customer_options}
              value={selected_customer}
              onChange={(selected) =>
                set_form((prev) => ({
                  ...prev,
                  customer_id: selected ? selected.value : "",
                }))
              }
              placeholder="Search customer..."
              isClearable
              styles={select_style}
            />
            <InputError isValid={is_error.customer_id} message="Customer is required" />
          </Col>
          <Col xs={6}>
            <div className="field-label">AUTHORIZED REPRESENTATIVE</div>
            <Form.Control
              type="text"
              name="authorized_representative"
              value={form.authorized_representative}
              className="nc-modal-custom-input"
              onChange={handle_change}
            />
          </Col>
        </Row>

        {/* ── Section 2: Contract Details ── */}
        <div className="biodata-section-label">Contract Details</div>

        {is_edit && contract_number && (
          <Row className="nc-modal-custom-row">
            <Col>
              CONTRACT NUMBER
              <div style={{ fontFamily: "var(--primary-font-bold)", fontSize: 16, color: "#2d3e4e", padding: "6px 0" }}>
                {contract_number}
              </div>
            </Col>
          </Row>
        )}

        {/* FIX: 3 date fields in one row */}
        <Row className="nc-modal-custom-row">
          <Col>
            <div className="field-label">DATE OF CONTRACT</div>
            <ReactDatePicker
              selected={form.date_signed ? new Date(form.date_signed) : null}
              onChange={(date) => handle_date_change("date_signed", date)}
              dateFormat="yyyy-MM-dd"
              className="nc-modal-custom-input w-100"
              placeholderText="Select date"
            />
          </Col>
          <Col>
            <div className="field-label">START DATE <span className="required-icon">*</span></div>
            <ReactDatePicker
              selected={form.start_date ? new Date(form.start_date) : null}
              onChange={(date) => handle_date_change("start_date", date)}
              dateFormat="yyyy-MM-dd"
              className="nc-modal-custom-input w-100"
              placeholderText="Select start date"
            />
            <InputError isValid={is_error.start_date} message="Start date is required" />
          </Col>
          {/* FIX: end date is now required */}
          <Col>
            <div className="field-label">END DATE <span className="required-icon">*</span></div>
            <ReactDatePicker
              selected={form.end_date ? new Date(form.end_date) : null}
              onChange={(date) => handle_date_change("end_date", date)}
              dateFormat="yyyy-MM-dd"
              className="nc-modal-custom-input w-100"
              placeholderText="Select end date"
            />
            <InputError isValid={is_error.end_date} message="End date is required" />
          </Col>
        </Row>

        {is_edit && (
          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">STATUS</div>
              <div className="status-select-wrap">
                <span className={status_dot_class}></span>
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
              </div>
            </Col>
          </Row>
        )}

        {/* ── Section 3: Rate & Billing ── */}
        <div className="biodata-section-label">Rate & Billing</div>
        <Row className="nc-modal-custom-row">
          <Col>
            <div className="field-label">MONTHLY RATE (₱) <span className="required-icon">*</span></div>
            <Form.Control
              type="number"
              name="monthly_rate"
              value={form.monthly_rate}
              className="nc-modal-custom-input"
              onChange={handle_change}
              placeholder="e.g. 10000"
            />
            <InputError isValid={is_error.monthly_rate} message="Monthly rate is required" />
          </Col>
          <Col>
            <div className="field-label">INCLUDED TRIPS / MONTH <span className="required-icon">*</span></div>
            <Form.Control
              type="number"
              name="included_trips"
              value={form.included_trips}
              className="nc-modal-custom-input"
              onChange={handle_change}
              placeholder="e.g. 4"
            />
            <InputError isValid={is_error.included_trips} message="Included trips is required" />
          </Col>
        </Row>
        <Row className="nc-modal-custom-row">
          <Col>
            <div className="field-label">EXCESS TRIP CHARGE (₱) <span className="required-icon">*</span></div>
            <Form.Control
              type="number"
              name="excess_trip_charge"
              value={form.excess_trip_charge}
              className="nc-modal-custom-input"
              onChange={handle_change}
              placeholder="Charge per extra trip"
            />
            <InputError isValid={is_error.excess_trip_charge} message="Excess trip charge is required" />
          </Col>
          <Col>
            <div className="field-label">AGREED FUEL PRICE / LITER (₱) <span className="required-icon">*</span></div>
            <Form.Control
              type="number"
              name="fuel_price_per_liter"
              value={form.fuel_price_per_liter}
              className="nc-modal-custom-input"
              onChange={handle_change}
              placeholder="e.g. 50"
            />
            <InputError isValid={is_error.fuel_price_per_liter} message="Fuel price is required" />
          </Col>
        </Row>

        {/* FIX: payment terms → number input with "days" label */}
        <Row className="nc-modal-custom-row">
          <Col xs={6}>
            <div className="field-label">PAYMENT TERMS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Form.Control
                type="number"
                name="payment_terms_days"
                value={form.payment_terms_days}
                className="nc-modal-custom-input"
                onChange={handle_change}
                placeholder="e.g. 30"
                min={1}
                style={{ width: 120, flex: "0 0 120px" }}
              />
              <span style={{ fontFamily: "var(--primary-font-medium)", fontSize: 14, color: "#2d3e4e", whiteSpace: "nowrap" }}>
                days{form.payment_terms_days ? ` (Net ${form.payment_terms_days})` : ""}
              </span>
            </div>
          </Col>
        </Row>

        {/* ── Section 4: Routes ── */}
        <div
          className="d-flex justify-content-between align-items-center mt-4"
          style={{ marginBottom: 8 }}
        >
          <div className="biodata-section-label mb-0">Routes</div>
          <button className="add-btn" onClick={add_route}>
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Add Route
          </button>
        </div>

        {routes.length === 0 && (
          <p style={{ color: "#aaa", fontSize: 13 }}>
            No routes added yet. Click "Add Route" to define pickup and delivery points.
          </p>
        )}

        {routes.map((route, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 12,
              background: "#fafafa",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#2d3e4e" }}>
                Route {index + 1}
              </span>
              {routes.length > 1 && (
                <button
                  className="button-warning"
                  style={{ width: "auto", padding: "2px 10px", fontSize: 12 }}
                  onClick={() => remove_route(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
            <Row className="nc-modal-custom-row">
              <Col>
                ORIGIN <span className="required-icon">*</span>
                <Form.Control
                  type="text"
                  name="origin"
                  value={route.origin}
                  className="nc-modal-custom-input"
                  onChange={(e) => handle_route_change(index, e)}
                  placeholder="Pickup location"
                />
              </Col>
              <Col>
                DESTINATION <span className="required-icon">*</span>
                <Form.Control
                  type="text"
                  name="destination"
                  value={route.destination}
                  className="nc-modal-custom-input"
                  onChange={(e) => handle_route_change(index, e)}
                  placeholder="Delivery location"
                />
              </Col>
              <Col xs={3}>
                DISTANCE (km)
                <Form.Control
                  type="number"
                  name="distance_km"
                  value={route.distance_km}
                  className="nc-modal-custom-input"
                  onChange={(e) => handle_route_change(index, e)}
                  placeholder="km"
                />
              </Col>
            </Row>
            <Row className="nc-modal-custom-row">
              <Col>
                REMARKS
                <Form.Control
                  type="text"
                  name="remarks"
                  value={route.remarks}
                  className="nc-modal-custom-input"
                  onChange={(e) => handle_route_change(index, e)}
                  placeholder="Optional"
                />
              </Col>
            </Row>
          </div>
        ))}

        {/* FIX: Remarks moved to last */}
        <div className="biodata-section-label">Remarks</div>
        <Row className="nc-modal-custom-row">
          <Col>
            <Form.Control
              as="textarea"
              rows={2}
              name="remarks"
              value={form.remarks || ""}
              className="nc-modal-custom-input"
              onChange={handle_change}
              placeholder="Optional notes about this contract"
            />
          </Col>
        </Row>

        </div> {/* end biodata-card */}
      </div>
    </div>
  );
}