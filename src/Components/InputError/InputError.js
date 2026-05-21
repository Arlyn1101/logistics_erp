import React from "react";

function InputError({ isValid, message }) {
  if (!isValid) return null;
  return (
    <div className="validity-error" style={{ color: "#DC3545", fontSize: "12px", marginTop: "4px" }}>
      {message}
    </div>
  );
}

export default InputError;
