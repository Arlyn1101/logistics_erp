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

export const searchContracts = async (name = null, status = null) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/search`, {
      token: get_token(),
      name,
      status,
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

export const createContract = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contracts/create`, {
      token: get_token(),
      ...form,
      date_start: form.start_date,
      date_end: form.end_date,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateContract = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contracts/update`, {
      token: get_token(),
      contract_id: form.id,
      ...form,
      date_start: form.start_date,
      date_end: form.end_date,
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