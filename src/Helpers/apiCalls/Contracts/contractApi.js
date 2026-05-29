import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllContracts = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchContracts = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/search`, {
      token: get_token(),
      ...filters,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getContractDetails = async (contract_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/details`, {
      token: get_token(),
      contract_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createContract = async (form, routes = []) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contracts/create`, {
      token: get_token(),
      customer_id: form.customer_id,
      date_signed: form.date_signed,
      authorized_representative: form.authorized_representative,
      payment_terms: form.payment_terms,
      monthly_rate: form.monthly_rate,
      included_trips: form.included_trips,
      excess_trip_charge: form.excess_trip_charge,
      fuel_price_per_liter: form.fuel_price_per_liter,
      date_start: form.start_date,
      date_end: form.end_date,
      remarks: form.remarks,
      routes: routes,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateContract = async (form, routes = []) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contracts/update`, {
      token: get_token(),
      contract_id: form.id,
      customer_id: form.customer_id,
      date_signed: form.date_signed,
      authorized_representative: form.authorized_representative,
      payment_terms: form.payment_terms,
      monthly_rate: form.monthly_rate,
      included_trips: form.included_trips,
      excess_trip_charge: form.excess_trip_charge,
      fuel_price_per_liter: form.fuel_price_per_liter,
      date_start: form.start_date,
      date_end: form.end_date,
      status: form.status,
      remarks: form.remarks,
      routes: routes,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteContract = async (contract_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contracts/delete`, {
      token: get_token(),
      contract_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

// Contract Routes
export const getAllContractRoutes = async (contract_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_routes/index`, {
      token: get_token(),
      contract_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createContractRoute = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_routes/create`, {
      token: get_token(),
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateContractRoute = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_routes/update`, {
      token: get_token(),
      contract_route_id: form.id,
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteContractRoute = async (contract_route_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_routes/delete`, {
      token: get_token(),
      contract_route_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getContractTripSummary = async (contract_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/trip_summary`, {
      token: get_token(),
      contract_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getAuthorizedSignatory = async (customer_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/get_authorized_signatory`, {
      token: get_token(),
      customer_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getContractSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

