import React from "react";
import "./Table.css";

function Table({ tableHeaders, headerSelector, tableData, showLoader, withActionData, onRowClick }) {
  if (showLoader) {
    return (
      <div className="table-wrapper">
        <div className="table-loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="erp-table">
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData && tableData.length > 0 ? (
            tableData.map((row, row_index) => (
              <tr
                key={row_index}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {headerSelector.map((selector, col_index) => (
                  <td key={col_index} onClick={selector === "action_btn" ? (e) => e.stopPropagation() : undefined}>
                    {selector === "action_btn" ? row[selector] : row[selector] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="no-data-row">
              <td colSpan={tableHeaders.length}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.defaultProps = {
  tableHeaders: [],
  headerSelector: [],
  tableData: [],
  showLoader: false,
  withActionData: false,
  onRowClick: null,
};

export default Table;
