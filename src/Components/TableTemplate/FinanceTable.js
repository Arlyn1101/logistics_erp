import DataTable from "react-data-table-component";
import { SyncLoader } from "react-spinners";
import NoDataPrompt from "../NoDataPrompt/NoDataPrompt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "./FinanceTable.css";

const fmt = (val) =>
  `₱ ${parseFloat(val || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  })}`;

const customStyles = {
  rows: {
    style: {
      minHeight: "5.2vh",
      flexWrap: "wrap",
      fontSize: "12px",
      whiteSpace: "pre",
    },
  },
  headCells: {
    style: {
      flexWrap: "wrap",
      fontSize: "12px",
      width: "100%",
      wordWrap: "breakWord",
    },
  },
};

const paginationComponentOptions = {
  rowsPerPageText: "",
  noRowsPerPage: true,
};

// ── Trips Columns ─────────────────────────────────────────────
function trips_columns() {
  return [
    {
      name: "#",
      selector: (row) => row.index,
      width: "5%",
      wrap: true,
    },
    {
      name: "TRIP DATE",
      selector: (row) => moment(row.trip_date).format("MMM D, YYYY"),
      width: "12%",
      wrap: true,
    },
    {
      name: "ROUTE",
      selector: (row) => `${row.origin} → ${row.destination}`,
      width: "30%",
      wrap: true,
    },
    {
      name: "TRUCK",
      selector: (row) => row.plate_number || "—",
      width: "13%",
      wrap: true,
    },
    {
      name: "EXCESS?",
      cell: (row) =>
        row.is_excess ? (
          <span className="status-badge excess">YES</span>
        ) : (
          <span className="status-badge included">NO</span>
        ),
      width: "10%",
      wrap: true,
    },
    {
      name: "EXCESS CHARGE",
      selector: (row) => (row.is_excess ? fmt(row.excess_charge) : "—"),
      width: "15%",
      wrap: true,
      right: true,
    },
    {
      name: "FUEL SURCHARGE",
      selector: (row) =>
        row.is_excess ? fmt(row.fuel_additional_charge) : "—",
      width: "15%",
      wrap: true,
      right: true,
    },
  ];
}

// ── Payment History Columns ───────────────────────────────────
function payment_columns(on_delete) {
  return [
    {
      name: "DATE",
      selector: (row) => moment(row.payment_date).format("MMM D, YYYY"),
      width: "13%",
      wrap: true,
    },
    {
      name: "METHOD",
      cell: (row) => (
        <span style={{ textTransform: "capitalize" }}>
          {row.payment_method.replace("_", " ")}
        </span>
      ),
      width: "13%",
      wrap: true,
    },
    {
      name: "AMOUNT",
      selector: (row) => fmt(row.amount),
      width: "13%",
      wrap: true,
      right: true,
    },
    {
      name: "REF / CHECK NO.",
      selector: (row) => {
        if (row.payment_method === "check") return row.check_number || "—";
        if (row.payment_method === "bank_transfer")
          return row.reference_number || "—";
        return "—";
      },
      width: "15%",
      wrap: true,
    },
    {
      name: "BANK",
      selector: (row) => row.bank_name || "—",
      width: "13%",
      wrap: true,
    },
    {
      name: "REMARKS",
      selector: (row) => row.remarks || "—",
      width: "20%",
      wrap: true,
    },
    {
      name: "",
      cell: (row) =>
        on_delete ? (
          <button
            type="button"
            className="attachment-btn attachment-remove"
            title="Delete payment"
            onClick={() => on_delete(row.id)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        ) : null,
      width: "8%",
      wrap: true,
    },
  ];
}

// ── Main Export ───────────────────────────────────────────────
export default function FinanceTable({
  type,       // "trips" | "payments"
  tableData,
  showLoader,
  on_delete,  // payments only — fn(payment_id)
}) {
  const data_with_index = (tableData || []).map((row, i) => ({
    ...row,
    index: i + 1,
  }));

  const columns =
    type === "trips"
      ? trips_columns()
      : payment_columns(on_delete);

  return showLoader ? (
    <div className="d-flex justify-content-center my-5">
      <SyncLoader color="#5ac8e1" size={15} />
    </div>
  ) : (
    <div className="finance-table-wrapper">
      <DataTable
        grow
        pagination
        responsive
        striped
        fixedHeader
        fixedHeaderScrollHeight="50vh"
        columns={columns}
        data={data_with_index}
        customStyles={customStyles}
        paginationComponentOptions={paginationComponentOptions}
        noDataComponent={<NoDataPrompt />}
      />
    </div>
  );
}