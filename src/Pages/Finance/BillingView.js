import React, { useState, useEffect } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import PaymentModal from "../../Components/Modals/PaymentModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  getBillingDetails,
} from "../../Helpers/apiCalls/Finance/billingApi";
import { deletePayment } from "../../Helpers/apiCalls/Finance/paymentApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

const STATUS_MAP = {
  unpaid:  "inactive",
  partial: "pending",
  paid:    "active",
};

export default function BillingView() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const passed    = location.state?.billing || null;

  const [inactive, set_inactive]               = useState(false);
  const [billing, set_billing]                 = useState(null);
  const [is_loading, set_is_loading]           = useState(true);
  const [show_payment_modal, set_show_payment_modal] = useState(false);
  const [is_deleting, set_is_deleting]         = useState(false);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  async function fetch_billing() {
    if (!passed) {
      navigate("/billings");
      return;
    }
    set_is_loading(true);
    const response = await getBillingDetails(passed.id);
    if (response.data && response.data.data) {
      set_billing(response.data.data);
    } else {
      toast.error("Failed to load billing details.", { style: toastStyle() });
      navigate("/billings");
    }
    set_is_loading(false);
  }

  useEffect(() => {
    fetch_billing();
  }, []);

  async function handle_delete_payment(payment_id) {
    if (!window.confirm("Remove this payment record?")) return;
    const response = await deletePayment(payment_id);
    if (response.data && response.data.status === "success") {
      toast.success("Payment removed.", { style: toastStyle() });
      fetch_billing();
    } else {
      toast.error("Failed to remove payment.", { style: toastStyle() });
    }
  }

  function get_payment_ref(payment) {
    if (payment.payment_method === "check")        return payment.check_number  || "—";
    if (payment.payment_method === "bank_transfer") return payment.reference_number || "—";
    return "—";
  }

  if (is_loading) {
    return (
      <div>
        <div className="page">
          <Navbar onCollapse={(v) => set_inactive(v)} active={"FINANCE"} />
        </div>
        <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
          <div className="details-loading">Loading billing details…</div>
        </div>
      </div>
    );
  }

  if (!billing) return null;

  const trips    = billing.trips    || [];
  const payments = billing.payments || [];

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(v) => set_inactive(v)} active={"FINANCE"} />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Breadcrumb */}
        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/billings")}>
            Billings
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{billing.billing_number}</span>
        </div>

        {/* Header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">{billing.billing_number}</h1>
            <p className="page-subtitle">{billing.customer_name} — {billing.contract_number}</p>
          </div>
          <div className="add-customer-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/billings")}
            >
              Back
            </button>
            {billing.status === "unpaid" && (
              <button
                type="button"
                className="save-btn"
                onClick={() => set_show_payment_modal(true)}
              >
                Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Section 1 — Billing Info */}
        <div className="biodata-card mb-3">
          <div className="biodata-section-label">Billing Information</div>
          <Row className="nc-modal-custom-row">
            <Col xs={3}>
              <div className="field-label">BILLING NO.</div>
              <div className="detail-value">{billing.billing_number}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">STATUS</div>
              <span className={`status-badge ${STATUS_MAP[billing.status] || billing.status}`}>
                {billing.status}
              </span>
            </Col>
            <Col xs={3}>
              <div className="field-label">CUSTOMER</div>
              <div className="detail-value">{billing.customer_name || "—"}</div>
            </Col>
            <Col xs={3}>
              <div className="field-label">CONTRACT NO.</div>
              <div className="detail-value">{billing.contract_number || "—"}</div>
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col xs={3}>
              <div className="field-label">BILLING PERIOD</div>
              <div className="detail-value">
                {moment(billing.billing_period_start).format("MMM D")} – {moment(billing.billing_period_end).format("MMM D, YYYY")}
              </div>
            </Col>
            <Col xs={3}>
              <div className="field-label">PAYMENT TERMS</div>
              <div className="detail-value">{billing.payment_terms || "—"}</div>
            </Col>
            {billing.remarks && (
              <Col xs={6}>
                <div className="field-label">REMARKS</div>
                <div className="detail-value">{billing.remarks}</div>
              </Col>
            )}
          </Row>
        </div>

        {/* Section 2 — Trip Breakdown */}
        <div className="biodata-card mb-3">
          <div className="biodata-section-label">
            Trip Breakdown ({trips.length} trips)
          </div>
          {trips.length === 0 ? (
            <p className="page-subtitle mt-2">No trips recorded for this billing period.</p>
          ) : (
            <div className="table-responsive mt-2">
              <Table bordered hover size="sm">
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
                  {trips.map((trip, i) => (
                    <tr
                      key={trip.id}
                      style={{ background: trip.is_excess ? "#fff5f5" : "inherit" }}
                    >
                      <td>{i + 1}</td>
                      <td>{moment(trip.trip_date).format("MMM D, YYYY")}</td>
                      <td>{trip.origin} → {trip.destination}</td>
                      <td>{trip.plate_number || "—"}</td>
                      <td>
                        {trip.is_excess ? (
                          <span className="status-badge excess">YES</span>
                        ) : (
                          <span className="status-badge included">NO</span>
                        )}
                      </td>
                      <td>{trip.is_excess ? fmt(trip.excess_charge) : "—"}</td>
                      <td>{trip.is_excess ? fmt(trip.fuel_additional_charge) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Section 3 — Computation Summary */}
        <div className="biodata-card mb-3">
          <div className="biodata-section-label">Computation Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
            {[
              { label: "Monthly Rate",        value: fmt(billing.monthly_rate) },
              { label: "Total Trips",         value: billing.total_trips },
              { label: "Included Trips",      value: billing.included_trips },
              { label: "Excess Trips",        value: billing.excess_trips },
              { label: "Excess Trip Total",   value: fmt(billing.excess_trip_total) },
              { label: "Fuel Surcharge Total",value: fmt(billing.fuel_surcharge_total) },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f4f8" }}>
                <span className="field-label" style={{ margin: 0 }}>{row.label}</span>
                <span className="detail-value" style={{ padding: 0 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px solid #edf0f4", marginTop: 4 }}>
              <span style={{ fontFamily: "var(--primary-font-bold)", fontSize: 13, color: "#2d3e4e" }}>GRAND TOTAL</span>
              <span style={{ fontFamily: "var(--primary-font-bold)", fontSize: 16, color: "#5ac8e1" }}>{fmt(billing.grand_total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span className="field-label" style={{ margin: 0 }}>AMOUNT PAID</span>
              <span className="detail-value" style={{ padding: 0, color: "#27ae60" }}>{fmt(billing.amount_paid)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span className="field-label" style={{ margin: 0 }}>BALANCE</span>
              <span className="detail-value" style={{ padding: 0, color: parseFloat(billing.balance) > 0 ? "#dc3545" : "#27ae60" }}>
                {fmt(billing.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4 — Payment History */}
        <div className="biodata-card mb-3">
          <div className="biodata-section-label">Payment History</div>
          {payments.length === 0 ? (
            <p className="page-subtitle mt-2">No payments recorded.</p>
          ) : (
            <div className="table-responsive mt-2">
              <Table bordered hover size="sm">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>METHOD</th>
                    <th>AMOUNT</th>
                    <th>REF / CHECK NO.</th>
                    <th>BANK</th>
                    <th>REMARKS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{moment(payment.payment_date).format("MMM D, YYYY")}</td>
                      <td style={{ textTransform: "capitalize" }}>
                        {payment.payment_method.replace("_", " ")}
                      </td>
                      <td>{fmt(payment.amount)}</td>
                      <td>{get_payment_ref(payment)}</td>
                      <td>{payment.bank_name || "—"}</td>
                      <td>{payment.remarks || "—"}</td>
                      <td>
                        <button
                          className="attachment-btn attachment-remove"
                          type="button"
                          title="Delete payment"
                          onClick={() => handle_delete_payment(payment.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        show={show_payment_modal}
        onHide={() => set_show_payment_modal(false)}
        billing={billing}
        on_success={() => fetch_billing()}
      />
    </div>
  );
}