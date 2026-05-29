import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import {
  getAllHelpers,
  searchHelpers,
  getHelperSuggestions,
} from "../../Helpers/apiCalls/Manage/helperApi";
import { Select as AntSelect } from "antd";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Helpers() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [suggestions, set_suggestions] = useState([]);
  const [suggestion_loading, set_suggestion_loading] = useState(false);
  const [active_filter, set_active_filter] = useState(null);
  const [search_value, set_search_value] = useState(null);
  const [active_tab, set_active_tab] = useState("all");
  const [helper_data, set_helper_data] = useState([]);
  const [filtered_data, set_filtered_data] = useState([]);

  function StatusBadge(status) {
    return <span className={`status-badge ${status}`}>{status}</span>;
  }

  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((d) => d.status === tab);
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_data(apply_tab_filter(helper_data, tab));
  }

  function get_tab_count(tab) {
    if (tab === "all") return helper_data.length;
    return helper_data.filter((d) => d.status === tab).length;
  }

  function get_plain_helper(row) {
    return {
      id: row.id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      suffix: row.suffix,
      contact_number: row.contact_number,
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

  async function handle_suggestion_search(keyword) {
    if (!keyword || keyword.trim().length < 1) {
      set_suggestions([]);
      return;
    }
    set_suggestion_loading(true);
    const res = await getHelperSuggestions(keyword);
    if (res.data?.data?.helpers) {
      const options = res.data.data.helpers.map((item) => ({
        value: `helper_id::${item.id}`,
        label: `🧑 ${item.label}`,
        sublabel: "Helper",
      }));
      set_suggestions(options);
    }
    set_suggestion_loading(false);
  }

  function handle_suggestion_select(value, option) {
    const [type, id] = value.split("::");
    set_active_filter({ type, id, label: option.label });
    const filtered = helper_data.filter((row) => String(row.id) === String(id));
    set_filtered_data(apply_tab_filter(filtered, active_tab));
  }

  function handle_reset_filter() {
    set_active_filter(null);
    set_suggestions([]);
    set_search_value(null);
    set_filtered_data(apply_tab_filter(helper_data, active_tab));
  }

  async function fetch_helpers() {
    set_show_loader(true);
    const response = search_text
      ? await searchHelpers(search_text)
      : await getAllHelpers();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        full_name: [a.first_name, a.middle_name, a.last_name, a.suffix].filter(Boolean).join(" "),
        status_badge: StatusBadge(a.status),
      }));
      set_helper_data(result);
      set_filtered_data(apply_tab_filter(result, active_tab));
    } else {
      set_helper_data([]);
      set_filtered_data([]);
    }
    set_show_loader(false);
  }

  function handle_row_click(row) {
    navigate(`/helpers/${row.id}`);
  }

  React.useEffect(() => {
    fetch_helpers();
  }, []);

  // ─── View modal content ────────────────────────────────────────────────────
  function view_content(form) {
    const full_name = [
      form.first_name,
      form.middle_name,
      form.last_name,
      form.suffix,
    ]
      .filter(Boolean)
      .join(" ");

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
            <span className="view-subtitle">
              {form.contact_number || "No contact number"}
            </span>
          </div>
          <span
            className={`status-badge ${form.status}`}
            style={{ alignSelf: "center" }}
          >
            {form.status}
          </span>
        </div>

        <div className="view-details">
          <div className="form-section-label">Helper Information</div>
          {detail("CONTACT NO.", form.contact_number)}
          {detail("EMAIL", form.email)}
          {detail("ADDRESS", form.address)}

          <div className="form-section-label mt-3">Personal Information</div>
          {detail(
            "BIRTHDATE",
            form.birthdate ? dateFormat(form.birthdate) : null,
          )}
          {detail("GENDER", form.gender)}
          {detail("CIVIL STATUS", form.civil_status)}
          {detail("NATIONALITY", form.nationality)}
          {detail("RELIGION", form.religion)}

          <div className="form-section-label mt-3">Emergency Contact</div>
          {detail("NAME", form.emergency_contact_name)}
          {detail("CONTACT NO.", form.emergency_contact_number)}
          {detail("RELATIONSHIP", form.emergency_contact_relationship)}
          {detail("ADDRESS", form.emergency_contact_address)}

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
          active={"HELPERS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Helpers</h1>
            <p className="page-subtitle">Manage helper personnel records</p>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <AntSelect
              showSearch
              allowClear
              value={search_value}
              onChange={(val) => set_search_value(val ?? null)}
              style={{ width: 280, marginRight: 8 }}
              placeholder="🔍 Search name, contact..."
              filterOption={false}
              onSearch={handle_suggestion_search}
              onSelect={handle_suggestion_select}
              onClear={handle_reset_filter}
              loading={suggestion_loading}
              options={suggestions.map((s) => ({
                value: s.value,
                label: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{s.label}</span>
                    <span
                      style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}
                    >
                      {s.sublabel}
                    </span>
                  </div>
                ),
              }))}
              notFoundContent={
                suggestion_loading ? "Searching..." : "No results"
              }
            />
            <button
              className="add-btn"
              onClick={() => navigate("/helpers/form")}
            >
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
            tableHeaders={["NAME", "CONTACT NO.", "ADDRESS", "STATUS"]}
            headerSelector={[
              "full_name",
              "contact_number",
              "address",
              "status_badge",
            ]}
            tableData={filtered_data}
            showLoader={show_loader}
            withActionData={true}
            onRowClick={handle_row_click}
          />
        </div>
      </div>
    </div>
  );
}
