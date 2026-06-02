import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import PaymentModal from "../../Components/Modals/PaymentModal";
import { Select as AntSelect, DatePicker as AntDatePicker } from "antd";
import {
  getAllBillings,
  searchBillings,
  getBillingSuggestions,
} from "../../Helpers/apiCalls/Finance/billingApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";

const { RangePicker } = AntDatePicker;

export default function Billings() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [active_tab, set_active_tab] = useState("all");
  const [billing_data, set_billing_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [show_payment_modal, set_show_payment_modal] = useState(false);
  const [selected_billing, set_selected_billing] = useState(null);
  const [date_range, set_date_range] = useState([null, null]);
  const [suggestions, set_suggestions] = useState([]);
  const [suggestion_loading, set_suggestion_loading] = useState(false);
  const [search_value, set_search_value] = useState(null);
  const [active_filter, set_active_filter] = useState({});

  const fmt = (val) =>
    `₱ ${parseFloat(val || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

  function StatusBadge(status) {
    const map = { open_bill: "inactive", closed_bill: "active" };
    return (
      <span className={`status-badge ${map[status] || status}`}>
        {status === "open_bill"
          ? "Open Invoice"
          : status === "closed_bill"
            ? "Closed Invoice"
            : status}
      </span>
    );
  }

  function ActionBtn(row) {
    if (row.status !== "open_bill") return "";
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
    if (tab === "partial") return data.filter((row) => row.status === "open_bill" && parseFloat(row.amount_paid) > 0);
    return data.filter((row) => row.status === tab);
  }

  function get_tab_count(tab) {
    if (tab === "all") return billing_data.length;
    if (tab === "partial") return billing_data.filter((row) => row.status === "open_bill" && parseFloat(row.amount_paid) > 0).length;
    return billing_data.filter((row) => row.status === tab).length;
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(billing_data, tab));
  }

  async function fetch_billings(filters = {}) {
    set_show_loader(true);
    const has_filter = Object.values(filters).some(
      (v) => v !== "" && v !== null,
    );
    const response = has_filter
      ? await searchBillings(filters)
      : await getAllBillings();

    if (response.data && response.data.data) {
      const result = response.data.data.map((b) => ({
        ...b,
        billing_period_display: `${moment(b.billing_period_start).format("MMM D")} – ${moment(b.billing_period_end).format("MMM D, YYYY")}`,
        monthly_rate_display: fmt(b.monthly_rate),
        grand_total_display: fmt(b.grand_total),
        balance_display: fmt(b.balance),
        status_badge: StatusBadge(b.status),
        action_btn: ActionBtn(b),
      }));
      set_billing_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_billing_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  async function handle_suggestion_search(keyword) {
    if (!keyword) { set_suggestions([]); return; }
    set_suggestion_loading(true);
    const res = await getBillingSuggestions(keyword);
    if (res.data && res.data.data && res.data.data.suggestions) {
      set_suggestions(res.data.data.suggestions);
    } else {
      set_suggestions([]);
    }
    set_suggestion_loading(false);
  }

  function handle_suggestion_select(value, option) {
    const new_filter = option.match_type === "billing"
      ? { billing_number: option.billing_number }
      : { customer_id: option.customer_id };
    set_active_filter(new_filter);
    fetch_billings({ ...new_filter, month_from: date_range?.[0] ? date_range[0].format("YYYY-MM-DD") : "", month_to: date_range?.[1] ? date_range[1].format("YYYY-MM-DD") : "" });
  }

  function handle_reset_filter() {
    set_search_value(null);
    set_suggestions([]);
    set_active_filter({});
    fetch_billings({ month_from: date_range?.[0] ? date_range[0].format("YYYY-MM-DD") : "", month_to: date_range?.[1] ? date_range[1].format("YYYY-MM-DD") : "" });
  }

  function handle_reset() {
    set_search_value(null);
    set_suggestions([]);
    set_active_filter({});
    set_date_range([null, null]);
    fetch_billings({});
  }

  useEffect(() => {
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
              <AntSelect
                showSearch
                allowClear
                value={search_value}
                onChange={(val) => set_search_value(val ?? null)}
                style={{ width: "100%" }}
                placeholder="🔍 Search customer or billing no."
                filterOption={false}
                onSearch={handle_suggestion_search}
                onSelect={handle_suggestion_select}
                onClear={handle_reset_filter}
                loading={suggestion_loading}
                options={suggestions.map((s) => ({
                  value: s.billing_number || s.customer_id,
                  label: s.billing_number
                    ? `${s.billing_number} — ${s.customer_name}`
                    : s.customer_name,
                  billing_number: s.billing_number,
                  customer_id: s.customer_id,
                  match_type: s.match_type,
                }))}
                notFoundContent={suggestion_loading ? "Searching..." : "No results"}
              />
            </Col>
            <Col xs={12} md={4}>
              <RangePicker
                value={date_range}
                onChange={(dates) => {
                  const d = dates || [null, null];
                  set_date_range(d);
                  fetch_billings({
                    ...active_filter,
                    month_from: d[0] ? d[0].format("YYYY-MM-DD") : "",
                    month_to: d[1] ? d[1].format("YYYY-MM-DD") : "",
                  });
                }}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder={["From date", "To date"]}
                allowClear
              />
            </Col>
            <Col xs="auto">
              <button
                type="button"
                className="cancel-btn"
                onClick={handle_reset}
              >
                Clear
              </button>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <div className="filter-tabs mb-3">
          {["all", "open_bill", "partial", "closed_bill"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-tab-btn ${active_tab === tab ? "active" : ""}`}
              onClick={() => handle_tab_change(tab)}
            >
              {tab === "all"
                ? "All"
                : tab === "open_bill"
                  ? "Open Invoice"
                  : tab === "partial"
                    ? "Partial"
                    : "Closed Invoice"}
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
