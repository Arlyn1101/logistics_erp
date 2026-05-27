import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";

export default function Payments() {
  const [inactive, set_inactive] = useState(false);

  return (
    <div>
      <div className="page">
        <Navbar
          onCollapse={(is_inactive) => set_inactive(is_inactive)}
          active={"FINANCE"}
        />
      </div>
      <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">whairrt sa</p>
      </div>
    </div>
  );
}