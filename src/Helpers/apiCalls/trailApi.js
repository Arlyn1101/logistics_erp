import { getAPICall, BASE_URL } from "./axiosMethodCalls";

export const getAllTrails = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trail/get_all`, filters);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
