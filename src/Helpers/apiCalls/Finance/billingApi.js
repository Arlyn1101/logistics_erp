import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllBillings = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billings/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchBillings = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billings/search`, {
      token: get_token(),
      ...filters,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getBillingDetails = async (billing_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billings/details`, {
      token: get_token(),
      billing_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createBilling = async (data) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_billings/create`, {
      token: get_token(),
      ...data,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateBilling = async (data) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_billings/update`, {
      token: get_token(),
      ...data,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteBilling = async (billing_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_billings/delete`, {
      token: get_token(),
      billing_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getUnbilledCycles = async (contract_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billings/get_unbilled_cycles`, {
      token: get_token(),
      contract_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const previewBillingTrips = async (contract_id, period_start, period_end) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billings/preview`, {
      token: get_token(),
      contract_id,
      period_start,
      period_end,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};