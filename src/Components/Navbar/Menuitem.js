import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

/**
 * MenuItem — mirrors old ERP MenuItem structure.
 * Accepts `icon` as a FontAwesome icon definition (instead of image src).
 */
const MenuItem = ({
  name,
  to,
  icon,
  subMenus = [],
  activeSub,
  inactive,
  exact,
  expandManage,
  setExpandManage,
  index,
  onClick,
}) => {
  if (subMenus.length > 0) {
    return (
      <li
        className="menu-li"
        onClick={() => {
          onClick && onClick();
          setExpandManage(index);
        }}
        title={name}
      >
        <div className={activeSub ? "menu-item li-active" : "menu-item"}>
          <div className="menu-icon">
            <FontAwesomeIcon icon={icon} className="icon fa-icon" />
          </div>
          <span className="nav-name">{name}</span>
          <span className="expand-icon">
            <FontAwesomeIcon icon={expandManage ? faChevronDown : faChevronUp} />
          </span>
        </div>
        {!expandManage && (
          <ul className="sub-menu">
            {subMenus.map((menu, idx) => (
              <li key={idx} className="menu-li sub-item" title={menu.name}>
                <NavLink to={menu.to}>{menu.name}</NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="menu-li" onClick={onClick} title={name}>
      <Link
        to={to}
        exact={exact}
        className={activeSub ? "menu-item li-active" : "menu-item"}
      >
        <div className="menu-icon">
          <FontAwesomeIcon icon={icon} className="icon fa-icon" />
        </div>
        <span className="nav-name">{name}</span>
      </Link>
    </li>
  );
};

export default MenuItem;