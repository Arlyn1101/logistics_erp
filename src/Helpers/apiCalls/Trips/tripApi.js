import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

export const getAllTrips = async (search = "") => {
  try {
    const response = await getAPICall(`${BASE_URL}/trip/get_all`, { search });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createTrip = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trip/create`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateTrip = async (payload) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trip/update`, payload);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteTrip = async (id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trip/delete`, { id });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
