import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import {
  getContractDetails,
  getContractTripSummary, // ⚠️ NEW endpoint needed — see backend note below
} from "../../Helpers/apiCalls/Contracts/contractApi";
import { formatAmount, dateFormat } from "../../Helpers/Utils/Common";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

/*
  ⚠️ BACKEND NOTE — getContractTripSummary:
  Add to contractApi.js:
    export const getContractTripSummary = async (contract_id) => { ... GET /contracts/trip_summary }

  Backend endpoint must return:
  {
    "data": {
      "included_trips": 4,
      "total_trips_used": 6,
      "excess_trips": 2,
      "trips": [
        { "id": 1, "trip_date": "2025-01-10", "origin": "CDO", "destination": "Iligan", "status": "completed" },
        ...
      ]
    }
  }

  The SQL would join trips/waybills to this contract_id.
  The controller method lives in Contracts.php as trip_summary().
*/

export default function ContractView() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed_contract = location.state?.contract || null;

  const [inactive, set_inactive] = useState(false);
  const [contract, set_contract] = useState(null);
  const [routes, set_routes] = useState([]);
  const [trip_summary, set_trip_summary] = useState(null);
  const [is_loading, set_is_loading] = useState(true);

  async function load_contract() {
    if (!passed_contract) {
      navigate("/contracts");
      return;
    }
    set_is_loading(true);
    const [contract_res, summary_res] = await Promise.all([
      getContractDetails(passed_contract.id),
      getContractTripSummary(passed_contract.id),
    ]);
    if (contract_res.data && contract_res.data.data) {
      const data = contract_res.data.data;
      set_contract(data);
      set_routes(data.routes || []);
    }
    if (summary_res.data && summary_res.data.data) {
      set_trip_summary(summary_res.data.data);
    }
    set_is_loading(false);
  }

  useEffect(() => {
    load_contract();
  }, []);

  function get_plain_contract(data) {
    return {
      id: data.id,
      contract_number: data.contract_number,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      date_signed: data.date_signed,
      authorized_representative: data.authorized_representative,
      payment_terms: data.payment_terms,
      monthly_rate: data.monthly_rate,
      included_trips: data.included_trips,
      excess_trip_charge: data.excess_trip_charge,
      fuel_price_per_liter: data.fuel_price_per_liter,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      remarks: data.remarks,
    };
  }

  if (is_loading) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"CONTRACTS"} />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <p style={{ color: "#aaa", marginTop: 40 }}>Loading contract...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"CONTRACTS"} />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <p style={{ color: "#aaa", marginTop: 40 }}>Contract not found.</p>
        </div>
      </div>
    );
  }

  const detail = (label, value, empty = "—") => (
    <div className="view-detail-row">
      <span className="view-detail-label">{label}</span>
      <span className={value ? "view-detail-value" : "view-empty-value"}>
        {value || empty}
      </span>
    </div>
  );

  // Trip usage calculations
  const included = trip_summary?.included_trips ?? contract.included_trips ?? 0;
  const used = trip_summary?.total_trips_used ?? 0;
  const excess = Math.max(0, used - included);
  const pct = included > 0 ? Math.min(100, Math.round((used / included) * 100)) : 0;
  const bar_color = pct >= 100 ? "#c0392b" : pct >= 75 ? "#e0a030" : "#27ae60";

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(v) => set_inactive(v)} active={"CONTRACTS"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/contracts")}>
            Contracts
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">
            {contract.contract_number || "View Contract"}
          </span>
        </div>

        {/* Sticky header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">{contract.contract_number || "Contract Details"}</h1>
            <p className="page-subtitle">{contract.customer_name || "—"}</p>
          </div>
          <div className="add-customer-actions">
            <button className="cancel-btn" onClick={() => navigate("/contracts")}>
              Back
            </button>
            <button
              className="save-btn"
              onClick={() =>
                navigate("/contracts/form", {
                  state: { contract: get_plain_contract(contract) },
                })
              }
            >
              Edit Contract
            </button>
          </div>
        </div>

        {/* ── Condensed: Customer + Contract Details side by side ── */}
        <Row>
          <Col md={6}>
            <div className="form-section-label">Customer</div>
            <div className="view-details">
              {detail("CUSTOMER", contract.customer_name)}
              {detail("AUTHORIZED REP.", contract.authorized_representative)}
            </div>
          </Col>
          <Col md={6}>
            <div className="form-section-label">Contract Details</div>
            <div className="view-details">
              {detail("CONTRACT NO.", contract.contract_number)}
              {detail("DATE OF CONTRACT", contract.date_signed ? dateFormat(contract.date_signed) : null)}
              <div className="view-detail-row">
                <span className="view-detail-label">STATUS</span>
                <span className={`status-badge ${contract.status}`}>{contract.status}</span>
              </div>
              {detail("START DATE", contract.start_date ? dateFormat(contract.start_date) : null)}
              {detail("END DATE", contract.end_date ? dateFormat(contract.end_date) : "Open-ended")}
            </div>
          </Col>
        </Row>

        {/* ── Condensed: Rate & Billing ── */}
        <div className="form-section-label mt-3">Rate & Billing</div>
        <div className="view-details">
          <Row>
            <Col md={6}>
              {detail("MONTHLY RATE", contract.monthly_rate ? `₱ ${formatAmount(contract.monthly_rate)}` : null)}
              {detail("INCLUDED TRIPS / MONTH", contract.included_trips)}
              {detail("EXCESS / TRIP", contract.excess_trip_charge ? `₱ ${formatAmount(contract.excess_trip_charge)}` : null)}
            </Col>
            <Col md={6}>
              {detail("FUEL PRICE / LITER", contract.fuel_price_per_liter ? `₱ ${formatAmount(contract.fuel_price_per_liter)}` : null)}
              {detail("PAYMENT TERMS", contract.payment_terms)}
            </Col>
          </Row>
        </div>

        {/* ── Trip Usage Summary ── */}
        <div className="form-section-label mt-3">Trip Usage Summary</div>
        {trip_summary === null ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>Trip usage data unavailable.</p>
        ) : (
          <>
            {/* Summary cards */}
            <Row className="mb-3" style={{ gap: 0 }}>
              <Col xs={4}>
                <div style={{
                  background: "#f7fbfd",
                  border: "1px solid #edf0f4",
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginRight: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#7a8fa6", fontFamily: "var(--primary-font-medium)", marginBottom: 4 }}>
                    TRIPS USED
                  </div>
                  <div style={{ fontSize: 22, fontFamily: "var(--primary-font-bold)", color: "#2d3e4e" }}>
                    {used}
                    <span style={{ fontSize: 13, color: "#7a8fa6", fontFamily: "var(--primary-font-medium)", marginLeft: 4 }}>
                      / {included} included
                    </span>
                  </div>
                </div>
              </Col>
              <Col xs={4}>
                <div style={{
                  background: excess > 0 ? "#fff5f5" : "#f7fbfd",
                  border: `1px solid ${excess > 0 ? "#f5c6cb" : "#edf0f4"}`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginRight: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#7a8fa6", fontFamily: "var(--primary-font-medium)", marginBottom: 4 }}>
                    EXCESS TRIPS
                  </div>
                  <div style={{ fontSize: 22, fontFamily: "var(--primary-font-bold)", color: excess > 0 ? "#c0392b" : "#2d3e4e" }}>
                    {excess}
                    {excess > 0 && (
                      <span style={{ fontSize: 13, color: "#c0392b", fontFamily: "var(--primary-font-medium)", marginLeft: 4 }}>
                        (+₱ {formatAmount(excess * (contract.excess_trip_charge || 0))})
                      </span>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={4}>
                <div style={{
                  background: "#f7fbfd",
                  border: "1px solid #edf0f4",
                  borderRadius: 10,
                  padding: "14px 18px",
                }}>
                  <div style={{ fontSize: 11, color: "#7a8fa6", fontFamily: "var(--primary-font-medium)", marginBottom: 8 }}>
                    USAGE
                  </div>
                  <div style={{
                    background: "#e0e0e0",
                    borderRadius: 6,
                    height: 10,
                    overflow: "hidden",
                    marginBottom: 4,
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      background: bar_color,
                      height: "100%",
                      borderRadius: 6,
                      transition: "width 0.3s",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: bar_color, fontFamily: "var(--primary-font-bold)" }}>
                    {pct}%
                  </div>
                </div>
              </Col>
            </Row>

            {/* Trip list */}
            {trip_summary.trips && trip_summary.trips.length > 0 ? (
              <div style={{ border: "1px solid #edf0f4", borderRadius: 10, overflow: "hidden" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 2fr 1fr",
                  background: "#f0f4f8",
                  padding: "8px 14px",
                  fontFamily: "var(--primary-font-bold)",
                  fontSize: 11,
                  color: "#7a8fa6",
                  letterSpacing: "0.5px",
                }}>
                  <span>DATE</span>
                  <span>ORIGIN → DESTINATION</span>
                  <span>ROUTE</span>
                  <span>STATUS</span>
                </div>
                {trip_summary.trips.map((trip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr 2fr 1fr",
                      padding: "9px 14px",
                      borderTop: "1px solid #edf0f4",
                      fontSize: 13,
                      background: i % 2 === 0 ? "#fff" : "#fafbfc",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#2d3e4e", fontFamily: "var(--primary-font-medium)" }}>
                      {trip.trip_date ? dateFormat(trip.trip_date) : "—"}
                    </span>
                    <span style={{ color: "#2d3e4e" }}>
                      {trip.origin || "—"} → {trip.destination || "—"}
                    </span>
                    <span style={{ color: "#7a8fa6" }}>
                      {trip.route_name || "—"}
                    </span>
                    <span className={`status-badge ${trip.status}`} style={{ fontSize: 11 }}>
                      {trip.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#aaa", fontSize: 13 }}>No trips logged under this contract yet.</p>
            )}
          </>
        )}

        {/* ── Remarks ── */}
        {contract.remarks && (
          <>
            <div className="form-section-label mt-3">Remarks</div>
            <div className="view-details">
              {detail("REMARKS", contract.remarks, "No remarks")}
            </div>
          </>
        )}

        {/* ── Routes ── */}
        <div className="form-section-label mt-3">
          Routes{" "}
          <span style={{ fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#aaa" }}>
            ({routes.length})
          </span>
        </div>

        {routes.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>No routes defined for this contract.</p>
        ) : (
          <Row>
            {routes.map((route, index) => (
              <Col md={6} key={index}>
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 12,
                  background: "#fafafa",
                }}>
                  <div style={{ fontFamily: "var(--primary-font-bold)", fontSize: 13, color: "#2d3e4e", marginBottom: 8 }}>
                    Route {index + 1}
                  </div>
                  {detail("ORIGIN", route.origin)}
                  {detail("DESTINATION", route.destination)}
                  {route.distance_km && detail("DISTANCE", `${route.distance_km} km`)}
                  {route.remarks && detail("REMARKS", route.remarks)}
                </div>
              </Col>
            ))}
          </Row>
        )}

      </div>
    </div>
  );
}