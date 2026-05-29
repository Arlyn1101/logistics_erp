import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllTrips = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/trips/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchTrips = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trips/search`, {
      token: get_token(),
      ...filters,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getTripDetails = async (trip_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trips/details`, {
      token: get_token(),
      trip_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getContractTripInfo = async (contract_id, trip_date) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trips/get_contract_trip_info`, {
      token: get_token(),
      contract_id,
      trip_date,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createTrip = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trips/create`, {
      token: get_token(),
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateTrip = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trips/update`, {
      token: get_token(),
      trip_id: form.id,
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteTrip = async (trip_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trips/delete`, {
      token: get_token(),
      trip_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const computeBilling = async (contract_id, month) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trips/compute_billing`, {
      token: get_token(),
      contract_id,
      month,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getTripSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trips/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const completeTrip = async (trip_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trips/complete`, {
      token: get_token(),
      trip_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getAvailableAssets = async (expected_departure_datetime, estimated_hours, exclude_trip_id = null) => {
  try {
    const params = {
      token: get_token(),
      expected_departure_datetime,
      estimated_hours,
    };
    if (exclude_trip_id) params.exclude_trip_id = exclude_trip_id;
    const response = await getAPICall(`${BASE_URL}/trips/get_available_assets`, params);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const startTrip = async (trip_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trips/start`, {
      token: get_token(),
      trip_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};