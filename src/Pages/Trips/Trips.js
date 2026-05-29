import React, { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/TableTemplate/Table";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import InputError from "../../Components/InputError/InputError";
import {
  getAllTrips,
  searchTrips,
  createTrip,
  updateTrip,
  completeTrip,
  startTrip,
  getTripDetails,
  getContractTripInfo,
  getTripSuggestions,
  getAvailableAssets,
} from "../../Helpers/apiCalls/Trips/tripApi";
import {
  getAllContracts,
  getAllContractRoutes,
} from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllTrucks } from "../../Helpers/apiCalls/Manage/truckApi";
import { getAllDrivers } from "../../Helpers/apiCalls/Manage/driverApi";
import { getAllHelpers } from "../../Helpers/apiCalls/Manage/helperApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { validateTrip } from "../../Helpers/Validation/Trips/tripValidation";
import { toastStyle, dateFormat } from "../../Helpers/Utils/Common";
import { Select as AntSelect, DatePicker as AntDatePicker } from "antd";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import {
  faTimes,
  faCalendarAlt,
  faBuilding,
  faMapMarkerAlt,
  faTruck,
  faUser,
  faUsers,
  faGasPump,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import toast from "react-hot-toast";
import "../Manage/Manage.css";
import "../../Components/Navbar/Navbar.css";
import "../../Components/Modals/Modal.css";
import "../Dashboard/Dashboard.css";

const { RangePicker } = AntDatePicker;

export default function Trips() {
  const [inactive, set_inactive] = useState(false);
  const [show_loader, set_show_loader] = useState(false);
  const [is_clicked, set_is_clicked] = useState(false);
  const [trip_data, set_trip_data] = useState([]);
  const [selected_trip, set_selected_trip] = useState(null);
  const [show_add_modal, set_show_add_modal] = useState(false);
  const [show_edit_modal, set_show_edit_modal] = useState(false);
  const [show_map_modal, set_show_map_modal] = useState(false);

  // Dropdown options
  const [customer_options, set_customer_options] = useState([]);
  const [contracts, set_contracts] = useState([]);
  const [truck_options, set_truck_options] = useState([]);
  const [driver_options, set_driver_options] = useState([]);
  const [helper_options, set_helper_options] = useState([]);
  const [available_assets, set_available_assets] = useState(null);
  const [contract_date_range, set_contract_date_range] = useState({ start: null, end: null });
  const [assets_loading, set_assets_loading]     = useState(false);


  // Contract trip info (for log trip form)
  const [contract_trip_info, set_contract_trip_info] = useState(null);
  const [fuel_preview, set_fuel_preview] = useState(0);

  const empty_form = {
    contract_id: "",
    contract_route_id: "",
    truck_id: "",
    expected_departure_datetime: "",
    estimated_hours: 8,
    driver_id: "",
    helper_id: "",
    actual_fuel_price: "",
    remarks: "",
};

  const [add_form, set_add_form] = useState({ ...empty_form });
  const [edit_form, set_edit_form] = useState({ ...empty_form });
  const [add_route_options, set_add_route_options] = useState([]);
  const [edit_route_options, set_edit_route_options] = useState([]);
  const [is_error, set_is_error] = useState({});
  const [active_tab, set_active_tab] = useState("all");
  const [filtered_trip_data, set_filtered_trip_data] = useState([]);
  const [suggestions, set_suggestions]         = useState([]);
  const [is_completing, set_is_completing]     = useState(false);
  const [suggestion_loading, set_suggestion_loading] = useState(false);
  const [active_filter, set_active_filter]     = useState(null);
  const [date_range, set_date_range]           = useState([null, null]);
  const [search_value, set_search_value] = useState(null);

  // When contract or trip_date changes in add form, fetch contract trip info
  async function fetch_contract_trip_info(contract_id, trip_date, set_form) {
    if (!contract_id || !trip_date) return;
    const res = await getContractTripInfo(contract_id, trip_date);
    if (res.data && res.data.data) {
      set_contract_trip_info(res.data.data);
    }
  }

  async function fetch_available_assets(departure, hours, exclude_trip_id = null) {
    if (!departure || !hours || hours <= 0) return;
    set_assets_loading(true);
    const res = await getAvailableAssets(departure, hours, exclude_trip_id);
    if (res.data?.data) {
      set_available_assets(res.data.data);
    }
    set_assets_loading(false);
  }

  // Compute fuel preview on the fly
  function compute_fuel_preview(actual_price, route_opts, form) {
    if (!actual_price || !form.contract_route_id || !form.truck_id) {
      set_fuel_preview(0);
      return;
    }
    const agreed = contract_trip_info?.fuel_price_per_liter ?? 0;
    const route  = route_opts.find((r) => String(r.id) === String(form.contract_route_id));
    const truck_pool = available_assets ? available_assets.trucks : truck_options;
    const truck = truck_pool.find((t) => String(t.id) === String(form.truck_id));

    if (!route || !truck || !route.distance_km || !truck.km_per_liter) {
      set_fuel_preview(0);
      return;
    }

    const diff = parseFloat(actual_price) - parseFloat(agreed);
    if (diff <= 0) {
      set_fuel_preview(0);
      return;
    }

    const liters  = parseFloat(route.distance_km) / parseFloat(truck.km_per_liter);
    const preview = Math.round(diff * liters * 100) / 100;
    set_fuel_preview(preview);
  }

  const handle_add_change = async (e) => {
    const { name, value } = e.target;
    const updated = { ...add_form, [name]: value };
    set_add_form(updated);

    if (name === "contract_id") {
      const res = await getAllContractRoutes(value);
      const routes = res.data?.data ?? [];
      set_add_route_options(routes);
      set_add_form((prev) => ({ ...prev, contract_route_id: "", expected_departure_datetime: "" }));
      set_contract_trip_info(null);
      set_fuel_preview(0);
      set_available_assets(null);

      // Set date range from selected contract
      const selected_contract = contracts.find((c) => String(c.id) === String(value));
      if (selected_contract) {
        set_contract_date_range({
          start: selected_contract.start_date || null,
          end:   selected_contract.end_date   || null,
        });
      } else {
        set_contract_date_range({ start: null, end: null });
      }

      if (value && updated.expected_departure_datetime) {
        fetch_contract_trip_info(value, updated.expected_departure_datetime.substring(0, 10));
      }
    }

    if (name === "expected_departure_datetime" || name === "estimated_hours") {
      const dep   = name === "expected_departure_datetime" ? value : add_form.expected_departure_datetime;
      const hours = name === "estimated_hours" ? value : add_form.estimated_hours;
      if (dep && hours && hours > 0) {
        fetch_available_assets(dep, hours);
      }
    }

    if (name === "actual_fuel_price") {
      compute_fuel_preview(value, add_route_options, updated);
    }

    if (name === "contract_route_id" || name === "truck_id") {
      compute_fuel_preview(updated.actual_fuel_price, add_route_options, updated);
    }
  };

  const handle_edit_change = async (e) => {
    const { name, value } = e.target;
    const updated = { ...edit_form, [name]: value };
    set_edit_form(updated);

    if (name === "contract_id") {
      const res = await getAllContractRoutes(value);
      const routes = res.data?.data ?? [];
      set_edit_route_options(routes);
      set_edit_form((prev) => ({ ...prev, contract_route_id: "" }));
    }

    if (name === "actual_fuel_price") {
      compute_fuel_preview(value, edit_route_options, updated);
    }

    if (name === "contract_route_id" || name === "truck_id") {
      compute_fuel_preview(updated.actual_fuel_price, edit_route_options, updated);
    }

    if (name === "expected_departure_datetime" || name === "estimated_hours") {
      const dep   = name === "expected_departure_datetime" ? value : edit_form.expected_departure_datetime;
      const hours = name === "estimated_hours" ? value : edit_form.estimated_hours;
      if (dep && hours && hours > 0) {
        fetch_available_assets(dep, hours, edit_form.id);
      }
    }

  };

  const handle_add_datetime_change = (date) => {
      if (!date) {
          set_add_form((prev) => ({ ...prev, expected_departure_datetime: "" }));
          return;
      }
      const formatted = date.format("YYYY-MM-DD HH:mm:ss");
      set_add_form((prev) => ({ ...prev, expected_departure_datetime: formatted }));
      if (add_form.contract_id) {
          fetch_contract_trip_info(add_form.contract_id, date.format("YYYY-MM-DD"));
      }
      if (add_form.estimated_hours && add_form.estimated_hours > 0) {
          fetch_available_assets(formatted, add_form.estimated_hours);
      }
  };

  const handle_edit_datetime_change = (date) => {
      if (!date) {
          set_edit_form((prev) => ({ ...prev, expected_departure_datetime: "" }));
          return;
      }
      const formatted = date.format("YYYY-MM-DD HH:mm:ss");
      set_edit_form((prev) => ({ ...prev, expected_departure_datetime: formatted }));
      if (edit_form.estimated_hours && edit_form.estimated_hours > 0) {
          fetch_available_assets(formatted, edit_form.estimated_hours, edit_form.id);
      }
  };

  async function handle_row_click(row) {
    set_selected_trip(row);
    set_show_map_modal(true);
    const res = await getTripDetails(row.id);
    if (res.data?.data) {
      const detail = res.data.data;
      set_selected_trip({
        ...row,
        driver_label: detail.driver
          ? detail.driver.driver_name
          : row.driver_label || "—",
        helper_label: detail.helper
          ? detail.helper.helper_name
          : row.helper_label || "—",
        agreed_fuel_price:      detail.agreed_fuel_price,
        actual_fuel_price:      detail.actual_fuel_price,
        fuel_additional_charge: detail.fuel_additional_charge,
        excess_charge:          detail.excess_charge,
        is_excess:              detail.is_excess,
        route_distance_km:      detail.route_distance_km,
        driver_id:              detail.driver?.driver_id ?? "",
        helper_id:              detail.helper?.helper_id ?? "",
      });
    }
  }

  function build_maps_url(origin, destination) {
    const key = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";
    const o = encodeURIComponent(origin);
    const d = encodeURIComponent(destination);
    return `https://www.google.com/maps/embed/v1/directions?origin=${o}&destination=${d}&key=${key}&mode=driving`;
  }

  async function fetch_routes_for_edit(contract_id) {
    if (!contract_id) return;
    const res = await getAllContractRoutes(contract_id);
    if (res.data?.data) set_edit_route_options(res.data.data);
  }

  async function fetch_all_options() {
    const [customers_res, contracts_res, trucks_res, drivers_res, helpers_res] =
      await Promise.all([
        getAllCustomers(),
        getAllContracts(),
        getAllTrucks(),
        getAllDrivers(),
        getAllHelpers(),
      ]);
    if (customers_res.data?.data) set_customer_options(customers_res.data.data);
    if (contracts_res.data?.data) set_contracts(contracts_res.data.data);
    if (trucks_res.data?.data)
      set_truck_options(trucks_res.data.data.filter((t) => t.status === "active"));
    if (drivers_res.data?.data)
      set_driver_options(drivers_res.data.data.filter((d) => d.status === "active"));
    if (helpers_res.data?.data)
      set_helper_options(helpers_res.data.data.filter((h) => h.status === "active"));
  }

  async function fetch_trips(filters = {}) {
    set_show_loader(true);
    const has_filter = Object.values(filters).some((v) => v !== "" && v !== null);
    const response = has_filter
      ? await searchTrips(filters)
      : await getAllTrips();

    if (response.data?.data) {
      const result = response.data.data.map((a) => ({
        ...a,
        contract_label:  a.contract_number ? `#${a.contract_number}` : `#${a.contract_id}`,
        customer_label:  a.trade_name || a.customer_name || "—",
        route_label:
          a.route_origin && a.route_destination
            ? `${a.route_origin} → ${a.route_destination}`
            : `Route #${a.contract_route_id}`,
        truck_label:
          a.truck_unit_code && a.truck_plate_number
            ? `${a.truck_unit_code} — ${a.truck_plate_number}`
            : `Truck #${a.truck_id}`,
        driver_label:  a.driver_label  || "—",
        helper_label:  a.helper_label  || "—",
        trip_date_fmt: dateFormat(a.expected_departure_datetime),
        status_badge: (
          <span className={`status-badge ${a.status || "scheduled"}`}>
            {a.status === "completed" ? "Completed" 
              : a.status === "in_transit" ? "In Transit" 
              : a.status === "cancelled" ? "Cancelled" 
              : "Scheduled"}
          </span>
        ),
      }));
      set_trip_data(result);
      set_filtered_trip_data(apply_tab_filter(result, active_tab));
    } else {
      set_trip_data([]);
      set_filtered_trip_data([]);
    }
    set_show_loader(false);
  }

  async function handle_create() {
    if (validateTrip(add_form, set_is_error)) {
      set_is_clicked(true);
      const response = await createTrip(add_form);
      if (response.data?.status === "success") {
        toast.success("Trip logged successfully!", { style: toastStyle() });
        set_show_add_modal(false);
        set_add_form({ ...empty_form });
        set_add_route_options([]);
        set_contract_trip_info(null);
        set_fuel_preview(0);
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
      if (response.data?.status === "success") {
        toast.success("Trip updated successfully!", { style: toastStyle() });
        set_show_edit_modal(false);
        set_fuel_preview(0);
        fetch_trips();
      } else {
        toast.error("Failed to update trip.", { style: toastStyle() });
      } 
      set_is_clicked(false);
    }
  }

  async function handle_complete_trip() {
    if (!selected_trip) return;
    set_is_completing(true);
    const res = await completeTrip(selected_trip.id);
    if (res.data?.status === "success") {
      toast.success("Trip marked as completed!", { style: toastStyle() });
      set_selected_trip((prev) => ({ ...prev, status: "completed" }));
      fetch_trips();
    } else {
      toast.error("Failed to complete trip.", { style: toastStyle() });
    }
    set_is_completing(false);
  }

  async function handle_start_trip() {
    if (!selected_trip) return;
    set_is_completing(true);
    const res = await startTrip(selected_trip.id);
    if (res.data?.status === "success") {
        toast.success("Trip started!", { style: toastStyle() });
        set_selected_trip((prev) => ({ ...prev, status: "in_transit" }));
        fetch_trips();
    } else {
        toast.error("Failed to start trip.", { style: toastStyle() });
    }
    set_is_completing(false);
  }

  async function handle_suggestion_search(keyword) {
  if (!keyword || keyword.trim().length < 1) {
    set_suggestions([]);
    return;
  }
  set_suggestion_loading(true);
  const res = await getTripSuggestions(keyword);
  if (res.data?.data) {
    const data = res.data.data;
    const type_map = [
      { key: 'customers', type: 'customer_id', icon: '👤', label: 'Customer' },
      { key: 'contracts', type: 'contract_id', icon: '📄', label: 'Contract' },
      { key: 'trucks',    type: 'truck_id',    icon: '🚛', label: 'Truck'    },
      { key: 'drivers',   type: 'driver_id',   icon: '🧑', label: 'Driver'   },
      { key: 'helpers',   type: 'helper_id',   icon: '👷', label: 'Helper'   },
      { key: 'routes',    type: 'route_id',    icon: '📍', label: 'Route'    },
    ];
    const options = type_map.flatMap(({ key, type, icon, label }) =>
      (data[key] || []).map((item) => ({
        value: `${type}::${item.id}`,
        label: `${icon} ${item.label}`,
        sublabel: label,
      }))
    );
    set_suggestions(options);
  }
  set_suggestion_loading(false);
}

function handle_suggestion_select(value, option) {
  const [type, id] = value.split('::');
  set_active_filter({ type, id, label: option.label });
  const filters = {
    customer_id: '',
    contract_id: '',
    truck_id:    '',
    driver_id:   '',
    helper_id:   '',
    route_id:    '',
    date_from:   date_range[0] ? moment(date_range[0]).format('YYYY-MM-DD') : '',
    date_to:     date_range[1] ? moment(date_range[1]).format('YYYY-MM-DD') : '',
    [type]:      id,
  };
  fetch_trips(filters);
}

function handle_range_change(dates) {
  set_date_range(dates || [null, null]);
  const filters = {
    customer_id: '',
    contract_id: '',
    truck_id:    '',
    driver_id:   '',
    helper_id:   '',
    route_id:    '',
    ...(active_filter ? { [active_filter.type]: active_filter.id } : {}),
    date_from: dates?.[0] ? moment(dates[0]).format('YYYY-MM-DD') : '',
    date_to:   dates?.[1] ? moment(dates[1]).format('YYYY-MM-DD') : '',
  };
  fetch_trips(filters);
}

function handle_reset_filter() {
  set_active_filter(null);
  set_date_range([null, null]);
  set_suggestions([]);
  set_search_value(null);
  fetch_trips({});
}


  function apply_tab_filter(data, tab) {
    if (tab === "all") return data;
    return data.filter((row) => row.status === tab);
  }

  function handle_tab_change(tab) {
    set_active_tab(tab);
    set_filtered_trip_data(apply_tab_filter(trip_data, tab));
  }

  function get_tab_count(tab) {
    if (tab === "all") return trip_data.length;
    return trip_data.filter((row) => row.status === tab).length;
  }

  useEffect(() => {
    fetch_all_options();
    fetch_trips();
  }, []);

  // Fuel info banner shown inside log trip form
  const fuel_info_banner = (form, route_opts) => {
    if (!contract_trip_info) return null;
    const agreed      = parseFloat(contract_trip_info.fuel_price_per_liter ?? 0);
    const actual      = parseFloat(form.actual_fuel_price ?? 0);
    const route       = route_opts.find((r) => String(r.id) === String(form.contract_route_id));
    const truck       = truck_options.find((t) => String(t.id) === String(form.truck_id));
    const distance_km = route ? parseFloat(route.distance_km ?? 0) : 0;
    const kpl         = truck ? parseFloat(truck.km_per_liter ?? 0) : 0;
    const liters      = kpl > 0 && distance_km > 0 ? (distance_km / kpl).toFixed(2) : "—";

    return (
      <div className="fuel-info-banner">
        <div className="fuel-info-row">
          <span>Agreed fuel price:</span>
          <strong>₱{agreed.toFixed(2)}/L</strong>
        </div>
        {route && (
          <div className="fuel-info-row">
            <span>Route distance:</span>
            <strong>{distance_km} km</strong>
          </div>
        )}
        {truck && kpl > 0 && (
          <div className="fuel-info-row">
            <span>Truck fuel efficiency:</span>
            <strong>{kpl} km/L → ~{liters} L needed</strong>
          </div>
        )}
        {actual > 0 && actual > agreed && (
          <div className="fuel-info-row fuel-excess">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>Fuel surcharge:</span>
            <strong>₱{fuel_preview.toFixed(2)}</strong>
          </div>
        )}
        {actual > 0 && actual <= agreed && (
          <div className="fuel-info-row fuel-ok">
            <FontAwesomeIcon icon={faGasPump} />
            <span>Actual price is within agreed rate — no fuel surcharge.</span>
          </div>
        )}
      </div>
    );
  };

  const trip_count_banner = () => {
    if (!contract_trip_info) return null;
    const { trips_this_month, included_trips, next_is_excess, excess_trip_charge } =
      contract_trip_info;
    return (
      <div className={`trip-count-banner ${next_is_excess ? "excess" : "ok"}`}>
        <span>
          Trips this month: <strong>{trips_this_month} / {included_trips}</strong>
        </span>
        {next_is_excess ? (
          <span className="excess-warning">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {" "}This trip will be an <strong>excess trip</strong> — ₱{parseFloat(excess_trip_charge).toFixed(2)} charge applies.
          </span>
        ) : (
          <span className="trips-remaining">
            {included_trips - trips_this_month} trip(s) remaining in included trips.
          </span>
        )}
      </div>
    );
  };

  const form_fields = (form, handle_change, route_opts, set_form, is_edit = false) => (

    <div className="mt-3">
      <div className="biodata-section-label">Trip Information</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">CONTRACT <span className="required-icon">*</span></div>
          <Form.Select
            className="nc-modal-custom-input"
            value={form.contract_id || ""}
            onChange={(e) => {
              const customEvent = { target: { name: "contract_id", value: e.target.value } };
              handle_change(customEvent);
            }}
            disabled={is_edit}
          >
            <option value="">-- Select Contract --</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contract_number} — {c.authorized_signatory || c.customer_name}
              </option>
            ))}
          </Form.Select>
          <InputError isValid={is_error.contract_id} message="Contract is required" />
        </Col>
        <Col>
          <div className="field-label">DEPARTURE DATE & TIME <span className="required-icon">*</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            <AntDatePicker
              format="YYYY-MM-DD"
              value={form.expected_departure_datetime ? dayjs(form.expected_departure_datetime) : null}
              onChange={(date) => {
                if (!date) return;
                const existing_time = form.expected_departure_datetime
                  ? dayjs(form.expected_departure_datetime).format("HH:mm")
                  : "00:00";
                const combined = dayjs(`${date.format("YYYY-MM-DD")} ${existing_time}:00`);
                is_edit ? handle_edit_datetime_change(combined) : handle_add_datetime_change(combined);
              }}
              disabled={!form.contract_id}
              disabledDate={(current) => {
                if (!current) return false;
                const start = contract_date_range.start ? dayjs(contract_date_range.start).startOf('day') : null;
                const end   = contract_date_range.end   ? dayjs(contract_date_range.end).endOf('day')     : null;
                if (start && current.isBefore(start)) return true;
                if (end   && current.isAfter(end))    return true;
                return false;
              }}
              placeholder={!form.contract_id ? "Select contract first" : "Date"}
              style={{ flex: 2 }}
              getPopupContainer={(trigger) => trigger.parentElement}
            />
            <AntDatePicker.TimePicker
              format="HH:mm"
              minuteStep={15}
              value={form.expected_departure_datetime ? dayjs(form.expected_departure_datetime) : null}
              onChange={(time) => {
                if (!time) return;
                const existing_date = form.expected_departure_datetime
                  ? dayjs(form.expected_departure_datetime).format("YYYY-MM-DD")
                  : dayjs().format("YYYY-MM-DD");
                const combined = dayjs(`${existing_date} ${time.format("HH:mm")}:00`);
                is_edit ? handle_edit_datetime_change(combined) : handle_add_datetime_change(combined);
              }}
              disabled={!form.contract_id}
              placeholder="Time"
              style={{ flex: 1 }}
              getPopupContainer={(trigger) => trigger.parentElement}
            />
          </div>
          <InputError isValid={is_error.expected_departure_datetime} message="Departure date and time is required" />
        </Col>
        <Col>
            <div className="field-label">ESTIMATED DURATION (hours) <span className="required-icon">*</span></div>
            <Form.Control
                type="number"
                step="0.5"
                min="0.5"
                name="estimated_hours"
                value={form.estimated_hours}
                className="nc-modal-custom-input"
                onChange={is_edit ? handle_edit_change : handle_add_change}
                placeholder="e.g. 4"
            />
        </Col>
      </Row>

      {trip_count_banner()}

      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">ROUTE <span className="required-icon">*</span></div>
          <Select
            options={route_opts.map((r) => ({
              value: r.id,
              label: `${r.origin} → ${r.destination}${r.distance_km ? ` (${r.distance_km} km)` : ""}`,
            }))}
            value={route_opts.map((r) => ({
              value: r.id,
              label: `${r.origin} → ${r.destination}${r.distance_km ? ` (${r.distance_km} km)` : ""}`,
            })).find((o) => String(o.value) === String(form.contract_route_id)) || null}
            onChange={(selected) => {
              const e = { target: { name: "contract_route_id", value: selected ? String(selected.value) : "" } };
              handle_change(e);
            }}
            placeholder="-- Select Route --"
            isClearable
            isDisabled={!form.contract_id}
            classNamePrefix="react-select"
          />
          <InputError isValid={is_error.contract_route_id} message="Route is required" />
        </Col>
        <Col>
          <div className="field-label">TRUCK <span className="required-icon">*</span></div>
          <Select
            options={
              (available_assets ? available_assets.trucks : truck_options)
                .filter(t => t.status !== 'maintenance')
                .map((t) => ({
                  value: t.id,
                  label: t.is_available === false
                    ? `${t.plate_number} — ${t.truck_type} (Booked)`
                    : `${t.plate_number} — ${t.truck_type}${t.km_per_liter ? ` (${t.km_per_liter} km/L)` : ""}`,
                  isDisabled: t.is_available === false,
                }))
            }
            value={
              (available_assets ? available_assets.trucks : truck_options)
                .map((t) => ({
                  value: t.id,
                  label: t.is_available === false
                    ? `${t.plate_number} — ${t.truck_type} (Booked)`
                    : `${t.plate_number} — ${t.truck_type}${t.km_per_liter ? ` (${t.km_per_liter} km/L)` : ""}`,
                  isDisabled: t.is_available === false,
                }))
                .find((o) => String(o.value) === String(form.truck_id)) || null
            }
            onChange={(selected) => {
              const e = { target: { name: "truck_id", value: selected ? String(selected.value) : "" } };
              handle_change(e);
            }}
            placeholder="-- Select Truck --"
            isClearable
            classNamePrefix="react-select"
          />
          <InputError isValid={is_error.truck_id} message="Truck is required" />
        </Col>
      </Row>

      <div className="biodata-section-label">Personnel</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">DRIVER <span className="required-icon">*</span></div>
          <Select
            options={
              (available_assets ? available_assets.drivers : driver_options)
                .map((d) => ({
                  value: d.id,
                  label: d.is_available === false
                    ? `${d.first_name} ${d.last_name} (Booked)`
                    : `${d.first_name} ${d.last_name}`,
                  isDisabled: d.is_available === false,
                }))
            }
            value={
              (available_assets ? available_assets.drivers : driver_options)
                .map((d) => ({
                  value: d.id,
                  label: d.is_available === false
                    ? `${d.first_name} ${d.last_name} (Booked)`
                    : `${d.first_name} ${d.last_name}`,
                  isDisabled: d.is_available === false,
                }))
                .find((o) => String(o.value) === String(form.driver_id)) || null
            }
            onChange={(selected) => {
              const e = { target: { name: "driver_id", value: selected ? String(selected.value) : "" } };
              handle_change(e);
            }}
            placeholder="-- Select Driver --"
            isClearable
            classNamePrefix="react-select"
          />
          <InputError isValid={is_error.driver_id} message="Driver is required" />
        </Col>
        <Col>
          <div className="field-label">HELPER</div>
          <Select
            options={
              (available_assets ? available_assets.helpers : helper_options)
                .map((h) => ({
                  value: h.id,
                  label: h.is_available === false
                    ? `${h.first_name} ${h.last_name} (Booked)`
                    : `${h.first_name} ${h.last_name}`,
                  isDisabled: h.is_available === false,
                }))
            }
            value={
              (available_assets ? available_assets.helpers : helper_options)
                .map((h) => ({
                  value: h.id,
                  label: h.is_available === false
                    ? `${h.first_name} ${h.last_name} (Booked)`
                    : `${h.first_name} ${h.last_name}`,
                  isDisabled: h.is_available === false,
                }))
                .find((o) => String(o.value) === String(form.helper_id)) || null
            }
            onChange={(selected) => {
              const e = { target: { name: "helper_id", value: selected ? String(selected.value) : "" } };
              handle_change(e);
            }}
            placeholder="-- No Helper --"
            isClearable
            classNamePrefix="react-select"
          />
        </Col>
      </Row>

      <div className="biodata-section-label">Fuel</div>
      <Row className="nc-modal-custom-row">
        {contract_trip_info && (
          <Col xs={12} md={6}>
            <div className="field-label">AGREED FUEL PRICE (from contract)</div>
            <Form.Control
              type="text"
              readOnly
              value={`₱${parseFloat(contract_trip_info.fuel_price_per_liter ?? 0).toFixed(2)} / L`}
              className="nc-modal-custom-input"
              style={{ background: "#f5f5f5", color: "#888" }}
            />
          </Col>
        )}
        <Col xs={12} md={6}>
          <div className="field-label">ACTUAL FUEL PRICE (₱/L) <span className="required-icon">*</span></div>
          <Form.Control
            type="number"
            step="0.01"
            name="actual_fuel_price"
            value={form.actual_fuel_price}
            className="nc-modal-custom-input"
            onChange={handle_change}
            placeholder="e.g. 62.50"
          />
          <InputError isValid={is_error.actual_fuel_price} message="Actual fuel price is required" />
        </Col>
      </Row>

      {fuel_info_banner(form, route_opts)}

      <div className="biodata-section-label">Additional</div>
      <Row className="nc-modal-custom-row">
        <Col>
          <div className="field-label">REMARKS</div>
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
        <Row className="mb-3">
          <Col xs={6}>
            <h1 className="page-title">Trips</h1>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <button className="add-btn" onClick={() => set_show_add_modal(true)}>
              Log Trip
            </button>
          </Col>
        </Row>

        {/* Filter bar */}
        <div className="trip-filter-bar mb-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={5}>
              <AntSelect
                showSearch
                allowClear
                value={search_value}
                onChange={(val) => set_search_value(val ?? null)}
                style={{ width: "100%" }}
                placeholder="🔍 Search customer, contract, truck, driver, helper, route..."
                filterOption={false}
                onSearch={handle_suggestion_search}
                onSelect={handle_suggestion_select}
                onClear={handle_reset_filter}
                loading={suggestion_loading}
                options={suggestions.map((s) => ({
                  value: s.value,
                  label: (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{s.label}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{s.sublabel}</span>
                    </div>
                  ),
                }))}
                notFoundContent={suggestion_loading ? "Searching..." : "No results"}
              />
            </Col>
            <Col xs={12} md={4}>
              <RangePicker
                value={date_range}
                onChange={handle_range_change}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder={["From date", "To date"]}
                allowClear
          />
            </Col>
            <Col xs="auto">
              <button className="cancel-btn" onClick={handle_reset_filter}>
                Clear
              </button>
            </Col>
          </Row>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs mb-3">
          {["all", "scheduled", "in_transit", "completed"].map((tab) => (
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
            tableHeaders={[
              "DATE",
              "CUSTOMER",
              "CONTRACT",
              "ROUTE",
              "TRUCK",
              "DRIVER",
              "HELPER",
              "EXCESS",
              "FUEL SURCHARGE",
              "STATUS",
            ]}
            headerSelector={[
              "trip_date_fmt",
              "customer_label",
              "contract_label",
              "route_label",
              "truck_label",
              "driver_label",
              "helper_label",
              "is_excess",
              "fuel_additional_charge",
              "status_badge",
            ]}
            tableData={filtered_trip_data}
            showLoader={show_loader}
            withActionData={true}
            onRowClick={(row) => handle_row_click(row)}
          />
        </div>
      </div>

      {/* Add Modal */}
      <AddModal
        title="LOG TRIP"
        size="xl"
        show={show_add_modal}
        onHide={() => {
          set_show_add_modal(false);
          set_add_form({ ...empty_form });
          set_add_route_options([]);
          set_contract_trip_info(null);
          set_fuel_preview(0);
          set_available_assets(null);
          set_contract_date_range({ start: null, end: null });
        }}
        onSave={handle_create}
        isClicked={is_clicked}
      >
        {form_fields(add_form, handle_add_change, add_route_options, set_add_form, false)}
      </AddModal>

      {/* Edit Modal */}
      <EditModal
        title="EDIT TRIP"
        size="lg"
        show={show_edit_modal}
        onHide={() => {
          set_show_edit_modal(false);
          set_fuel_preview(0);
          set_available_assets(null);
        }}
        onSave={handle_update}
        isClicked={is_clicked}
      >
        {form_fields(edit_form, handle_edit_change, edit_route_options, set_edit_form, true)}
      </EditModal>

      {/* Trip Detail / Map Modal */}
      {show_map_modal && selected_trip && (
        <div
          className="trip-modal-overlay"
          onClick={() => set_show_map_modal(false)}
        >
          <div className="trip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trip-modal-header">
              <span className="trip-modal-title">
                TRIP-{String(selected_trip.id).padStart(4, "0")} — Trip Details
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {selected_trip?.status === "scheduled" && (
                  <button
                    className="save-btn"
                    style={{ background: "#2980b9", borderColor: "#2980b9" }}
                    onClick={handle_start_trip}
                    disabled={is_completing}
                  >
                    {is_completing ? "Starting..." : "▶ Start Trip"}
                  </button>
                )}
                {selected_trip?.status === "in_transit" && (
                  <button
                    className="save-btn"
                    style={{ background: "#27ae60", borderColor: "#27ae60" }}
                    onClick={handle_complete_trip}
                    disabled={is_completing}
                  >
                    {is_completing ? "Completing..." : "✓ Mark as Delivered"}
                  </button>
                )}
                {selected_trip?.status === "completed" && (
                  <span className="status-badge active" style={{ padding: "6px 12px" }}>
                    ✓ Delivered
                  </span>
                )}
                <button
                  className="add-btn"
                  onClick={() => {
                    set_contract_trip_info(null);
                    set_fuel_preview(0);
                    set_edit_form({
                      ...selected_trip,
                      driver_id: String(selected_trip.driver_id ?? ""),
                      helper_id: String(selected_trip.helper_id ?? ""),
                      actual_fuel_price: selected_trip.actual_fuel_price ?? "",
                    });
                    fetch_routes_for_edit(selected_trip.contract_id);
                    set_show_map_modal(false);
                    set_show_edit_modal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="trip-modal-close"
                  onClick={() => set_show_map_modal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <div className="trip-modal-body">
              <div className="trip-modal-details">
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faCalendarAlt} className="detail-icon" />
                  <div>
                    <span className="detail-label">Trip Date</span>
                    <span className="detail-value">{dateFormat(selected_trip.expected_departure_datetime)}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faBuilding} className="detail-icon" />
                  <div>
                    <span className="detail-label">Customer</span>
                    <span className="detail-value">{selected_trip.customer_name || "—"}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="detail-icon" />
                  <div>
                    <span className="detail-label">Route</span>
                    <span className="detail-value">
                      {selected_trip.route_origin} → {selected_trip.route_destination}
                      {selected_trip.route_distance_km
                        ? ` (${selected_trip.route_distance_km} km)`
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faTruck} className="detail-icon" />
                  <div>
                    <span className="detail-label">Truck</span>
                    <span className="detail-value">
                      {selected_trip.truck_unit_code} — {selected_trip.truck_plate_number}
                    </span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faUser} className="detail-icon" />
                  <div>
                    <span className="detail-label">Driver</span>
                    <span className="detail-value">{selected_trip.driver_label || "—"}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faUsers} className="detail-icon" />
                  <div>
                    <span className="detail-label">Helper</span>
                    <span className="detail-value">{selected_trip.helper_label || "—"}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faGasPump} className="detail-icon" />
                  <div>
                    <span className="detail-label">Fuel</span>
                    <span className="detail-value">
                      Agreed: ₱{parseFloat(selected_trip.agreed_fuel_price ?? 0).toFixed(2)}/L
                      {" · "}
                      Actual: ₱{parseFloat(selected_trip.actual_fuel_price ?? 0).toFixed(2)}/L
                    </span>
                    {parseFloat(selected_trip.fuel_additional_charge ?? 0) > 0 && (
                      <span className="detail-value excess-warning">
                        Fuel surcharge: ₱{parseFloat(selected_trip.fuel_additional_charge).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {parseInt(selected_trip.is_excess) === 1 && (
                  <div className="trip-detail-row">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="detail-icon" />
                    <div>
                      <span className="detail-label">Excess Trip</span>
                      <span className="detail-value excess-warning">
                        ₱{parseFloat(selected_trip.excess_charge ?? 0).toFixed(2)} charge
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="trip-modal-map">
                {process.env.REACT_APP_GOOGLE_MAPS_KEY ? (
                  <iframe
                    title="trip-route-map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: 8 }}
                    loading="lazy"
                    allowFullScreen
                    src={build_maps_url(
                      selected_trip.route_origin,
                      selected_trip.route_destination
                    )}
                  />
                ) : (
                  <div className="map-placeholder">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="map-placeholder-icon" />
                    <span className="map-placeholder-text">
                      {selected_trip.route_origin} → {selected_trip.route_destination}
                    </span>
                    <span className="map-placeholder-sub">
                      Add REACT_APP_GOOGLE_MAPS_KEY to .env to enable map
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}