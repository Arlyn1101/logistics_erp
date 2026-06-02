import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { Select as AntSelect, DatePicker as AntDatePicker } from "antd";
import FinanceTable from "../../Components/TableTemplate/FinanceTable";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import {
  getContractsWithUnbilled,
  createBatchBilling,
} from "../../Helpers/apiCalls/Finance/billingApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { searchContracts } from "../../Helpers/apiCalls/Contracts/contractApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import dayjs from "dayjs";
import "../Manage/Manage.css";

export default function BillingForm() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);

  // Step 1 — customer + billing month
  const [customer_options, set_customer_options] = useState([]);
  const [selected_customer, set_selected_customer] = useState(null);
  const [customer_contracts, set_customer_contracts] = useState([]); // [{start_date, end_date}] // { customer_id, customer_name }
  const [billing_month, set_billing_month] = useState(null); // dayjs object

  // Step 2 — contract cards
  const [contract_cards, set_contract_cards] = useState([]); // array of { contract_id, contract_number, customer_name, trips, summary }
  const [loading_contracts, set_loading_contracts] = useState(false);
  const [due_date, set_due_date] = useState("");
  const [customer_details, set_customer_details] = useState(null);
const [contracts_page, set_contracts_page] = useState(1);
  const billing_date = moment().format("MMMM DD, YYYY");

  async function fetch_customers() {
    const res = await getAllCustomers();
    if (res.data && res.data.data) {
      const options = res.data.data.map((c) => ({
        value: c.id,
        label: c.trade_name || `${c.first_name} ${c.last_name}`,
        customer_id: c.id,
        customer_name: c.trade_name || `${c.first_nfame} ${c.last_name}`,
      }));
      set_customer_options(options);
    }
  }

  async function handle_customer_select(value, option) {
    set_selected_customer({
      customer_id: option.customer_id,
      customer_name: option.customer_name,
    });
    set_contract_cards([]);
    set_billing_month(null);
    set_customer_contracts([]);

    const res = await searchContracts({ customer_id: option.customer_id });
    if (res.data && res.data.data) {
      set_customer_contracts(res.data.data);
    }
  }

  function handle_customer_clear() {
    set_selected_customer(null);
    set_contract_cards([]);
    set_billing_month(null);
    set_customer_contracts([]);
    set_customer_details(null);
  }

  async function handle_month_change(date) {
    set_billing_month(date);
    set_contract_cards([]);
    if (!date || !selected_customer) return;
    const period_start = date.startOf("month").format("YYYY-MM-DD");
    const period_end = date.endOf("month").format("YYYY-MM-DD");
    set_loading_contracts(true);
    const res = await getContractsWithUnbilled(
      selected_customer.customer_id,
      period_start,
      period_end,
    );
    if (res.data && res.data.data && res.data.data.length > 0) {
      const mapped_cards = res.data.data.map((c) => {
        const terms_match = c.payment_terms ? c.payment_terms.match(/\d+/) : null;
        const terms = terms_match ? parseInt(terms_match[0]) : 0;
        const auto_due = terms > 0 ? moment().add(terms, 'days').format('YYYY-MM-DD') : '';
        return { ...c, expanded: false, due_date: auto_due };
      });
      set_contract_cards(mapped_cards);
      if (mapped_cards.length === 1) {
        set_due_date(mapped_cards[0].due_date || '');
      }
      set_customer_details(res.data.customer || null);
    } else {
      set_contract_cards([]);
      set_customer_details(null);
      toast("No unbilled contracts found for this customer and month.", {
        style: toastStyle(),
      });
    }
    set_loading_contracts(false);
  }

  async function handle_confirm() {
    if (!selected_customer || !billing_month || contract_cards.length === 0)
      return;
    if (contract_cards.length === 1 && !due_date) {
      toast.error("Please select a due date.", { style: toastStyle() });
      return;
    }
    if (contract_cards.length > 1) {
      const missing = contract_cards.some((c) => !c.due_date);
      if (missing) {
        toast.error("Please select a due date for all contracts.", { style: toastStyle() });
        return;
      }
    }
    const period_start = billing_month.startOf("month").format("YYYY-MM-DD");
    const period_end = billing_month.endOf("month").format("YYYY-MM-DD");
    set_is_clicked(true);
    const is_multiple = contract_cards.length > 1;
    const due_dates_array = is_multiple
      ? contract_cards.map((c) => ({ contract_id: c.contract_id, due_date: c.due_date }))
      : [];
    const payload = {
      customer_id: selected_customer.customer_id,
      period_start,
      period_end,
      ...(is_multiple ? { due_dates: due_dates_array } : { due_date }),
      contract_ids: contract_cards.map((c) => c.contract_id),
    };
    const res = await createBatchBilling(payload);
    if (res.data && res.data.status === "success") {
      toast.success("Billing generated successfully!", { style: toastStyle() });
      setTimeout(() => navigate("/billings"), 1000);
    } else {
      toast.error("Failed to generate billing.", { style: toastStyle() });
    }
    set_is_clicked(false);
  }

  useEffect(() => {
    fetch_customers();
  }, []);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  function toggle_card(contract_id) {
    set_contract_cards((prev) =>
      prev.map((c) =>
        c.contract_id === contract_id ? { ...c, expanded: !c.expanded } : c,
      ),
    );
  }

  function is_month_disabled(current) {
    if (!current || customer_contracts.length === 0) return false;
    const month_start = current.startOf("month");
    const month_end = current.endOf("month");
    return !customer_contracts.some((c) => {
      const contract_start = dayjs(c.start_date).startOf("month");
      const contract_end = dayjs(c.end_date).endOf("month");
      return month_end >= contract_start && month_start <= contract_end;
    });
  }

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
              Select a customer and billing month to generate
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
              disabled={contract_cards.length === 0 || is_clicked}
            >
              {is_clicked ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </div>

        {/* Step 1 — Select Customer + Month */}
        <div className="biodata-card mb-4">
          <div className="biodata-section-label">Billing Information</div>
          {contract_cards.length > 1 ? (
            <Row className="nc-modal-custom-row" style={{ alignItems: "flex-end" }}>
              <Col xs={12} md={4}>
                <div className="field-label">
                  CUSTOMER <span className="required-icon">*</span>
                </div>
                <AntSelect
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Search customer..."
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onSelect={handle_customer_select}
                  onClear={handle_customer_clear}
                  options={customer_options}
                />
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">
                  BILLING MONTH <span className="required-icon">*</span>
                </div>
                <AntDatePicker
                  picker="month"
                  value={billing_month}
                  onChange={handle_month_change}
                  format="MMMM YYYY"
                  placeholder={
                    !selected_customer
                      ? "Select a customer first"
                      : "Select billing month"
                  }
                  disabled={!selected_customer}
                  disabledDate={is_month_disabled}
                  style={{ width: "100%" }}
                  className="nc-modal-custom-input"
                />
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">BILLING DATE</div>
                <div className="detail-value" style={{ paddingTop: 6 }}>
                  {billing_date}
                </div>
              </Col>
            </Row>
          ) : (
            <>
              <Row className="nc-modal-custom-row" style={{ alignItems: "flex-end" }}>
                <Col xs={12} md={6}>
                  <div className="field-label">
                    CUSTOMER <span className="required-icon">*</span>
                  </div>
                  <AntSelect
                    showSearch
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Search customer..."
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    onSelect={handle_customer_select}
                    onClear={handle_customer_clear}
                    options={customer_options}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <div className="field-label">
                    BILLING MONTH <span className="required-icon">*</span>
                  </div>
                  <AntDatePicker
                    picker="month"
                    value={billing_month}
                    onChange={handle_month_change}
                    format="MMMM YYYY"
                    placeholder={
                      !selected_customer
                        ? "Select a customer first"
                        : "Select billing month"
                    }
                    disabled={!selected_customer}
                    disabledDate={is_month_disabled}
                    style={{ width: "100%" }}
                    className="nc-modal-custom-input"
                  />
                </Col>
              </Row>
              <Row className="nc-modal-custom-row mt-3" style={{ alignItems: "flex-end" }}>
                <Col xs={12} md={4}>
                  <div className="field-label">CONTRACT NO.</div>
                  <div className="detail-value" style={{ paddingTop: 6 }}>
                    {contract_cards.length === 1 ? contract_cards[0].contract_number : "—"}
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div className="field-label">BILLING DATE</div>
                  <div className="detail-value" style={{ paddingTop: 6 }}>
                    {billing_date}
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div className="field-label">
                    DUE DATE <span className="required-icon">*</span>
                  </div>
                  <AntDatePicker
                    value={due_date ? dayjs(due_date) : null}
                    onChange={(date) =>
                      set_due_date(date ? date.format("YYYY-MM-DD") : "")
                    }
                    format="MMMM DD, YYYY"
                    placeholder="Select due date"
                    disabled={contract_cards.length === 0}
                    style={{ width: "100%" }}
                    className="nc-modal-custom-input"
                  />
                </Col>
              </Row>
            </>
          )}
        </div>
        {/* Loading state */}
        {loading_contracts && (
          <div className="biodata-card mb-4 text-center py-4">
            <span className="page-subtitle">Loading contracts...</span>
          </div>
        )}

        {/* Combined top card — multiple contracts only */}
        {!loading_contracts && contract_cards.length > 1 && (
          <div className="biodata-card mb-4">

        {/* Customer Details — multiple */}
        {customer_details && (
          <>
            <div className="biodata-section-label">Customer Details</div>
            <Row className="nc-modal-custom-row mt-2">
              <Col xs={12} md={4}>
                <div className="field-label">TRADE NAME</div>
                <div className="detail-value">{customer_details.trade_name || "—"}</div>
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">ADDRESS</div>
                <div className="detail-value">{customer_details.trade_address || "—"}</div>
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">TIN</div>
                <div className="detail-value">{customer_details.tin || "—"}</div>
              </Col>
            </Row>
          </>
        )}

        {/* Contracts in This Billing table */}
        {(() => {
          const page_size = 5;
          const total_pages = Math.ceil(contract_cards.length / page_size);
          const paginated = contract_cards.slice((contracts_page - 1) * page_size, contracts_page * page_size);
          return (
            <div className="mt-4">
              <div className="biodata-section-label">
                Contracts in This Billing ({contract_cards.length} contracts)
              </div>
              <div className="table-responsive mt-3">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#1a2e40" }}>
                      <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>Contract No.</th>
                      <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>Start Date</th>
                      <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((card) => (
                      <tr key={card.contract_id}>
                        <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{card.contract_number}</td>
                        <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{dayjs(card.start_date).format("MMM D, YYYY")}</td>
                        <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{dayjs(card.end_date).format("MMM D, YYYY")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total_pages > 1 && (
                <div className="d-flex justify-content-end align-items-center mt-2" style={{ gap: 8 }}>
                  <button type="button" className="cancel-btn" disabled={contracts_page === 1} onClick={() => set_contracts_page((p) => p - 1)}>Prev</button>
                  <span style={{ fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{contracts_page} / {total_pages}</span>
                  <button type="button" className="cancel-btn" disabled={contracts_page === total_pages} onClick={() => set_contracts_page((p) => p + 1)}>Next</button>
                </div>
              )}
            </div>
          );
        })()}
          </div>
        )}

        {/* Customer Details — single contract only */}
        {!loading_contracts && contract_cards.length === 1 && customer_details && (
          <div className="biodata-card mb-4">
            <div className="biodata-section-label">Customer Details</div>
            <Row className="nc-modal-custom-row mt-2">
              <Col xs={12} md={4}>
                <div className="field-label">TRADE NAME</div>
                <div className="detail-value">{customer_details.trade_name || "—"}</div>
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">ADDRESS</div>
                <div className="detail-value">{customer_details.trade_address || "—"}</div>
              </Col>
              <Col xs={12} md={4}>
                <div className="field-label">TIN</div>
                <div className="detail-value">{customer_details.tin || "—"}</div>
              </Col>
            </Row>
          </div>
        )}

        {/* One card per contract */}
        {!loading_contracts &&
          contract_cards.map((card, card_index) => (
            <React.Fragment key={card.contract_id}>
              {contract_cards.length > 1 ? (
              <div className="biodata-card mb-4">
              {/* Card header — collapsible, only when multiple contracts */}
              {true && (
                  <div
                    className="d-flex justify-content-between align-items-center mb-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggle_card(card.contract_id)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ backgroundColor: "#1a2e40", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "var(--primary-font-bold)", flexShrink: 0 }}>{card_index + 1}</span>
                      <div className="biodata-section-label mb-0">
                        Contract {card.contract_number} &nbsp;|&nbsp;{" "}
                        {dayjs(card.start_date).format("MMM D, YYYY")} –{" "}
                        {dayjs(card.end_date).format("MMM D, YYYY")}
                        &nbsp;
                        <span style={{ fontSize: 11, color: "#5ac8e1" }}>
                          {card.expanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-column" style={{ marginLeft: "auto", paddingLeft: 24 }} onClick={(e) => e.stopPropagation()}>
                      <div className="field-label mb-1" style={{ whiteSpace: "nowrap" }}>DUE DATE <span className="required-icon">*</span></div>
                      <AntDatePicker
                        value={card.due_date ? dayjs(card.due_date) : null}
                        onChange={(date) =>
                          set_contract_cards((prev) =>
                            prev.map((c) =>
                              c.contract_id === card.contract_id
                                ? { ...c, due_date: date ? date.format("YYYY-MM-DD") : "" }
                                : c
                            )
                          )
                        }
                        format="MMMM DD, YYYY"
                        placeholder="Select due date"
                        style={{ width: 180 }}
                        className="nc-modal-custom-input"
                      />
                    </div>
                  </div>
              )}

              {/* Trip Table + Summary — same card */}
              {(contract_cards.length === 1 || card.expanded) && (
                <>
                  <div>
                    <div className="biodata-section-label">
                      Trips in This Cycle ({card.trips.length} trips)
                    </div>
                    <div className="mt-3">
                      {card.trips.length === 0 ? (
                        <p className="page-subtitle mt-2">
                          No trips found for this billing cycle.
                        </p>
                      ) : (
                        <FinanceTable
                          type="trips"
                          tableData={card.trips}
                          showLoader={false}
                        />
                      )}
                    </div>
                  </div>

                  {/* Billing Summary */}
                  <div className="mt-4">
                    <div className="biodata-section-label">Billing Summary</div>
                    <div className="table-responsive mt-3">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#1a2e40" }}>
                            <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", width: "60%" }}>Description</th>
                            <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: "Monthly Rate",         value: fmt(card.summary.monthly_rate) },
                            { label: "Excess Trip Total",    value: fmt(card.summary.excess_trip_total) },
                            { label: "Fuel Surcharge Total", value: fmt(card.summary.fuel_surcharge_total) },
                          ].map((row) => (
                            <tr key={row.label}>
                              <td style={{ padding: "8px 12px", width: "60%", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{row.label}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{row.value}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: "2px solid #edf0f4" }}>
                            <td style={{ padding: "10px 12px", fontFamily: "var(--primary-font-bold)", fontSize: 14, color: "#1a2e40" }}>GRAND TOTAL</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--primary-font-bold)", fontSize: 16, color: "#5ac8e1" }}>{fmt(card.summary.grand_total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              </div>
              ) : (
                <>
                  <div className="biodata-card mb-4">
                    <div className="biodata-section-label">
                      Trips in This Cycle ({card.trips.length} trips)
                    </div>
                    <div className="mt-3">
                      {card.trips.length === 0 ? (
                        <p className="page-subtitle mt-2">No trips found for this billing cycle.</p>
                      ) : (
                        <FinanceTable type="trips" tableData={card.trips} showLoader={false} />
                      )}
                    </div>
                  </div>
                  <div className="biodata-card mb-4">
                    <div className="biodata-section-label">Billing Summary</div>
                    <div className="table-responsive mt-3">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#1a2e40" }}>
                            <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", width: "60%" }}>Description</th>
                            <th style={{ padding: "10px 12px", color: "#ffffff", fontFamily: "var(--primary-font-bold)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: "Monthly Rate",         value: fmt(card.summary.monthly_rate) },
                            { label: "Excess Trip Total",    value: fmt(card.summary.excess_trip_total) },
                            { label: "Fuel Surcharge Total", value: fmt(card.summary.fuel_surcharge_total) },
                          ].map((row) => (
                            <tr key={row.label}>
                              <td style={{ padding: "8px 12px", width: "60%", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{row.label}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", borderBottom: "1px solid #f0f0f0", fontFamily: "var(--primary-font-medium)", fontSize: 13, color: "#444" }}>{row.value}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: "2px solid #edf0f4" }}>
                            <td style={{ padding: "10px 12px", fontFamily: "var(--primary-font-bold)", fontSize: 14, color: "#1a2e40" }}>GRAND TOTAL</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--primary-font-bold)", fontSize: 16, color: "#5ac8e1" }}>{fmt(card.summary.grand_total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
