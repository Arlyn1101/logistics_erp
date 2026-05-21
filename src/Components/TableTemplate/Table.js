import React from "react";
import "./Table.css";

function Table({ tableHeaders, headerSelector, tableData, showLoader, withActionData }) {
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
              <tr key={row_index}>
                {headerSelector.map((selector, col_index) => (
                  <td key={col_index}>
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
};

export default Table;
