import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { getContractDetails } from "../../Helpers/apiCalls/Contracts/contractApi";
import { formatAmount, dateFormat } from "../../Helpers/Utils/Common";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function ContractView() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed_contract = location.state?.contract || null;

  const [inactive, set_inactive] = useState(false);
  const [contract, set_contract] = useState(null);
  const [routes, set_routes] = useState([]);
  const [is_loading, set_is_loading] = useState(true);

  async function load_contract() {
    if (!passed_contract) {
      navigate("/contracts");
      return;
    }
    set_is_loading(true);
    const response = await getContractDetails(passed_contract.id);
    if (response.data && response.data.data) {
      const data = response.data.data;
      set_contract(data);
      set_routes(data.routes || []);
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
          <Navbar
            onCollapse={(is_inactive) => set_inactive(is_inactive)}
            active={"CONTRACTS"}
          />
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
          <Navbar
            onCollapse={(is_inactive) => set_inactive(is_inactive)}
            active={"CONTRACTS"}
          />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <p style={{ color: "#aaa", marginTop: 40 }}>Contract not found.</p>
        </div>
      </div>
    );
  }

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
          <span
            className="breadcrumb-link"
            onClick={() => navigate("/contracts")}
          >
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
            <button
              className="cancel-btn"
              onClick={() => navigate("/contracts")}
            >
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

        {/* ── Customer ── */}
        <div className="form-section-label">Customer</div>
        <div className="view-details">
          <div className="view-detail-row">
            <span className="view-detail-label">CUSTOMER</span>
            <span className={contract.customer_name ? "view-detail-value" : "view-empty-value"}>
              {contract.customer_name || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">AUTHORIZED REP.</span>
            <span className={contract.authorized_representative ? "view-detail-value" : "view-empty-value"}>
              {contract.authorized_representative || "—"}
            </span>
          </div>
        </div>

        {/* ── Contract Details ── */}
        <div className="form-section-label mt-3">Contract Details</div>
        <div className="view-details">
          <div className="view-detail-row">
            <span className="view-detail-label">CONTRACT NO.</span>
            <span className={contract.contract_number ? "view-detail-value" : "view-empty-value"}>
              {contract.contract_number || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">DATE OF CONTRACT</span>
            <span className={contract.date_signed ? "view-detail-value" : "view-empty-value"}>
              {contract.date_signed ? dateFormat(contract.date_signed) : "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">STATUS</span>
            <span className={`status-badge ${contract.status}`}>
              {contract.status}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">START DATE</span>
            <span className={contract.start_date ? "view-detail-value" : "view-empty-value"}>
              {contract.start_date ? dateFormat(contract.start_date) : "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">END DATE</span>
            <span className={contract.end_date ? "view-detail-value" : "view-empty-value"}>
              {contract.end_date ? dateFormat(contract.end_date) : "Open-ended"}
            </span>
          </div>
        </div>

        {/* ── Rate & Billing ── */}
        <div className="form-section-label mt-3">Rate & Billing</div>
        <div className="view-details">
          <div className="view-detail-row">
            <span className="view-detail-label">MONTHLY RATE</span>
            <span className="view-detail-value">
              ₱ {formatAmount(contract.monthly_rate) || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">INCLUDED TRIPS</span>
            <span className="view-detail-value">
              {contract.included_trips || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">EXCESS/TRIP</span>
            <span className="view-detail-value">
              ₱ {formatAmount(contract.excess_trip_charge) || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">FUEL PRICE/LITER</span>
            <span className="view-detail-value">
              ₱ {formatAmount(contract.fuel_price_per_liter) || "—"}
            </span>
          </div>
          <div className="view-detail-row">
            <span className="view-detail-label">PAYMENT TERMS</span>
            <span className={contract.payment_terms ? "view-detail-value" : "view-empty-value"}>
              {contract.payment_terms || "—"}
            </span>
          </div>
        </div>

        {/* ── Remarks ── */}
        <div className="form-section-label mt-3">Remarks</div>
        <div className="view-details">
          <div className="view-detail-row">
            <span className="view-detail-label">REMARKS</span>
            <span className={contract.remarks ? "view-detail-value" : "view-empty-value"}>
              {contract.remarks || "No remarks"}
            </span>
          </div>
        </div>

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
          routes.map((route, index) => (
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
              <div
                style={{
                  fontFamily: "var(--primary-font-bold)",
                  fontSize: 13,
                  color: "#2d3e4e",
                  marginBottom: 8,
                }}
              >
                Route {index + 1}
              </div>
              <Row>
                <Col>
                  <div className="view-detail-row">
                    <span className="view-detail-label">ORIGIN</span>
                    <span className={route.origin ? "view-detail-value" : "view-empty-value"}>
                      {route.origin || "—"}
                    </span>
                  </div>
                </Col>
                <Col>
                  <div className="view-detail-row">
                    <span className="view-detail-label">DESTINATION</span>
                    <span className={route.destination ? "view-detail-value" : "view-empty-value"}>
                      {route.destination || "—"}
                    </span>
                  </div>
                </Col>
                {route.distance_km && (
                  <Col xs={3}>
                    <div className="view-detail-row">
                      <span className="view-detail-label">DISTANCE</span>
                      <span className="view-detail-value">{route.distance_km} km</span>
                    </div>
                  </Col>
                )}
              </Row>
              {route.remarks && (
                <div className="view-detail-row">
                  <span className="view-detail-label">REMARKS</span>
                  <span className="view-detail-value">{route.remarks}</span>
                </div>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
}