import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { Select as AntSelect } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import {
  getAccountsReceivable,
  getArCustomerSuggestions,
  getArContractSuggestions,
} from "../../Helpers/apiCalls/Reports/reportsApi";
import { CSVLink } from "react-csv";
import Table from "../../Components/TableTemplate/Table";
import ReceivablesBreakdownModal from "../../Components/Modals/ReceivablesBreakdownModal";
import "../Manage/Manage.css";

const fmt = (val) =>
  `₱ ${parseFloat(val || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  })}`;

const csv_headers = [
  { label: "Customer", key: "customer_name" },
  { label: "Contract No.", key: "contract_number" },
  { label: "Current", key: "current" },
  { label: "1-30 Days", key: "one_to_thirty" },
  { label: "31-60 Days", key: "thirty_one_to_sixty" },
  { label: "61-90 Days", key: "sixty_one_to_ninety" },
  { label: "Above 90 Days", key: "above_ninety" },
  { label: "Total", key: "total" },
];

const BUCKET_KEYS = ["current", "one_to_thirty", "thirty_one_to_sixty", "sixty_one_to_ninety", "above_ninety"];
const BUCKET_LABELS = ["CURRENT", "1-30 DAYS", "31-60 DAYS", "61-90 DAYS", "ABOVE 90 DAYS"];

export default function AccountsReceivable() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [is_loading, set_is_loading] = useState(false);

  // filters
  const [customer_options, set_customer_options] = useState([]);
  const [contract_options, set_contract_options] = useState([]);
  const [selected_customer, set_selected_customer] = useState(null);
  const [selected_contract, set_selected_contract] = useState(null);

  // table data
  const [table_data, set_table_data] = useState([]);
  const [summary, set_summary] = useState(null);

  // breakdown modal
  const [show_breakdown, set_show_breakdown] = useState(false);
  const [breakdown_data, set_breakdown_data] = useState([]);
  const [breakdown_title, set_breakdown_title] = useState("");

  async function fetch_data(filters = {}) {
    set_is_loading(true);
    const res = await getAccountsReceivable(filters);
    if (res.data && res.data.data) {
      set_table_data(res.data.data);
      set_summary(res.data.summary || null);
    } else {
      set_table_data([]);
      set_summary(null);
    }
    set_is_loading(false);
  }

  async function handle_customer_search(keyword) {
    if (!keyword) return;
    const res = await getArCustomerSuggestions(keyword);
    if (res.data && Array.isArray(res.data.data)) {
      set_customer_options(
        res.data.data.map((c) => ({
          value: c.id,
          label: c.name || c.trade_name || c.customer_name,
        }))
      );
    }
  }

  async function handle_contract_search(keyword) {
    if (!keyword) return;
    const res = await getArContractSuggestions(keyword);
    if (res.data && Array.isArray(res.data.data)) {
      set_contract_options(
        res.data.data.map((c) => ({
          value: c.id,
          label: c.contract_number,
        }))
      );
    }
  }

  function handle_customer_select(value) {
    set_selected_customer(value);
    set_selected_contract(null);
    fetch_data({ customer_id: value });
  }

  function handle_customer_clear() {
    set_selected_customer(null);
    set_selected_contract(null);
    fetch_data({});
  }

  function handle_contract_select(value) {
    set_selected_contract(value);
    fetch_data({
      customer_id: selected_customer || null,
      contract_id: value,
    });
  }

  function handle_contract_clear() {
    set_selected_contract(null);
    fetch_data({ customer_id: selected_customer || null });
  }

  function handle_cell_click(row, bucket_key, bucket_label) {
    const amount = parseFloat(row[bucket_key] || 0);
    if (amount === 0) return;
    const billings = row.billings?.filter((b) => b.bucket === bucket_key) || [];
    set_breakdown_title(`${row.customer_name} — ${row.contract_number} (${bucket_label})`);
    set_breakdown_data(billings);
    set_show_breakdown(true);
  }

  function handle_csv_export() {
    return (
      <CSVLink
        data={table_data}
        headers={csv_headers}
        filename={`AccountsReceivable_${new Date().toISOString().slice(0, 10)}.csv`}
        style={{ textDecoration: "none", color: "#ffffff" }}
      >
        Export to CSV
      </CSVLink>
    );
  }

  // compute totals row from backend summary
  const totals = summary ? {
    current:              summary.total_current,
    one_to_thirty:        summary.total_one_to_thirty,
    thirty_one_to_sixty:  summary.total_thirty_one_to_sixty,
    sixty_one_to_ninety:  summary.total_sixty_one_to_ninety,
    above_ninety:         summary.total_above_ninety,
    total:                summary.total_receivables,
  } : BUCKET_KEYS.reduce((acc, key) => {
    acc[key] = table_data.reduce((sum, row) => sum + parseFloat(row[key] || 0), 0);
    return acc;
  }, { total: table_data.reduce((sum, row) => sum + parseFloat(row.total || 0), 0) });

  function render_bucket_cell(row, key, label) {
    const amount = parseFloat(row[key] || 0);
    if (row.is_total_row) {
      return (
        <span style={{ fontFamily: "var(--primary-font-bold)", fontSize: 13, color: "#1a2e40" }}>
          {fmt(amount)}
        </span>
      );
    }
    return (
      <span
        onClick={() => handle_cell_click(row, key, label)}
        style={{
          color: amount > 0 ? "#5ac8e1" : "#aaa",
          cursor: amount > 0 ? "pointer" : "default",
          textDecoration: amount > 0 ? "underline" : "none",
          fontFamily: "var(--primary-font-medium)",
          fontSize: 13,
        }}
      >
        {fmt(amount)}
      </span>
    );
  }

  useEffect(() => {
    fetch_data({});
  }, []);

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(v) => set_inactive(v)}
          active={"REPORTS"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        {/* Header */}
        <div className="add-customer-header">
          <div>
            <h1 className="page-title">Accounts Receivable</h1>
          </div>
          <div className="add-customer-actions">
            <button type="button" className="save-btn">
              {handle_csv_export()}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="biodata-card mb-4">
          <Row className="nc-modal-custom-row" style={{ alignItems: "flex-end" }}>
            <Col xs={12} md={4}>
              <div className="field-label">CUSTOMER</div>
              <AntSelect
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Search customer..."
                filterOption={false}
                onSearch={handle_customer_search}
                onSelect={handle_customer_select}
                onClear={handle_customer_clear}
                options={customer_options}
              />
            </Col>
            <Col xs={12} md={4}>
              <div className="field-label">CONTRACT NO.</div>
              <AntSelect
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Search contract..."
                filterOption={false}
                onSearch={handle_contract_search}
                onSelect={handle_contract_select}
                onClear={handle_contract_clear}
                options={contract_options}
              />
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="biodata-card mb-4">
          <Table
              tableHeaders={["CUSTOMER", "CONTRACT NO.", ...BUCKET_LABELS, "TOTAL"]}
              headerSelector={["customer_name", "contract_number", ...BUCKET_KEYS, "total"]}
              tableData={[
                ...table_data,
                {
                  customer_name:        "TOTAL",
                  contract_number:      "",
                  current:              totals.current,
                  one_to_thirty:        totals.one_to_thirty,
                  thirty_one_to_sixty:  totals.thirty_one_to_sixty,
                  sixty_one_to_ninety:  totals.sixty_one_to_ninety,
                  above_ninety:         totals.above_ninety,
                  total:                totals.total,
                  is_total_row:         true,
                }
              ]}
            showLoader={is_loading}
            cellRenderers={{
              customer_name: (row) => (
                <span style={{
                  fontFamily: row.is_total_row ? "var(--primary-font-bold)" : "var(--primary-font-medium)",
                  fontSize: 13,
                  color: row.is_total_row ? "#1a2e40" : "#444",
                }}>
                  {row.customer_name}
                </span>
              ),
              current: (row) => render_bucket_cell(row, "current", "CURRENT"),
              one_to_thirty: (row) => render_bucket_cell(row, "one_to_thirty", "1-30 DAYS"),
              thirty_one_to_sixty: (row) => render_bucket_cell(row, "thirty_one_to_sixty", "31-60 DAYS"),
              sixty_one_to_ninety: (row) => render_bucket_cell(row, "sixty_one_to_ninety", "61-90 DAYS"),
              above_ninety: (row) => render_bucket_cell(row, "above_ninety", "ABOVE 90 DAYS"),
              total: (row) => (
                <span style={{
                  fontFamily: "var(--primary-font-bold)",
                  color: row.is_total_row ? "#5ac8e1" : "#1a2e40",
                  fontSize: row.is_total_row ? 14 : 13,
                }}>
                  {fmt(row.total)}
                </span>
              ),
            }}
          />
        </div>

        <ReceivablesBreakdownModal
          show={show_breakdown}
          onHide={() => set_show_breakdown(false)}
          title={breakdown_title}
          data={breakdown_data}
        />
      </div>
    </div>
  );
}