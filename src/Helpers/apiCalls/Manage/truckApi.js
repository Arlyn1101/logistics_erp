import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllTrucks = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchTrucks = async (unit_code = null, plate_number = null, status = null) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/search`, {
      token: get_token(),
      unit_code,
      plate_number,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getTruckDetails = async (truck_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/details`, {
      token: get_token(),
      truck_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createTruck = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trucks/create`, {
      token: get_token(),
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateTruck = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trucks/update`, {
      token: get_token(),
      truck_id: form.id,   // BE expects truck_id
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteTruck = async (truck_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trucks/delete`, {
      token: get_token(),
      truck_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};