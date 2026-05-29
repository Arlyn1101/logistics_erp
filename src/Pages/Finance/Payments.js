import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import Select from "react-select";
import { DatePicker as AntDatePicker } from "antd";
import {
  getAllPayments,
  searchPayments,
} from "../../Helpers/apiCalls/Finance/paymentApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";

const { RangePicker } = AntDatePicker;

export default function Payments() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [payment_data, set_payment_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [active_tab, set_active_tab] = useState("all");
  const [customer_options, set_customer_options] = useState([]);
  const [selected_customer, set_selected_customer] = useState(null);
  const [date_range, set_date_range] = useState([null, null]);

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((row) => row.payment_method === tab);
  }

  function get_tab_count(tab) {
    if (tab === "all") return payment_data.length;
    return payment_data.filter((row) => row.payment_method === tab).length;
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(payment_data, tab));
  }

  function get_ref(payment) {
    if (payment.payment_method === "check") return payment.check_number || "—";
    if (payment.payment_method === "bank_transfer")
      return payment.reference_number || "—";
    return "—";
  }

  async function fetch_customers() {
    const response = await getAllCustomers();
    if (response.data && response.data.data) {
      const options = response.data.data.map((c) => ({
        label: `${c.first_name} ${c.last_name}`,
        value: c.id,
      }));
      set_customer_options([{ label: "All Customers", value: "" }, ...options]);
    }
  }

  async function fetch_payments(filters = {}) {
    set_show_loader(true);
    const has_filter = Object.values(filters).some(
      (v) => v !== "" && v !== null,
    );
    const response = has_filter
      ? await searchPayments(filters)
      : await getAllPayments();

    if (response.data && response.data.data) {
      const result = response.data.data.map((p) => ({
        ...p,
        payment_date_fmt: moment(p.payment_date).format("MMM D, YYYY"),
        amount_display: fmt(p.amount),
        method_display: p.payment_method.replace("_", " "),
        ref_display: get_ref(p),
        bank_display: p.bank_name || "—",
        remarks_display: p.remarks || "—",
      }));
      set_payment_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_payment_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  function handle_filter_change(customer, dates) {
    const filters = {
      customer_id: customer?.value || "",
      date_from: dates?.[0] ? moment(dates[0]).format("YYYY-MM-DD") : "",
      date_to: dates?.[1] ? moment(dates[1]).format("YYYY-MM-DD") : "",
    };
    fetch_payments(filters);
  }

  function handle_reset() {
    set_selected_customer(null);
    set_date_range([null, null]);
    fetch_payments({});
  }

  useEffect(() => {
    fetch_customers();
    fetch_payments();
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
            <h1 className="page-title">Payments</h1>
            <p className="page-subtitle">All payment records</p>
          </Col>
        </Row>

        {/* Filter bar */}
        <div className="trip-filter-bar mb-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={4}>
              <Select
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                placeholder="Select Customer"
                options={customer_options}
                value={selected_customer}
                onChange={(val) => {
                  set_selected_customer(val);
                  handle_filter_change(val, date_range);
                }}
                isClearable
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
              <button className="cancel-btn" onClick={handle_reset}>
                Clear
              </button>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <div className="filter-tabs mb-3">
          {["all", "cash", "check", "bank_transfer"].map((tab) => (
            <button
              key={tab}
              className={`filter-tab-btn ${active_tab === tab ? "active" : ""}`}
              onClick={() => handle_tab_change(tab)}
            >
              {tab === "bank_transfer"
                ? "Bank Transfer"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">{get_tab_count(tab)}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          <Table
            tableHeaders={[
              "DATE",
              "BILLING NO.",
              "CUSTOMER",
              "CONTRACT NO.",
              "METHOD",
              "AMOUNT",
              "REF / CHECK NO.",
              "BANK",
              "REMARKS",
            ]}
            headerSelector={[
              "payment_date_fmt",
              "billing_number",
              "customer_name",
              "contract_number",
              "method_display",
              "amount_display",
              "ref_display",
              "bank_display",
              "remarks_display",
            ]}
            tableData={filtered_data}
            showLoader={show_loader}
            onRowClick={(row) =>
              navigate("/payments/view", {
                state: { payment: { id: row.id } },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
