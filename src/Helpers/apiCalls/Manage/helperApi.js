import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

export const getAllHelpers = async (search = "") => {
  try {
    const response = await getAPICall(`${BASE_URL}/helper/get_all`, { search });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createHelper = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helper/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateHelper = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helper/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteHelper = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helper/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
