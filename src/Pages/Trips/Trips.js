import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import DeleteModal from "../../Components/Modals/DeleteModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllTrips,
  searchTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../../Helpers/apiCalls/Trips/tripApi";
import {
  getAllContracts,
  getAllContractRoutes,
} from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllTrucks } from "../../Helpers/apiCalls/Manage/truckApi";
import { getAllDrivers } from "../../Helpers/apiCalls/Manage/driverApi";
import { getAllHelpers } from "../../Helpers/apiCalls/Manage/helperApi";
import { validateTrip } from "../../Helpers/Validation/Trips/tripValidation";
import { toastStyle } from "../../Helpers/Utils/Common";
import Select from "react-select";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";

export default function Trips() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [search_text, set_search_text] = useState("");
  const [trip_data, set_trip_data] = useState([]);
  const [selected_row, set_selected_row] = useState({});

  // Options
  const [contract_options, set_contract_options] = useState([]);
  const [route_options, set_route_options] = useState([]);
  const [truck_options, set_truck_options] = useState([]);
  const [driver_options, set_driver_options] = useState([]);
  const [helper_options, set_helper_options] = useState([]);

  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_view_modal, set_show_view_modal] = useState(false);
  const [show_delete_modal, set_show_delete_modal] = useState(false);

  const empty_form = {
    contract_id: "",
    contract_route_id: "",
    truck_id: "",
    trip_date: "",
    driver_ids: [],
    helper_ids: [],
    remarks: "",
  };
  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [is_error, set_is_error] = useState({});

  // When contract changes, filter routes
  const [add_route_options, set_add_route_options] = useState([]);
  const [edit_route_options, set_edit_route_options] = useState([]);

  const handle_add_change = async (e) => {
    const { name, value } = e.target;
    set_add_form((prev) => ({ ...prev, [name]: value }));
    if (name === "contract_id") {
      const response = await getAllContractRoutes(value);
      if (response.data && response.data.data)
        set_add_route_options(response.data.data);
      else set_add_route_options([]);
      set_add_form((prev) => ({ ...prev, contract_route_id: "" }));
    }
  };

  const handle_edit_change = async (e) => {
    const { name, value } = e.target;
    set_edit_form((prev) => ({ ...prev, [name]: value }));
    if (name === "contract_id") {
      const response = await getAllContractRoutes(value);
      if (response.data && response.data.data)
        set_edit_route_options(response.data.data);
      else set_edit_route_options([]);
      set_edit_form((prev) => ({ ...prev, contract_route_id: "" }));
    }
  };

  const handle_add_multi = (e, field) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    set_add_form((prev) => ({ ...prev, [field]: values }));
  };

  const handle_edit_multi = (e, field) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    set_edit_form((prev) => ({ ...prev, [field]: values }));
  };

  function handle_select_change(e, row) {
    set_selected_row(row);
    set_edit_form({
      ...row,
      driver_ids: row.driver_ids || [],
      helper_ids: row.helper_ids || [],
    });
    if (e.target.value === "edit-trip") {
      fetch_routes_for_edit(row.contract_id);
      set_show_edit_modal(true);
    } else if (e.target.value === "view-trip") {
      fetch_routes_for_edit(row.contract_id);
      set_show_view_modal(true);
    } else if (e.target.value === "delete-trip") {
      set_show_delete_modal(true);
    }
    e.target.value = "";
  }

  async function fetch_routes_for_edit(contract_id) {
    if (!contract_id) return;
    const response = await getAllContractRoutes(contract_id);
    if (response.data && response.data.data)
      set_edit_route_options(response.data.data);
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
        <option value="view-trip" className="color-options">
          View
        </option>
        <option value="edit-trip" className="color-options">
          Edit
        </option>
        <option value="delete-trip" className="color-red">
          Delete
        </option>
      </Form.Select>
    );
  }

  async function fetch_all_options() {
    const [contracts_res, trucks_res, drivers_res, helpers_res] =
      await Promise.all([
        getAllContracts(),
        getAllTrucks(),
        getAllDrivers(),
        getAllHelpers(),
      ]);
    if (contracts_res.data?.data) set_contract_options(contracts_res.data.data);
    if (trucks_res.data?.data)
      set_truck_options(
        trucks_res.data.data.filter((t) => t.status === "active"),
      );
    if (drivers_res.data?.data)
      set_driver_options(
        drivers_res.data.data.filter((d) => d.status === "active"),
      );
    if (helpers_res.data?.data)
      set_helper_options(
        helpers_res.data.data.filter((h) => h.status === "active"),
      );
  }

  async function fetch_trips() {
    set_show_loader(true);
    const response = search_text
      ? await searchTrips(search_text)
      : await getAllTrips();
    if (response.data && response.data.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        contract_label: a.customer_name || `Contract #${a.contract_id}`,
        route_label:
          a.route_origin && a.route_destination
            ? `${a.route_origin} → ${a.route_destination}`
            : `Route #${a.contract_route_id}`,
        truck_label:
          a.truck_unit_code && a.truck_plate_number
            ? `${a.truck_unit_code} — ${a.truck_plate_number}`
            : `Truck #${a.truck_id}`,
        drivers_label: "",
        helpers_label: "",
        action_btn: ActionBtn(a),
      }));
      set_trip_data(result);
    } else {
      set_trip_data([]);
    }
    set_show_loader(false);
  }

  async function handle_create() {
    if (validateTrip(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createTrip(add_form);
      if (response.data && response.data.status === "success") {
        toast.success("Trip logged successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        set_add_route_options([]);
        fetch_trips();
      } else {
        toast.error("Failed to log trip.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_update() {
    if (validateTrip(edit_form, set_is_error)) {
      set_is_clicked(true);
      const response = await updateTrip(edit_form);
      if (response.data && response.data.status === "success") {
        toast.success("Trip updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        fetch_trips();
      } else {
        toast.error("Failed to update trip.", { style: toastStyle() });
      }
      set_is_clicked(false);
    }
  }

  async function handle_delete() {
    const response = await deleteTrip(selected_row.id);
    if (response.data && response.data.status === "success") {
      toast.success("Trip deleted.", { style: toastStyle() });
      set_show_delete_modal(false);
      fetch_trips();
    } else {
      toast.error("Failed to delete trip.", { style: toastStyle() });
    }
  }

  useEffect(() => {
    fetch_all_options();
    fetch_trips();
  }, []);

  const form_fields = (
    form,
    handle_change,
    handle_multi,
    route_opts,
    set_form,
    disabled = false,
  ) => (
    <div className="mt-3">
      <div className="form-section-label">Trip Information</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div>
            CONTRACT <span className="required-icon">*</span>
          </div>
          <Form.Select
            name="contract_id"
            value={form.contract_id}
            className="nc-modal-custom-select"
            onChange={handle_change}
          >
            <option value="">-- Select Contract --</option>
            {contract_options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name || `Contract #${c.id}`} — ₱{c.monthly_rate}/mo
              </option>
            ))}
          </Form.Select>
          <InputError
            isValid={is_error.contract_id}
            message="Contract is required"
          />
        </Col>
        <Col>
          <div>
            ROUTE <span className="required-icon">*</span>
          </div>
          <Form.Select
            name="contract_route_id"
            value={form.contract_route_id}
            className="nc-modal-custom-select"
            onChange={handle_change}
            disabled={!form.contract_id}
          >
            <option value="">-- Select Route --</option>
            {route_opts.map((r) => (
              <option key={r.id} value={r.id}>
                {r.origin} → {r.destination}
              </option>
            ))}
          </Form.Select>
          <InputError
            isValid={is_error.contract_route_id}
            message="Route is required"
          />
        </Col>
      </Row>

      <Row className="nc-modal-custom-row">
        <Col>
          <div>
            TRUCK <span className="required-icon">*</span>
          </div>
          <Form.Select
            name="truck_id"
            value={form.truck_id}
            className="nc-modal-custom-select"
            onChange={handle_change}
          >
            <option value="">-- Select Truck --</option>
            {truck_options.map((t) => (
              <option key={t.id} value={t.id}>
                {t.plate_number} — {t.truck_type}
              </option>
            ))}
          </Form.Select>
          <InputError isValid={is_error.truck_id} message="Truck is required" />
        </Col>
        <Col>
          <div>
            TRIP DATE <span className="required-icon">*</span>
          </div>
          <Form.Control
            type="date"
            name="trip_date"
            value={form.trip_date}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
          <InputError
            isValid={is_error.trip_date}
            message="Trip date is required"
          />
        </Col>
      </Row>

      <div className="form-section-label">Personnel</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div>DRIVER(S)</div>
          <Select
            isMulti
            options={driver_options.map((d) => ({
              value: d.id,
              label: `${d.first_name} ${d.last_name}`,
            }))}
            value={driver_options
              .filter((d) => form.driver_ids.includes(String(d.id)))
              .map((d) => ({
                value: d.id,
                label: `${d.first_name} ${d.last_name}`,
              }))}
            onChange={(selected) =>
              set_form((prev) => ({
                ...prev,
                driver_ids: selected.map((s) => String(s.value)),
              }))
            }
            placeholder="Select driver(s)..."
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: 10,
                borderColor: "#B9B9B9",
                fontFamily: "var(--primary-font-medium)",
                fontSize: 14,
              }),
            }}
          />
        </Col>
        <Col>
          <div>HELPER(S)</div>
          <Select
            isMulti
            options={helper_options.map((h) => ({
              value: h.id,
              label: `${h.first_name} ${h.last_name}`,
            }))}
            value={helper_options
              .filter((h) => form.helper_ids.includes(String(h.id)))
              .map((h) => ({
                value: h.id,
                label: `${h.first_name} ${h.last_name}`,
              }))}
            onChange={(selected) =>
              set_form((prev) => ({
                ...prev,
                helper_ids: selected.map((s) => String(s.value)),
              }))
            }
            placeholder="Select helper(s)..."
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: 10,
                borderColor: "#B9B9B9",
                fontFamily: "var(--primary-font-medium)",
                fontSize: 14,
              }),
            }}
          />
        </Col>
      </Row>

      <div className="form-section-label">Additional</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div>REMARKS</div>
          <Form.Control
            as="textarea"
            rows={2}
            name="remarks"
            value={form.remarks || ""}
            className="nc-modal-custom-input"
            onChange={handle_change}
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"TRIPS"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <Row className="mb-4">
          <Col xs={6}>
            <h1 className="page-title">Trips</h1>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <input
              type="search"
              placeholder="Search trips..."
              value={search_text}
              onChange={(e) => set_search_text(e.target.value)}
              className="search-bar"
              onKeyDown={(e) => {
                if (e.key === "Enter") fetch_trips();
              }}
            />
            <button
              className="add-btn"
              onClick={() => set_show_add_modal(true)}
            >
              Log Trip
            </button>
          </Col>
        </Row>
        <div className="tab-content">
          <Table
            tableHeaders={[
              "TRIP DATE",
              "CONTRACT",
              "ROUTE",
              "TRUCK",
              "DRIVER(S)",
              "HELPER(S)",
              "REMARKS",
              "ACTIONS",
            ]}
            headerSelector={[
              "trip_date",
              "contract_label",
              "route_label",
              "truck_label",
              "drivers_label",
              "helpers_label",
              "remarks",
              "action_btn",
            ]}
            tableData={trip_data}
            showLoader={show_loader}
            withActionData={true}
          />
        </div>
      </div>

      <AddModal
        title="TRIP"
        size="lg"
        show={show_add_modal}
        onHide={() => set_show_add_modal(false)}
        onSave={handle_create}
        isClicked={is_clicked}
      >
        {form_fields(
          add_form,
          handle_add_change,
          handle_add_multi,
          add_route_options,
          set_add_form,
        )}
      </AddModal>
      <EditModal
        title="TRIP"
        size="lg"
        show={show_edit_modal}
        onHide={() => set_show_edit_modal(false)}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(
          edit_form,
          handle_edit_change,
          handle_edit_multi,
          edit_route_options,
          set_edit_form,
        )}
      </EditModal>
      <ViewModal
        title="TRIP DETAILS"
        size="lg"
        withButtons
        show={show_view_modal}
        onHide={() => set_show_view_modal(false)}
        onEdit={() => {
          set_show_edit_modal(true);
          set_show_view_modal(false);
        }}
      >
        <div className="view-wrapper">
          <div className="view-header">
            <div className="view-header-left">
              <span className="view-title">{edit_form.trip_date || "—"}</span>
              <span className="view-subtitle">
                {edit_form.route_label ||
                  `Route #${edit_form.contract_route_id}`}
              </span>
            </div>
          </div>
          <div className="view-details">
            <div className="view-detail-row">
              <span className="view-detail-label">TRIP DATE</span>
              <span
                className={
                  edit_form.trip_date ? "view-detail-value" : "view-empty-value"
                }
              >
                {edit_form.trip_date || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">CONTRACT</span>
              <span
                className={
                  edit_form.contract_label
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.contract_label ||
                  `Contract #${edit_form.contract_id}`}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">ROUTE</span>
              <span
                className={
                  edit_form.route_label
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.route_label || "—"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">TRUCK</span>
              <span
                className={
                  edit_form.truck_label
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.truck_label || `Truck #${edit_form.truck_id}`}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">DRIVER(S)</span>
              <span
                className={
                  edit_form.drivers_label
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.drivers_label || "No drivers assigned"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">HELPER(S)</span>
              <span
                className={
                  edit_form.helpers_label
                    ? "view-detail-value"
                    : "view-empty-value"
                }
              >
                {edit_form.helpers_label || "No helpers assigned"}
              </span>
            </div>
            <div className="view-detail-row">
              <span className="view-detail-label">REMARKS</span>
              <span
                className={
                  edit_form.remarks ? "view-detail-value" : "view-empty-value"
                }
              >
                {edit_form.remarks || "No remarks"}
              </span>
            </div>
          </div>
        </div>
      </ViewModal>
      <DeleteModal
        text="trip"
        show={show_delete_modal}
        onHide={() => set_show_delete_modal(false)}
        onDelete={handle_delete}
      />
    </div>
  );
}
