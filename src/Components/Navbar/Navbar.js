import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTruck,
  faIdCard,
  faUsers,
  faBuilding,
  faFileContract,
  faRoute,
  faClipboardList,
  faUserCog,
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
      { name: "DASHBOARD", to: "/dashboard", icon: faHome, subMenus: [] },
    ],
  },
  {
    section: "FLEET",
    items: [
      {
        name: "FLEET",
        to: "/",
        icon: faTruck,
        subMenus: [
          { name: "TRUCKS",  to: "/trucks" },
          { name: "DRIVERS", to: "/drivers" },
          { name: "HELPERS", to: "/helpers" },
        ],
      },
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
      {
        name: "CONTRACTS",
        to: "/contracts",
        icon: faFileContract,
        subMenus: [],
      },
    ],
  },
  {
    section: "FINANCE",
    items: [
      {
        name: "FINANCE",
        to: "/",
        icon: faFileContract,
        subMenus: [
          { name: "BILLINGS", to: "/billings" },
          { name: "PAYMENTS", to: "/payments" },
        ],
      },
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
      {
        name: "USERS",
        to: "/users",
        icon: faUserCog,
        subMenus: [],
      },
    ],
  },
];

// Shared ref that survives navigation — tracks hover state globally
// so re-mount doesn't reset it
let global_expanded = null;

const Navbar = ({ onCollapse }) => {
  const [inactive] = useState(false);
  const [expanded_index, set_expanded_index] = useState(global_expanded);

  function handle_expand(key) {
    const next = global_expanded === key ? null : key;
    global_expanded = next;
    set_expanded_index(next);
  }
  const location = useLocation();

  const user_name = getName() || "User";
  const user_type = getType() || "Staff";
  const user_initial = user_name.charAt(0).toUpperCase();

  useEffect(() => {
    if (onCollapse) onCollapse(inactive);
  }, [inactive]);

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
    <div className={`side-menu ${inactive ? "inactive" : ""}`}>
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
            <ul className="section-list">
              {section.items.map((item, i_idx) => (
                <MenuItem
                  key={i_idx}
                  name={item.name}
                  to={item.to}
                  icon={item.icon}
                  subMenus={item.subMenus}
                  activeSub={item.subMenus.length > 0 
                    ? item.subMenus.some(sub => is_active(sub.to))
                    : is_active(item.to)}
                  inactive={inactive}
                  exact="true"
                  expandManage={expanded_index !== s_idx + "_" + i_idx}
                  setExpandManage={() => handle_expand(s_idx + "_" + i_idx)}
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