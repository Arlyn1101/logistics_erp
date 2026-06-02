import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import InputError from "../../Components/InputError/InputError";
import { createTruck } from "../../Helpers/apiCalls/Manage/truckApi";
import { validateTruck } from "../../Helpers/Validation/Manage/truckValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import { DatePicker as AntDatePicker } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faEye, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function AddTruck() {
  const navigate = useNavigate();
  const [inactive, set_inactive] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [or_attachments, set_or_attachments] = useState([]);
  const [cr_attachments, set_cr_attachments] = useState([]);

  const empty_form = {
    unit_code: "",
    plate_number: "",
    truck_type: "",
    color: "",
    capacity: "",
    or_expiry: "",
    km_per_liter: "",
    status: "active",
    remarks: "",
  };

  const [form, set_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({
    unit_code: false,
    plate_number: false,
  });

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form((prev) => ({ ...prev, [name]: value }));
  };

  async function handle_save() {
    if (validateTruck(form, set_is_error)) {
      set_is_clicked(true);
      const response = await createTruck(form, or_attachments, cr_attachments);
      if (response.data && response.data.status === "success") {
        toast.success("Truck added successfully!", { style: toastStyle() });
        setTimeout(() => navigate("/trucks"), 1000);
      } else {
        toast.error("Failed to add truck.", { style: toastStyle() });
        set_is_clicked(false);
      }
    }
  }

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"TRUCKS"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>

        <div className="add-customer-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/trucks")}>
            Trucks
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Add New Truck</span>
        </div>

        <div className="add-customer-header">
          <div>
            <h1 className="page-title">Add New Truck</h1>
            <p className="page-subtitle">Fill in the truck details below</p>
          </div>
          <div className="add-customer-actions">
            <button className="cancel-btn" onClick={() => navigate("/trucks")} disabled={is_clicked}>
              Cancel
            </button>
            <button className="save-btn" onClick={handle_save} disabled={is_clicked}>
              {is_clicked ? "Saving..." : "Save Truck"}
            </button>
          </div>
        </div>

        <div className="biodata-card">

          <div className="biodata-section-label">Truck Information</div>
          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">TRUCK TYPE</div>
              <Form.Select name="truck_type" value={form.truck_type} className="nc-modal-custom-select" onChange={handle_change}>
                <option value="">Select</option>
                <option value="Wing Van">Wing Van</option>
                <option value="Closed Van">Closed Van</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Dump Truck">Dump Truck</option>
                <option value="Tractor Head">Tractor Head</option>
              </Form.Select>
            </Col>
            <Col xs={4}>
              <div className="field-label">OR EXPIRY</div>
              <AntDatePicker
                value={form.or_expiry ? dayjs(form.or_expiry) : null}
                onChange={(date) => set_form((prev) => ({ ...prev, or_expiry: date ? date.format("YYYY-MM-DD") : "" }))}
                format="YYYY-MM-DD"
                placeholder="Select expiry date"
                style={{ width: "100%" }}
                className="nc-modal-custom-input"
              />
            </Col>
            <Col xs={4}>
              <div className="field-label">PLATE NUMBER <span className="required-icon">*</span></div>
              <Form.Control type="text" name="plate_number" placeholder="e.g. ABC 1234" value={form.plate_number} className="nc-modal-custom-input" onChange={handle_change} />
              <InputError isValid={is_error.plate_number} message="Plate number is required" />
            </Col>
          </Row>
          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">UNIT CODE <span className="required-icon">*</span></div>
              <Form.Control type="text" name="unit_code" placeholder="e.g. Unit 01" value={form.unit_code} className="nc-modal-custom-input" onChange={handle_change} />
              <InputError isValid={is_error.unit_code} message="Unit code is required" />
            </Col>
            <Col xs={4}>
              <div className="field-label">COLOR</div>
              <Form.Control type="text" name="color" placeholder="e.g. White" value={form.color} className="nc-modal-custom-input" onChange={handle_change} />
            </Col>
            <Col xs={4}>
              <div className="field-label">CAPACITY</div>
              <div className="input-suffix-wrap">
                <Form.Control type="number" name="capacity" placeholder="e.g. 10" value={form.capacity} className="nc-modal-custom-input" onChange={handle_change} />
                <span className="input-suffix">tons</span>
              </div>
            </Col>
          </Row>

          <div className="biodata-section-label" style={{ marginTop: "18px" }}>Fuel Details</div>
          <Row className="nc-modal-custom-row">
            <Col xs={4}>
              <div className="field-label">KM PER LITER</div>
              <div className="input-suffix-wrap">
                <Form.Control type="number" name="km_per_liter" placeholder="e.g. 4.5" value={form.km_per_liter} className="nc-modal-custom-input" onChange={handle_change} />
                <span className="input-suffix">km/L</span>
              </div>
              <small className="field-hint">For reference only — fuel surcharge is based on contract</small>
            </Col>
          </Row>

          <Row className="nc-modal-custom-row">
            <Col>
              <div className="field-label">REMARKS</div>
              <Form.Control as="textarea" rows={2} name="remarks" placeholder="Optional notes about this truck..." value={form.remarks} className="nc-modal-custom-input" onChange={handle_change} />
            </Col>
          </Row>

          <div className="biodata-section-label" style={{ marginTop: "18px" }}>Documents</div>
          <Row className="nc-modal-custom-row">
            <Col xs={6}>
              <div className="field-label">OR <span style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}>(Official Receipt)</span></div>
              <Form.Control type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="nc-modal-custom-input" onChange={(e) => set_or_attachments(Array.from(e.target.files))} />
              <small className="field-hint">Accepted: PDF, JPG, PNG</small>
            </Col>
            <Col xs={6}>
              <div className="field-label">CR <span style={{ color: "#aaa", fontSize: 11, marginLeft: 4 }}>(Certificate of Registration)</span></div>
              <Form.Control type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="nc-modal-custom-input" onChange={(e) => set_cr_attachments(Array.from(e.target.files))} />
              <small className="field-hint">Accepted: PDF, JPG, PNG</small>
            </Col>
          </Row>

        </div>
      </div>
    </div>
  );
}