import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import PaymentModal from "../../Components/Modals/PaymentModal";
import Select from "react-select";
import { DatePicker as AntDatePicker } from "antd";
import { getAllBillings, searchBillings } from "../../Helpers/apiCalls/Finance/billingApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";

const { RangePicker } = AntDatePicker;

export default function Billings() {
  const navigate = useNavigate();
  const [inactive, set_inactive]           = useState(false);
  const [show_loader, set_show_loader]     = useState(false);
  const [active_tab, set_active_tab]       = useState("all");
  const [billing_data, set_billing_data]   = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [show_payment_modal, set_show_payment_modal] = useState(false);
  const [selected_billing, set_selected_billing]     = useState(null);
  const [customer_options, set_customer_options]     = useState([]);
  const [selected_customer, set_selected_customer]   = useState(null);
  const [date_range, set_date_range]                 = useState([null, null]);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  function StatusBadge(status) {
    const map = { unpaid: "inactive", paid: "active" };
    return (
      <span className={`status-badge ${map[status] || status}`}>
        {status}
      </span>
    );
  }

  function ActionBtn(row) {
    if (row.status !== "unpaid") return null;
    return (
      <button
        type="button"
        className="add-btn"
        onClick={(e) => {
          e.stopPropagation();
          const { status_badge, action_btn, ...clean } = row;
          set_selected_billing(clean);
          set_show_payment_modal(true);
        }}
      >
        Add Payment
      </button>
    );
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((row) => row.status === tab);
  }

  function get_tab_count(tab) {
    if (tab === "all") return billing_data.length;
    return billing_data.filter((row) => row.status === tab).length;
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(billing_data, tab));
  }

  async function fetch_customers() {
    const response = await getAllCustomers();
    if (response.data && response.data.data) {
      const options = response.data.data.map((c) => ({
        label: c.trade_name || `${c.first_name} ${c.last_name}`,
        value: c.id,
      }));
      set_customer_options([{ label: "All Customers", value: "" }, ...options]);
    }
  }

  async function fetch_billings(filters = {}) {
    set_show_loader(true);
    const has_filter = Object.values(filters).some((v) => v !== "" && v !== null);
    const response = has_filter
      ? await searchBillings(filters)
      : await getAllBillings();

    if (response.data && response.data.data) {
      const result = response.data.data.map((b) => ({
        ...b,
        billing_period_display: `${moment(b.billing_period_start).format("MMM D")} – ${moment(b.billing_period_end).format("MMM D, YYYY")}`,
        monthly_rate_display:   fmt(b.monthly_rate),
        grand_total_display:    fmt(b.grand_total),
        balance_display:        fmt(b.balance),
        status_badge:           StatusBadge(b.status),
        action_btn:             ActionBtn(b),
      }));
      set_billing_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_billing_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  function handle_filter_change(customer, dates) {
    const filters = {
      customer_id: customer?.value || "",
      month_from:  dates?.[0] ? moment(dates[0]).format("YYYY-MM-DD") : "",
      month_to:    dates?.[1] ? moment(dates[1]).format("YYYY-MM-DD") : "",
    };
    fetch_billings(filters);
  }

  function handle_reset() {
    set_selected_customer(null);
    set_date_range([null, null]);
    fetch_billings({});
  }

  useEffect(() => {
    fetch_customers();
    fetch_billings();
  }, []);

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"FINANCE"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Billings</h1>
            <p className="page-subtitle">Contract billing management</p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <button
              type="button"
              className="add-btn"
              onClick={() => navigate("/billings/form")}
            >
              Generate Billing
            </button>
          </Col>
        </Row>

        {/* Filter bar */}
        <div className="trip-filter-bar mb-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={4}>
              <Select
              classNamePrefix="react-select"
              placeholder="Select Customer"
              options={customer_options}
              value={selected_customer}
              onChange={(val) => {
                set_selected_customer(val);
                handle_filter_change(val, date_range);
              }}
              isClearable
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
            </Col>
            <Col xs={12} md={4}>
              <RangePicker
                value={date_range}
                onChange={(dates) => {
                  set_date_range(dates || [null, null]);
                  handle_filter_change(selected_customer, dates);
                }}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder={["From date", "To date"]}
                allowClear
              />
            </Col>
            <Col xs="auto">
              <button type="button" className="cancel-btn" onClick={handle_reset}>
                Clear
              </button>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <div className="filter-tabs mb-3">
          {["all", "unpaid", "paid"].map((tab) => (
            <button
              key={tab}
              type="button"
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
            onRowClick={(row) => {
              const { status_badge, action_btn, ...clean } = row;
              navigate("/billings/view", { state: { billing: clean } });
            }}
            tableHeaders={[
              "BILLING NO.",
              "CUSTOMER",
              "CONTRACT NO.",
              "BILLING PERIOD",
              "MONTHLY RATE",
              "GRAND TOTAL",
              "BALANCE",
              "STATUS",
              "",
            ]}
            headerSelector={[
              "billing_number",
              "customer_name",
              "contract_number",
              "billing_period_display",
              "monthly_rate_display",
              "grand_total_display",
              "balance_display",
              "status_badge",
              "action_btn",
            ]}
            tableData={filtered_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <PaymentModal
        show={show_payment_modal}
        onHide={() => set_show_payment_modal(false)}
        billing={selected_billing}
        on_success={() => fetch_billings()}
      />
    </div>
  );
}