import { getAPICall, BASE_URL } from "./axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllTrails = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trail/index`, {
      token: get_token(),
      ...filters,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};