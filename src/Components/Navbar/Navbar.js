import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faTruck,
  faIdCard,
  faUsers,
  faBuilding,
  faFileContract,
  faRoute,
  faClipboardList,
  faUserCog,
  faHistory,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { getName, getType, removeUserSession, toastStyle } from "../../Helpers/Utils/Common";
import MenuItem from "./Menuitem";
import "./Navbar.css";

const MENU_SECTIONS = [
  {
    section: "OVERVIEW",
    items: [
      { name: "DASHBOARD", to: "/dashboard", icon: faTachometerAlt, subMenus: [] },
    ],
  },
  {
    section: "FLEET",
    items: [
      { name: "TRUCKS",  to: "/trucks",  icon: faTruck,  subMenus: [] },
      { name: "DRIVERS", to: "/drivers", icon: faIdCard, subMenus: [] },
      { name: "HELPERS", to: "/helpers", icon: faUsers,  subMenus: [] },
    ],
  },
  {
    section: "CLIENTS",
    items: [
      { name: "CUSTOMERS", to: "/customers", icon: faBuilding, subMenus: [] },
    ],
  },
  {
    section: "CONTRACTS",
    items: [
      { name: "CONTRACTS",       to: "/contracts",       icon: faFileContract, subMenus: [] },
      { name: "CONTRACT ROUTES", to: "/contract-routes", icon: faRoute,        subMenus: [] },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { name: "TRIPS", to: "/trips", icon: faClipboardList, subMenus: [] },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { name: "USERS",       to: "/users",  icon: faUserCog, subMenus: [] },
      { name: "AUDIT TRAIL", to: "/trail",  icon: faHistory, subMenus: [] },
    ],
  },
];

// Shared ref that survives navigation — tracks hover state globally
// so re-mount doesn't reset it
let global_is_hovered = false;

const Navbar = ({ onCollapse }) => {
  const [inactive, set_inactive] = useState(!global_is_hovered);
  const location = useLocation();

  const user_name = getName() || "User";
  const user_type = getType() || "Staff";
  const user_initial = user_name.charAt(0).toUpperCase();

  useEffect(() => {
    if (onCollapse) onCollapse(inactive);
  }, [inactive]);

  function handle_mouse_enter() {
    global_is_hovered = true;
    set_inactive(false);
  }

  function handle_mouse_leave() {
    global_is_hovered = false;
    set_inactive(true);
  }

  async function handle_logout() {
    removeUserSession();
    window.localStorage.clear();
    toast.success("Logging you out...", { style: toastStyle() });
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }

  function is_active(to) {
    return location.pathname === to || location.pathname.startsWith(to + "/");
  }

  return (
    <div
      className={`side-menu ${inactive ? "inactive" : ""}`}
      onMouseEnter={handle_mouse_enter}
      onMouseLeave={handle_mouse_leave}
    >
      {/* Top: brand */}
      <div className="top-section">
        <div className="sidebar-brand">
          <FontAwesomeIcon icon={faTruck} className="brand-icon" />
          {!inactive && (
            <div className="brand-text">
              <span className="brand-name">Logistics ERP</span>
              <span className="brand-sub">Trucking Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className={`main-menu ${inactive ? "" : "active-menu"}`}>
        {MENU_SECTIONS.map((section, s_idx) => (
          <div key={s_idx} className="menu-section">
            {!inactive && (
              <div className="menu-section-title">{section.section}</div>
            )}
            <ul className="section-list">
              {section.items.map((item, i_idx) => (
                <MenuItem
                  key={i_idx}
                  name={item.name}
                  to={item.to}
                  icon={item.icon}
                  subMenus={item.subMenus}
                  activeSub={is_active(item.to)}
                  inactive={inactive}
                  exact="true"
                  expandManage={true}
                  setExpandManage={() => {}}
                  index={i_idx}
                  onClick={() => {}}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="side-menu-footer">
        <div className="logout-cont" onClick={handle_logout}>
          <div className="menu-icon">
            <FontAwesomeIcon icon={faSignOutAlt} className="icon fa-icon" />
          </div>
          {!inactive && <span className="logout-label">LOGOUT</span>}
        </div>
        {!inactive && (
          <div className="user-details-footer">
            <div className="user-avatar">{user_initial}</div>
            <div className="user-info">
              <span className="navbar-user-label">{user_name}</span>
              <span className="user-type-label">{user_type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;