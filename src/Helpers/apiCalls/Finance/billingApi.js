import { getAPICall, postAPICall } from "../axiosMethodCalls";

// Get all billings
export const getAllBillings = async () => {
  return await getAPICall("/api/billing/get_all");
};

// Get billing by id
export const getBilling = async (id) => {
  return await getAPICall(`/api/billing/get/${id}`);
};

// Get unbilled cycles for a contract
export const getUnbilledCycles = async (contract_id) => {
  return await getAPICall(`/api/billing/get_unbilled_cycles/${contract_id}`);
};

// Preview trips for a contract + billing period
export const previewBillingTrips = async (contract_id, period_start, period_end) => {
  return await getAPICall(
    `/api/billing/preview?contract_id=${contract_id}&period_start=${period_start}&period_end=${period_end}`
  );
};

// Create billing
export const createBilling = async (data) => {
  return await postAPICall("/api/billing/create", data);
};

// Get all payments
export const getAllPayments = async () => {
  return await getAPICall("/api/billing_payment/get_all");
};

// Get payments for a specific billing
export const getPaymentsByBilling = async (billing_id) => {
  return await getAPICall(`/api/billing_payment/get_by_billing/${billing_id}`);
};

// Create payment
export const createPayment = async (data) => {
  return await postAPICall("/api/billing_payment/create", data);
};