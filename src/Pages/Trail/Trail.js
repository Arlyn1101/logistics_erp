import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import { getAllTrails } from "../../Helpers/apiCalls/trailApi";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";

export default function Trail() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [trail_data, set_trail_data] = useState([]);
  const [filter_table, set_filter_table] = useState("");
  const [search_text, set_search_text] = useState("");

  const TABLE_OPTIONS = [
    "customer", "driver", "helper", "truck",
    "contract", "contract_route", "trip", "trip_driver", "trip_helper", "user",
  ];

  async function fetch_trails() {
    set_show_loader(true);
    const filters = {};
    if (filter_table) filters.table_name = filter_table;
    if (search_text) filters.search = search_text;
    const response = await getAllTrails(filters);
    if (response.data && response.data.data) {
      set_trail_data(response.data.data);
    } else {
      set_trail_data([]);
    }
    set_show_loader(false);
  }

  useEffect(() => { fetch_trails(); }, [filter_table]);

  return (
    <div>
      <div className="page">
        <Navbar onCollapse={(is_inactive) => set_inactive(is_inactive)} active={"AUDIT TRAIL"} />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={5}><h1 className="page-title">Audit Trail</h1></Col>
          <Col className="d-flex justify-content-end align-items-center gap-2">
            <Form.Select
              className="PO-select-action form-select"
              value={filter_table}
              onChange={(e) => set_filter_table(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="">All Tables</option>
              {TABLE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>
            <input
              type="search"
              placeholder="Search..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => { if (e.key === "Enter") fetch_trails(); }}
            />
          </Col>
        </Row>
        <div className="tab-content">
          <Table
            tableHeaders={["TABLE", "RECORD ID", "COLUMN", "OLD VALUE", "NEW VALUE", "CHANGED BY", "DATE"]}
            headerSelector={["table_name", "source_id", "col_name", "old_value", "new_value", "added_by", "added_on"]}
            tableData={trail_data}
            showLoader={show_loader}
          />
        </div>
      </div>
    </div>
  );
}
