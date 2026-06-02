import React from "react";
import DataTable from "react-data-table-component";
import { SyncLoader } from "react-spinners";
import "./Table.css";

const customStyles = {
  headRow: {
    style: {
      backgroundColor: "#2d3e4e",
      color: "#fff",
      fontFamily: "var(--primary-font-bold)",
      fontSize: "12px",
      letterSpacing: "0.04em",
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      color: "#fff",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: {
      fontFamily: "var(--primary-font-medium)",
      fontSize: "13px",
      color: "#2d3e4e",
      minHeight: "48px",
      borderBottom: "1px solid #f0f2f5",
    },
    stripedStyle: {
      backgroundColor: "#f7fbfd",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  pagination: {
    style: {
      fontFamily: "var(--primary-font-medium)",
      fontSize: "13px",
      color: "#2d3e4e",
      borderTop: "1px solid #edf0f4",
    },
  },
};

const paginationOptions = {
  rowsPerPageText: "Rows per page:",
  rangeSeparatorText: "of",
  noRowsPerPage: false,
};

function NoData() {
  return (
    <div style={{
      padding: "40px",
      textAlign: "center",
      fontFamily: "var(--primary-font-medium)",
      fontSize: "14px",
      color: "#8a9ab0",
    }}>
      No records found.
    </div>
  );
}

function Table({
  tableHeaders,
  headerSelector,
  tableData,
  showLoader,
  withActionData,
  onRowClick,
  cellRenderers,
}) {
  if (showLoader) {
    return (
      <div className="d-flex justify-content-center my-5">
        <SyncLoader color="#5ac8e1" size={12} />
      </div>
    );
  }

  const columns = tableHeaders.map((header, index) => ({
    name: header,
    selector: (row) => row[headerSelector[index]],
    cell: (row) => {
      if (cellRenderers && cellRenderers[headerSelector[index]]) {
        return cellRenderers[headerSelector[index]](row);
      }
      const value = row[headerSelector[index]];
      if (value === null || value === undefined) return "—";
      return value;
    },
    sortable: headerSelector[index] !== "action_btn",
    wrap: true,
    minWidth: headerSelector[index] === "action_btn" ? "120px" : "100px",
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 25, 50, 100]}
      paginationComponentOptions={paginationOptions}
      striped
      fixedHeader
      fixedHeaderScrollHeight="65vh"
      customStyles={customStyles}
      noDataComponent={<NoData />}
      onRowClicked={onRowClick || undefined}
      pointerOnHover={!!onRowClick}
      highlightOnHover
    />
  );
}

Table.defaultProps = {
  tableHeaders: [],
  headerSelector: [],
  tableData: [],
  showLoader: false,
  withActionData: false,
  onRowClick: null,
  cellRenderers: null,
};

export default Table;