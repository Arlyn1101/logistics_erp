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

  const card_style = {
    background: "#fff",
    border: "1px solid #edf0f4",
    borderRadius: 10,
    padding: "16px",
    height: "100%",
  };

  const stat_card_style = {
    background: "#f7fbfd",
    border: "1px solid #edf0f4",
    borderRadius: 8,
    padding: "10px 12px",
  };

  const stat_label_style = {
    fontSize: 11,
    color: "#7a8fa6",
    fontFamily: "var(--primary-font-medium)",
    marginBottom: 4,
  };

  const stat_value_style = {
    fontSize: 20,
    fontFamily: "var(--primary-font-bold)",
    color: "#2d3e4e",
  };

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

        {/* Header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">{contract.contract_number || "Contract Details"}</h1>
            <p className="page-subtitle">{contract.customer_name || "—"}</p>
          </div>
          <div className="add-customer-actions">
            <button className="cancel-btn" onClick={() => navigate("/contracts")}>Back</button>
            <button className="save-btn" onClick={() => navigate("/contracts/form", { state: { contract: get_plain_contract(contract) } })}>
              Edit Contract
            </button>
          </div>
        </div>

      <div className="biodata-card">

          {/* ── Customer ── */}
          <div className="biodata-section-label">Customer</div>
          <Row className="nc-modal-custom-row">
            <Col xs={6}>
              <div className="field-label">CUSTOMER</div>
              <div className="detail-value">{contract.customer_name || "—"}</div>
            </Col>
            <Col xs={6}>
              <div className="field-label">AUTHORIZED REPRESENTATIVE</div>
              <div className="detail-value">{contract.authorized_representative || "—"}</div>
            </Col>
          </Row>

          {/* ── Contract Details ── */}
          <div className="biodata-section-label">Contract Details</div>
          <Row className="nc-modal-custom-row">
            <Col xs={3}>
              <div className="field-label">CONTRACT NO.</div>
              <div className="detail-value">{contract.contract_number || "—"}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">DATE SIGNED</div>
              <div className="detail-value">{contract.date_signed ? dateFormat(contract.date_signed) : "—"}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">START DATE</div>
              <div className="detail-value">{contract.start_date ? dateFormat(contract.start_date) : "—"}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">END DATE</div>
              <div className="detail-value">{contract.end_date ? dateFormat(contract.end_date) : "Open-ended"}</div>
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col xs={3}>
              <div className="field-label">STATUS</div>
              <span className={`status-badge ${contract.status}`}>{contract.status}</span>
            </Col>
            <Col xs={3}>
              <div className="field-label">PAYMENT TERMS</div>
              <div className="detail-value">{contract.payment_terms || "—"}</div>
            </Col>
          </Row>

          {/* ── Rate & Billing ── */}
          <div className="biodata-section-label">Rate & Billing</div>
          <Row className="nc-modal-custom-row">
            <Col xs={3}>
              <div className="field-label">MONTHLY RATE</div>
              <div className="detail-value">₱ {formatAmount(contract.monthly_rate || 0)}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">INCLUDED TRIPS / MONTH</div>
              <div className="detail-value">{contract.included_trips || "—"}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">EXCESS TRIP CHARGE</div>
              <div className="detail-value">₱ {formatAmount(contract.excess_trip_charge || 0)}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">FUEL PRICE / LITER</div>
              <div className="detail-value">₱ {formatAmount(contract.fuel_price_per_liter || 0)}</div>
            </Col>
          </Row>

        </div>

        {/* ── Trip Usage + Routes side by side ── */}
        <Row className="g-3 mb-3 mt-3">

          {/* Trip Usage */}
          <Col xs={12} md={6}>
            <div style={card_style}>
              <div className="form-section-label" style={{ marginBottom: 10 }}>Trip Usage</div>
              {trip_summary === null ? (
                <p style={{ color: "#aaa", fontSize: 13 }}>Trip usage data unavailable.</p>
              ) : (
                <>
                  <Row className="g-2 mb-3">
                    <Col xs={6}>
                      <div style={stat_card_style}>
                        <div style={stat_label_style}>TRIPS USED</div>
                        <div style={stat_value_style}>
                          {used}
                          <span style={{ fontSize: 12, color: "#7a8fa6", marginLeft: 4 }}>/ {included}</span>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ ...stat_card_style, background: excess > 0 ? "#fff5f5" : "#f7fbfd", border: `1px solid ${excess > 0 ? "#f5c6cb" : "#edf0f4"}` }}>
                        <div style={stat_label_style}>EXCESS TRIPS</div>
                        <div style={{ ...stat_value_style, color: excess > 0 ? "#c0392b" : "#2d3e4e" }}>
                          {excess}
                          {excess > 0 && <span style={{ fontSize: 11, marginLeft: 4 }}>+₱{formatAmount(excess * (contract.excess_trip_charge || 0))}</span>}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div style={{ fontSize: 11, color: "#7a8fa6", marginBottom: 4, fontFamily: "var(--primary-font-medium)" }}>USAGE</div>
                  <div style={{ background: "#e0e0e0", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ width: `${pct}%`, background: bar_color, height: "100%", borderRadius: 6, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: bar_color, fontFamily: "var(--primary-font-bold)" }}>{pct}%</div>
                </>
              )}
            </div>
          </Col>

          {/* Routes */}
          <Col xs={12} md={6}>
            <div style={card_style}>
              <div className="form-section-label" style={{ marginBottom: 10 }}>
                Routes <span style={{ color: "#aaa", fontSize: 12 }}>({routes.length})</span>
              </div>
              {routes.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: 13 }}>No routes defined.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {routes.map((route, i) => (
                    <div key={i} style={{ background: "#f7fbfd", border: "1px solid #edf0f4", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontFamily: "var(--primary-font-bold)", fontSize: 12, color: "#7a8fa6", marginBottom: 4 }}>Route {i + 1}</div>
                      <div style={{ fontSize: 13, color: "#2d3e4e", fontFamily: "var(--primary-font-medium)" }}>
                        {route.origin || "—"} → {route.destination || "—"}
                      </div>
                      {route.distance_km && <div style={{ fontSize: 12, color: "#7a8fa6" }}>{route.distance_km} km</div>}
                      {route.remarks && <div style={{ fontSize: 12, color: "#7a8fa6" }}>{route.remarks}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Remarks */}
          {contract.remarks && (
            <Col xs={12} md={6}>
              <div style={card_style}>
                <div className="form-section-label" style={{ marginBottom: 10 }}>Remarks</div>
                <p style={{ fontSize: 13, color: "#2d3e4e", margin: 0 }}>{contract.remarks}</p>
              </div>
            </Col>
          )}

        </Row>

        {/* ── Trip List ── */}
        {trip_summary?.trips && trip_summary.trips.length > 0 && (
          <div style={{ ...card_style, marginBottom: 24 }}>
            <div className="form-section-label" style={{ marginBottom: 10 }}>
              Trip Log <span style={{ color: "#aaa", fontSize: 12 }}>({trip_summary.trips.length})</span>
            </div>
            <div style={{ border: "1px solid #edf0f4", borderRadius: 8, overflow: "hidden", maxHeight: 300, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", background: "#f0f4f8", padding: "7px 14px", fontFamily: "var(--primary-font-bold)", fontSize: 11, color: "#7a8fa6", letterSpacing: "0.5px", position: "sticky", top: 0 }}>
                <span>DATE</span>
                <span>ROUTE</span>
              </div>
              {trip_summary.trips.map((trip, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr", padding: "7px 14px", borderTop: "1px solid #edf0f4", fontSize: 13, background: i % 2 === 0 ? "#fff" : "#fafbfc", alignItems: "center" }}>
                  <span style={{ color: "#7a8fa6", fontSize: 12 }}>{trip.trip_date ? dateFormat(trip.trip_date) : "—"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ color: "#2d3e4e" }}>{trip.origin || "—"} → {trip.destination || "—"}</span>
                    <span className={`status-badge ${trip.is_excess == 1 ? "excess" : "included"}`} style={{ fontSize: 10, padding: "1px 7px" }}>
                      {trip.is_excess == 1 ? "Excess" : "Included"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}