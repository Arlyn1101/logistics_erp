import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import ViewModal from "../../Components/Modals/ViewModal";
import {
  getAllContracts,
  searchContracts,
  getContractDetails,
  getContractSuggestions,
} from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { Select as AntSelect, DatePicker as AntDatePicker } from "antd";
import moment from "moment";
import {
  toastStyle,
  formatAmount,
  dateFormat,
} from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

const { RangePicker } = AntDatePicker;

export default function Contracts() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [suggestions, set_suggestions] = useState([]);
  const [suggestion_loading, set_suggestion_loading] = useState(false);
  const [active_filter, set_active_filter] = useState(null);
  const [search_value, set_search_value] = useState(null);
  const [date_range, set_date_range] = useState([null, null]);
  const [contract_data, set_contract_data] = useState([]);
  const [customer_options, set_customer_options] = useState([]);
  const [selected_row, set_selected_row] = useState({});
  const [active_tab, set_active_tab] = useState("all");
  const [filtered_data, set_filtered_data] = useState([]);
  const [show_view_modal, set_show_view_modal] = useState(false);
  const [view_form, set_view_form] = useState({});

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((row) => row.status === tab);
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(contract_data, tab));
  }

  function get_tab_count(tab) {
    if (tab === "all") return contract_data.length;
    return contract_data.filter((row) => row.status === tab).length;
  }

  async function handle_suggestion_search(keyword) {
    if (!keyword || keyword.trim().length < 1) {
      set_suggestions([]);
      return;
    }
    set_suggestion_loading(true);
    const res = await getContractSuggestions(keyword);
    if (res.data?.data) {
      const data = res.data.data;
      const type_map = [
        {
          key: "customers",
          type: "customer_id",
          icon: "🏢",
          label: "Customer",
        },
        {
          key: "contracts",
          type: "contract_id",
          icon: "📄",
          label: "Contract",
        },
      ];
      const options = type_map.flatMap(({ key, type, icon, label }) =>
        (data[key] || []).map((item) => ({
          value: `${type}::${item.id}`,
          label: `${icon} ${item.label}`,
          sublabel: label,
        })),
      );
      set_suggestions(options);
    }
    set_suggestion_loading(false);
  }

  function handle_suggestion_select(value, option) {
    const [type, id] = value.split("::");
    set_active_filter({ type, id, label: option.label });

    let filtered = contract_data;
    if (type === "contract_id") {
      filtered = contract_data.filter((row) => String(row.id) === String(id));
    } else if (type === "customer_id") {
      filtered = contract_data.filter((row) => String(row.customer_id) === String(id));
    }
    set_filtered_data(apply_tab_filter(filtered, active_tab));
  }

  function handle_range_change(dates) {
    set_date_range(dates || [null, null]);
    const filters = {
      customer_id: "",
      contract_id: "",
      ...(active_filter ? { [active_filter.type]: active_filter.id } : {}),
      date_from: dates?.[0] ? dates[0].format("YYYY-MM-DD") : "",
      date_to: dates?.[1] ? dates[1].format("YYYY-MM-DD") : "",
    };
    fetch_contracts(filters);
  }

  function handle_reset_filter() {
    set_active_filter(null);
    set_date_range([null, null]);
    set_suggestions([]);
    set_search_value(null);
    set_filtered_data(apply_tab_filter(contract_data, active_tab));
  }

  async function fetch_customers() {
    const response = await getAllCustomers();
    if (response.data && response.data.data) {
      set_customer_options(response.data.data);
    }
  }

  async function fetch_contracts(filters = {}) {
    set_show_loader(true);
    const has_filter = Object.values(filters).some(
      (v) => v !== "" && v !== null,
    );
    const response = has_filter
      ? await searchContracts(filters)
      : await getAllContracts();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        monthly_rate_fmt: `₱ ${formatAmount(a.monthly_rate)}`,
        fuel_price_fmt: `₱ ${formatAmount(a.fuel_price_per_liter)}`,
        excess_fmt: `₱ ${formatAmount(a.excess_trip_charge)}`,
        status_badge: StatusBadge(a.status),
        start_date_fmt: dateFormat(a.start_date),
        end_date_fmt: dateFormat(a.end_date) || "Open-ended",
      }));
      set_contract_data(result);
      set_filtered_data(result);
    } else {
      set_contract_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  function handle_row_click(row) {
    navigate("/contracts/view", {
      state: { contract: get_plain_contract(row) },
    });
  }

  // Strip React elements before passing to navigate
  function get_plain_contract(row) {
    return {
      id: row.id,
      contract_number: row.contract_number,
      customer_id: row.customer_id,
      customer_name: row.customer_name,
      date_signed: row.date_signed,
      authorized_representative: row.authorized_representative,
      payment_terms: row.payment_terms,
      monthly_rate: row.monthly_rate,
      included_trips: row.included_trips,
      excess_trip_charge: row.excess_trip_charge,
      fuel_price_per_liter: row.fuel_price_per_liter,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      remarks: row.remarks,
    };
  }

  useEffect(() => {
    fetch_customers();
    fetch_contracts();
  }, []);

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"CONTRACTS"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-3">
          <Col xs={6}>
            <h1 className="page-title">Contracts</h1>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <button className="add-btn" onClick={() => navigate("/contracts/form")}>
              Add Contract
            </button>
          </Col>
        </Row>

        <div className="trip-filter-bar mb-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={5}>
              <AntSelect
                showSearch
                allowClear
                value={search_value}
                onChange={(val) => set_search_value(val ?? null)}
                style={{ width: "100%" }}
                placeholder="🔍 Search customer, contract number..."
                filterOption={false}
                onSearch={handle_suggestion_search}
                onSelect={handle_suggestion_select}
                onClear={handle_reset_filter}
                loading={suggestion_loading}
                options={suggestions.map((s) => ({
                  value: s.value,
                  label: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{s.label}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{s.sublabel}</span>
                    </div>
                  ),
                }))}
                notFoundContent={suggestion_loading ? "Searching..." : "No results"}
              />
            </Col>
            <Col xs={12} md={4}>
              <RangePicker
                value={date_range}
                onChange={handle_range_change}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder={["Start from", "Start to"]}
                allowClear
              />
            </Col>
            <Col xs="auto">
              <button className="cancel-btn" onClick={handle_reset_filter}>
                Clear
              </button>
            </Col>
          </Row>
        </div>

        <div className="filter-tabs mb-3">
          {["all", "active", "expired", "terminated"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab-btn ${active_tab === tab ? "active" : ""}`}
              onClick={() => handle_tab_change(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">{get_tab_count(tab)}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          <Table
            tableHeaders={[
              "CONTRACT NO.",
              "CUSTOMER",
              "MONTHLY RATE",
              "TRIPS INCL.",
              "EXCESS/TRIP",
              "FUEL PRICE",
              "START DATE",
              "END DATE",
              "STATUS",
            ]}
            headerSelector={[
              "contract_number",
              "customer_name",
              "monthly_rate_fmt",
              "included_trips",
              "excess_fmt",
              "fuel_price_fmt",
              "start_date_fmt",
              "end_date_fmt",
              "status_badge",
            ]}
            tableData={filtered_data}
            showLoader={show_loader}
            withActionData={true}
            onRowClick={handle_row_click}
          />
        </div>
      </div>

      <ViewModal
        title="CONTRACT DETAILS"
        size="lg"
        withButtons
        show={show_view_modal}
        onHide={() => set_show_view_modal(false)}
        onEdit={() => {
          set_show_view_modal(false);
          navigate("/contracts/form", {
            state: { contract: get_plain_contract(view_form) },
          });
        }}
      >
        <div className="view-wrapper">
          <div className="view-header">
            <div className="view-header-left">
              <span className="view-title">
                {view_form.contract_number || "—"}
              </span>
              <span className="view-subtitle">
                {view_form.customer_name || "—"}
              </span>
            </div>
            <span
              className={`status-badge ${view_form.status}`}
              style={{ alignSelf: "center" }}
            >
              {view_form.status}
            </span>
          </div>

          <div className="view-details">
            <div className="form-section-label">Contract Details</div>
            <div className="view-detail-row">
              <span className="view-detail-label">CONTRACT NO.</span>
              <span
                className={
                  view_form.contract_number
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {view_form.contract_number || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">DATE SIGNED</span>
              <span
                className={
                  view_form.date_signed
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {view_form.date_signed
                  ? dateFormat(view_form.date_signed)
                  : "—"}
              </span>
            </div>

            <div className="form-section-label mt-3">Customer</div>
            <div className="view-detail-row">
              <span className="view-detail-label">CUSTOMER</span>
              <span
                className={
                  view_form.customer_name
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {view_form.customer_name || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">AUTHORIZED REP.</span>
              <span
                className={
                  view_form.authorized_representative
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {view_form.authorized_representative || "—"}
              </span>
            </div>

            <div className="form-section-label mt-3">Rate & Billing</div>
            <div className="view-detail-row">
              <span className="view-detail-label">MONTHLY RATE</span>
              <span className="view-detail-value">
                ₱ {formatAmount(view_form.monthly_rate) || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">INCLUDED TRIPS</span>
              <span className="view-detail-value">
                {view_form.included_trips || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">EXCESS/TRIP</span>
              <span className="view-detail-value">
                ₱ {formatAmount(view_form.excess_trip_charge) || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">FUEL PRICE/LITER</span>
              <span className="view-detail-value">
                ₱ {formatAmount(view_form.fuel_price_per_liter) || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">PAYMENT TERMS</span>
              <span
                className={
                  view_form.payment_terms
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {view_form.payment_terms || "—"}
              </span>
            </div>

            <div className="form-section-label mt-3">Contract Duration</div>
            <div className="view-detail-row">
              <span className="view-detail-label">START DATE</span>
              <span
                className={
                  view_form.start_date
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {view_form.start_date ? dateFormat(view_form.start_date) : "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">END DATE</span>
              <span
                className={
                  view_form.end_date ? "view-detail-value" : "view-empty-value"
                }
              >
                {view_form.end_date
                  ? dateFormat(view_form.end_date)
                  : "Open-ended"}
              </span>
            </div>

            <div className="form-section-label mt-3">Remarks</div>
            <div className="view-detail-row">
              <span className="view-detail-label">REMARKS</span>
              <span
                className={
                  view_form.remarks ? "view-detail-value" : "view-empty-value"
                }
              >
                {view_form.remarks || "No remarks"}
              </span>
            </div>

            <div className="form-section-label mt-3">Routes</div>
            {view_form.routes && view_form.routes.length > 0 ? (
              view_form.routes.map((route, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 8,
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--primary-font-bold)",
                      fontSize: 13,
                      color: "#2d3e4e",
                      marginBottom: 4,
                    }}
                  >
                    Route {index + 1}
                  </div>
                  <div className="view-detail-row">
                    <span className="view-detail-label">ORIGIN</span>
                    <span className="view-detail-value">
                      {route.origin || "—"}
                    </span>
                  </div>
                  <div className="view-detail-row">
                    <span className="view-detail-label">DESTINATION</span>
                    <span className="view-detail-value">
                      {route.destination || "—"}
                    </span>
                  </div>
                  {route.distance_km && (
                    <div className="view-detail-row">
                      <span className="view-detail-label">DISTANCE</span>
                      <span className="view-detail-value">
                        {route.distance_km} km
                      </span>
                    </div>
                  )}
                  {route.remarks && (
                    <div className="view-detail-row">
                      <span className="view-detail-label">REMARKS</span>
                      <span className="view-detail-value">{route.remarks}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="view-empty-value" style={{ padding: "8px 0" }}>
                No routes defined
              </div>
            )}
          </div>
        </div>
      </ViewModal>
    </div>
  );
}
