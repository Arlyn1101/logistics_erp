import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

export const getAllCustomers = async (search = "") => {
  try {
    const response = await getAPICall(`${BASE_URL}/customer/get_all`, { search });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createCustomer = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customer/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateCustomer = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customer/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customer/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
