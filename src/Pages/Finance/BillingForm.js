import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import FinanceTable from "../../Components/TableTemplate/FinanceTable";
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
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
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
  const [due_date, set_due_date] = useState("");
  const billing_date = moment().format("MMMM DD, YYYY");

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
    const res = await previewBillingTrips(
      contract_id,
      period_start,
      period_end,
    );
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
    if (!due_date) {
      toast.error("Please select a due date.", { style: toastStyle() });
      return;
    }
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
      due_date: due_date || null,
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
          <div className="biodata-section-label">Billing Information</div>
          <Row className="nc-modal-custom-row" style={{ alignItems: "flex-end" }}>
            <Col xs={12} md={3}>
              <div className="field-label">
                CONTRACT <span className="required-icon">*</span>
              </div>
              <Select
                options={contracts.map((c) => ({
                  value: String(c.id),
                  label: `${c.trade_name || c.customer_name} — ${c.contract_number}`,
                }))}
                value={
                  contracts
                    .map((c) => ({
                      value: String(c.id),
                      label: `${c.trade_name || c.customer_name} — ${c.contract_number}`,
                    }))
                    .find((o) => o.value === String(contract_id)) || null
                }
                onChange={(selected) =>
                  handle_contract_change({
                    target: { value: selected ? selected.value : "" },
                  })
                }
                placeholder="Search contract..."
                isClearable
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, minWidth: 380 }),
                }}
              />
            </Col>
            <Col xs={12} md={3}>
              <div className="field-label">
                BILLING CYCLE <span className="required-icon">*</span>
              </div>
              <Select
                options={unbilled_cycles.map((cycle) => ({
                  value: `${cycle.period_start}|${cycle.period_end}`,
                  label: `${moment(cycle.period_start).format("MMMM YYYY")} (${moment(cycle.period_start).format("MMM D")} – ${moment(cycle.period_end).format("MMM D, YYYY")})`,
                }))}
                value={
                  selected_cycle
                    ? {
                        value: selected_cycle,
                        label: (() => {
                          const [s, e] = selected_cycle.split("|");
                          return `${moment(s).format("MMMM YYYY")} (${moment(s).format("MMM D")} – ${moment(e).format("MMM D, YYYY")})`;
                        })(),
                      }
                    : null
                }
                onChange={(selected) => handle_cycle_change({ target: { value: selected ? selected.value : "" } })}
                placeholder={
                  !contract_id
                    ? "Select a contract first"
                    : unbilled_cycles.length === 0
                    ? "No unbilled cycles"
                    : "Search billing cycle..."
                }
                isDisabled={!contract_id || unbilled_cycles.length === 0}
                isClearable
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({ ...base, minWidth: 280 }),
                }}
              />
            </Col>
            <Col xs={12} md={3}>
              <div className="field-label">BILLING DATE</div>
              <div className="detail-value" style={{ paddingTop: 6 }}>{billing_date}</div>
            </Col>
            <Col xs={12} md={3}>
              <div className="field-label">DUE DATE <span className="required-icon">*</span></div>
              <AntDatePicker
                value={due_date ? dayjs(due_date) : null}
                onChange={(date) => set_due_date(date ? date.format("YYYY-MM-DD") : "")}
                format="MMMM DD, YYYY"
                placeholder="Select due date"
                style={{ width: "100%" }}
                className="nc-modal-custom-input"
              />
            </Col>
          </Row>
        </div>

        {/* Customer Details Strip — shown after preview loads */}
        {preview && !loading_preview && preview.customer && (
          <div className="biodata-card mb-4">
            <div className="biodata-section-label">Customer Details</div>
            <Row className="nc-modal-custom-row mt-2">
              <Col xs={12} md={4}>
                <div className="field-label">TRADE NAME</div>
                <div className="detail-value">{preview.customer.trade_name || "—"}</div>
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">ADDRESS</div>
                <div className="detail-value">{preview.customer.trade_address || "—"}</div>
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">TIN</div>
                <div className="detail-value">{preview.customer.tin || "—"}</div>
              </Col>
            </Row>
          </div>
        )}

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
                  No trips found for this billing cycle. You may still proceed —
                  only the monthly rate will be billed.
                </p>
              ) : (
                <FinanceTable
                  type="trips"
                  tableData={preview.trips}
                  showLoader={loading_preview}
                />
              )}
            </div>

            {/* Summary */}
            <div className="biodata-card mb-4">
              <div className="biodata-section-label">Billing Summary</div>
              <div className="table-responsive mt-3">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1a2e40" }}>
                      <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", width: "60%" }}>
                        Description
                      </th>
                      <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Monthly Rate",         value: fmt(preview.summary.monthly_rate) },
                      { label: "Total Trips",          value: preview.summary.total_trips },
                      { label: "Included Trips",       value: preview.summary.included_trips },
                      { label: "Excess Trips",         value: preview.summary.excess_trips },
                      { label: "Excess Trip Total",    value: fmt(preview.summary.excess_trip_total) },
                      { label: "Fuel Surcharge Total", value: fmt(preview.summary.fuel_surcharge_total) },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td style={{ padding: "8px 12px", width: "60%", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>
                          {row.label}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid #edf0f4" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "var(--primary-font-bold)", fontSize: 14, color: "#1a2e40" }}>
                        GRAND TOTAL
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--primary-font-bold)", fontSize: 16, color: "#5ac8e1" }}>
                        {fmt(preview.summary.grand_total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
