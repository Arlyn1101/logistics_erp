import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Pages
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Customers from "./Pages/Manage/Customers";
import AddCustomer from "./Pages/Manage/AddCustomer";
import CustomerDetails from "./Pages/Manage/CustomerDetails";
import Drivers from "./Pages/Manage/Drivers";
import DriverForm from "./Pages/Manage/DriverForm";
import DriverDetails from "./Pages/Manage/DriverDetails";
import Helpers from "./Pages/Manage/Helpers";
import HelperForm from "./Pages/Manage/HelperForm";
import HelperDetails from "./Pages/Manage/HelperDetails";
import Trucks from "./Pages/Manage/Trucks";
import Users from "./Pages/Manage/Users";
import Contracts from "./Pages/Contracts/Contracts";
import ContractForm from "./Pages/Contracts/ContractForm";
import ContractView from "./Pages/Contracts/ContractView";
import Trips from "./Pages/Trips/Trips";
import Trail from "./Pages/Trail/Trail";
import Billings from "./Pages/Finance/Billings";
import Payments from "./Pages/Finance/Payments";
import BillingForm from "./Pages/Finance/BillingForm";

// Auth guard — checks localStorage token
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "var(--primary-font-medium)",
            fontSize: "14px"
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Manage */}
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <PrivateRoute>
              <AddCustomer />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute>
              <CustomerDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <PrivateRoute>
              <Drivers />
            </PrivateRoute>
          }
        />
        <Route
          path="/drivers/form"
          element={
            <PrivateRoute>
              <DriverForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/drivers/:id"
          element={
            <PrivateRoute>
              <DriverDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/helpers"
          element={
            <PrivateRoute>
              <Helpers />
            </PrivateRoute>
          }
        />
        <Route
          path="/helpers/form"
          element={
            <PrivateRoute>
              <HelperForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/helpers/:id"
          element={
            <PrivateRoute>
              <HelperDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/trucks"
          element={
            <PrivateRoute>
              <Trucks />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />

        {/* Contracts */}
        <Route
          path="/contracts"
          element={
            <PrivateRoute>
              <Contracts />
            </PrivateRoute>
          }
        />
        <Route
          path="/contracts/form"
          element={
            <PrivateRoute>
              <ContractForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/contracts/view"
          element={
            <PrivateRoute>
              <ContractView />
            </PrivateRoute>
          }
        />

        {/* Finance */}
        <Route
          path="/billings"
          element={
            <PrivateRoute>
              <Billings />
            </PrivateRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <Payments />
            </PrivateRoute>
          }
        />
        <Route
          path="/billings/form"
          element={
            <PrivateRoute>
              <BillingForm />
            </PrivateRoute>
          }
        />

        {/* Operations */}
        <Route
          path="/trips"
          element={
            <PrivateRoute>
              <Trips />
            </PrivateRoute>
          }
        />

        {/* System */}
        <Route
          path="/trail"
          element={
            <PrivateRoute>
              <Trail />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
