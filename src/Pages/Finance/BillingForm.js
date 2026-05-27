import React, { useState, useEffect } from "react";
import { Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { getAllContracts } from "../../Helpers/apiCalls/Contracts/contractApi";
import {
  getUnbilledCycles,
  previewBillingTrips,
  createBilling,
} from "../../Helpers/apiCalls/Finance/billingApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import "../Manage/Manage.css";

export default function BillingForm() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);

  // Step 1 — contract + cycle selection
  const [contracts, set_contracts] = useState([]);
  const [selected_contract, set_selected_contract] = useState(null);
  const [contract_id, set_contract_id] = useState("");
  const [unbilled_cycles, set_unbilled_cycles] = useState([]);
  const [selected_cycle, set_selected_cycle] = useState("");

  // Step 2 — preview
  const [preview, set_preview] = useState(null); // { trips, summary }
  const [loading_preview, set_loading_preview] = useState(false);

  async function fetch_contracts() {
    const res = await getAllContracts();
    if (res.data && res.data.data) {
      set_contracts(res.data.data.filter((c) => c.status === "active"));
    }
  }

  async function handle_contract_change(e) {
    const id = e.target.value;
    set_contract_id(id);
    set_selected_cycle("");
    set_preview(null);
    set_unbilled_cycles([]);
    if (!id) {
      set_selected_contract(null);
      return;
    }
    const found = contracts.find((c) => String(c.id) === String(id));
    set_selected_contract(found || null);

    const res = await getUnbilledCycles(id);
    if (res.data && res.data.data) {
      set_unbilled_cycles(res.data.data);
    } else {
      set_unbilled_cycles([]);
      toast("All billing cycles for this contract are already billed.", {
        style: toastStyle(),
      });
    }
  }

  async function handle_cycle_change(e) {
    const val = e.target.value;
    set_selected_cycle(val);
    set_preview(null);
    if (!val) return;

    const [period_start, period_end] = val.split("|");
    set_loading_preview(true);
    const res = await previewBillingTrips(contract_id, period_start, period_end);
    if (res.data && res.data.data) {
      set_preview(res.data.data);
    } else {
      set_preview(null);
      toast.error("Failed to load trip preview.", { style: toastStyle() });
    }
    set_loading_preview(false);
  }

  async function handle_confirm() {
    if (!contract_id || !selected_cycle || !preview) return;
    const [period_start, period_end] = selected_cycle.split("|");
    set_is_clicked(true);
    const payload = {
      contract_id,
      billing_period_start: period_start,
      billing_period_end: period_end,
      // summary values from preview
      total_trips: preview.summary.total_trips,
      included_trips: preview.summary.included_trips,
      excess_trips: preview.summary.excess_trips,
      monthly_rate: preview.summary.monthly_rate,
      excess_trip_charge: preview.summary.excess_trip_charge,
      excess_trip_total: preview.summary.excess_trip_total,
      fuel_surcharge_total: preview.summary.fuel_surcharge_total,
      grand_total: preview.summary.grand_total,
      trip_ids: preview.trips.map((t) => t.id),
    };
    const res = await createBilling(payload);
    if (res.data && res.data.status === "success") {
      toast.success("Billing generated successfully!", { style: toastStyle() });
      navigate("/billings");
    } else {
      toast.error("Failed to generate billing.", { style: toastStyle() });
    }
    set_is_clicked(false);
  }

  useEffect(() => {
    fetch_contracts();
  }, []);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"BILLINGS"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        {/* Header */}
        <div className="add-customer-header">
          <div>
            <div className="add-customer-breadcrumb">
              <span
                className="breadcrumb-link"
                onClick={() => navigate("/billings")}
              >
                Billings
              </span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">Generate Billing</span>
            </div>
            <h1 className="page-title">Generate Billing</h1>
            <p className="page-subtitle">
              Select a contract and billing cycle to generate
            </p>
          </div>
          <div className="add-customer-actions">
            <button
              className="cancel-btn"
              onClick={() => navigate("/billings")}
            >
              Cancel
            </button>
            <button
              className="save-btn"
              onClick={handle_confirm}
              disabled={!preview || is_clicked}
            >
              {is_clicked ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </div>

        {/* Step 1 — Select Contract + Cycle */}
        <div className="biodata-card mb-4">
          <div className="biodata-section-label">Billing Setup</div>
          <Row className="nc-modal-custom-row">
            <Col xs={12} md={6}>
              <div className="field-label">
                CONTRACT <span className="required-icon">*</span>
              </div>
              <Form.Select
                className="nc-modal-custom-input"
                value={contract_id}
                onChange={handle_contract_change}
              >
                <option value="">Select contract...</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contract_number} —{" "}
                    {c.trade_name || `${c.first_name} ${c.last_name}`}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={6}>
              <div className="field-label">
                BILLING CYCLE <span className="required-icon">*</span>
              </div>
              <Form.Select
                className="nc-modal-custom-input"
                value={selected_cycle}
                onChange={handle_cycle_change}
                disabled={!contract_id || unbilled_cycles.length === 0}
              >
                <option value="">
                  {!contract_id
                    ? "Select a contract first"
                    : unbilled_cycles.length === 0
                    ? "No unbilled cycles"
                    : "Select billing cycle..."}
                </option>
                {unbilled_cycles.map((cycle, i) => (
                  <option
                    key={i}
                    value={`${cycle.period_start}|${cycle.period_end}`}
                  >
                    {moment(cycle.period_start).format("MMMM YYYY")} (
                    {moment(cycle.period_start).format("MMM D")} –{" "}
                    {moment(cycle.period_end).format("MMM D, YYYY")})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Contract info strip */}
          {selected_contract && (
            <div className="billing-info-strip mt-3">
              <div className="billing-info-item">
                <span className="billing-info-label">Monthly Rate</span>
                <span className="billing-info-value">
                  {fmt(selected_contract.monthly_rate)}
                </span>
              </div>
              <div className="billing-info-item">
                <span className="billing-info-label">Included Trips</span>
                <span className="billing-info-value">
                  {selected_contract.included_trips}
                </span>
              </div>
              <div className="billing-info-item">
                <span className="billing-info-label">Excess Trip Charge</span>
                <span className="billing-info-value">
                  {fmt(selected_contract.excess_trip_charge)}
                </span>
              </div>
              <div className="billing-info-item">
                <span className="billing-info-label">Fuel Price/Liter</span>
                <span className="billing-info-value">
                  {fmt(selected_contract.fuel_price_per_liter)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2 — Trip Preview */}
        {loading_preview && (
          <div className="biodata-card mb-4 text-center py-4">
            <span className="page-subtitle">Loading trip data...</span>
          </div>
        )}

        {preview && !loading_preview && (
          <>
            {/* Trip Table */}
            <div className="biodata-card mb-4">
              <div className="biodata-section-label">
                Trips in This Cycle ({preview.trips.length} trips)
              </div>
              {preview.trips.length === 0 ? (
                <p className="page-subtitle mt-2">
                  No trips found for this billing cycle. You may still proceed
                  — only the monthly rate will be billed.
                </p>
              ) : (
                <div className="table-responsive mt-2">
                  <Table bordered hover size="sm" className="billing-trip-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>TRIP DATE</th>
                        <th>ROUTE</th>
                        <th>TRUCK</th>
                        <th>EXCESS?</th>
                        <th>EXCESS CHARGE</th>
                        <th>FUEL SURCHARGE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.trips.map((trip, i) => (
                        <tr
                          key={trip.id}
                          className={trip.is_excess ? "trip-row-excess" : ""}
                        >
                          <td>{i + 1}</td>
                          <td>
                            {moment(trip.trip_date).format("MMM D, YYYY")}
                          </td>
                          <td>
                            {trip.origin} → {trip.destination}
                          </td>
                          <td>{trip.plate_number}</td>
                          <td>
                            {trip.is_excess ? (
                              <span className="badge-excess">YES</span>
                            ) : (
                              <span className="badge-included">NO</span>
                            )}
                          </td>
                          <td>
                            {trip.is_excess ? fmt(trip.excess_charge) : "—"}
                          </td>
                          <td>
                            {trip.is_excess
                              ? fmt(trip.fuel_additional_charge)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="biodata-card mb-4">
              <div className="biodata-section-label">Billing Summary</div>
              <div className="billing-summary-grid mt-3">
                <div className="billing-summary-row">
                  <span className="billing-summary-label">Monthly Rate</span>
                  <span className="billing-summary-value">
                    {fmt(preview.summary.monthly_rate)}
                  </span>
                </div>
                <div className="billing-summary-row">
                  <span className="billing-summary-label">Total Trips</span>
                  <span className="billing-summary-value">
                    {preview.summary.total_trips}
                  </span>
                </div>
                <div className="billing-summary-row">
                  <span className="billing-summary-label">Included Trips</span>
                  <span className="billing-summary-value">
                    {preview.summary.included_trips}
                  </span>
                </div>
                <div className="billing-summary-row">
                  <span className="billing-summary-label">Excess Trips</span>
                  <span className="billing-summary-value">
                    {preview.summary.excess_trips}
                  </span>
                </div>
                <div className="billing-summary-row">
                  <span className="billing-summary-label">
                    Excess Trip Total
                  </span>
                  <span className="billing-summary-value">
                    {fmt(preview.summary.excess_trip_total)}
                  </span>
                </div>
                <div className="billing-summary-row">
                  <span className="billing-summary-label">
                    Fuel Surcharge Total
                  </span>
                  <span className="billing-summary-value">
                    {fmt(preview.summary.fuel_surcharge_total)}
                  </span>
                </div>
                <div className="billing-summary-row billing-summary-total">
                  <span className="billing-summary-label">GRAND TOTAL</span>
                  <span className="billing-summary-value grand-total-value">
                    {fmt(preview.summary.grand_total)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}