import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

export const getAllTrucks = async (search = "") => {
  try {
    const response = await getAPICall(`${BASE_URL}/truck/get_all`, { search });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createTruck = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/truck/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateTruck = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/truck/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteTruck = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/truck/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
