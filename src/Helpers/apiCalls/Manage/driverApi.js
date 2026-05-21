import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

export const getAllDrivers = async (search = "") => {
  try {
    const response = await getAPICall(`${BASE_URL}/driver/get_all`, { search });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createDriver = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/driver/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateDriver = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/driver/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteDriver = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/driver/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
