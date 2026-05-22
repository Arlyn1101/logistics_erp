import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllHelpers = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchHelpers = async (name = null, status = null) => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/search`, {
      token: get_token(),
      name,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getHelperDetails = async (helper_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/details`, {
      token: get_token(),
      helper_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createHelper = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/create`, {
      token: get_token(),
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateHelper = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/update`, {
      token: get_token(),
      helper_id: form.id,
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteHelper = async (helper_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/delete`, {
      token: get_token(),
      helper_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};