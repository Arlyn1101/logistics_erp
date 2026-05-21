import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

export const getAllContracts = async (search = "") => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract/get_all`, { search });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createContract = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateContract = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteContract = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

// Contract Routes
export const getAllContractRoutes = async (contract_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_route/get_all`, { contract_id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createContractRoute = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_route/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateContractRoute = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_route/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteContractRoute = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_route/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
