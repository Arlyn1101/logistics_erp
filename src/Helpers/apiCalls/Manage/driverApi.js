import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllDrivers = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchDrivers = async (
  name = null,
  license_number = null,
  status = null,
) => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/search`, {
      token: get_token(),
      name,
      license_number,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getDriverDetails = async (driver_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/details`, {
      token: get_token(),
      driver_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createDriver = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/drivers/create`, {
      token: get_token(),
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateDriver = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/drivers/update`, {
      token: get_token(),
      driver_id: form.id,
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteDriver = async (driver_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/drivers/delete`, {
      token: get_token(),
      driver_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
