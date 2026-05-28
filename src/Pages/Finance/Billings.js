import React, { useState } from "react";
import PaymentModal from "../../Components/Modals/PaymentModal";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import { getAllBillings } from "../../Helpers/apiCalls/Finance/billingApi";
import { toastStyle } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import moment from "moment";

export default function Billings() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [active_tab, set_active_tab] = useState("all");
  const [billing_data, set_billing_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);
  const [show_payment_modal, set_show_payment_modal] = useState(false);
  const [selected_billing, set_selected_billing] = useState(null);

  function StatusBadge(status) {
    const map = {
      unpaid: "inactive",
      partial: "pending",
      paid: "active",
    };
    return (
      <span className={`status-badge ${map[status] || status}`}>
        {status}
      </span>
    );
  }

  function ActionBtn(row) {
    return (
      <Form.Select
        name="action"
        className="PO-select-action form-select"
        onChange={(e) => handle_select_change(e, row)}
        value={""}
      >
        <option defaultValue selected hidden>
          Select
        </option>
        <option value="view-billing" className="color-options">
          View
        </option>
        <option value="add-payment" className="color-options">
          Add Payment
        </option>
      </Form.Select>
    );
  }

  function handle_select_change(e, row) {
    const action = e.target.value;
    e.target.value = "";
    if (action === "view-billing") {
      navigate("/billings/view", { state: { billing: row } });
    } else if (action === "add-payment") {
      set_selected_billing(row);
      set_show_payment_modal(true);
    }
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

  async function fetch_billings() {
    set_show_loader(true);
    const response = await getAllBillings();
    if (response.data && response.data.data) {
      const result = response.data.data.map((b) => ({
        ...b,
        billing_period_display: `${moment(b.billing_period_start).format("MMM D")} – ${moment(b.billing_period_end).format("MMM D, YYYY")}`,
        monthly_rate_display: `₱ ${parseFloat(b.monthly_rate).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
        grand_total_display: `₱ ${parseFloat(b.grand_total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
        balance_display: `₱ ${parseFloat(b.balance).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
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

  React.useEffect(() => {
    fetch_billings();
  }, []);

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"BILLINGS"}
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
              className="add-btn"
              onClick={() => navigate("/billings/form")}
            >
              Generate Billing
            </button>
          </Col>
        </Row>

        <div className="filter-tabs mb-3">
          {["all", "unpaid", "partial", "paid"].map((tab) => (
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
              "ACTIONS",
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