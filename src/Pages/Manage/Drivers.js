import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import {
  getAllDrivers,
  searchDrivers,
} from "../../Helpers/apiCalls/Manage/driverApi";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Drivers() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [active_tab, set_active_tab] = useState("all");
  const [driver_data, set_driver_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  function ExpiryBadge(expiry) {
    if (!expiry) return <span className="view-empty-value">—</span>;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp_date = new Date(expiry);
    const diff_days = Math.ceil((exp_date - today) / (1000 * 60 * 60 * 24));
    if (diff_days < 0) {
      return (
        <span
          className="status-badge"
          style={{ background: "#c0392b", color: "#fff", borderRadius: "12px", padding: "3px 10px", fontSize: "12px" }}
        >
          {dateFormat(expiry)} (Expired)
        </span>
      );
    }
    if (diff_days <= 30) {
      return (
        <span
          className="status-badge"
          style={{ background: "#e0a030", color: "#fff", borderRadius: "12px", padding: "3px 10px", fontSize: "12px" }}
        >
          {dateFormat(expiry)} (Expiring)
        </span>
      );
    }
    return (
      <span style={{ color: "#2d3e4e", fontFamily: "var(--primary-font-medium)" }}>
        {dateFormat(expiry)}
      </span>
    );
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((d) => d.status === tab);
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(driver_data, tab));
  }

  function get_tab_count(tab) {
    if (tab === "all") return driver_data.length;
    return driver_data.filter((d) => d.status === tab).length;
  }

  // Strip React elements before passing to navigate
  function get_plain_driver(row) {
    return {
      id: row.id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      suffix: row.suffix,
      contact_number: row.contact_number,
      license_number: row.license_number,
      license_expiry: row.license_expiry,
      address: row.address,
      status: row.status,
      birthdate: row.birthdate,
      gender: row.gender,
      civil_status: row.civil_status,
      nationality: row.nationality,
      religion: row.religion,
      email: row.email,
      emergency_contact_name: row.emergency_contact_name,
      emergency_contact_number: row.emergency_contact_number,
      emergency_contact_relationship: row.emergency_contact_relationship,
      emergency_contact_address: row.emergency_contact_address,
      sss_number: row.sss_number,
      pagibig_number: row.pagibig_number,
      philhealth_number: row.philhealth_number,
      tin_number: row.tin_number,
    };
  }

  async function fetch_drivers() {
    set_show_loader(true);
    const response = search_text
      ? await searchDrivers(search_text)
      : await getAllDrivers();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        full_name: `${a.first_name} ${a.last_name}`,
        status_badge: StatusBadge(a.status),
        expiry_badge: ExpiryBadge(a.license_expiry),
      }));
      set_driver_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_driver_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  function handle_row_click(row) {
    navigate(`/drivers/${row.id}`);
  }

  React.useEffect(() => {
    fetch_drivers();
  }, []);

  // ─── View modal content ────────────────────────────────────────────────────
  function view_content(form) {
    const full_name = [form.first_name, form.middle_name, form.last_name, form.suffix]
      .filter(Boolean)
      .join(" ");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp_date = form.license_expiry ? new Date(form.license_expiry) : null;
    const diff_days = exp_date
      ? Math.ceil((exp_date - today) / (1000 * 60 * 60 * 24))
      : null;
    let expiry_color = null;
    if (diff_days !== null && diff_days < 0) expiry_color = "#c0392b";
    else if (diff_days !== null && diff_days <= 30) expiry_color = "#e0a030";

    const detail = (label, value) => (
      <div className="view-detail-row">
        <span className="view-detail-label">{label}</span>
        <span className={value ? "view-detail-value" : "view-empty-value"}>
          {value || "—"}
        </span>
      </div>
    );

    return (
      <div className="view-wrapper">
        <div className="view-header">
          <div className="view-header-left">
            <span className="view-title">{full_name || "—"}</span>
            <span className="view-subtitle">{form.license_number || "No license number"}</span>
          </div>
          <span className={`status-badge ${form.status}`} style={{ alignSelf: "center" }}>
            {form.status}
          </span>
        </div>

        <div className="view-details">
          <div className="form-section-label">Driver Information</div>
          {detail("CONTACT NO.", form.contact_number)}
          {detail("EMAIL", form.email)}
          {detail("ADDRESS", form.address)}

          <div className="form-section-label mt-3">Personal Information</div>
          {detail("BIRTHDATE", form.birthdate ? dateFormat(form.birthdate) : null)}
          {detail("GENDER", form.gender)}
          {detail("CIVIL STATUS", form.civil_status)}
          {detail("NATIONALITY", form.nationality)}
          {detail("RELIGION", form.religion)}

          <div className="form-section-label mt-3">Emergency Contact</div>
          {detail("NAME", form.emergency_contact_name)}
          {detail("CONTACT NO.", form.emergency_contact_number)}
          {detail("RELATIONSHIP", form.emergency_contact_relationship)}
          {detail("ADDRESS", form.emergency_contact_address)}

          <div className="form-section-label mt-3">License Details</div>
          {detail("LICENSE NO.", form.license_number)}
          <div className="view-detail-row">
            <span className="view-detail-label">LICENSE EXPIRY</span>
            <span
              className={form.license_expiry ? "view-detail-value" : "view-empty-value"}
              style={expiry_color ? { color: expiry_color, fontFamily: "var(--primary-font-bold)" } : {}}
            >
              {form.license_expiry ? dateFormat(form.license_expiry) : "—"}
              {diff_days !== null && diff_days < 0 && " (Expired)"}
              {diff_days !== null && diff_days >= 0 && diff_days <= 30 && ` (Expiring in ${diff_days}d)`}
            </span>
          </div>

          <div className="form-section-label mt-3">Government Benefits</div>
          {detail("SSS NO.", form.sss_number)}
          {detail("PAG-IBIG NO.", form.pagibig_number)}
          {detail("PHILHEALTH NO.", form.philhealth_number)}
          {detail("TIN", form.tin_number)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"DRIVERS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Drivers</h1>
            <p className="page-subtitle">Manage driver records and license details</p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              placeholder="Search driver..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => { if (e.key === "Enter") fetch_drivers(); }}
            />
            <button className="add-btn" onClick={() => navigate("/drivers/form")}>
              Add
            </button>
          </Col>
        </Row>

        <div className="filter-tabs mb-3">
          {["all", "active", "inactive"].map((tab) => (
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
            onRowClick={handle_row_click}
            tableHeaders={["NAME", "CONTACT NO.", "LICENSE NO.", "LICENSE EXPIRY", "STATUS"]}
            headerSelector={["full_name", "contact_number", "license_number", "expiry_badge", "status_badge"]}
            tableData={filtered_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>
    </div>
  );
}