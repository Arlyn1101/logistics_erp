import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck, faIdCard, faUsers, faBuilding,
  faFileContract, faClipboardList, faArrowRight,
  faExclamationTriangle, faTimes, faMapMarkerAlt,
  faCalendarAlt, faUser, faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import Navbar from "../../Components/Navbar/Navbar";
import { getName } from "../../Helpers/Utils/Common";
import { getAllTrucks } from "../../Helpers/apiCalls/Manage/truckApi";
import { getAllDrivers } from "../../Helpers/apiCalls/Manage/driverApi";
import { getAllHelpers } from "../../Helpers/apiCalls/Manage/helperApi";
import { getAllCustomers } from "../../Helpers/apiCalls/Manage/customerApi";
import { getAllContracts } from "../../Helpers/apiCalls/Contracts/contractApi";
import { getAllTrips, getTripDetails } from "../../Helpers/apiCalls/Trips/tripApi";
import "./Dashboard.css";

// ── Static data (safe outside component) ─────────────────────
const QUICK_ACTIONS = [
  { label: "Log a Trip",   icon: faClipboardList, to: "/trips" },
  { label: "New Contract", icon: faFileContract,  to: "/contracts" },
  { label: "Add Driver",   icon: faIdCard,        to: "/drivers" },
  { label: "Add Truck",    icon: faTruck,         to: "/trucks" },
];

const MONTH_STATS = [
  { label: "Active Contracts", value: "—" },
  { label: "Total Trips",      value: "—" },
  { label: "Excess Trips",     value: "—" },
];

const TRIP_LINE_DATA = [];

const INITIAL_DONUT_DATA = [
  { name: "Within Limit", value: 0, color: "#5ac8e1" },
  { name: "Excess Trips", value: 0, color: "#1a2e40" },
];

const RECENT_TRIPS = [];
const CONTRACT_ALERTS = [];

const DonutLabel = ({ cx, cy, total }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle"
      style={{ fontFamily: "var(--primary-font-bold)", fontSize: 26, fill: "#1a2e40" }}>
      {total}
    </text>
    <text x={cx} y={cy + 14} textAnchor="middle"
      style={{ fontFamily: "var(--primary-font-medium)", fontSize: 11, fill: "#8a9ab0" }}>
      Total Trips
    </text>
  </>
);

export default function Dashboard() {
  const [inactive, set_inactive]           = useState(false);
  const [show_modal, set_show_modal]       = useState(false);
  const [selected_trip, set_selected_trip] = useState(null);
  const [counts, set_counts]               = useState({
    trucks: "—",
    drivers: "—",
    helpers: "—",
    customers: "—",
    contracts: "—",
  });

  const [donut_data, set_donut_data]       = useState(INITIAL_DONUT_DATA);
  const [month_stats, set_month_stats]     = useState({ total: "—", excess: "—", active_contracts: "—" });
  const [recent_trips, set_recent_trips]   = useState([]);
  const [contract_alerts, set_contract_alerts] = useState([]);
  const navigate = useNavigate();
  const user_name = getName() || "User";

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    fetch_counts();
  }, []);

  async function fetch_counts() {
    const [trucks_res, drivers_res, helpers_res, customers_res, contracts_res, trips_res] = await Promise.all([
      getAllTrucks(),
      getAllDrivers(),
      getAllHelpers(),
      getAllCustomers(),
      getAllContracts(),
      getAllTrips(),
    ]);

    const active_trucks    = trucks_res.data?.data?.filter(t => t.status === "active").length ?? "—";
    const active_drivers   = drivers_res.data?.data?.filter(d => d.status === "active").length ?? "—";
    const active_helpers   = helpers_res.data?.data?.filter(h => h.status === "active").length ?? "—";
    const total_customers  = customers_res.data?.data?.length ?? "—";
    const active_contracts = contracts_res.data?.data?.filter(c => c.status === "active").length ?? "—";

    // Trip breakdown
    const trips = trips_res.data?.data || [];
    const today_date2    = new Date();
    const this_month2    = today_date2.getMonth();
    const this_year2     = today_date2.getFullYear();
    const trips_for_donut = trips.filter(t => {
      const d = new Date(t.trip_date);
      return d.getMonth() === this_month2 && d.getFullYear() === this_year2;
    });
    const excess_trips  = trips_for_donut.filter(t => t.is_excess == 1).length;
    const normal_trips  = trips_for_donut.length - excess_trips;

    set_counts({
      trucks:    active_trucks,
      drivers:   active_drivers,
      helpers:   active_helpers,
      customers: total_customers,
      contracts: active_contracts,
    });

    // Update donut data
    set_donut_data([
      { name: "Within Limit", value: normal_trips, color: "#5ac8e1" },
      { name: "Excess Trips", value: excess_trips, color: "#1a2e40" },
    ]);

    // This Month's Trips
    const today_date = new Date();
    const this_month = today_date.getMonth();
    const this_year  = today_date.getFullYear();
    const trips_this_month = trips.filter(t => {
      const d = new Date(t.trip_date);
      return d.getMonth() === this_month && d.getFullYear() === this_year;
    });
    const excess_this_month = trips_this_month.filter(t => t.is_excess == 1).length;
    set_month_stats({
      total: trips_this_month.length,
      excess: excess_this_month,
      active_contracts: active_contracts,
    });

    // Recent Trips — last 5
    set_recent_trips(trips.slice(0, 5));

    // Contract Alerts — expiring within 30 days or expired
    const today_ms = new Date().setHours(0, 0, 0, 0);
    const alerts = (contracts_res.data?.data || [])
      .filter(c => c.end_date)
      .map(c => {
        const end = new Date(c.end_date).setHours(0, 0, 0, 0);
        const days_remaining = Math.ceil((end - today_ms) / (1000 * 60 * 60 * 24));
        return { ...c, days_remaining };
      })
      .filter(c => c.days_remaining <= 30)
      .sort((a, b) => a.days_remaining - b.days_remaining);
    set_contract_alerts(alerts);
  }

  const DASH_CARDS = [
    { icon: faTruck,        label: "Active Trucks",    value: counts.trucks,    sub: "status = active" },
    { icon: faIdCard,       label: "Active Drivers",   value: counts.drivers,   sub: "status = active" },
    { icon: faUsers,        label: "Active Helpers",   value: counts.helpers,   sub: "status = active" },
    { icon: faBuilding,     label: "Customers",        value: counts.customers, sub: "total clients" },
    { icon: faFileContract, label: "Active Contracts", value: counts.contracts, sub: "currently running" },
  ];

  const donut_total = donut_data.reduce((sum, d) => sum + d.value, 0);

  async function handle_trip_click(trip) {
    set_show_modal(true);
    const response = await getTripDetails(trip.id);
    if (response.data && response.data.data) {
      const detail = response.data.data;
      const drivers_label = (detail.drivers || []).map(d => `${d.first_name} ${d.last_name}`).join(", ");
      const helpers_label = (detail.helpers || []).map(h => `${h.first_name} ${h.last_name}`).join(", ");
      set_selected_trip({ ...trip, drivers_label, helpers_label });
    } else {
      set_selected_trip(trip);
    }
  }

  function handle_close_modal() {
    set_show_modal(false);
    set_selected_trip(null);
  }

  function build_maps_url(origin, destination) {
    const key = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";
    const o   = encodeURIComponent(origin);
    const d   = encodeURIComponent(destination);
    return `https://www.google.com/maps/embed/v1/directions?origin=${o}&destination=${d}&key=${key}&mode=driving`;
  }

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"DASHBOARD"}
        />
      </div>

      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <div className="dashboard-content">

          {/* ── Page header ── */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
          <h1 className="page-title">Welcome back, {user_name}!</h1>
          </div>
          <div className="dashboard-datetime-card">
            <span className="datetime-time">
              {new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="datetime-date">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

          {/* ── Summary cards ── */}
          <div className="dashboard-cards">
            {DASH_CARDS.map((card, idx) => (
              <div className="dash-card" key={idx}>
                <div className="dash-card-icon">
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <div className="dash-card-body">
                  <span className="dash-card-value">{card.value}</span>
                  <span className="dash-card-label">{card.label}</span>
                  <span className="dash-card-sub">{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick actions ── */}
          <div className="dashboard-quicknav">
            {QUICK_ACTIONS.map((link, idx) => (
              <button key={idx} className="quicknav-btn" onClick={() => navigate(link.to)}>
                <span className="quicknav-plus">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
                <FontAwesomeIcon icon={link.icon} />
                {link.label}
              </button>
            ))}
          </div>

          {/* ── Middle row: stats+chart | donut ── */}
          <div className="dashboard-middle">

            <div className="dashboard-panel panel-stats">
              <div className="panel-header">
                <span className="panel-title">This Month's Trips</span>
                <span className="panel-month">
                  {new Date().toLocaleString("en-PH", { month: "long" })}
                </span>
              </div>
              <div className="stats-body">
                <div className="stats-rows">
                  {[
                    { label: "Active Contracts", value: month_stats.active_contracts },
                    { label: "Total Trips",      value: month_stats.total },
                    { label: "Excess Trips",     value: month_stats.excess },
                  ].map((s, idx) => (
                    <div className="stats-row" key={idx}>
                      <div className="stats-row-icon">
                        <FontAwesomeIcon icon={faClipboardList} />
                      </div>
                      <div className="stats-row-info">
                        <span className="stats-row-label">{s.label}</span>
                        <span className="stats-row-value">{s.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="stats-chart">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={TRIP_LINE_DATA}>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#aab2bc" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ fontFamily: "var(--primary-font-medium)", fontSize: 12, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                      <Line type="monotone" dataKey="trips" stroke="#5ac8e1" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#5ac8e1" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="dashboard-panel panel-donut">
              <div className="panel-header">
                <span className="panel-title">Trip Breakdown</span>
                <button className="panel-link" onClick={() => navigate("/trips")}>
                  View All <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              <div className="donut-body">
                <PieChart width={160} height={160}>
                  <Pie
                    data={donut_total === 0 ? [{ name: "No data", value: 1, color: "#edf0f4" }] : donut_data}
                    cx={75} cy={75}
                    innerRadius={50} outerRadius={72}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                  >
                    {(donut_total === 0 ? [{ color: "#edf0f4" }] : donut_data).map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  {donut_total > 0 && (
                    <text>
                      <DonutLabel cx={75} cy={75} total={donut_total} />
                    </text>
                  )}
                </PieChart>
                <div className="donut-legend">
                  {donut_data.map((d, idx) => (
                    <div className="donut-legend-row" key={idx}>
                      <span className="donut-dot" style={{ background: d.color }} />
                      <div className="donut-legend-info">
                        <span className="donut-legend-label">{d.name}</span>
                        <span className="donut-legend-value">{d.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── Bottom row: recent trips | contract alerts ── */}
          <div className="dashboard-bottom">

            <div className="dashboard-panel panel-trips">
              <div className="panel-header">
                <span className="panel-title">Recent Trips</span>
                <button className="panel-link" onClick={() => navigate("/trips")}>
                  View All <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              <div className="trip-card-list">
                {recent_trips.length === 0 ? (
                  <div className="panel-empty">No trips recorded yet.</div>
                ) : (
                  recent_trips.map((trip, idx) => (
                    <div className="trip-card" key={idx} onClick={() => handle_trip_click(trip)}>
                      <div className="trip-card-header">
                        <span className="trip-card-id">TRIP-{String(trip.id).padStart(4, "0")}</span>
                        <span className="trip-card-date">{trip.trip_date}</span>
                      </div>
                      <div className="trip-card-route">
                        <div className="route-point">
                          <span className="route-dot dot-origin" />
                          <span className="route-label">Pickup</span>
                          <span className="route-place">{trip.route_origin || "—"}</span>
                        </div>
                        <div className="route-line-connector" />
                        <div className="route-point">
                          <span className="route-dot dot-dest" />
                          <span className="route-label">Destination</span>
                          <span className="route-place">{trip.route_destination || "—"}</span>
                        </div>
                      </div>
                      <div className="trip-card-footer">
                        <span className="trip-card-customer">{trip.customer_name || "—"}</span>
                        <span className="trip-card-view">View Details</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dashboard-panel panel-alerts">
              <div className="panel-header">
                <span className="panel-title">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon" />
                  Contract Alerts
                </span>
                <button className="panel-link" onClick={() => navigate("/contracts")}>
                  View All <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
              <div className="alert-list">
                {contract_alerts.length === 0 ? (
                  <div className="panel-empty">No contract alerts.</div>
                ) : (
                  contract_alerts.map((c, idx) => (
                    <div className="alert-row" key={idx}>
                      <div className="alert-row-info">
                        <span className="alert-name">{c.customer_name}</span>
                        <span className="alert-meta">
                          Ends: {c.end_date} &nbsp;·&nbsp;
                          <span className={c.days_remaining <= 0 ? "badge-expired" : "badge-expiring"}>
                            {c.days_remaining <= 0 ? "Expired" : `${c.days_remaining}d left`}
                          </span>
                        </span>
                      </div>
                      <span className={`alert-dot ${c.days_remaining <= 0 ? "dot-red" : "dot-orange"}`} />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {show_modal && selected_trip && (
        <div className="trip-modal-overlay" onClick={handle_close_modal}>
          <div className="trip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trip-modal-header">
              <span className="trip-modal-title">
                TRIP-{String(selected_trip.id).padStart(4, "0")} — Trip Details
              </span>
              <button className="trip-modal-close" onClick={handle_close_modal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="trip-modal-body">
              <div className="trip-modal-details">
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faCalendarAlt} className="detail-icon" />
                  <div>
                    <span className="detail-label">Trip Date</span>
                    <span className="detail-value">{selected_trip.trip_date}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faBuilding} className="detail-icon" />
                  <div>
                    <span className="detail-label">Customer</span>
                    <span className="detail-value">{selected_trip.customer_name}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="detail-icon" />
                  <div>
                    <span className="detail-label">Route</span>
                    <span className="detail-value">{selected_trip.route_origin} → {selected_trip.route_destination}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faTruck} className="detail-icon" />
                  <div>
                    <span className="detail-label">Truck</span>
                    <span className="detail-value">{selected_trip.truck_unit_code} — {selected_trip.truck_plate_number}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faUser} className="detail-icon" />
                  <div>
                    <span className="detail-label">Driver(s)</span>
                    <span className="detail-value">{selected_trip.drivers_label || "—"}</span>
                  </div>
                </div>
                <div className="trip-detail-row">
                  <FontAwesomeIcon icon={faUsers} className="detail-icon" />
                  <div>
                    <span className="detail-label">Helper(s)</span>
                    <span className="detail-value">{selected_trip.helpers_label || "—"}</span>
                  </div>
                </div>
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
                    src={build_maps_url(selected_trip.origin, selected_trip.destination)}
                  />
                ) : (
                  <div className="map-placeholder">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="map-placeholder-icon" />
                    <span className="map-placeholder-text">{selected_trip.route_origin} → {selected_trip.route_destination}</span>
                    <span className="map-placeholder-sub">Add REACT_APP_GOOGLE_MAPS_KEY to .env to enable map</span>
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